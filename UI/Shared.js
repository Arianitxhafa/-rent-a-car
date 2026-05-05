/* ============================================================
   shared.js — Funksione të përbashkëta për të gjitha faqet
============================================================ */

// NAVBAR scroll effect
window.addEventListener('scroll', function() {
    var nav = document.getElementById('navbar');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);

    var scrollBtn = document.getElementById('scroll-top');
    if (scrollBtn) scrollBtn.classList.toggle('visible', window.scrollY > 400);
});

// HAMBURGER menu
document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('hamburger');
    var menu = document.getElementById('mobile-menu');
    if (btn && menu) {
        btn.addEventListener('click', function() {
            btn.classList.toggle('open');
            menu.classList.toggle('open');
        });
        menu.querySelectorAll('.mobile-link').forEach(function(l) {
            l.addEventListener('click', function() {
                btn.classList.remove('open');
                menu.classList.remove('open');
            });
        });
    }

    // REVEAL on scroll
    var reveals = document.querySelectorAll('.reveal');
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });
    reveals.forEach(function(el) { observer.observe(el); });

    // Set active nav link
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__link, .mobile-link').forEach(function(l) {
        var href = l.getAttribute('href');
        if (href && href === path) l.classList.add('active');
        else l.classList.remove('active');
    });
});

// TOAST
function showToast(msg, type) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'toast ' + (type || 'info') + ' show';
    clearTimeout(t._t);
    t._t = setTimeout(function() { t.className = 'toast'; }, 3500);
}

// ESCAPE HTML
function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// Car images mapping (Unsplash)
var CAR_IMAGES = {
    'BMW': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80',
    'Mercedes': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80',
    'Audi': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80',
    'Toyota': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&q=80',
    'Volkswagen': 'https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?w=600&q=80',
    'Ford': 'https://images.unsplash.com/photo-1551830820-c8d85ac89e77?w=600&q=80',
    'Hyundai': 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80',
    'Kia': 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=600&q=80',
    'Porsche': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80',
    'Tesla': 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=600&q=80',
    'default': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80'
};

function getCarImage(brand) {
    return CAR_IMAGES[brand] || CAR_IMAGES['default'];
}

function getCarCategory(price) {
    var p = parseFloat(price);
    if (p >= 90) return 'Luxury';
    if (p >= 55) return 'SUV / Premium';
    if (p >= 35) return 'Compact';
    return 'Economy';
}

/* ============================================================
   AUTH HELPERS — shared për të gjitha faqet
============================================================ */
function checkAuth() {
    var token = localStorage.getItem('rentigoToken');
    var user = null;
    try { user = JSON.parse(localStorage.getItem('rentigoUser')); } catch(e) {}
    return { token: token, user: user };
}

function logout() {
    localStorage.removeItem('rentigoToken');
    localStorage.removeItem('rentigoUser');
    window.location.reload();
}