/* ============================================================
   navbar.js — Universal Navbar
   Ky skedar injekton navbar-in automatikisht në çdo faqe.
   Shto vetëm <script src="navbar.js"></script> në çdo HTML.
   Nuk duhet të kopjosh HTML të navbar-it manualisht.
============================================================ */

(function () {
  /* ── 1. GJEJ FAQEN AKTUALE ── */
  var page = window.location.pathname.split('/').pop() || 'index.html';

  function isActive(href) {
    return page === href ? 'active' : '';
  }

  /* ── 2. BUILD HTML ── */
  var navHTML = `
<div class="rg-topbar">
  <div class="rg-topbar__inner">
    <div class="rg-topbar__left">
      <span>📞 <a href="tel:+38349584584">+383 49 584 584</a></span>
      <span>✉ <a href="mailto:info@rentigo.ks">info@rentigo.ks</a></span>
    </div>
    <div class="rg-topbar__right">
      <span>🕐 E Hënë – E Diel: 08:00 – 22:00</span>
    </div>
  </div>
</div>

<nav class="rg-nav" id="rg-nav">
  <div class="rg-nav__inner">

    <!-- LOGO -->
    <a href="index.html" class="rg-logo">
      <img src="logo.png"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
           class="rg-logo__img" alt="Rentigo" />
      <div class="rg-logo__fallback" style="display:none">
        <div class="rg-logo__mark">
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
            <path d="M3 14L6 7L16 7L19 14Z" fill="white" opacity=".9"/>
            <rect x="2" y="13" width="18" height="5" rx="2" fill="white" opacity=".7"/>
            <circle cx="6.5" cy="19.5" r="2" fill="white"/>
            <circle cx="15.5" cy="19.5" r="2" fill="white"/>
          </svg>
        </div>
        <span class="rg-logo__name">Rentigo</span>
      </div>
    </a>

    <!-- LINKS -->
    <ul class="rg-nav__links" id="rg-links">
      <li><a href="index.html"   class="rg-link ${isActive('index.html')}">Home</a></li>
      <li><a href="cars.html"    class="rg-link ${isActive('cars.html')}">Makinat</a></li>
      <li><a href="about.html"   class="rg-link ${isActive('about.html')}">Rreth Nesh</a></li>
      <li><a href="contact.html" class="rg-link ${isActive('contact.html')}">Kontakt</a></li>
    </ul>

    <!-- ACTIONS -->
    <div class="rg-nav__actions" id="rg-actions">
      <!-- Mbushet nga updateNavAuth() -->
    </div>

    <!-- HAMBURGER -->
    <button class="rg-burger" id="rg-burger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>

  <!-- MOBILE MENU -->
  <div class="rg-mobile" id="rg-mobile">
    <a href="index.html"   class="rg-mobile__link ${isActive('index.html')}">Home</a>
    <a href="cars.html"    class="rg-mobile__link ${isActive('cars.html')}">Makinat</a>
    <a href="booking.html" class="rg-mobile__link ${isActive('booking.html')}">Rezervo</a>
    <a href="contact.html" class="rg-mobile__link ${isActive('contact.html')}">Kontakt</a>
    <div id="rg-mobile-auth"></div>
    <a href="booking.html" class="rg-mobile__cta">Rezervo Tani</a>
  </div>
</nav>

<!-- ══════════════════════════════════════════════════════
     AUTH MODAL — Login · Regjistrohu · Fjalëkalim i Harruar
     Hapet me butonin "Hyr" nga navbar
═══════════════════════════════════════════════════════ -->
<div class="rg-modal-overlay" id="rg-auth-modal" role="dialog" aria-modal="true">
  <div class="rg-modal">
    <button class="rg-modal__close" id="rg-modal-close" aria-label="Mbyll">✕</button>

    <!-- LOGO brenda modal -->
    <div class="rg-modal__brand">
      <div class="rg-modal__logo-mark">
        <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
          <path d="M3 14L6 7L16 7L19 14Z" fill="white" opacity=".9"/>
          <rect x="2" y="13" width="18" height="5" rx="2" fill="white" opacity=".7"/>
          <circle cx="6.5" cy="19.5" r="2" fill="white"/>
          <circle cx="15.5" cy="19.5" r="2" fill="white"/>
        </svg>
      </div>
      <span>Rentigo</span>
    </div>

    <!-- TABS -->
    <div class="rg-tabs">
      <button class="rg-tab active" data-tab="login">Hyr</button>
      <button class="rg-tab" data-tab="register">Regjistrohu</button>
      <button class="rg-tab" data-tab="forgot">Fjalëkalim?</button>
    </div>

    <!-- ── TAB: LOGIN ── -->
    <div class="rg-tab-pane active" id="tab-login">
      <p class="rg-modal__sub">Hyni në llogarinë tuaj për të rezervuar.</p>
      <form id="form-login" class="rg-form" autocomplete="on">
        <div class="rg-field">
          <label>Email</label>
          <input type="email" id="login-email" placeholder="email@shembull.com" autocomplete="email" required/>
        </div>
        <div class="rg-field">
          <label>Fjalëkalimi</label>
          <div class="rg-field__pass">
            <input type="password" id="login-pass" placeholder="••••••••" autocomplete="current-password" required/>
            <button type="button" class="rg-eye" onclick="togglePass('login-pass',this)">👁</button>
          </div>
        </div>
        <div class="rg-msg" id="msg-login"></div>
        <button type="submit" class="rg-btn-primary">Hyr →</button>
        <p class="rg-form__hint">
          Nuk ke llogari?
          <a href="#" onclick="switchTab('register');return false">Regjistrohu</a>
        </p>
      </form>
    </div>

    <!-- ── TAB: REGISTER ── -->
    <div class="rg-tab-pane" id="tab-register">
      <p class="rg-modal__sub">Krijo llogarinë tuaj falas.</p>
      <form id="form-register" class="rg-form" autocomplete="on">
        <div class="rg-field">
          <label>Emri i Plotë</label>
          <input type="text" id="reg-name" placeholder="Emri juaj" autocomplete="name" required/>
        </div>
        <div class="rg-field">
          <label>Email</label>
          <input type="email" id="reg-email" placeholder="email@shembull.com" autocomplete="email" required/>
        </div>
        <div class="rg-field">
          <label>Numri i Telefonit</label>
          <input type="tel" id="reg-phone" placeholder="+383 44 000 000" autocomplete="tel"/>
        </div>
        <div class="rg-field">
          <label>Fjalëkalimi</label>
          <div class="rg-field__pass">
            <input type="password" id="reg-pass" placeholder="Min. 6 karaktere" required/>
            <button type="button" class="rg-eye" onclick="togglePass('reg-pass',this)">👁</button>
          </div>
        </div>
        <div class="rg-field">
          <label>Ripërsërit Fjalëkalimin</label>
          <input type="password" id="reg-pass2" placeholder="••••••••" required/>
        </div>
        <div class="rg-msg" id="msg-register"></div>
        <button type="submit" class="rg-btn-primary">Krijo Llogarinë →</button>
        <p class="rg-form__hint">
          Ke llogari?
          <a href="#" onclick="switchTab('login');return false">Hyr këtu</a>
        </p>
      </form>
    </div>

    <!-- ── TAB: FORGOT PASSWORD ── -->
    <div class="rg-tab-pane" id="tab-forgot">
      <!-- HAPI 1: Jep email -->
      <div id="forgot-step1">
        <p class="rg-modal__sub">Jepni email-in tuaj dhe do t'ju dërgojmë kodin e rivendosjes.</p>
        <form id="form-forgot" class="rg-form">
          <div class="rg-field">
            <label>Email</label>
            <input type="email" id="forgot-email" placeholder="email@shembull.com" required/>
          </div>
          <div class="rg-msg" id="msg-forgot"></div>
          <button type="submit" class="rg-btn-primary">Dërgo Kodin →</button>
        </form>
      </div>

      <!-- HAPI 2: Vendos kodin + fjalëkalim i ri -->
      <div id="forgot-step2" style="display:none">
        <p class="rg-modal__sub">Vendosni kodin dhe fjalëkalimin e ri.</p>
        <div class="rg-code-hint" id="rg-code-hint">📧 Kontrollo console-in e serverit për kodin</div>
        <form id="form-reset" class="rg-form">
          <div class="rg-field">
            <label>Kodi 6-shifror</label>
            <div class="rg-code-inputs">
              <input type="text" class="rg-code-box" maxlength="1" inputmode="numeric" id="c1"/>
              <input type="text" class="rg-code-box" maxlength="1" inputmode="numeric" id="c2"/>
              <input type="text" class="rg-code-box" maxlength="1" inputmode="numeric" id="c3"/>
              <input type="text" class="rg-code-box" maxlength="1" inputmode="numeric" id="c4"/>
              <input type="text" class="rg-code-box" maxlength="1" inputmode="numeric" id="c5"/>
              <input type="text" class="rg-code-box" maxlength="1" inputmode="numeric" id="c6"/>
            </div>
          </div>
          <div class="rg-field">
            <label>Fjalëkalimi i Ri</label>
            <input type="password" id="new-pass" placeholder="Min. 6 karaktere" required/>
          </div>
          <div class="rg-field">
            <label>Ripërsërit</label>
            <input type="password" id="new-pass2" placeholder="••••••••" required/>
          </div>
          <div class="rg-msg" id="msg-reset"></div>
          <button type="submit" class="rg-btn-primary">Rivendos Fjalëkalimin →</button>
        </form>
        <p class="rg-form__hint">
          <a href="#" onclick="showForgotStep(1);return false">← Kthehu</a>
        </p>
      </div>
    </div>

  </div>
</div>
`;

  /* ── 3. INJECT NE DOM ── */
  var wrapper = document.createElement('div');
  wrapper.id = 'rg-navbar-root';
  wrapper.innerHTML = navHTML;
  document.body.insertBefore(wrapper, document.body.firstChild);

  /* ── 4. LOGO PNG (e ngarkuara nga uploads) ── */
  // Vendos rrugën e saktë te logo.png
  var logoImg = document.querySelector('.rg-logo__img');
  if (logoImg) {
    // Provo me rrugë relative — nëse dështon onerror e fsheh dhe tregon fallback SVG
    logoImg.src = 'logo.png';
  }

  /* ── 5. NAVBAR SCROLL EFFECT ── */
  window.addEventListener('scroll', function () {
    var nav = document.getElementById('rg-nav');
    if (nav) nav.classList.toggle('rg-nav--scrolled', window.scrollY > 30);
  });

  /* ── 6. HAMBURGER ── */
  document.getElementById('rg-burger').addEventListener('click', function () {
    this.classList.toggle('open');
    document.getElementById('rg-mobile').classList.toggle('open');
  });

  // Mbyll menu kur klikohet link
  document.querySelectorAll('.rg-mobile__link, .rg-mobile__cta').forEach(function (l) {
    l.addEventListener('click', function () {
      document.getElementById('rg-burger').classList.remove('open');
      document.getElementById('rg-mobile').classList.remove('open');
    });
  });

  /* ── 7. AUTH STATE — Navbar ── */
  updateNavAuth();

  function updateNavAuth() {
    var token = localStorage.getItem('rentigoToken');
    var user = null;
    try { user = JSON.parse(localStorage.getItem('rentigoUser')); } catch (e) {}

    var actions = document.getElementById('rg-actions');
    var mobileAuth = document.getElementById('rg-mobile-auth');

    if (token && user) {
      // I LOGUAR
      actions.innerHTML =
        '<div class="rg-user">' +
          '<span class="rg-user__dot"></span>' +
          '<span class="rg-user__name">' + _esc(user.name || user.email) + '</span>' +
          '<button class="rg-btn-ghost" onclick="rgLogout()">Dil</button>' +
        '</div>' +
        '<a href="booking.html" class="rg-btn-orange">Rezervo Tani</a>';
      if (mobileAuth) {
        mobileAuth.innerHTML =
          '<span class="rg-mobile__link" style="color:#3fb950">👤 ' + _esc(user.name || user.email) + '</span>' +
          '<a href="#" class="rg-mobile__link" onclick="rgLogout()">Dil →</a>';
      }
    } else {
      // JO I LOGUAR
      actions.innerHTML =
        '<button class="rg-btn-ghost" onclick="rgOpenModal()">Hyr</button>' +
        '<a href="booking.html" class="rg-btn-orange">Rezervo Tani</a>';
      if (mobileAuth) {
        mobileAuth.innerHTML =
          '<a href="#" class="rg-mobile__link" onclick="rgOpenModal()">🔑 Hyr / Regjistrohu</a>';
      }
    }
  }

  /* ── 8. MODAL OPEN / CLOSE ── */
  window.rgOpenModal = function (tab) {
    var m = document.getElementById('rg-auth-modal');
    m.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (tab) switchTab(tab);
    // Mbyll menu mobile nëse ishte hapur
    document.getElementById('rg-burger').classList.remove('open');
    document.getElementById('rg-mobile').classList.remove('open');
  };

  window.rgCloseModal = function () {
    document.getElementById('rg-auth-modal').classList.remove('open');
    document.body.style.overflow = '';
  };

  // Mbyll me klik jashtë
  document.getElementById('rg-auth-modal').addEventListener('click', function (e) {
    if (e.target === this) rgCloseModal();
  });
  document.getElementById('rg-modal-close').addEventListener('click', rgCloseModal);

  // Mbyll me Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') rgCloseModal();
  });

  /* ── 9. TABS ── */
  window.switchTab = function (name) {
    document.querySelectorAll('.rg-tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.tab === name);
    });
    document.querySelectorAll('.rg-tab-pane').forEach(function (p) {
      p.classList.toggle('active', p.id === 'tab-' + name);
    });
  };

  document.querySelectorAll('.rg-tab').forEach(function (btn) {
    btn.addEventListener('click', function () { switchTab(this.dataset.tab); });
  });

  /* ── 10. TOGGLE PASSWORD VISIBILITY ── */
  window.togglePass = function (inputId, btn) {
    var inp = document.getElementById(inputId);
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
    btn.textContent = inp.type === 'password' ? '👁' : '🙈';
  };

  /* ── 11. FORGOT: STEP SWITCH ── */
  window.showForgotStep = function (n) {
    document.getElementById('forgot-step1').style.display = n === 1 ? 'block' : 'none';
    document.getElementById('forgot-step2').style.display = n === 2 ? 'block' : 'none';
  };

  // Code boxes — auto-focus
  var codeBoxes = document.querySelectorAll('.rg-code-box');
  codeBoxes.forEach(function (box, i) {
    box.addEventListener('input', function () {
      if (this.value && i < codeBoxes.length - 1) codeBoxes[i + 1].focus();
    });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && !this.value && i > 0) codeBoxes[i - 1].focus();
    });
  });

  /* ── 12. FORM HANDLERS ── */

  // LOGIN
  document.getElementById('form-login').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = document.getElementById('login-email').value.trim();
    var pass  = document.getElementById('login-pass').value;
    var msg   = document.getElementById('msg-login');
    var btn   = this.querySelector('button[type=submit]');

    setMsg(msg, '');
    btn.disabled = true;
    btn.textContent = '⏳ Duke hyrë...';

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: pass })
    })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      btn.disabled = false;
      btn.textContent = 'Hyr →';
      if (res.success) {
        localStorage.setItem('rentigoToken', res.token);
        localStorage.setItem('rentigoUser', JSON.stringify(res.user));
        setMsg(msg, '✓ Mirë se erdhe, ' + (res.user.name || '') + '!', 'success');
        setTimeout(function () { rgCloseModal(); updateNavAuth(); }, 900);
      } else {
        setMsg(msg, '✗ ' + (res.message || 'Email ose fjalëkalim gabim'), 'error');
      }
    })
    .catch(function () {
      btn.disabled = false;
      btn.textContent = 'Hyr →';
      setMsg(msg, '✗ Problem me lidhjen. Provo përsëri.', 'error');
    });
  });

  // REGISTER
  document.getElementById('form-register').addEventListener('submit', function (e) {
    e.preventDefault();
    var name  = document.getElementById('reg-name').value.trim();
    var email = document.getElementById('reg-email').value.trim();
    var phone = document.getElementById('reg-phone').value.trim();
    var pass  = document.getElementById('reg-pass').value;
    var pass2 = document.getElementById('reg-pass2').value;
    var msg   = document.getElementById('msg-register');
    var btn   = this.querySelector('button[type=submit]');

    if (pass !== pass2) { setMsg(msg, '✗ Fjalëkalimet nuk përputhen!', 'error'); return; }
    if (pass.length < 6) { setMsg(msg, '✗ Fjalëkalimi duhet të ketë min. 6 karaktere!', 'error'); return; }

    btn.disabled = true;
    btn.textContent = '⏳ Duke krijuar...';

    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, phone: phone, password: pass })
    })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      btn.disabled = false;
      btn.textContent = 'Krijo Llogarinë →';
      if (res.success) {
        localStorage.setItem('rentigoToken', res.token);
        localStorage.setItem('rentigoUser', JSON.stringify(res.user));
        setMsg(msg, '✓ Llogaria u krijua! Mirë se erdhe!', 'success');
        setTimeout(function () { rgCloseModal(); updateNavAuth(); }, 900);
      } else {
        setMsg(msg, '✗ ' + (res.message || 'Gabim gjatë regjistrimit'), 'error');
      }
    })
    .catch(function () {
      btn.disabled = false;
      btn.textContent = 'Krijo Llogarinë →';
      setMsg(msg, '✗ Problem me lidhjen. Provo përsëri.', 'error');
    });
  });

  // FORGOT PASSWORD
  document.getElementById('form-forgot').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = document.getElementById('forgot-email').value.trim();
    var msg   = document.getElementById('msg-forgot');
    var btn   = this.querySelector('button[type=submit]');

    btn.disabled = true;
    btn.textContent = '⏳ Duke dërguar...';

    fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      btn.disabled = false;
      btn.textContent = 'Dërgo Kodin →';
      if (res.success) {
        // Ruaj kodin për ta treguar te step 2
        if (res.code) {
          var hint = document.getElementById('rg-code-hint');
          if (hint) hint.textContent = '📌 Kodi juaj: ' + res.code + ' (shiko edhe console-in e serverit)';
          // Auto-fill code boxes
          res.code.split('').forEach(function(ch, i) {
            var box = document.getElementById('c' + (i+1));
            if (box) box.value = ch;
          });
        }
        setMsg(msg, '✓ Kodi u gjenerua!', 'success');
        setTimeout(function () { showForgotStep(2); }, 900);
      } else {
        setMsg(msg, '✗ ' + (res.message || 'Email nuk u gjet'), 'error');
      }
    })
    .catch(function () {
      btn.disabled = false;
      btn.textContent = 'Dërgo Kodin →';
      setMsg(msg, '✗ Problem me lidhjen. A është serveri aktiv?', 'error');
    });
  });

  // RESET PASSWORD
  document.getElementById('form-reset').addEventListener('submit', function (e) {
    e.preventDefault();
    var code  = ['c1','c2','c3','c4','c5','c6'].map(function (id) { return document.getElementById(id).value; }).join('');
    var pass  = document.getElementById('new-pass').value;
    var pass2 = document.getElementById('new-pass2').value;
    var email = document.getElementById('forgot-email').value.trim();
    var msg   = document.getElementById('msg-reset');
    var btn   = this.querySelector('button[type=submit]');

    if (code.length < 6) { setMsg(msg, '✗ Plotëso kodin 6-shifror!', 'error'); return; }
    if (pass !== pass2)  { setMsg(msg, '✗ Fjalëkalimet nuk përputhen!', 'error'); return; }

    btn.disabled = true;
    btn.textContent = '⏳ Duke rivendosur...';

    fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, code: code, newPassword: pass })
    })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      btn.disabled = false;
      btn.textContent = 'Rivendos Fjalëkalimin →';
      if (res.success) {
        setMsg(msg, '✓ Fjalëkalimi u rivendos! Tani mund të hysh.', 'success');
        setTimeout(function () { showForgotStep(1); switchTab('login'); }, 1500);
      } else {
        setMsg(msg, '✗ ' + (res.message || 'Kod gabim ose i skaduar'), 'error');
      }
    })
    .catch(function () {
      btn.disabled = false;
      btn.textContent = 'Rivendos Fjalëkalimin →';
      setMsg(msg, '✗ Problem me lidhjen.', 'error');
    });
  });

  /* ── 13. LOGOUT ── */
  window.rgLogout = function () {
    localStorage.removeItem('rentigoToken');
    localStorage.removeItem('rentigoUser');
    updateNavAuth();
    window.location.reload();
  };

  /* ── HELPERS ── */
  function setMsg(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className = 'rg-msg' + (type ? ' rg-msg--' + type : '');
  }

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

})();