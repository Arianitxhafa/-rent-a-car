/* ══════════════════════════════════════════
   RENTIGO — app.js
   Filtrim CLIENT-SIDE (nuk varet nga route /list/)
══════════════════════════════════════════ */

var allCars = [];       // të gjitha makinat nga serveri
var currentFilter = ''; // '', 'available', 'rented'
var editingId = null;

/* ── IMAZHET sipas markës ── */
var IMGS = {
  'BMW':        'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80',
  'Mercedes':   'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80',
  'Audi':       'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80',
  'Toyota':     'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&q=80',
  'Volkswagen': 'https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?w=600&q=80',
  'Ford':       'https://images.unsplash.com/photo-1551830820-c8d85ac89e77?w=600&q=80',
  'Hyundai':    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80',
  'Kia':        'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=600&q=80',
  'Porsche':    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80',
  'Tesla':      'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=600&q=80',
  'DEFAULT':    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80'
};

function getImg(brand)  { return IMGS[brand] || IMGS['DEFAULT']; }
function getCat(price)  {
  var p = parseFloat(price);
  if (p >= 90) return 'Luxury';
  if (p >= 60) return 'Premium';
  if (p >= 40) return 'Compact';
  return 'Economy';
}
function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function isAvail(car) {
  return car._available === true || car._available === 'true';
}

/* ══════════════════════════════════════════
   1. NGARKO MAKINAT — vetëm GET /api/cars
══════════════════════════════════════════ */
function loadCars() {
  fetch('/api/cars')
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function(cars) {
      allCars = Array.isArray(cars) ? cars : [];
      applyFilters();
      updateStats();
    })
    .catch(function(err) {
      console.error('loadCars error:', err);
      var grid = document.getElementById('cars-container');
      if (grid) grid.innerHTML =
        '<div class="empty-state">' +
          '<div class="empty-state-icon">⚠️</div>' +
          '<h3>Gabim në lidhje</h3>' +
          '<p>Sigurohu që serveri është aktiv: <strong>node Program.js</strong></p>' +
        '</div>';
      var cnt = document.getElementById('cars-count');
      if (cnt) cnt.textContent = '0 makina';
    });
}

/* ══════════════════════════════════════════
   2. FILTRIM + KËRKIM — client-side
══════════════════════════════════════════ */
function applyFilters() {
  var searchEl = document.getElementById('search-inp');
  var search   = searchEl ? searchEl.value.toLowerCase() : '';

  var filtered = allCars.filter(function(c) {
    // filtro sipas statusit
    if (currentFilter === 'available' && !isAvail(c)) return false;
    if (currentFilter === 'rented'    &&  isAvail(c)) return false;
    // filtro sipas kërkimit
    if (search && (c._brand + ' ' + c._model).toLowerCase().indexOf(search) === -1) return false;
    return true;
  });

  renderCars(filtered);
}

function setFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.fbtn').forEach(function(b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  applyFilters();
}

function searchCars(val) {
  applyFilters();
}

/* ══════════════════════════════════════════
   3. SHFAQ KARTAT
══════════════════════════════════════════ */
function renderCars(cars) {
  var grid  = document.getElementById('cars-container');
  var count = document.getElementById('cars-count');
  if (!grid) return;

  if (count) count.textContent = cars.length + ' makina të gjetura';

  if (!cars.length) {
    grid.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-state-icon">🚗</div>' +
        '<h3>Asnjë makinë e gjetur</h3>' +
        '<p>Provo të ndryshosh filtrin ose kërkimin.</p>' +
      '</div>';
    return;
  }

  grid.innerHTML = '';
  cars.forEach(function(car, i) {
    var avail = isAvail(car);
    var card  = document.createElement('div');
    card.className = 'car-card';
    card.style.animationDelay = (i * 0.07) + 's';
    card.innerHTML =
      '<div class="car-img">' +
        '<img src="' + getImg(car._brand) + '" alt="' + esc(car._brand) + '"' +
          ' loading="lazy" onerror="this.src=\'' + IMGS['DEFAULT'] + '\'" />' +
        '<div class="car-img-overlay"></div>' +
        '<span class="car-status-badge ' + (avail ? 'badge-available' : 'badge-rented') + '">' +
          (avail ? '● Lirë' : '● Zënë') +
        '</span>' +
        '<span class="car-category">' + getCat(car._pricePerDay) + '</span>' +
      '</div>' +
      '<div class="car-body">' +
        '<div class="car-name">' + esc(car._brand) + ' ' + esc(car._model) + '</div>' +
        '<div class="car-year">Viti ' + esc(String(car._year)) + ' &nbsp;·&nbsp; ID: ' + esc(car._id) + '</div>' +
        '<div class="car-specs">' +
          '<div class="spec"><label>Çmimi</label><span class="spec-price">$' + car._pricePerDay + '</span></div>' +
          '<div class="spec"><label>Kategoria</label><span>' + getCat(car._pricePerDay) + '</span></div>' +
          '<div class="spec"><label>Statusi</label><span>' + (avail ? '✓ Lirë' : '✗ Zënë') + '</span></div>' +
        '</div>' +
        '<div class="car-actions car-actions-3">' +
          (avail
            ? '<button class="btn-rent" onclick="rentCar(\'' + esc(car._id) + '\')">🔑 Rezervo</button>'
            : '<button class="btn-return" onclick="returnCar(\'' + esc(car._id) + '\')">↩ Kthe</button>'
          ) +
          '<button class="btn-edit" onclick="openEdit(\'' + esc(car._id) + '\',\'' +
            esc(car._brand) + '\',\'' + esc(car._model) + '\',\'' +
            esc(String(car._year)) + '\',\'' + esc(String(car._pricePerDay)) + '\')">✏ Edito</button>' +
          '<button class="btn-del" onclick="deleteCar(\'' + esc(car._id) + '\')">🗑 Fshi</button>' +
        '</div>' +
      '</div>';
    grid.appendChild(card);
  });
}

/* ══════════════════════════════════════════
   4. STATISTIKA
══════════════════════════════════════════ */
function updateStats() {
  var total   = allCars.length;
  var avail   = allCars.filter(isAvail).length;
  var rented  = total - avail;
  var revenue = allCars.reduce(function(s,c){ return s + parseFloat(c._pricePerDay||0); }, 0);

  setText('hs-total',  total);
  setText('hs-avail',  avail);
  setText('hs-rented', rented);
  setText('st-total',  total);
  setText('st-avail',  avail);
  setText('st-rented', rented);
  setText('st-revenue','$' + revenue.toFixed(0));
  setText('nav-status', avail + ' disponueshme');
}

function setText(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ══════════════════════════════════════════
   5. RENT / RETURN
══════════════════════════════════════════ */
function rentCar(id) {
  fetch('/api/cars/rent/' + id, { method: 'PUT' })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      showToast(res.success ? '✓ ' + res.message : '✗ ' + res.message, res.success ? 'ok' : 'err');
      loadCars();
    })
    .catch(function() { showToast('✗ Gabim lidhje!', 'err'); });
}

function returnCar(id) {
  fetch('/api/cars/return/' + id, { method: 'PUT' })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      showToast(res.success ? '✓ ' + res.message : '✗ ' + res.message, res.success ? 'ok' : 'err');
      loadCars();
    })
    .catch(function() { showToast('✗ Gabim lidhje!', 'err'); });
}

/* ══════════════════════════════════════════
   6. SHTO MAKINË
══════════════════════════════════════════ */
function addCar() {
  var brand = (document.getElementById('brand').value || '').trim();
  var model = (document.getElementById('model').value || '').trim();
  var year  = (document.getElementById('year').value  || '').trim();
  var price = (document.getElementById('price').value || '').trim();
  var msg   = document.getElementById('add-msg');

  if (!brand || !model || !year || !price) {
    setMsg(msg, '⚠ Plotëso të gjitha fushat!', 'err'); return;
  }
  if (parseInt(year) < 1990 || parseInt(year) > 2030) {
    setMsg(msg, '⚠ Viti duhet të jetë mes 1990-2030!', 'err'); return;
  }
  if (parseFloat(price) <= 0) {
    setMsg(msg, '⚠ Çmimi duhet të jetë pozitiv!', 'err'); return;
  }

  fetch('/api/cars', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brand: brand, model: model, year: year, pricePerDay: price })
  })
  .then(function(r) { return r.json(); })
  .then(function(res) {
    if (res.success !== false) {
      setMsg(msg, '✓ Makina u shtua me sukses!', 'ok');
      document.getElementById('brand').value = '';
      document.getElementById('model').value = '';
      document.getElementById('year').value  = '';
      document.getElementById('price').value = '';
      loadCars();
      showToast('✓ Makina u shtua!', 'ok');
    } else {
      setMsg(msg, '✗ ' + (res.message || 'Gabim!'), 'err');
    }
  })
  .catch(function() { setMsg(msg, '✗ Gabim lidhje!', 'err'); });
}

/* ══════════════════════════════════════════
   7. DELETE
══════════════════════════════════════════ */
function deleteCar(id) {
  if (!confirm('A jeni i sigurt që doni ta fshini këtë makinë?')) return;
  fetch('/api/cars/' + id, { method: 'DELETE' })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      showToast(res.success ? '✓ ' + res.message : '✗ ' + res.message, res.success ? 'ok' : 'err');
      loadCars();
    })
    .catch(function() { showToast('✗ Gabim lidhje!', 'err'); });
}

/* ══════════════════════════════════════════
   8. EDIT MODAL
══════════════════════════════════════════ */
function openEdit(id, brand, model, year, price) {
  editingId = id;
  document.getElementById('edit-id-label').textContent = id;
  document.getElementById('e-brand').value = brand;
  document.getElementById('e-model').value = model;
  document.getElementById('e-year').value  = year;
  document.getElementById('e-price').value = price;
  setMsg(document.getElementById('edit-msg'), '', '');
  document.getElementById('edit-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeEdit() {
  document.getElementById('edit-modal').classList.remove('open');
  document.body.style.overflow = '';
  editingId = null;
}

function saveEdit() {
  var brand = (document.getElementById('e-brand').value || '').trim();
  var model = (document.getElementById('e-model').value || '').trim();
  var year  = (document.getElementById('e-year').value  || '').trim();
  var price = (document.getElementById('e-price').value || '').trim();
  var msg   = document.getElementById('edit-msg');

  if (!brand || !model || !year || !price) {
    setMsg(msg, '⚠ Plotëso të gjitha fushat!', 'err'); return;
  }

  fetch('/api/cars/update/' + editingId, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brand: brand, model: model, year: year, pricePerDay: price, available: true })
  })
  .then(function(r) { return r.json(); })
  .then(function(res) {
    if (res.success) {
      showToast('✓ ' + res.message, 'ok');
      closeEdit();
      loadCars();
    } else {
      setMsg(msg, '✗ ' + (res.message || 'Gabim!'), 'err');
    }
  })
  .catch(function() { setMsg(msg, '✗ Gabim lidhje!', 'err'); });
}

/* ══════════════════════════════════════════
   9. TOAST + HELPERS
══════════════════════════════════════════ */
function showToast(msg, type) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast ' + (type||'') + ' show';
  clearTimeout(t._timer);
  t._timer = setTimeout(function() { t.className = 'toast'; }, 3200);
}

function setMsg(el, text, cls) {
  if (!el) return;
  el.textContent = text;
  el.className = 'form-msg ' + (cls||'');
}

/* ══════════════════════════════════════════
   10. HAMBURGER + SCROLL
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  // Hamburger
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobile-menu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', function() {
      this.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
  }

  // Scroll navbar shadow
  window.addEventListener('scroll', function() {
    var nav = document.getElementById('navbar');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 30);
    var st = document.getElementById('scroll-top');
    if (st) st.classList.toggle('visible', window.scrollY > 400);
  });

  // Ngarko makinat
  loadCars();
});

function closeMobile() {
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobile-menu');
  if (burger) burger.classList.remove('open');
  if (mobileMenu) mobileMenu.classList.remove('open');
}