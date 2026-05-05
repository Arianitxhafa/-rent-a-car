/* ============================================================
   cars.js — Logjika e faqes së makinave (IMPROVED)
============================================================ */

var allCars = [];
var currentView = 'grid';

document.addEventListener('DOMContentLoaded', function () {
    loadCars();
});

function loadCars() {
    var grid = document.getElementById('cars-grid');

    if (!grid) return;

    // Skeleton UI
    grid.innerHTML = Array(6).fill(0).map(function () {
        return `
        <div class="skel-card">
            <div class="skeleton" style="height:200px"></div>
            <div style="padding:20px">
                <div class="skeleton" style="height:18px;margin-bottom:10px;width:70%"></div>
                <div class="skeleton" style="height:14px;width:50%"></div>
            </div>
        </div>`;
    }).join('');

    fetch('http://localhost:5000/api/cars')
        .then(function (r) {
            if (!r.ok) throw new Error('HTTP Error: ' + r.status);
            return r.json();
        })
        .then(function (cars) {
            if (!Array.isArray(cars)) throw new Error('Invalid data format');

            allCars = cars;
            filterCars();
        })
        .catch(function (err) {
            console.error("FETCH ERROR:", err);

            grid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                <div class="empty-state__icon">⚠️</div>
                <h3>Gabim në lidhje</h3>
                <p>Sigurohu që serveri është aktiv dhe provo përsëri.</p>
            </div>`;
        });
}

function filterCars() {
    var searchVal = document.getElementById('search-input');
    var search = (searchVal ? searchVal.value : '').toLowerCase();

    var statusEl = document.querySelector('input[name="status"]:checked');
    var status = statusEl ? statusEl.value : '';

    var priceEl = document.getElementById('price-range');
    var maxPrice = priceEl ? parseFloat(priceEl.value) : 999999;

    var sortEl = document.getElementById('sort-select');
    var sortBy = sortEl ? sortEl.value : '';

    var filtered = allCars.filter(function (c) {

        var brand = (c._brand || '').toLowerCase();
        var model = (c._model || '').toLowerCase();

        var matchSearch = !search || (brand + ' ' + model).includes(search);

        var available = c._available === true;

        var matchStatus =
            !status ||
            (status === 'available'
                ? available
                : !available);

        var price = Number(c._pricePerDay) || 0;
        var matchPrice = price <= maxPrice;

        return matchSearch && matchStatus && matchPrice;
    });

    // Sorting safe
    filtered.sort(function (a, b) {
        var priceA = Number(a._pricePerDay) || 0;
        var priceB = Number(b._pricePerDay) || 0;

        var yearA = Number(a._year) || 0;
        var yearB = Number(b._year) || 0;

        switch (sortBy) {
            case 'price-asc': return priceA - priceB;
            case 'price-desc': return priceB - priceA;
            case 'year-desc': return yearB - yearA;
            case 'year-asc': return yearA - yearB;
            case 'brand-az':
                return (a._brand || '').localeCompare(b._brand || '');
            default:
                return 0;
        }
    });

    var countEl = document.getElementById('cars-count');
    if (countEl) {
        countEl.textContent = filtered.length + ' makina të gjetura';
    }

    renderCars(filtered);
}

function renderCars(cars) {
    var grid = document.getElementById('cars-grid');
    if (!grid) return;

    grid.className = 'cars-grid' + (currentView === 'list' ? ' list-view' : '');

    if (!cars.length) {
        grid.innerHTML = `
        <div class="empty-state">
            <div class="empty-state__icon">🚗</div>
            <h3>Asnjë makinë e gjetur</h3>
            <p>Provo të ndryshosh filtrat ose kërkimin.</p>
        </div>`;
        return;
    }

    grid.innerHTML = '';

    cars.forEach(function (car, i) {

        var avail = car._available === true;
        var img = getCarImage(car._brand || '');
        var cat = getCarCategory(Number(car._pricePerDay) || 0);

        var card = document.createElement('div');
        card.className = 'car-card';
        card.style.cssText =
            'animation: cardIn 0.4s var(--ease) backwards; animation-delay:' + (i * 0.06) + 's';

        card.innerHTML = `
        <div class="car-img">
            <img 
                src="${img}" 
                alt="${esc(car._brand)} ${esc(car._model)}"
                loading="lazy"
                onerror="this.src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80'"
            />
            <div class="car-img__overlay"></div>

            <div class="car-img__status">
                ${avail
                    ? '<span class="tag-available">● Lirë</span>'
                    : '<span class="tag-rented">● Zënë</span>'
                }
            </div>

            <div class="car-img__category">${cat}</div>
        </div>

        <div class="car-body">
            <div class="car-name">${esc(car._brand)} ${esc(car._model)}</div>
            <div class="car-year">Viti ${car._year || '-'}</div>

            <div class="car-specs">
                <div class="car-spec">
                    <label>Çmimi</label>
                    <span class="car-price">
                        $${car._pricePerDay || 0}<small>/ditë</small>
                    </span>
                </div>

                <div class="car-spec">
                    <label>Kategoria</label>
                    <span>${cat}</span>
                </div>

                <div class="car-spec">
                    <label>Statusi</label>
                    <span>${avail ? '✓ Lirë' : '✗ Zënë'}</span>
                </div>
            </div>

            <div class="car-actions">
                ${avail
                    ? `<a href="booking.html?car=${car._id}" class="btn btn--primary">🔑 Rezervo</a>`
                    : `<span class="btn btn--glass" style="opacity:0.5;cursor:default">✗ E Zënë</span>`
                }

                <a href="booking.html" class="btn btn--outline btn--sm">Detaje</a>
            </div>
        </div>`;

        grid.appendChild(card);
    });
}

function updatePriceLabel(val) {
    var el = document.getElementById('price-val');
    if (el) el.textContent = '$' + val;
}

function setView(view, btn) {
    currentView = view;

    document.querySelectorAll('.view-btn').forEach(function (b) {
        b.classList.remove('active');
    });

    if (btn) btn.classList.add('active');

    filterCars();
}

function clearFilters() {
    var search = document.getElementById('search-input');
    if (search) search.value = '';

    var status = document.querySelector('input[name="status"][value=""]');
    if (status) status.checked = true;

    var price = document.getElementById('price-range');
    if (price) price.value = 200;

    var priceVal = document.getElementById('price-val');
    if (priceVal) priceVal.textContent = '$200';

    var sort = document.getElementById('sort-select');
    if (sort) sort.value = '';

    filterCars();
}