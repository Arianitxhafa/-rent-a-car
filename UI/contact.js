/* ============================================================
   contact.js — Logjika e faqes së kontaktit
============================================================ */

document.addEventListener('DOMContentLoaded', function() {
    setupFaqToggle();
});

function toggleFaq(el) {
    el.classList.toggle('active');
}

function setupFaqToggle() {
    var items = document.querySelectorAll('.faq-item');
    items.forEach(function(item) {
        var q = item.querySelector('.faq-q');
        if (q) {
            q.addEventListener('click', function(e) {
                e.stopPropagation();
                item.classList.toggle('active');
            });
        }
    });
}

function sendMessage(e) {
    e.preventDefault();

    var name = document.getElementById('cf-name').value.trim();
    var phone = document.getElementById('cf-phone').value.trim();
    var email = document.getElementById('cf-email').value.trim();
    var subject = document.getElementById('cf-subject').value;
    var msg = document.getElementById('cf-msg').value.trim();
    var resp = document.getElementById('cf-response');

    if (!name || !phone || !email || !msg) {
        resp.className = 'cf-response error';
        resp.textContent = '⚠ Ju lutem plotësoni të gjitha fushat e detyrueshme!';
        return;
    }

    var btn = document.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = '⏳ Duke dërguar...';

    fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, phone: phone, email: email, subject: subject, message: msg })
    })
    .then(function(r) { return r.json(); })
    .then(function(res) {
        btn.disabled = false;
        btn.textContent = '✉ Dërgo Mesazhin';
        if (res.success) {
            resp.className = 'cf-response success';
            resp.textContent = '✓ Mesazhi u dërgua! Do t\'ju kontaktojmë në shpejti.';
            document.getElementById('contact-form').reset();
            showToast('Mesazhi u dërgua me sukses!', 'success');
        } else {
            resp.className = 'cf-response error';
            resp.textContent = '✗ Gabim: ' + res.message;
        }
    })
    .catch(function() {
        btn.disabled = false;
        btn.textContent = '✉ Dërgo Mesazhin';
        resp.className = 'cf-response error';
        resp.textContent = '✗ Gabim në lidhje. Provo përsëri.';
    });
}