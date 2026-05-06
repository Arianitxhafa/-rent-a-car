/* ============================================================
   home.js — Logjika e faqes kryesore
   - Load cars
   - Showcase slider
   - Fleet preview
   - Login modal
   - Car details modal
============================================================ */
var allCars = [];
var fpFilter = '';
var showcaseIndex = 0;
var showcaseInterval;

document.addEventListener('DOMContentLoaded', function() {
    loadHomeData();
    setupAuthLinks();
    setupCarDetailsModal();
});

function loadHomeData() {
    fetch('/api/cars')
        .then(function(r) { return r.json(); })
        .then(function(cars) {
            allCars = cars;
            var avail = cars.filter(function(c) { return c.available; });
            document.getElementById('stat-avail').textContent = avail.length;
            initShowcase(cars);
            renderFP(cars, '');
        })
        .catch(function() {
            document.getElementById('stat-avail').textContent = '0';
        });
}

/* SHOWCASE SLIDER */
function initShowcase(cars) {
    if (!cars.length) return;
    var dots = document.getElementById('showcase-dots');
    dots.innerHTML = '';
    cars.slice(0, 5).forEach(function(c, i) {
        var d = document.createElement('div');
        d.className = 'showcase__dot' + (i === 0 ? ' active' : '');
        d.onclick = function() { goShowcase(i); };
        dots.appendChild(d);
    });
    updateShowcase(0);
    clearInterval(showcaseInterval);
    showcaseInterval = setInterval(function() {
        showcaseIndex = (showcaseIndex + 1) % Math.min(cars.length, 5);
        updateShowcase(showcaseIndex);
    }, 4500);
}

function updateShowcase(i) {
    var cars5 = allCars.slice(0, 5);
    var car = cars5[i];
    if (!car) return;
    showcaseIndex = i;
    var img = document.getElementById('showcase-img');
    var name = document.getElementById('showcase-name');
    var price = document.getElementById('showcase-price');
    // Animate
    img.style.opacity = '0';
    name.style.opacity = '0';
    price.style.opacity = '0';
    setTimeout(function() {
        img.src = getCarImage(car.brand);
        img.alt = car.brand + ' ' + car.model;
        name.textContent = car.brand + ' ' + car.model + ' ' + car.year;
        price.textContent = '$' + car.pricePerDay + ' / ditë';
        img.style.transition = 'opacity 0.5s';
        name.style.transition = 'opacity 0.4s';
        price.style.transition = 'opacity 0.4s';
        img.style.opacity = '1'; name.style.opacity = '1'; price.style.opacity = '1';
    }, 250);
    document.querySelectorAll('.showcase__dot').forEach(function(d, j) {
        d.classList.toggle('active', j === i);
    });
}

function goShowcase(i) {
    clearInterval(showcaseInterval);
    updateShowcase(i);
}

/* FLEET PREVIEW */
function renderFP(cars, filter) {
    var filtered = cars;
    if (filter === 'available') filtered = cars.filter(function(c) { return c.available; });
    if (filter === 'rented') filtered = cars.filter(function(c) { return !c.available; });
    var grid = document.getElementById('fp-grid');
    if (!grid) return;
    var show = filtered.slice(0, 6);
    if (!show.length) {
        grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text3);grid-column:1/-1">Asnjë makinë e gjetur.</div>';
        return;
    }
    grid.innerHTML = '';
    show.forEach(function(car, i) {
        var avail = car.available;
        var card = document.createElement('div');
        card.className = 'car-card';
        card.style.animationDelay = (i * 0.08) + 's';
        card.style.animation = 'cardIn 0.4s var(--ease) backwards';
        card.innerHTML =
            '<style>@keyframes cardIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}</style>' +
            '<div class="car-img">' +
                '<img src="' + getCarImage(car.brand) + '" alt="' + esc(car.brand) + '" loading="lazy" onerror="this.src=\'' + CAR_IMAGES['default'] + '\'" />' +
                '<div class="car-img__overlay"></div>' +
                '<div class="car-img__status">' +
                    (avail ? '<span class="tag-available">● Lirë</span>' : '<span class="tag-rented">● Zënë</span>') +
                '</div>' +
                '<div class="car-img__category">' + getCarCategory(car.pricePerDay) + '</div>' +
            '</div>' +
            '<div class="car-body">' +
                '<div class="car-name">' + esc(car.brand) + ' ' + esc(car.model) + '</div>' +
                '<div class="car-year">Viti ' + car.year + ' • ID: ' + car.id + '</div>' +
                '<div class="car-specs">' +
                    '<div class="car-spec"><label>Çmimi</label><span class="car-price">$' + car.pricePerDay + '<small>/ditë</small></span></div>' +
                    '<div class="car-spec"><label>Kategoria</label><span>' + getCarCategory(car.pricePerDay) + '</span></div>' +
                    '<div class="car-spec"><label>Statusi</label><span>' + (avail ? '✓ Lirë' : '✗ Zënë') + '</span></div>' +
                '</div>' +
                '<div class="car-actions">' +
                    '<a href="booking.html?car=' + car.id + '" class="btn btn--primary">🔑 Rezervo</a>' +
                    '<button class="btn btn--glass" onclick="openCarDetails(\'' + car.id + '\')">📋 Detaje</button>' +
                '</div>' +
            '</div>';
        grid.appendChild(card);
    });
}

function fpFilter(filter, btn) {
    document.querySelectorAll('.fp-filter').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    renderFP(allCars, filter);
}

/* ============================================================
   AUTH LINKS — Navbar ndryshon sipas statusit login
============================================================ */
function setupAuthLinks() {
    var auth = checkAuth();
    var actions = document.getElementById('navbar-actions');
    var mobileAuth = document.getElementById('mobile-auth');
    if (!actions) return;

    if (auth.token && auth.user) {
        /* I LOGUAR — shfaq emrin + buton dil */
        actions.innerHTML =
            '<div class="navbar-user">' +
                '<div class="navbar-user__info">' +
                    '<div class="navbar-user__dot"></div>' +
                    '<span>' + esc(auth.user.name || auth.user.email) + '</span>' +
                '</div>' +
                '<button class="btn btn--glass btn--sm" onclick="logout()">Dil</button>' +
                '<a href="booking.html" class="btn btn--primary btn--sm">Rezervo Tani</a>' +
            '</div>';
        if (mobileAuth) {
            mobileAuth.innerHTML =
                '<span class="mobile-link" style="color:var(--green)">👤 ' + esc(auth.user.name || auth.user.email) + '</span>' +
                '<a href="#" class="mobile-link" onclick="logout()">🚪 Dil</a>';
        }
    } else {
        /* JO I LOGUAR — shfaq vetëm Hyr */
        actions.innerHTML =
            '<button class="btn btn--glass btn--sm" onclick="openLoginModal()">Hyr</button>' +
            '<a href="booking.html" class="btn btn--primary btn--sm">Rezervo Tani</a>';
        if (mobileAuth) {
            mobileAuth.innerHTML =
                '<a href="#" class="mobile-link" onclick="openLoginModal();document.getElementById(\'mobile-menu\').classList.remove(\'open\')">🔑 Hyr</a>';
        }
    }
}

function openLoginModal() {
    var modal = document.getElementById('login-modal');
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Focus email field pas animacionit
    setTimeout(function() {
        var emailField = document.getElementById('modal-email');
        if (emailField) emailField.focus();
    }, 100);
}

function closeLoginModal() {
    var modal = document.getElementById('login-modal');
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
}

function handleModalLogin(e) {
    e.preventDefault();
    var email = document.getElementById('modal-email').value.trim();
    var pass = document.getElementById('modal-pass').value;
    var msg = document.getElementById('modal-message');
    var btn = e.target.querySelector('button[type="submit"]');

    if (!email || !pass) {
        msg.className = 'error';
        msg.textContent = '⚠ Plotëso të gjitha fushat!';
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
        btn.innerHTML = '🚀 Hyr Tani';
        if (res.success) {
            localStorage.setItem('rentigoToken', res.token);
            localStorage.setItem('rentigoUser', JSON.stringify(res.user));
            msg.className = 'success';
            msg.textContent = '✓ Mirë se erdhe, ' + res.user.name + '!';
            setTimeout(function() {
                closeLoginModal();
                setupAuthLinks();
            }, 900);
        } else {
            msg.className = 'error';
            msg.textContent = '✗ ' + (res.message || 'Email ose fjalëkalimi gabim');
        }
    })
    .catch(function() {
        btn.disabled = false;
        btn.innerHTML = '🚀 Hyr Tani';
        msg.className = 'error';
        msg.textContent = '✗ Problem me lidhjen. Provo përsëri.';
    });
}

/* ============================================================
   CAR DETAILS MODAL
============================================================ */
function setupCarDetailsModal() {
    var modal = document.getElementById('car-details-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeCarDetailsModal();
        });
    }
}

function openCarDetails(id) {
    var car = allCars.find(function(c) { return c._id === id; });
    if (!car) return;

    var modal = document.getElementById('car-details-modal');
    var body = document.getElementById('car-details-body');
    var img = getCarImage(car.brand);
    var avail = car.available;
    var cat = getCarCategory(car.pricePerDay);

    /* Detaje specifike sipas markës */
    var specs = getCarSpecs(car.brand, car.model);

    body.innerHTML =
        /* HEADER me foto */
        '<div class="car-detail-header">' +
            '<img class="car-detail-header-img" src="' + img + '" alt="' + esc(car.brand) + '" onerror="this.src=\'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80\'" />' +
            '<div class="car-detail-header-overlay"></div>' +
            '<button class="car-detail-close" onclick="closeCarDetailsModal()">✕</button>' +
            '<div class="car-detail-header-info">' +
                '<h2>' + esc(car.brand) + ' ' + esc(car.model) + ' ' + car.year + '</h2>' +
                '<p>' + cat + ' &nbsp;•&nbsp; ' + (avail ? '● E disponueshme' : '● E zënë') + '</p>' +
            '</div>' +
        '</div>' +

        /* SPECS GRID */
        '<div class="car-detail-specs-grid">' +
            '<div class="spec-item"><span class="spec-icon">👥</span><strong>Ulëset</strong><span>' + specs.seats + '</span></div>' +
            '<div class="spec-item"><span class="spec-icon">⚙</span><strong>Transmisioni</strong><span>' + specs.transmission + '</span></div>' +
            '<div class="spec-item"><span class="spec-icon">⛽</span><strong>Karburanti</strong><span>' + specs.fuel + '</span></div>' +
            '<div class="spec-item"><span class="spec-icon">🔋</span><strong>Fuqia</strong><span>' + specs.power + '</span></div>' +
            '<div class="spec-item"><span class="spec-icon">🎒</span><strong>Bagazhi</strong><span>' + specs.trunk + '</span></div>' +
            '<div class="spec-item"><span class="spec-icon">🛣</span><strong>0-100 km/h</strong><span>' + specs.acceleration + '</span></div>' +
        '</div>' +

        /* FEATURES */
        '<div class="car-detail-features">' +
            '<h3>Çfarë përfshihet</h3>' +
            '<ul>' +
                '<li>Km të pakufizuar</li>' +
                '<li>Sigurimi bazë</li>' +
                '<li>Dorëzim falas në aeroport</li>' +
                '<li>Asistencë rrugore 24/7</li>' +
                '<li>Kthim çdo kohë</li>' +
                '<li>GPS i instaluar</li>' +
            '</ul>' +
        '</div>' +

        /* FOOTER me çmim + buton */
        '<div class="car-detail-footer">' +
            '<div class="car-detail-price-block">' +
                '<span>Çmimi</span>' +
                '<strong>$' + car.pricePerDay + '<small style="font-size:14px;font-weight:500;color:var(--text3)">/ditë</small></strong>' +
            '</div>' +
            '<div class="car-detail-footer-btns">' +
                (avail
                    ? '<a href="booking.html?car=' + car.id + '" class="btn btn--primary">🔑 Rezervo Tani</a>'
                    : '<span class="btn btn--glass" style="opacity:0.5;cursor:default;pointer-events:none">✗ E Zënë</span>'
                ) +
                '<button class="btn btn--outline" onclick="closeCarDetailsModal()">Mbyll</button>' +
            '</div>' +
        '</div>';

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCarDetailsModal() {
    var modal = document.getElementById('car-details-modal');
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
}

/* Specs sipas markës/modelit */
function getCarSpecs(brand, model) {
    var db = {
        'BMW':       { seats: 5, transmission: 'Automatik', fuel: 'Diesel', power: '184 HP', trunk: '480L', acceleration: '7.1s' },
        'Mercedes':  { seats: 5, transmission: 'Automatik', fuel: 'Diesel', power: '194 HP', trunk: '455L', acceleration: '7.4s' },
        'Audi':      { seats: 5, transmission: 'Automatik', fuel: 'Diesel', power: '150 HP', trunk: '460L', acceleration: '8.1s' },
        'Volkswagen':{ seats: 5, transmission: 'Automatik', fuel: 'Diesel', power: '115 HP', trunk: '380L', acceleration: '9.8s' },
        'Toyota':    { seats: 5, transmission: 'Manual',    fuel: 'Benzinë', power: '122 HP', trunk: '361L', acceleration: '10.2s' },
        'Ford':      { seats: 5, transmission: 'Automatik', fuel: 'Benzinë', power: '125 HP', trunk: '375L', acceleration: '10.0s' },
        'Hyundai':   { seats: 5, transmission: 'Manual',    fuel: 'Benzinë', power: '100 HP', trunk: '326L', acceleration: '11.5s' },
        'Kia':       { seats: 5, transmission: 'Automatik', fuel: 'Benzinë', power: '120 HP', trunk: '352L', acceleration: '10.8s' },
        'Porsche':   { seats: 2, transmission: 'Automatik', fuel: 'Benzinë', power: '450 HP', trunk: '132L', acceleration: '3.4s' },
        'Tesla':     { seats: 5, transmission: 'Automatik', fuel: 'Elektrik', power: '283 HP', trunk: '425L', acceleration: '5.8s' },
    };
    return db[brand] || { seats: 5, transmission: 'Automatik', fuel: 'Diesel', power: '130 HP', trunk: '400L', acceleration: '9.5s' };
}