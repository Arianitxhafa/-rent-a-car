/* ============================================================
   server.js — Routes: Cars + Auth (Login/Register/Forgot)
   
   AUTH përdor:
   - crypto (Node.js built-in) për hash + token
   - Data/users.json për ruajtjen e users
   - Data/reset-codes.json për kodet e rivendosjes
   
   NUK kërkon: bcryptjs, jsonwebtoken, pg, dotenv
============================================================ */

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');  // Built-in në Node.js, pa npm install

// ── Rrugët e skedarëve të të dhënave ──
const USERS_FILE  = path.join(__dirname, 'Data', 'users.json');
const TOKENS_FILE = path.join(__dirname, 'Data', 'reset-codes.json');

// ── Sigurohu që skedarët ekzistojnë ──
function ensureFile(filePath, defaultVal) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2));
  }
}
ensureFile(USERS_FILE,  []);
ensureFile(TOKENS_FILE, []);

// ── Lexo / Shkruaj JSON ──
function readJSON(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch (e) { return []; }
}
function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
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

      // Krijo user të ri
      var newUser = {
        id:        String(Date.now()),
        name:      name,
        email:     email,
        phone:     phone,
        password:  hashPassword(pass),
        is_admin:  false,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      writeJSON(USERS_FILE, users);

      // Kthe token + user (pa password)
      var token = generateToken();
      var safeUser = { id: newUser.id, name: newUser.name, email: newUser.email, is_admin: false };

      return res.json({ success: true, token: token, user: safeUser });

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
      if (user.password !== hashPassword(pass)) {
        return res.status(401).json({ success: false, message: 'Email ose fjalëkalim i gabuar!' });
      }

      var token = generateToken();
      var safeUser = { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin };

      return res.json({ success: true, token: token, user: safeUser });

    } catch (err) {
      console.error('Login error:', err);
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

      // ── Shfaq kodin në console (pa email service) ──
      console.log('══════════════════════════════');
      console.log('🔐 KOD RIVENDOSJE PËR: ' + email);
      console.log('📌 KODI: ' + code);
      console.log('⏱  Skadon: 10 minuta');
      console.log('══════════════════════════════');

      return res.json({ success: true, message: 'Kodi u gjenerua! Shiko console-in e serverit.', code: code });

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

  // ── GET /api/auth/me — Kontrollo token ──
  server.get('/api/auth/me', function(req, res) {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false });
    // Token i thjeshtë — vetëm konfirmo ekzistencën (pa DB tokens)
    return res.json({ success: true });
  });

  // ════════════════════════════════════════
  //  CARS ROUTES (ekzistuese + të korrighuara)
  // ════════════════════════════════════════

  server.get('/api/cars', function(req, res) {
    try {
      var cars = service.getAllCars();
      res.json(cars);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim gjatë ngarkimit.' });
    }
  });

  // KUJDES: routes specifike para /:id
  server.get('/api/cars/list/:filter', function(req, res) {
    var cars = service.listCars(req.params.filter);
    res.json(cars);
  });

  server.get('/api/cars/find/:id', function(req, res) {
    var result = service.findCar(req.params.id);
    res.json(result);
  });

  server.get('/api/cars/:id', function(req, res) {
    try {
      var car = service.getCarById(req.params.id);
      if (!car) return res.status(404).json({ success: false, message: 'Makina nuk u gjet!' });
      res.json(car);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim serveri.' });
    }
  });

  server.post('/api/cars', function(req, res) {
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
      var result = service.rentCar(req.params.id);
      res.json(result);
    } catch (err) {
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

  server.put('/api/cars/update/:id', function(req, res) {
    try {
      var b = req.body;
      var result = service.updateCar(req.params.id, b.brand, b.model, b.year, b.pricePerDay, b.available);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim serveri.' });
    }
  });

  server.delete('/api/cars/:id', function(req, res) {
    try {
      var result = service.deleteCar(req.params.id);
      res.json(result);
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
      // Ruaj mesazhin në console (pa email service)
      console.log('📧 MESAZH I RI NGA: ' + b.name + ' <' + b.email + '>');
      console.log('   Tema: ' + (b.subject || 'Pa temë'));
      console.log('   Mesazhi: ' + b.message);
      return res.json({ success: true, message: 'Mesazhi u dërgua me sukses!' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim serveri.' });
    }
  });

  // ════════════════════════════════════════
  //  ADMIN ROUTES - USER MANAGEMENT
  // ════════════════════════════════════════

  // Middleware për admin
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