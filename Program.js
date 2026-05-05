/* ============================================================
   PROGRAM_UPDATED.js — Main Server Setup with Auth, DB, Email
   
   Replace your Program.js me këtë kod
============================================================ */

require('dotenv').config();
var express = require('express');
var path = require('path');
var cors = require('cors');
var { Pool } = require('pg');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');

// ===== DATABASE CONNECTION =====
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'rentigo_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
});

pool.on('error', function(err) {
    console.error('Database error:', err);
});

// ===== EMAIL SERVICE =====
const emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
});

// ===== EXPRESS SETUP =====
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'UI')));

// ===== MIDDLEWARE =====
const verifyToken = function(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

const verifyAdmin = function(req, res, next) {
    if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
};

// ===== ROUTES: AUTHENTICATION =====

// LOGIN
app.post('/api/auth/login', async function(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: 'Missing fields' });

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (!result.rows.length) return res.status(401).json({ success: false, message: 'Invalid email or password' });

        const user = result.rows[0];
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(401).json({ success: false, message: 'Invalid email or password' });

        const token = jwt.sign(
            { id: user.id, email: user.email, is_admin: user.is_admin },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({
            success: true,
            token: token,
            user: { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// REGISTER
app.post('/api/auth/register', async function(req, res) {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !phone || !password) return res.status(400).json({ success: false, message: 'Missing fields' });

        const existsRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existsRes.rows.length) return res.status(400).json({ success: false, message: 'Email already registered' });

        const hashedPass = await bcrypt.hash(password, 10);
        const insertRes = await pool.query(
            'INSERT INTO users (name, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
            [name, email, phone, hashedPass]
        );

        const user = insertRes.rows[0];
        const token = jwt.sign(
            { id: user.id, email: user.email, is_admin: false },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        // Send welcome email
        emailTransporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: '🎉 Mirë se erdhe në Rentigo!',
            html: '<h2>Mirë se erdhe ' + name + '!</h2><p>Llogarija juaj është krijuar. Tani mund të filloni të rezervoni.</p><p><a href="http://localhost:3000">Hyj këtu</a></p>'
        }, function(err) {
            if (err) console.error('Email error:', err);
        });

        res.json({
            success: true,
            token: token,
            user: { id: user.id, name: user.name, email: user.email, is_admin: false }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// FORGOT PASSWORD
app.post('/api/auth/forgot-password', async function(req, res) {
    try {
        const { email } = req.body;
        const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (!result.rows.length) return res.status(404).json({ success: false, message: 'Email not found' });

        const code = Math.random().toString().substring(2, 8);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minuta

        await pool.query(
            'INSERT INTO reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [result.rows[0].id, code, expiresAt]
        );

        // Send reset email
        emailTransporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: '🔐 Rivendos Fjalëkalimin Tuaj',
            html: '<h2>Rivendosja e Fjalëkalimit</h2><p>Këtu është kodi juaj i rivendosjes:</p><h1 style="color:#FF3B30;font-size:32px">' + code + '</h1><p>Kodi skadon në 10 minuta.</p>'
        }, function(err) {
            if (err) console.error('Email error:', err);
        });

        res.json({ success: true, message: 'Reset code sent to email' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// RESET PASSWORD
app.post('/api/auth/reset-password', async function(req, res) {
    try {
        const { email, code, newPassword } = req.body;
        
        const tokenRes = await pool.query(
            'SELECT * FROM reset_tokens WHERE token = $1 AND expires_at > NOW()',
            [code]
        );
        if (!tokenRes.rows.length) return res.status(400).json({ success: false, message: 'Invalid or expired code' });

        const hashedPass = await bcrypt.hash(newPassword, 10);
        await pool.query(
            'UPDATE users SET password = $1 WHERE email = $2',
            [hashedPass, email]
        );

        await pool.query('DELETE FROM reset_tokens WHERE token = $1', [code]);

        res.json({ success: true, message: 'Password reset successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ===== ROUTES: CARS =====

app.get('/api/cars', async function(req, res) {
    try {
        const result = await pool.query('SELECT id, brand, model, year, price_per_day, available FROM cars ORDER BY brand');
       const cars = result.rows.map(function(row) {
    return {
        _id: String(row.id),
        _brand: row.brand,
        _model: row.model,
        _year: row.year,
        _pricePerDay: row.price_per_day,
        _available: row.available
    };
});
        res.json(cars);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/cars', verifyToken, verifyAdmin, async function(req, res) {
    try {
        const { brand, model, year, pricePerDay } = req.body;
        if (!brand || !model || !year || !pricePerDay) return res.status(400).json({ success: false, message: 'Missing fields' });

        const result = await pool.query(
            'INSERT INTO cars (brand, model, year, price_per_day) VALUES ($1, $2, $3, $4) RETURNING id',
            [brand, model, year, pricePerDay]
        );

        res.json({ success: true, message: 'Car added', id: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.put('/api/cars/rent/:id', async function(req, res) {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT available FROM cars WHERE id = $1', [id]);
        if (!result.rows.length) return res.status(404).json({ success: false, message: 'Car not found' });
        if (!result.rows[0].available) return res.status(400).json({ success: false, message: 'Car already rented' });

        await pool.query('UPDATE cars SET available = FALSE WHERE id = $1', [id]);
        res.json({ success: true, message: 'Car rented' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.put('/api/cars/return/:id', async function(req, res) {
    try {
        const { id } = req.params;
        await pool.query('UPDATE cars SET available = TRUE WHERE id = $1', [id]);
        res.json({ success: true, message: 'Car returned' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ===== ROUTES: BOOKINGS =====

app.post('/api/bookings', verifyToken, async function(req, res) {
    try {
        const { carId, pickupDate, returnDate, pickupLoc, returnLoc, notes } = req.body;
        if (!carId || !pickupDate || !returnDate) return res.status(400).json({ success: false, message: 'Missing fields' });

        const days = Math.ceil((new Date(returnDate) - new Date(pickupDate)) / (1000*60*60*24));
        const carRes = await pool.query('SELECT * FROM cars WHERE id = $1', [carId]);
        if (!carRes.rows.length) return res.status(404).json({ success: false, message: 'Car not found' });

        const car = carRes.rows[0];
        const totalPrice = car.price_per_day * days;

        const bookingRes = await pool.query(
            'INSERT INTO bookings (user_id, car_id, pickup_date, return_date, pickup_location, return_location, total_price, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
            [req.user.id, carId, pickupDate, returnDate, pickupLoc, returnLoc, totalPrice, notes]
        );

        // Send confirmation email
        const userRes = await pool.query('SELECT email, name FROM users WHERE id = $1', [req.user.id]);
        const user = userRes.rows[0];

        emailTransporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: '✓ Rezervimi u Konfirmua - Rentigo',
            html: '<h2>Mirë se erdhe ' + user.name + '!</h2><p>Rezervimi juaj është konfirmuar.</p>' +
                  '<p><strong>' + car.brand + ' ' + car.model + '</strong></p>' +
                  '<p>📅 ' + pickupDate + ' → ' + returnDate + '</p>' +
                  '<p>💰 Total: $' + totalPrice + '</p>' +
                  '<p>Ref: <strong>RNT-' + bookingRes.rows[0].id + '</strong></p>'
        }, function(err) {
            if (err) console.error('Email error:', err);
        });

        res.json({ success: true, message: 'Booking created', bookingId: bookingRes.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ===== ROUTES: CONTACT =====

app.post('/api/contact', async function(req, res) {
    try {
        const { name, email, phone, subject, message } = req.body;
        if (!name || !email || !message) return res.status(400).json({ success: false, message: 'Missing fields' });

        await pool.query(
            'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES ($1, $2, $3, $4, $5)',
            [name, email, phone, subject, message]
        );

        // Send confirmation to user
        emailTransporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: '✓ Mesazhi Juaj u Pranua - Rentigo',
            html: '<h2>Faleminderit ' + name + '!</h2><p>Mesazhi juaj u pranua. Do t\'ju kontaktojmë sa më shpejt.</p>'
        }, function(err) {
            if (err) console.error('Email error:', err);
        });

        // Send to admin
        emailTransporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.ADMIN_EMAIL,
            subject: '📧 Mesazh i ri nga ' + name,
            html: '<h2>Mesazh i ri</h2><p><strong>Nga:</strong> ' + name + ' (' + email + ')</p><p><strong>Tema:</strong> ' + subject + '</p><p>' + message + '</p>'
        }, function(err) {
            if (err) console.error('Email error:', err);
        });

        res.json({ success: true, message: 'Message sent' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ===== START SERVER =====

const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
    console.log('🚀 Server running on http://localhost:' + PORT);
    console.log('📊 Database:', process.env.DB_NAME);
    console.log('📧 Email:', process.env.SMTP_USER);
});