var state = {
    filter: '',
    search: '',
    cars: [],
    modalMode: 'add', // 'add' | 'edit'
};

function $(id) {
    return document.getElementById(id);
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function setStatus(text, isLoading) {
    var pill = $('status-pill');
    if (!pill) return;
    pill.textContent = text;
    if (isLoading) pill.classList.add('is-loading');
    else pill.classList.remove('is-loading');
}

function toast(type, title, text) {
    var root = $('toast-root');
    if (!root) return;

    var icon = type === 'ok' ? '✓' : type === 'warn' ? '!' : '⨯';
    var el = document.createElement('div');
    el.className = 'toast toast--' + (type === 'ok' ? 'ok' : type === 'warn' ? 'warn' : 'err');
    el.innerHTML =
        '<div class="toast__icon" aria-hidden="true">' + icon + '</div>' +
        '<div class="toast__body">' +
        '<p class="toast__title">' + escapeHtml(title || '') + '</p>' +
        (text ? '<p class="toast__text">' + escapeHtml(text) + '</p>' : '') +
        '</div>';

    root.appendChild(el);
    setTimeout(function() {
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 3200);
}

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}
}

function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem('theme'); } catch (e) {}
    if (saved === 'light' || saved === 'dark') return setTheme(saved);
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
}

function openModal(mode) {
    state.modalMode = mode;
    var root = $('modal-root');
    var title = $('modal-title');
    var submit = $('modal-submit');
    if (!root || !title || !submit) return;

    title.textContent = mode === 'edit' ? 'Edito makinë' : 'Shto makinë';
    submit.textContent = mode === 'edit' ? 'Ruaj ndryshimet' : 'Shto';

    // In edit mode, ID is readonly
    $('id').readOnly = mode === 'edit';

    root.hidden = false;
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    var root = $('modal-root');
    if (!root) return;
    root.hidden = true;
    document.body.style.overflow = '';
}

function resetForm() {
    $('id').value = '';
    $('brand').value = '';
    $('model').value = '';
    $('year').value = '';
    $('price').value = '';
    $('id').readOnly = false;
}

function fillEditForm(car) {
    $('id').value = car._id;
    $('brand').value = car._brand;
    $('model').value = car._model;
    $('year').value = car._year;
    $('price').value = car._pricePerDay;
}

function getApiUrl() {
    return state.filter ? '/api/cars/list/' + state.filter : '/api/cars';
}

function applySearch(cars) {
    var q = (state.search || '').trim().toLowerCase();
    if (!q) return cars;
    return cars.filter(function(c) {
        return (
            String(c._id).toLowerCase().indexOf(q) !== -1 ||
            String(c._brand).toLowerCase().indexOf(q) !== -1 ||
            String(c._model).toLowerCase().indexOf(q) !== -1
        );
    });
}

function renderStats(carsAll) {
    var total = carsAll.length;
    var available = carsAll.filter(function(c) { return !!c._available; }).length;
    var rented = total - available;
    var elTotal = $('stat-total');
    var elAvail = $('stat-available');
    var elRent = $('stat-rented');
    if (elTotal) elTotal.textContent = String(total);
    if (elAvail) elAvail.textContent = String(available);
    if (elRent) elRent.textContent = String(rented);
}

function renderCars() {
    var container = $('cars-container');
    var empty = $('empty-state');
    if (!container) return;

    var cars = applySearch(state.cars);
    container.innerHTML = '';

    if (!cars.length) {
        if (empty) empty.hidden = false;
        return;
    }
    if (empty) empty.hidden = true;

    cars.forEach(function(car) {
        var available = !!car._available;
        var card = document.createElement('div');
        card.className = 'car-card';
        card.setAttribute('data-id', car._id);

        var badgeClass = available ? 'badge badge--ok' : 'badge badge--no';
        var badgeText = available ? 'Disponueshme' : 'E zënë';

        card.innerHTML =
            '<div class="car-card__head">' +
                '<h3 class="car-card__title">' + escapeHtml(car._brand) + ' ' + escapeHtml(car._model) + '</h3>' +
                '<span class="' + badgeClass + '">' + badgeText + '</span>' +
            '</div>' +
            '<div class="meta">' +
                '<div class="meta__item"><div class="meta__label">ID</div><div class="meta__value">' + escapeHtml(car._id) + '</div></div>' +
                '<div class="meta__item"><div class="meta__label">Viti</div><div class="meta__value">' + escapeHtml(car._year) + '</div></div>' +
                '<div class="meta__item"><div class="meta__label">Çmimi/Ditë</div><div class="meta__value">$' + escapeHtml(car._pricePerDay) + '</div></div>' +
                '<div class="meta__item"><div class="meta__label">Status</div><div class="meta__value">' + badgeText + '</div></div>' +
            '</div>' +
            '<div class="card-actions">' +
                (available
                    ? '<button class="btn btn--rent" type="button" data-action="rent">Rezervo</button>'
                    : '<button class="btn btn--return" type="button" data-action="return">Kthe</button>'
                ) +
                '<button class="btn btn--update" type="button" data-action="edit">Edito</button>' +
                '<button class="btn btn--delete" type="button" data-action="delete">Fshi</button>' +
            '</div>';

        container.appendChild(card);
    });
}

function loadCars() {
    setStatus('Duke ngarkuar…', true);
    return fetch(getApiUrl())
        .then(function(res) { return res.json(); })
        .then(function(cars) {
            state.cars = Array.isArray(cars) ? cars : [];
            renderStats(state.cars);
            renderCars();
            setStatus('Gati', false);
        })
        .catch(function() {
            setStatus('Gabim në ngarkim', false);
            toast('err', 'Gabim', 'S’u arrit të ngarkohen të dhënat.');
        });
}

function rentCar(id) {
    setStatus('Duke rezervuar…', true);
    return fetch('/api/cars/rent/' + id, { method: 'PUT' })
        .then(function(res) { return res.json(); })
        .then(function(result) {
            toast('ok', 'Rezervim', result && result.message ? result.message : 'U krye me sukses.');
            return loadCars();
        })
        .finally(function() { setStatus('Gati', false); });
}

function returnCar(id) {
    setStatus('Duke kthyer…', true);
    return fetch('/api/cars/return/' + id, { method: 'PUT' })
        .then(function(res) { return res.json(); })
        .then(function(result) {
            toast('ok', 'Kthim', result && result.message ? result.message : 'U krye me sukses.');
            return loadCars();
        })
        .finally(function() { setStatus('Gati', false); });
}

function confirmDelete(id) {
    // Lightweight confirm using browser confirm, but with toast feedback.
    // (Keeping it simple without adding a second modal type.)
    var ok = confirm('A jeni i sigurt qe doni ta fshini kete makine?');
    if (!ok) return;
    setStatus('Duke fshirë…', true);
    fetch('/api/cars/' + id, { method: 'DELETE' })
        .then(function(res) { return res.json(); })
        .then(function(result) {
            toast('ok', 'Fshirje', result && result.message ? result.message : 'U fshi me sukses.');
            loadCars();
        })
        .catch(function() {
            toast('err', 'Gabim', 'S’u arrit të fshihet makina.');
        })
        .finally(function() { setStatus('Gati', false); });
}

function submitModal() {
    var id = $('id').value.trim();
    var brand = $('brand').value.trim();
    var model = $('model').value.trim();
    var year = $('year').value;
    var price = $('price').value;

    if (!id || !brand || !model || !year || !price) {
        toast('warn', 'Kujdes', 'Plotëso të gjitha fushat.');
        return;
    }

    if (state.modalMode === 'edit') {
        setStatus('Duke ruajtur…', true);
        fetch('/api/cars/update/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                brand: brand,
                model: model,
                year: year,
                pricePerDay: price,
                available: true
            })
        })
        .then(function(res) { return res.json(); })
        .then(function(result) {
            toast('ok', 'U ruajt', result && result.message ? result.message : 'Ndryshimet u ruajtën.');
            closeModal();
            resetForm();
            loadCars();
        })
        .catch(function() {
            toast('err', 'Gabim', 'S’u arrit të ruhet makina.');
        })
        .finally(function() { setStatus('Gati', false); });
        return;
    }

    setStatus('Duke shtuar…', true);
    fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            brand: brand,
            model: model,
            year: year,
            pricePerDay: price,
            available: true
        })
    })
    .then(function(res) { return res.json(); })
    .then(function() {
        toast('ok', 'U shtua', 'Makina u shtua me sukses.');
        closeModal();
        resetForm();
        loadCars();
    })
    .catch(function() {
        toast('err', 'Gabim', 'S’u arrit të shtohet makina.');
    })
    .finally(function() { setStatus('Gati', false); });
}

function setFilter(filter) {
    state.filter = filter || '';
    var chips = document.querySelectorAll('.chip[data-filter]');
    for (var i = 0; i < chips.length; i++) {
        var chip = chips[i];
        var isActive = chip.getAttribute('data-filter') === state.filter;
        chip.classList.toggle('is-active', isActive);
        chip.setAttribute('aria-selected', isActive ? 'true' : 'false');
    }
    loadCars();
}

function initUi() {
    initTheme();

    var themeToggle = $('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            var current = document.body.getAttribute('data-theme') || 'dark';
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    var openAdd = $('open-add');
    if (openAdd) {
        openAdd.addEventListener('click', function() {
            resetForm();
            openModal('add');
        });
    }

    var modalRoot = $('modal-root');
    if (modalRoot) {
        modalRoot.addEventListener('click', function(e) {
            var t = e.target;
            if (t && t.getAttribute && t.getAttribute('data-close') === 'true') {
                closeModal();
            }
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !modalRoot.hidden) closeModal();
        });
    }

    var modalSubmit = $('modal-submit');
    if (modalSubmit) modalSubmit.addEventListener('click', submitModal);

    var searchInput = $('search-input');
    if (searchInput) {
        var timer = null;
        searchInput.addEventListener('input', function() {
            clearTimeout(timer);
            timer = setTimeout(function() {
                state.search = searchInput.value || '';
                renderCars();
            }, 120);
        });
    }

    var chipsWrap = document.querySelector('.chips');
    if (chipsWrap) {
        chipsWrap.addEventListener('click', function(e) {
            var btn = e.target && e.target.closest ? e.target.closest('.chip[data-filter]') : null;
            if (!btn) return;
            setFilter(btn.getAttribute('data-filter') || '');
        });
    }

    var container = $('cars-container');
    if (container) {
        container.addEventListener('click', function(e) {
            var btn = e.target && e.target.closest ? e.target.closest('button[data-action]') : null;
            if (!btn) return;

            var card = btn.closest ? btn.closest('.car-card') : null;
            var id = card ? card.getAttribute('data-id') : null;
            if (!id) return;

            var action = btn.getAttribute('data-action');
            if (action === 'rent') return rentCar(id);
            if (action === 'return') return returnCar(id);
            if (action === 'delete') return confirmDelete(id);
            if (action === 'edit') {
                var car = state.cars.find(function(c) { return String(c._id) === String(id); });
                if (!car) return toast('err', 'Gabim', 'Makina nuk u gjet.');
                fillEditForm(car);
                openModal('edit');
                return;
            }
        });
    }
}

/* ===== SEARCH ===== */
function doSearch() {
    var query = document.getElementById('search-query').value.trim();
    var maxPrice = document.getElementById('search-price').value.trim();
    var msg = document.getElementById('search-message');
    var results = document.getElementById('search-results');

    if (maxPrice && isNaN(parseFloat(maxPrice))) {
        msg.textContent = 'Ju lutem shkruani çmim valid!';
        msg.className = 'form-message error';
        return;
    }

    var url = '/api/cars/search?q=' + encodeURIComponent(query);
    if (maxPrice) url += '&maxPrice=' + encodeURIComponent(maxPrice);

    fetch(url)
        .then(function(res) { return res.json(); })
        .then(function(r) {
            if (!r.success) {
                msg.textContent = r.message;
                msg.className = 'form-message error';
                return;
            }
            msg.className = 'form-message';
            renderSearchResults(r.cars, 'Rezultatet e Kërkimit');
        })
        .catch(function() {
            msg.textContent = 'Gabim gjatë kërkimit!';
            msg.className = 'form-message error';
        });
}

/* ===== SORT ===== */
function doSort() {
    var sortBy = document.getElementById('sort-select').value;
    var msg = document.getElementById('search-message');

    if (!sortBy) {
        msg.textContent = 'Zgjidh një opsion sortimi!';
        msg.className = 'form-message error';
        return;
    }

    fetch('/api/cars/sort/' + sortBy)
        .then(function(res) { return res.json(); })
        .then(function(r) {
            if (!r.success) {
                msg.textContent = r.message;
                msg.className = 'form-message error';
                return;
            }
            msg.className = 'form-message';
            var labels = {
                'price-asc': 'Çmimi: Nga më i lirë',
                'price-desc': 'Çmimi: Nga më i shtrenjtë',
                'year-desc': 'Viti: Nga më i ri',
                'year-asc': 'Viti: Nga më i vjetër',
                'brand-az': 'Marka: A-Z',
                'brand-za': 'Marka: Z-A'
            };
            renderSearchResults(r.cars, 'Sortuar: ' + (labels[sortBy] || sortBy));
        })
        .catch(function() {
            msg.textContent = 'Gabim gjatë sortimit!';
            msg.className = 'form-message error';
        });
}

/* ===== EXPORT ===== */
function doExport() {
    var msg = document.getElementById('search-message');
    var results = document.getElementById('search-results');

    fetch('/api/cars/export')
        .then(function(res) { return res.json(); })
        .then(function(r) {
            if (!r.success) {
                msg.textContent = r.message;
                msg.className = 'form-message error';
                return;
            }
            msg.textContent = r.message + ' (docs/raport.txt)';
            msg.className = 'form-message success';
            results.innerHTML = '<div class="export-output">' + escStr(r.content) + '</div>';
            showToast('Raporti u eksportua me sukses!', 'success');
        })
        .catch(function() {
            msg.textContent = 'Gabim gjatë eksportit!';
            msg.className = 'form-message error';
        });
}

/* ===== RENDER SEARCH RESULTS ===== */
function renderSearchResults(cars, title) {
    var container = document.getElementById('search-results');

    if (cars.length === 0) {
        container.innerHTML =
            '<div class="results-header">' +
                '<span class="results-title">' + title + '</span>' +
                '<span class="results-count">0 rezultate</span>' +
            '</div>' +
            '<div style="text-align:center;padding:30px;color:var(--text3)">Asnjë makinë e gjetur</div>';
        return;
    }

    var html = '<div class="results-header">' +
        '<span class="results-title">' + title + '</span>' +
        '<span class="results-count">' + cars.length + ' makina</span>' +
        '</div><div class="search-results-grid">';

    cars.forEach(function(car) {
        var avail = car._available;
        html += '<div class="car-card" style="animation:cardPop 0.3s ease backwards">' +
            '<div class="card-header">' +
                '<div>' +
                    '<div class="card-brand">' + escStr(car._brand) + ' ' + escStr(car._model) + '</div>' +
                    '<div class="card-id">ID: ' + car._id + '</div>' +
                '</div>' +
                '<span class="badge ' + (avail ? 'badge-avail' : 'badge-rented') + '">' +
                (avail ? 'Lirë' : 'Zënë') + '</span>' +
            '</div>' +
            '<div class="card-info">' +
                '<div class="info-item"><label>Viti</label><span>' + car._year + '</span></div>' +
                '<div class="info-item"><label>Çmimi/Ditë</label><span class="price-val">$' + car._pricePerDay + '</span></div>' +
            '</div>' +
        '</div>';
    });

    html += '</div>';
    container.innerHTML = html;
}

initUi();
loadCars();
