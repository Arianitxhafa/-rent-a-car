/* ============================================================
   server.js — Routes: Cars + Auth (Login/Register/Forgot)
   
   AUTH përdor:
   - crypto (Node.js built-in) për hash + token
   - Data/users.json për ruajtjen e users
   - Data/reset-codes.json për kodet e rivendosjes
   
   NUK kërkon: bcryptjs, jsonwebtoken, pg, dotenv
============================================================ */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');  // Built-in në Node.js, pa npm install
const nodemailer = require('nodemailer');
const express = require('express');
const app = express();

// Middleware për autentifikim (supozoni se keni një funksion authMiddleware)
const authMiddleware = (req, res, next) => {
  // Kontrolloni token ose sesion
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).send('Akses i ndaluar');
  }
  next();
};

// ── Rrugët e skedarëve të të dhënave ──
const USERS_FILE    = path.join(__dirname, 'Data', 'users.json');
const TOKENS_FILE   = path.join(__dirname, 'Data', 'reset-codes.json');
const BOOKINGS_FILE = path.join(__dirname, 'Data', 'bookings.json');
const MESSAGES_FILE = path.join(__dirname, 'Data', 'messages.json');

// ── Sigurohu që skedarët ekzistojnë ──
function ensureFile(filePath, defaultVal) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2));
  }
}
ensureFile(USERS_FILE,    []);
ensureFile(TOKENS_FILE,   []);
ensureFile(BOOKINGS_FILE, []);
ensureFile(MESSAGES_FILE, []);

// ── Lexo / Shkruaj JSON ──
function readJSON(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch (e) { return []; }
}
function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || 'Rentigo <no-reply@rentigo.ks>';
const APP_URL = process.env.APP_URL || 'http://localhost:5000';

let emailTransporter = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  emailTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
} else {
  console.warn('⚠️ SMTP nuk është i konfiguruar. Email-et do të shfaqen vetëm në console.');
}

function sendEmail(to, subject, html) {
  if (!emailTransporter) {
    console.log('══════════════════════════════');
    console.log('📩 Email fallback (SMTP jo i konfiguruar)');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML:', html);
    console.log('══════════════════════════════');
    return Promise.resolve();
  }
  return emailTransporter.sendMail({
    from: SMTP_FROM,
    to: to,
    subject: subject,
    html: html
  });
}

function sendVerificationEmail(user, code) {
  var verifyUrl = APP_URL + '/verify-email.html?email=' + encodeURIComponent(user.email);
  var subject = 'Verifikimi i email-it për Rentigo';
  var html = '<h2>Verifikimi i email-it</h2>' +
             '<p>Për të parë llogarinë tuaj Rentigo, përdorni kodin e mëposhtëm të verifikimit:</p>' +
             '<p style="font-size:20px;font-weight:bold;">' + code + '</p>' +
             '<p>Kodi skadon në 60 minuta.</p>' +
             '<p><a href="' + verifyUrl + '">Kliko këtu për të verifikuar email-in</a></p>' +
             '<p>Faleminderit për regjistrimin në Rentigo!</p>';
  return sendEmail(user.email, subject, html);
}

function sendBookingConfirmationEmail(booking) {
  var carDetails = booking.carBrand + ' ' + booking.carModel + ' (' + booking.carYear + ')';
  var days = booking.days || 1;
  var totalPrice = (parseFloat(booking.pricePerDay) * days).toFixed(2);
  
  var subject = '✓ Konfirim Rezervimi - ' + booking.referenceNumber + ' • Rentigo';
  var html = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
             '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; color: white;">' +
             '<h1 style="margin: 0; font-size: 28px;">✓ Rezervimi Konfirmuar!</h1>' +
             '<p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Faleminderit për zgjedhjen e Rentigo</p>' +
             '</div>' +
             '<div style="background: #f8f9fa; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">' +
             '<p>Përshëndetje <strong>' + booking.customerName + '</strong>,</p>' +
             '<p>Rezervimi juaj ka qenë i suksesshëm! Shënimet e plotë janë më poshtë:</p>' +
             '<div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px;">' +
             '<p style="margin: 0 0 15px 0;"><strong>📌 Numri i Referimit: ' + booking.referenceNumber + '</strong></p>' +
             '<p style="margin: 0 0 10px 0;"><strong>🚗 Makina:</strong> ' + carDetails + '</p>' +
             '<p style="margin: 0 0 10px 0;"><strong>📅 Data Marrje:</strong> ' + booking.pickupDate + '</p>' +
             '<p style="margin: 0 0 10px 0;"><strong>📅 Data Kthimi:</strong> ' + booking.returnDate + '</p>' +
             '<p style="margin: 0 0 10px 0;"><strong>⏱ Ditë Qiraje:</strong> ' + days + ' ditë</p>' +
             '<p style="margin: 0 0 10px 0;"><strong>💵 Çmim/Ditë:</strong> $' + parseFloat(booking.pricePerDay).toFixed(2) + '</p>' +
             '<p style="margin: 0; padding-top: 10px; border-top: 1px solid #eee;"><strong style="font-size: 18px; color: #667eea;">💰 Total: $' + totalPrice + '</strong></p>' +
             '</div>' +
             '<div style="background: white; padding: 20px; border-left: 4px solid #764ba2; margin: 20px 0; border-radius: 4px;">' +
             '<p style="margin: 0 0 10px 0;"><strong>👤 Informacione Kontakti:</strong></p>' +
             '<p style="margin: 5px 0;"><strong>Emri:</strong> ' + booking.customerName + '</p>' +
             '<p style="margin: 5px 0;"><strong>Email:</strong> ' + booking.customerEmail + '</p>' +
             '<p style="margin: 5px 0;"><strong>Telefon:</strong> ' + booking.customerPhone + '</p>' +
             '</div>' +
             '<div style="background: #f0f7ff; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #0066cc;">' +
             '<p style="margin: 0; font-size: 14px;"><strong>ℹ️ Shënim Rëndësishëm:</strong></p>' +
             '<p style="margin: 5px 0; font-size: 13px;">Sigurohu që të shfaqësh këtë email ose numrin e referimit në zyrën tonë në kohën e marrjes.</p>' +
             '</div>' +
             '<p style="margin-top: 20px; color: #666; font-size: 13px;">Nëse ke ndonjë pyetje, kontakto ne në <strong>info@rentigo.ks</strong> ose <strong>+383 49 584 584</strong></p>' +
             '<p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; font-size: 12px; text-align: center;">' +
             'Rentigo © 2024 • Qira Makinash Premium në Kosovë' +
             '</p>' +
             '</div>' +
             '</div>';
  
  return sendEmail(booking.customerEmail, subject, html);
}

// ── Hash i thjeshtë me SHA-256 (pa bcrypt) ──
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'rentigo_salt_2024').digest('hex');
}

// ── Gjenero token të rastit ──
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// ── Gjenero kod 6-shifror ──
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ============================================================

module.exports = (server, service) => {

  // ════════════════════════════════════════
  //  AUTH ROUTES
  // ════════════════════════════════════════

  // ── POST /api/auth/register ──
  server.post('/api/auth/register', function(req, res) {
    try {
      var body = req.body;
      var name  = (body.name  || '').trim();
      var email = (body.email || '').trim().toLowerCase();
      var phone = (body.phone || '').trim();
      var pass  = (body.password || '');

      // Validim
      if (!name || !email || !pass) {
        return res.status(400).json({ success: false, message: 'Emri, email dhe fjalëkalimi janë të detyrueshme!' });
      }
      if (pass.length < 6) {
        return res.status(400).json({ success: false, message: 'Fjalëkalimi duhet të ketë minimum 6 karaktere!' });
      }
      if (!email.includes('@')) {
        return res.status(400).json({ success: false, message: 'Email-i nuk është valid!' });
      }

      var users = readJSON(USERS_FILE);

      // Kontrollo nëse email ekziston
      if (users.find(function(u) { return u.email === email; })) {
        return res.status(400).json({ success: false, message: 'Ky email është regjistruar tashmë!' });
      }

      // Krijo user të ri me kod verifikimi
      var verificationCode = generateCode();
      var verificationExpiry = Date.now() + 60 * 60 * 1000; // 1 orë
      var newUser = {
        id:        String(Date.now()),
        name:      name,
        email:     email,
        phone:     phone,
        password:  hashPassword(pass),
        is_admin:  false,
        verified:  false,
        verifyCode: verificationCode,
        verifyExpires: verificationExpiry,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      writeJSON(USERS_FILE, users);

      sendVerificationEmail(newUser, verificationCode)
        .catch(function(err) {
          console.error('Email verification send error:', err);
        });

      return res.json({
        success: true,
        message: 'Regjistrimi u krye. Kontrollo email-in tënd për kodin e verifikimit.'
      });

    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ success: false, message: 'Gabim i serverit. Provo përsëri.' });
    }
  });

  // ── POST /api/auth/login ──
  server.post('/api/auth/login', function(req, res) {
    try {
      var body  = req.body;
      var email = (body.email    || '').trim().toLowerCase();
      var pass  = (body.password || '');

      if (!email || !pass) {
        return res.status(400).json({ success: false, message: 'Email dhe fjalëkalimi janë të detyrueshëm!' });
      }

      var users = readJSON(USERS_FILE);
      var user  = users.find(function(u) { return u.email === email; });

      if (!user) {
        return res.status(401).json({ success: false, message: 'Email ose fjalëkalim i gabuar!' });
      }
      if (!user.verified) {
        return res.status(403).json({
          success: false,
          message: 'Email-i nuk është verifikuar. Kontrollo email-in ose ridërgo kodin e verifikimit.',
          emailNotVerified: true,
          email: user.email
        });
      }
      if (user.password !== hashPassword(pass)) {
        return res.status(401).json({ success: false, message: 'Email ose fjalëkalim i gabuar!' });
      }

      var token = generateToken();
      user.token = token;  // Ruaj token-in në user
      writeJSON(USERS_FILE, users);  // Ruaj ndryshimet

      var safeUser = { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin };

      return res.json({ success: true, token: token, user: safeUser });

    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: 'Gabim i serverit. Provo përsëri.' });
    }
  });

  // ── POST /api/auth/verify-email ──
  server.post('/api/auth/verify-email', function(req, res) {
    try {
      var email = (req.body.email || '').trim().toLowerCase();
      var code  = (req.body.code  || '').trim();

      if (!email || !code) {
        return res.status(400).json({ success: false, message: 'Email dhe kodi janë të detyrueshme!' });
      }

      var users = readJSON(USERS_FILE);
      var user  = users.find(function(u) { return u.email === email; });
      if (!user) {
        return res.status(404).json({ success: false, message: 'Email-i nuk u gjet.' });
      }
      if (user.verified) {
        return res.json({ success: true, message: 'Email-i është tashmë i verifikuar.' });
      }
      if (!user.verifyCode || user.verifyCode !== code) {
        return res.status(400).json({ success: false, message: 'Kodi i verifikimit është gabim!' });
      }
      if (Date.now() > user.verifyExpires) {
        return res.status(400).json({ success: false, message: 'Kodi ka skaduar. Ridërgo kodin e verifikimit.' });
      }

      user.verified = true;
      delete user.verifyCode;
      delete user.verifyExpires;
      writeJSON(USERS_FILE, users);

      return res.json({ success: true, message: 'Email-i u verifikua me sukses! Tani mund të hyni.' });

    } catch (err) {
      console.error('Verify email error:', err);
      return res.status(500).json({ success: false, message: 'Gabim i serverit. Provo përsëri.' });
    }
  });

  // ── POST /api/auth/resend-verification ──
  server.post('/api/auth/resend-verification', function(req, res) {
    try {
      var email = (req.body.email || '').trim().toLowerCase();
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email është i detyrueshëm!' });
      }

      var users = readJSON(USERS_FILE);
      var user  = users.find(function(u) { return u.email === email; });
      if (!user) {
        return res.json({ success: true, message: 'Nëse email-i ekziston, kodi u ridërgua.' });
      }
      if (user.verified) {
        return res.json({ success: true, message: 'Email-i është tashmë i verifikuar.' });
      }

      var newCode = generateCode();
      user.verifyCode = newCode;
      user.verifyExpires = Date.now() + 60 * 60 * 1000;
      writeJSON(USERS_FILE, users);

      sendVerificationEmail(user, newCode)
        .catch(function(err) {
          console.error('Resend verification send error:', err);
        });

      return res.json({ success: true, message: 'Kodi i verifikimit u ridërgua.' });

    } catch (err) {
      console.error('Resend verification error:', err);
      return res.status(500).json({ success: false, message: 'Gabim i serverit. Provo përsëri.' });
    }
  });

  // ── POST /api/auth/forgot-password ──
  server.post('/api/auth/forgot-password', function(req, res) {
    try {
      var email = (req.body.email || '').trim().toLowerCase();
      if (!email) {
        return res.status(400).json({ success: false, message: 'Ju lutem jepni email-in!' });
      }

      var users = readJSON(USERS_FILE);
      var user  = users.find(function(u) { return u.email === email; });

      // Kthe success edhe nëse nuk ekziston (siguri)
      if (!user) {
        return res.json({ success: true, message: 'Nëse email-i ekziston, kodi u dërgua!' });
      }

      // Gjenero kod + ruaje
      var code    = generateCode();
      var expires = Date.now() + 10 * 60 * 1000; // 10 minuta

      var tokens = readJSON(TOKENS_FILE).filter(function(t) { return t.email !== email; });
      tokens.push({ email: email, code: code, expires: expires });
      writeJSON(TOKENS_FILE, tokens);

      var html = '<h2>Rivendos fjalëkalimin</h2>' +
                 '<p>Kodi i rivendosjes për llogarinë tuaj Rentigo është:</p>' +
                 '<p style="font-size:20px;font-weight:bold;">' + code + '</p>' +
                 '<p>Kodi skadon në 10 minuta.</p>' +
                 '<p>Nëse nuk e kërkuat, injoroni këtë email.</p>';

      sendEmail(email, 'Kodi i rivendosjes së fjalëkalimit Rentigo', html)
        .catch(function(err) {
          console.error('Forgot password email send error:', err);
        });

      console.log('══════════════════════════════');
      console.log('🔐 KOD RIVENDOSJE PËR: ' + email);
      console.log('📌 KODI: ' + code);
      console.log('⏱  Skadon: 10 minuta');
      console.log('══════════════════════════════');

      return res.json({ success: true, message: 'Kodi u dërgua në email.' });

    } catch (err) {
      console.error('Forgot password error:', err);
      return res.status(500).json({ success: false, message: 'Gabim i serverit. Provo përsëri.' });
    }
  });

  // ── POST /api/auth/reset-password ──
  server.post('/api/auth/reset-password', function(req, res) {
    try {
      var email   = (req.body.email       || '').trim().toLowerCase();
      var code    = (req.body.code        || '').trim();
      var newPass = (req.body.newPassword || '');

      if (!email || !code || !newPass) {
        return res.status(400).json({ success: false, message: 'Të gjitha fushat janë të detyrueshme!' });
      }
      if (newPass.length < 6) {
        return res.status(400).json({ success: false, message: 'Fjalëkalimi duhet të ketë minimum 6 karaktere!' });
      }

      var tokens = readJSON(TOKENS_FILE);
      var record = tokens.find(function(t) { return t.email === email && t.code === code; });

      if (!record) {
        return res.status(400).json({ success: false, message: 'Kodi është gabim!' });
      }
      if (Date.now() > record.expires) {
        return res.status(400).json({ success: false, message: 'Kodi ka skaduar! Kërko një kod të ri.' });
      }

      // Përditëso fjalëkalimin
      var users = readJSON(USERS_FILE);
      var idx   = users.findIndex(function(u) { return u.email === email; });
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Përdoruesi nuk u gjet!' });
      }

      users[idx].password = hashPassword(newPass);
      writeJSON(USERS_FILE, users);

      // Fshi kodin e përdorur
      writeJSON(TOKENS_FILE, tokens.filter(function(t) { return !(t.email === email && t.code === code); }));

      console.log('✅ Fjalëkalimi u rivendos për: ' + email);
      return res.json({ success: true, message: 'Fjalëkalimi u rivendos me sukses!' });

    } catch (err) {
      console.error('Reset password error:', err);
      return res.status(500).json({ success: false, message: 'Gabim i serverit. Provo përsëri.' });
    }
  });

  // ── GET /api/auth/me — Kontrollo token dhe kthe user ──
  server.get('/api/auth/me', function(req, res) {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Token i munguar' });

    var users = readJSON(USERS_FILE);
    var user = users.find(function(u) { return u.token === token; });
    if (!user) return res.status(401).json({ success: false, message: 'Token i pavlefshëm' });

    var safeUser = { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin };
    return res.json({ success: true, user: safeUser });
  });

  // ════════════════════════════════════════
  //  CARS ROUTES (ekzistuese + të korrighuara)
  // ════════════════════════════════════════

  server.get('/api/cars', function(req, res) {
    try {
      var cars = service.getAllCars();
      var plainCars = cars.map(function(car) {
        return {
          id: car.getId(),
          brand: car.getBrand(),
          model: car.getModel(),
          year: car.getYear(),
          pricePerDay: car.getPricePerDay(),
          available: car.isAvailable()
        };
      });
      res.json(plainCars);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim gjatë ngarkimit.' });
    }
  });

  // KUJDES: routes specifike para /:id
  server.get('/api/cars/list/:filter', function(req, res) {
    var cars = service.listCars(req.params.filter);
    var plainCars = cars.map(function(car) {
      return {
        id: car.getId(),
        brand: car.getBrand(),
        model: car.getModel(),
        year: car.getYear(),
        pricePerDay: car.getPricePerDay(),
        available: car.isAvailable()
      };
    });
    res.json(plainCars);
  });

  server.get('/api/cars/find/:id', function(req, res) {
    var result = service.findCar(req.params.id);
    if (result.success && result.car) {
      result.car = {
        id: result.car.getId(),
        brand: result.car.getBrand(),
        model: result.car.getModel(),
        year: result.car.getYear(),
        pricePerDay: result.car.getPricePerDay(),
        available: result.car.isAvailable()
      };
    }
    res.json(result);
  });

  server.get('/api/cars/:id', function(req, res) {
    try {
      var car = service.getCarById(req.params.id);
      if (!car) return res.status(404).json({ success: false, message: 'Makina nuk u gjet!' });
      var plainCar = {
        id: car.getId(),
        brand: car.getBrand(),
        model: car.getModel(),
        year: car.getYear(),
        pricePerDay: car.getPricePerDay(),
        available: car.isAvailable()
      };
      res.json(plainCar);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim serveri.' });
    }
  });

  server.post('/api/cars', requireAdmin, function(req, res) {
    try {
      var body = req.body;
      if (!body.brand || !body.model || !body.year || !body.pricePerDay) {
        return res.status(400).json({ success: false, message: 'Të gjitha fushat janë të detyrueshme!' });
      }
      var car = service.addCar(body.brand, body.model, body.year, body.pricePerDay, true);
      res.json({ success: true, car: car });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message || 'Gabim serveri.' });
    }
  });

  server.put('/api/cars/rent/:id', function(req, res) {
    try {
      var carId = req.params.id;
      var body = req.body;
      
      // Merr të dhënat e customerit
      var customerName = (body.customerName || '').trim();
      var customerEmail = (body.customerEmail || '').trim().toLowerCase();
      var customerPhone = (body.customerPhone || '').trim();
      var pickupDate = (body.pickupDate || '').trim();
      var returnDate = (body.returnDate || '').trim();
      
      // Validim
      if (!customerName || !customerEmail || !customerPhone) {
        return res.status(400).json({ 
          success: false, 
          message: 'Emri, email dhe telefoni janë të detyrueshëm!' 
        });
      }
      
      if (!pickupDate || !returnDate) {
        return res.status(400).json({ 
          success: false, 
          message: 'Datat e marrjes dhe kthimit janë të detyrueshme!' 
        });
      }
      
      // Rent the car
      var result = service.rentCar(carId);
      if (!result.success) {
        return res.json(result);
      }
      
      // Merr detajet e makinës
      var car = service.getCarById(carId);
      if (!car) {
        return res.status(404).json({ success: false, message: 'Makina nuk u gjet!' });
      }
      
      // Gjenero numrin e referimit
      var referenceNumber = 'RNT-' + Date.now().toString(36).toUpperCase();
      
      // Llogarit numrin e ditëve
      var d1 = new Date(pickupDate);
      var d2 = new Date(returnDate);
      var days = Math.max(1, Math.ceil((d2 - d1) / (1000*60*60*24)));
      
      // Krijo objektin e booking-ut
      var booking = {
        id: String(Date.now()),
        referenceNumber: referenceNumber,
        carId: String(carId),
        carBrand: car.getBrand(),
        carModel: car.getModel(),
        carYear: car.getYear(),
        pricePerDay: car.getPricePerDay(),
        days: days,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        pickupDate: pickupDate,
        returnDate: returnDate,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };
      
      // Ruaj booking-un
      var bookings = readJSON(BOOKINGS_FILE);
      bookings.push(booking);
      writeJSON(BOOKINGS_FILE, bookings);
      
      // Dergo email-in e konfirmimit
      sendBookingConfirmationEmail(booking)
        .catch(function(err) {
          console.error('Booking confirmation email send error:', err);
        });
      
      console.log('✅ Booking i ri: ' + referenceNumber + ' për: ' + customerEmail);
      
      return res.json({ 
        success: true, 
        message: result.message,
        referenceNumber: referenceNumber,
        booking: booking
      });
    } catch (err) {
      console.error('Booking error:', err);
      res.status(500).json({ success: false, message: 'Gabim serveri.' });
    }
  });

  server.put('/api/cars/return/:id', function(req, res) {
    try {
      var result = service.returnCar(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim serveri.' });
    }
  });

  server.put('/api/cars/update/:id', requireAdmin, function(req, res) {
    try {
      var b = req.body;
      var result = service.updateCar(req.params.id, b.brand, b.model, b.year, b.pricePerDay, b.available);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim serveri.' });
    }
  });

  server.delete('/api/cars/:id', requireAdmin, function(req, res) {
    try {
      var result = service.deleteCar(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim serveri.' });
    }
  });

  // ════════════════════════════════════════
  //  BOOKINGS ROUTE - For Admin
  // ════════════════════════════════════════

  server.get('/api/bookings', function(req, res) {
    try {
      var bookings = readJSON(BOOKINGS_FILE);
      res.json(bookings);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim serveri.' });
    }
  });

  // ════════════════════════════════════════
  //  MESSAGES ROUTE - For Admin
  // ════════════════════════════════════════

  server.get('/api/messages', function(req, res) {
    try {
      var messages = readJSON(MESSAGES_FILE);
      res.json(messages);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim serveri.' });
    }
  });

  // ════════════════════════════════════════
  //  CONTACT ROUTE
  // ════════════════════════════════════════

  server.post('/api/contact', function(req, res) {
    try {
      var b = req.body;
      if (!b.name || !b.email || !b.message) {
        return res.status(400).json({ success: false, message: 'Emri, email dhe mesazhi janë të detyrueshëm!' });
      }
      
      // Ruaj mesazhin në file
      var messages = readJSON(MESSAGES_FILE);
      var newMessage = {
        id: String(Date.now()),
        name: b.name,
        email: b.email,
        subject: b.subject || 'Pa temë',
        message: b.message,
        createdAt: new Date().toISOString()
      };
      messages.push(newMessage);
      writeJSON(MESSAGES_FILE, messages);
      
      console.log('📧 MESAZH I RI NGA: ' + b.name + ' <' + b.email + '>');
      console.log('   Tema: ' + newMessage.subject);
      console.log('   Mesazhi: ' + b.message);
      
      return res.json({ success: true, message: 'Mesazhi u dërgua me sukses!' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim serveri.' });
    }
  });

  // ════════════════════════════════════════
  //  ADMIN ROUTES - USER MANAGEMENT
  // ════════════════════════════════════════

  // Middleware për admin (përditësuar)
  function requireAdmin(req, res, next) {
    var token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Token i munguar' });

    var users = readJSON(USERS_FILE);
    var user = users.find(function(u) { return u.token === token; });
    if (!user || !user.is_admin) {
      return res.status(403).json({ success: false, message: 'Vetëm administratorët mund të hyjnë!' });
    }
    req.user = user;
    next();
  }

  // GET /api/admin/users - Merr të gjithë përdoruesit
  server.get('/api/admin/users', requireAdmin, function(req, res) {
    try {
      var users = readJSON(USERS_FILE);
      var safeUsers = users.map(function(u) {
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          is_admin: u.is_admin,
          createdAt: u.createdAt
        };
      });
      res.json({ success: true, users: safeUsers });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim serveri.' });
    }
  });

  // POST /api/admin/users - Shto përdorues të ri
  server.post('/api/admin/users', requireAdmin, function(req, res) {
    try {
      var b = req.body;
      if (!b.name || !b.email || !b.password || !b.phone) {
        return res.status(400).json({ success: false, message: 'Të gjitha fushat janë të detyrueshme!' });
      }

      var users = readJSON(USERS_FILE);
      if (users.find(function(u) { return u.email === b.email; })) {
        return res.status(400).json({ success: false, message: 'Email ekziston tashmë!' });
      }

      var newUser = {
        id: String(Date.now()),
        name: b.name,
        email: b.email.toLowerCase(),
        phone: b.phone,
        password: hashPassword(b.password),
        is_admin: b.is_admin || false,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      writeJSON(USERS_FILE, users);

      res.json({
        success: true,
        message: 'Përdoruesi u shtua me sukses!',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          is_admin: newUser.is_admin,
          createdAt: newUser.createdAt
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim serveri.' });
    }
  });

  // PUT /api/admin/users/:id - Përditëso përdorues
  server.put('/api/admin/users/:id', requireAdmin, function(req, res) {
    try {
      var b = req.body;
      var users = readJSON(USERS_FILE);
      var userIdx = users.findIndex(function(u) { return u.id === req.params.id; });

      if (userIdx === -1) {
        return res.status(404).json({ success: false, message: 'Përdoruesi nuk u gjet!' });
      }

      // Përditëso fushat (pa password nëse nuk është dhënë)
      if (b.name) users[userIdx].name = b.name;
      if (b.email) users[userIdx].email = b.email.toLowerCase();
      if (b.phone) users[userIdx].phone = b.phone;
      if (b.password) users[userIdx].password = hashPassword(b.password);
      if (typeof b.is_admin === 'boolean') users[userIdx].is_admin = b.is_admin;

      writeJSON(USERS_FILE, users);

      res.json({
        success: true,
        message: 'Përdoruesi u përditësua me sukses!',
        user: {
          id: users[userIdx].id,
          name: users[userIdx].name,
          email: users[userIdx].email,
          phone: users[userIdx].phone,
          is_admin: users[userIdx].is_admin,
          createdAt: users[userIdx].createdAt
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim serveri.' });
    }
  });

  // DELETE /api/admin/users/:id - Fshi përdorues
  server.delete('/api/admin/users/:id', requireAdmin, function(req, res) {
    try {
      var users = readJSON(USERS_FILE);
      var userIdx = users.findIndex(function(u) { return u.id === req.params.id; });

      if (userIdx === -1) {
        return res.status(404).json({ success: false, message: 'Përdoruesi nuk u gjet!' });
      }

      // Mos lejo fshirjen e vetvetes
      if (users[userIdx].id === req.user.id) {
        return res.status(400).json({ success: false, message: 'Nuk mund të fshini veten!' });
      }

      var deletedUser = users.splice(userIdx, 1)[0];
      writeJSON(USERS_FILE, users);

      res.json({
        success: true,
        message: 'Përdoruesi u fshi me sukses!',
        user: {
          id: deletedUser.id,
          name: deletedUser.name,
          email: deletedUser.email
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim serveri.' });
    }
  });

};