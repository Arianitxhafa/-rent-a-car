/* ============================================================
   cars.js — Logjika e faqes së makinave
============================================================ */
var allCars = [];
var currentView = 'grid';

document.addEventListener('DOMContentLoaded', function() {
    loadCars();
});

function loadCars() {
    var grid = document.getElementById('cars-grid');
    grid.innerHTML = [1,2,3,4,5,6].map(function() {
        return '<div class="skel-card"><div class="skeleton" style="height:200px"></div><div style="padding:20px"><div class="skeleton" style="height:18px;margin-bottom:10px;width:70%"></div><div class="skeleton" style="height:14px;width:50%"></div></div></div>';
    }).join('');

    fetch('/api/cars')
        .then(function(r) { return r.json(); })
        .then(function(cars) {
            allCars = cars;
            filterCars();
        })
        .catch(function() {
            grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state__icon">⚠️</div><h3>Gabim në lidhje</h3><p>Sigurohu që serveri është aktiv dhe provo përsëri.</p></div>';
        });
}

function filterCars() {
    var search = (document.getElementById('search-input').value || '').toLowerCase();
    var status = document.querySelector('input[name="status"]:checked').value;
    var maxPrice = parseFloat(document.getElementById('price-range').value);
    var sortBy = document.getElementById('sort-select').value;

    var filtered = allCars.filter(function(c) {
        var matchSearch = !search || (c._brand + ' ' + c._model).toLowerCase().indexOf(search) !== -1;
        var matchStatus = !status || (status === 'available' ? c._available : !c._available);
        var matchPrice = parseFloat(c._pricePerDay) <= maxPrice;
        return matchSearch && matchStatus && matchPrice;
    });

    if (sortBy === 'price-asc') filtered.sort(function(a,b){ return a._pricePerDay - b._pricePerDay; });
    else if (sortBy === 'price-desc') filtered.sort(function(a,b){ return b._pricePerDay - a._pricePerDay; });
    else if (sortBy === 'year-desc') filtered.sort(function(a,b){ return b._year - a._year; });
    else if (sortBy === 'year-asc') filtered.sort(function(a,b){ return a._year - b._year; });
    else if (sortBy === 'brand-az') filtered.sort(function(a,b){ return a._brand.localeCompare(b._brand); });

    document.getElementById('cars-count').textContent = filtered.length + ' makina të gjetura';
    renderCars(filtered);
}

function renderCars(cars) {
    var grid = document.getElementById('cars-grid');
    grid.className = 'cars-grid' + (currentView === 'list' ? ' list-view' : '');

    if (!cars.length) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-state__icon">🚗</div><h3>Asnjë makinë e gjetur</h3><p>Provo të ndryshosh filtrat ose kërkimin.</p></div>';
        return;
    }

    grid.innerHTML = '';
    cars.forEach(function(car, i) {
        var avail = car._available;
        var img = getCarImage(car._brand);
        var cat = getCarCategory(car._pricePerDay);
        var card = document.createElement('div');
        card.className = 'car-card';
        card.style.cssText = 'animation: cardIn 0.4s var(--ease) backwards; animation-delay:' + (i * 0.06) + 's';
        card.innerHTML =
            '<div class="car-img">' +
                '<img src="' + img + '" alt="' + esc(car._brand) + ' ' + esc(car._model) + '" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80\'" />' +
                '<div class="car-img__overlay"></div>' +
                '<div class="car-img__status">' + (avail ? '<span class="tag-available">● Lirë</span>' : '<span class="tag-rented">● Zënë</span>') + '</div>' +
                '<div class="car-img__category">' + cat + '</div>' +
            '</div>' +
            '<div class="car-body">' +
                '<div class="car-name">' + esc(car._brand) + ' ' + esc(car._model) + '</div>' +
                '<div class="car-year">Viti ' + car._year + '</div>' +
                '<div class="car-specs">' +
                    '<div class="car-spec"><label>Çmimi</label><span class="car-price">$' + car._pricePerDay + '<small>/ditë</small></span></div>' +
                    '<div class="car-spec"><label>Kategoria</label><span>' + cat + '</span></div>' +
                    '<div class="car-spec"><label>Statusi</label><span>' + (avail ? '✓ Lirë' : '✗ Zënë') + '</span></div>' +
                '</div>' +
                '<div class="car-actions">' +
                    (avail
                        ? '<a href="booking.html?car=' + car._id + '" class="btn btn--primary">🔑 Rezervo</a>'
                        : '<span class="btn btn--glass" style="opacity:0.5;cursor:default">✗ E Zënë</span>'
                    ) +
                    '<a href="booking.html" class="btn btn--outline btn--sm">Detaje</a>' +
                '</div>' +
            '</div>';
        grid.appendChild(card);
    });
}

function updatePriceLabel(val) {
    document.getElementById('price-val').textContent = '$' + val;
}

function setView(view, btn) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    filterCars();
}

function clearFilters() {
    document.getElementById('search-input').value = '';
    document.querySelector('input[name="status"][value=""]').checked = true;
    document.getElementById('price-range').value = 200;
    document.getElementById('price-val').textContent = '$200';
    document.getElementById('sort-select').value = '';
    filterCars();
}