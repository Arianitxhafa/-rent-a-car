/* ============================================================
   booking.js — Logjika e faqes së rezervimit
============================================================ */
var allCars = [];
var selectedCarId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadCarsForBooking();
    setDefaultDates();
    checkUrlParams();
});

function setDefaultDates() {
    var today = new Date();
    var tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
    var nextWeek = new Date(); nextWeek.setDate(today.getDate() + 7);
    var fmt = function(d) {
        return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    };
    var p = document.getElementById('pickup-date');
    var r = document.getElementById('return-date');
    if (p) { p.value = fmt(tomorrow); p.min = fmt(today); p.addEventListener('change', updateSummary); }
    if (r) { r.value = fmt(nextWeek); r.min = fmt(tomorrow); }
}

function checkUrlParams() {
    var params = new URLSearchParams(window.location.search);
    var carId = params.get('car');
    if (carId) selectedCarId = carId;
}

function loadCarsForBooking() {
    fetch('/api/cars')
        .then(function(r) { return r.json(); })
        .then(function(cars) {
            allCars = cars;
            renderCarPicker(cars);
            if (selectedCarId) selectCar(selectedCarId);
        })
        .catch(function() {
            document.getElementById('car-picker').innerHTML = '<p style="color:var(--text3);font-size:14px;">Gabim gjatë ngarkimit. Sigurohu që serveri është aktiv.</p>';
        });
}

function renderCarPicker(cars) {
    var picker = document.getElementById('car-picker');
    var available = cars.filter(function(c) { return c._available; });
    var rented = cars.filter(function(c) { return !c._available; });
    var all = available.concat(rented);

    if (!all.length) {
        picker.innerHTML = '<p style="color:var(--text3);">Nuk ka makina të disponueshme.</p>';
        return;
    }

    picker.innerHTML = '';
    all.forEach(function(car) {
        var avail = car._available;
        var div = document.createElement('div');
        div.className = 'car-option' + (avail ? '' : ' disabled') + (car._id === selectedCarId ? ' selected' : '');
        div.id = 'car-opt-' + car._id;
        if (avail) div.onclick = function() { selectCar(car._id); };
        div.innerHTML =
            '<img class="car-option__img" src="' + getCarImage(car._brand) + '" alt="' + esc(car._brand) + '" onerror="this.src=\'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&q=70\'" />' +
            '<div class="car-option__info">' +
                '<div class="car-option__name">' + esc(car._brand) + ' ' + esc(car._model) + ' ' + car._year + '</div>' +
                '<div class="car-option__meta">' + getCarCategory(car._pricePerDay) + ' • ' + (avail ? '✓ E Disponueshme' : '✗ E Zënë') + '</div>' +
            '</div>' +
            '<div class="car-option__price">$' + car._pricePerDay + '<small>/ditë</small></div>';
        picker.appendChild(div);
    });

    if (selectedCarId) {
        var el = document.getElementById('car-opt-' + selectedCarId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function selectCar(id) {
    selectedCarId = id;
    document.querySelectorAll('.car-option').forEach(function(el) { el.classList.remove('selected'); });
    var opt = document.getElementById('car-opt-' + id);
    if (opt) opt.classList.add('selected');

    var car = allCars.find(function(c) { return c._id === id; });
    if (!car) return;

    document.getElementById('summary-car-name').textContent = car._brand + ' ' + car._model;
    document.getElementById('summary-car-price').textContent = '$' + car._pricePerDay + '/ditë';
    document.getElementById('summary-img').src = getCarImage(car._brand);
    document.getElementById('sum-ppd').textContent = '$' + car._pricePerDay;
    updateSummary();
}

function updateSummary() {
    var pickup = document.getElementById('pickup-date').value;
    var ret = document.getElementById('return-date').value;
    if (!pickup || !ret) return;

    var d1 = new Date(pickup); var d2 = new Date(ret);
    var days = Math.max(1, Math.ceil((d2 - d1) / (1000*60*60*24)));

    document.getElementById('sum-pickup').textContent = formatDate(pickup);
    document.getElementById('sum-return').textContent = formatDate(ret);
    document.getElementById('sum-days').textContent = days + ' ditë';

    var car = allCars.find(function(c) { return c._id === selectedCarId; });
    if (car) {
        var total = (parseFloat(car._pricePerDay) * days).toFixed(0);
        document.getElementById('sum-total').textContent = '$' + total;
    }
}

function formatDate(str) {
    if (!str) return '—';
    var parts = str.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
}

function submitBooking() {
    var msg = document.getElementById('booking-message');

    if (!selectedCarId) {
        msg.textContent = '⚠ Ju lutem zgjidhni një makinë!';
        msg.className = 'booking-msg error';
        document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
        return;
    }

    var pickup = document.getElementById('pickup-date').value;
    var ret = document.getElementById('return-date').value;
    var name = document.getElementById('fullname').value.trim();
    var phone = document.getElementById('phone').value.trim();
    var email = document.getElementById('email').value.trim();

    if (!pickup || !ret) {
        msg.textContent = '⚠ Ju lutem zgjidhni datat!';
        msg.className = 'booking-msg error';
        return;
    }
    if (pickup >= ret) {
        msg.textContent = '⚠ Data e kthimit duhet të jetë pas datës së marrjes!';
        msg.className = 'booking-msg error';
        return;
    }
    if (!name || !phone || !email) {
        msg.textContent = '⚠ Ju lutem plotësoni të gjitha fushat e detyrueshme!';
        msg.className = 'booking-msg error';
        document.getElementById('step3').scrollIntoView({ behavior: 'smooth' });
        return;
    }

    var btn = document.querySelector('.booking-submit');
    btn.disabled = true;
    btn.textContent = '⏳ Duke procesuar...';

    fetch('/api/cars/rent/' + selectedCarId, { method: 'PUT' })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            btn.disabled = false;
            btn.innerHTML = '🚀 Konfirmo Rezervimin';
            if (res.success) {
                var car = allCars.find(function(c) { return c._id === selectedCarId; });
                var days = Math.max(1, Math.ceil((new Date(ret) - new Date(pickup)) / (1000*60*60*24)));
                var total = car ? (parseFloat(car._pricePerDay) * days).toFixed(0) : 0;
                var ref = 'RNT-' + Date.now().toString(36).toUpperCase();

                document.getElementById('success-text').innerHTML =
                    '<strong>' + (car ? car._brand + ' ' + car._model : '') + '</strong> është rezervuar.<br>' +
                    '📅 ' + formatDate(pickup) + ' → ' + formatDate(ret) + ' (' + days + ' ditë)<br>' +
                    '💰 Total: <strong>$' + total + '</strong>';
                document.getElementById('success-ref').textContent = ref;
                document.getElementById('success-modal').style.display = 'flex';
                showToast('Rezervimi u konfirmua!', 'success');
            } else {
                msg.textContent = '✗ ' + res.message;
                msg.className = 'booking-msg error';
            }
        })
        .catch(function() {
            btn.disabled = false;
            btn.innerHTML = '🚀 Konfirmo Rezervimin';
            msg.textContent = '✗ Gabim gjatë rezervimit. Provo përsëri.';
            msg.className = 'booking-msg error';
        });
}