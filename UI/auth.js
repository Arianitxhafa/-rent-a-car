/* ============================================================
   auth.js — Login, Register, Forgot Password logic
============================================================ */

function handleLogin(e) {
    e.preventDefault();
    var email = document.getElementById('login-email').value.trim();
    var pass = document.getElementById('login-pass').value;
    var msg = document.getElementById('login-message');
    var btn = e.target.querySelector('button[type="submit"]');

    if (!email || !pass) {
        msg.className = 'auth-message error';
        msg.textContent = '⚠ Ju lutem plotësoni të gjitha fushat!';
        return;
    }

    btn.disabled = true;
    btn.textContent = '⏳ Duke u lidhur...';

    fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: pass })
    })
    .then(function(r) { return r.json(); })
    .then(function(res) {
        btn.disabled = false;
        btn.textContent = '🚀 Hyj Tani';
        if (res.success) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            showToast('Mirë se erdhe!', 'success');
            setTimeout(function() { window.location.href = 'index.html'; }, 500);
        } else {
            msg.className = 'auth-message error';
            msg.textContent = '✗ ' + res.message;
        }
    })
    .catch(function() {
        btn.disabled = false;
        btn.textContent = '🚀 Hyj Tani';
        msg.className = 'auth-message error';
        msg.textContent = '✗ Gabim në lidhje. Provo përsëri.';
    });
}

function handleRegister(e) {
    e.preventDefault();
    var name = document.getElementById('reg-name').value.trim();
    var email = document.getElementById('reg-email').value.trim();
    var phone = document.getElementById('reg-phone').value.trim();
    var pass = document.getElementById('reg-pass').value;
    var pass2 = document.getElementById('reg-pass2').value;
    var msg = document.getElementById('register-message');
    var btn = e.target.querySelector('button[type="submit"]');

    if (!name || !email || !phone || !pass || !pass2) {
        msg.className = 'auth-message error';
        msg.textContent = '⚠ Ju lutem plotësoni të gjitha fushat!';
        return;
    }
    if (pass !== pass2) {
        msg.className = 'auth-message error';
        msg.textContent = '⚠ Fjalëkalimet nuk përputhen!';
        return;
    }
    if (pass.length < 6) {
        msg.className = 'auth-message error';
        msg.textContent = '⚠ Fjalëkalimi duhet të ketë të paktën 6 karaktere!';
        return;
    }

    btn.disabled = true;
    btn.textContent = '⏳ Duke u regjistruar...';

    fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, phone: phone, password: pass })
    })
    .then(function(r) { return r.json(); })
    .then(function(res) {
        btn.disabled = false;
        btn.textContent = '✓ Regjistrohu';
        if (res.success) {
            msg.className = 'auth-message success';
            msg.textContent = '✓ Regjistrimi u krye! Duke të ridrejtur...';
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            showToast('Mirë se erdhe në Rentigo!', 'success');
            setTimeout(function() { window.location.href = 'index.html'; }, 1500);
        } else {
            msg.className = 'auth-message error';
            msg.textContent = '✗ ' + res.message;
        }
    })
    .catch(function() {
        btn.disabled = false;
        btn.textContent = '✓ Regjistrohu';
        msg.className = 'auth-message error';
        msg.textContent = '✗ Gabim në lidhje. Provo përsëri.';
    });
}

function handleForgotPassword(e) {
    e.preventDefault();
    var email = document.getElementById('forgot-email').value.trim();
    var msg = document.getElementById('forgot-message');
    var btn = e.target.querySelector('button[type="submit"]');

    if (!email) {
        msg.className = 'auth-message error';
        msg.textContent = '⚠ Ju lutem jepni email-in tuaj!';
        return;
    }

    btn.disabled = true;
    btn.textContent = '⏳ Duke dërguar...';

    fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
    })
    .then(function(r) { return r.json(); })
    .then(function(res) {
        btn.disabled = false;
        btn.textContent = '📧 Dërgo Kodin';
        if (res.success) {
            msg.className = 'auth-message success';
            msg.textContent = '✓ Kodi i rivendosjes u dërgua në email-in tuaj!';
            document.getElementById('forgot-form').style.display = 'none';
            document.getElementById('code-form').style.display = 'block';
            startTimer(600); // 10 minuta
        } else {
            msg.className = 'auth-message error';
            msg.textContent = '✗ ' + res.message;
        }
    })
    .catch(function() {
        btn.disabled = false;
        btn.textContent = '📧 Dërgo Kodin';
        msg.className = 'auth-message error';
        msg.textContent = '✗ Gabim në lidhje. Provo përsëri.';
    });
}

function startTimer(seconds) {
    var el = document.getElementById('timer-text');
    var int = setInterval(function() {
        seconds--;
        var m = Math.floor(seconds / 60);
        var s = seconds % 60;
        el.innerHTML = 'Kodi skadon në <span class="time">' + m + ':' + String(s).padStart(2, '0') + '</span>';
        if (seconds <= 0) {
            clearInterval(int);
            document.getElementById('code-form').style.display = 'none';
            document.getElementById('forgot-form').style.display = 'block';
        }
    }, 1000);
}

function verifyCode(e) {
    e.preventDefault();
    var code = [1,2,3,4,5,6].map(function(i) { return document.getElementById('code-' + i).value; }).join('');
    var newPass = document.getElementById('new-pass').value;
    var newPass2 = document.getElementById('new-pass2').value;
    var msg = document.getElementById('code-message');
    var btn = e.target.querySelector('button[type="submit"]');

    if (code.length !== 6) {
        msg.className = 'auth-message error';
        msg.textContent = '⚠ Ju lutem jepni kodin 6 shifror!';
        return;
    }
    if (!newPass || !newPass2) {
        msg.className = 'auth-message error';
        msg.textContent = '⚠ Ju lutem plotësoni fjalëkalimin!';
        return;
    }
    if (newPass !== newPass2) {
        msg.className = 'auth-message error';
        msg.textContent = '⚠ Fjalëkalimet nuk përputhen!';
        return;
    }
    if (newPass.length < 6) {
        msg.className = 'auth-message error';
        msg.textContent = '⚠ Fjalëkalimi duhet të ketë të paktën 6 karaktere!';
        return;
    }

    btn.disabled = true;
    btn.textContent = '⏳ Duke rivendosur...';

    var email = document.getElementById('forgot-email').value;
    fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, code: code, newPassword: newPass })
    })
    .then(function(r) { return r.json(); })
    .then(function(res) {
        btn.disabled = false;
        btn.textContent = '✓ Rivendos';
        if (res.success) {
            msg.className = 'auth-message success';
            msg.textContent = '✓ Fjalëkalimi u rivendos! Duke të ridrejtur...';
            showToast('Fjalëkalimi u rivendos!', 'success');
            setTimeout(function() { window.location.href = 'login.html'; }, 1500);
        } else {
            msg.className = 'auth-message error';
            msg.textContent = '✗ ' + res.message;
        }
    })
    .catch(function() {
        btn.disabled = false;
        btn.textContent = '✓ Rivendos';
        msg.className = 'auth-message error';
        msg.textContent = '✗ Gabim. Provo përsëri.';
    });
}

// AUTO-FOCUS CODE INPUTS
document.addEventListener('DOMContentLoaded', function() {
    [1,2,3,4,5,6].forEach(function(i) {
        var el = document.getElementById('code-' + i);
        if (!el) return;
        el.addEventListener('input', function(e) {
            if (e.target.value && i < 6) {
                document.getElementById('code-' + (i+1)).focus();
            }
        });
        el.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !e.target.value && i > 1) {
                document.getElementById('code-' + (i-1)).focus();
            }
        });
    });
});

// CHECK IF USER IS LOGGED IN
function checkAuth() {
    var token = localStorage.getItem('token');
    var user = localStorage.getItem('user');
    return { token: token, user: user ? JSON.parse(user) : null };
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}