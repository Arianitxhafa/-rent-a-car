/* ============================================================
   admin.js — Admin Panel Functionality
   - Dashboard statistics
   - Car management
   - Bookings tracking
   - Messages display
   - User management
============================================================ */

var allCars = [];
var allBookings = [];
var allMessages = [];
var allUsers = [];

document.addEventListener('DOMContentLoaded', function() {
    verifyAdminAccess();
    loadDashboardData();
    setupEventListeners();
});

// ════════════════════════════════════════
// ADMIN VERIFICATION
// ════════════════════════════════════════

function verifyAdminAccess() {
    var token = localStorage.getItem('token');
    var user = localStorage.getItem('user');
    
    if (!token || !user) {
        alert('❌ Duhet të jeni i loguar!');
        window.location.href = 'index.html';
        return;
    }
    
    var userData = JSON.parse(user);
    if (!userData.is_admin) {
        alert('❌ Vetëm administratorët mund të hyjnë!');
        window.location.href = 'index.html';
    }
}

// ════════════════════════════════════════
// LOAD DASHBOARD DATA
// ════════════════════════════════════════

function loadDashboardData() {
    loadCarsData();
    loadBookingsData();
    loadUsersData();
    loadMessagesData();
}

function loadCarsData() {
    fetch('http://localhost:5000/api/cars')
        .then(function(r) { return r.json(); })
        .then(function(cars) {
            allCars = cars;
            var available = cars.filter(function(c) { return c._available; });
            
            document.getElementById('total-cars').textContent = cars.length;
            document.getElementById('avail-cars').textContent = available.length;
            
            renderCarsList();
            renderCarsTable();
        })
        .catch(function(err) {
            console.error('Error loading cars:', err);
            document.getElementById('total-cars').textContent = '0';
        });
}

function loadBookingsData() {
    // Simuluar për demo (në realitet do të vinte nga API)
    document.getElementById('total-bookings').textContent = '5';
    renderRecentBookings();
}

function loadUsersData() {
    // Simuluar për demo
    document.getElementById('total-users').textContent = '12';
}

function loadMessagesData() {
    // Simuluar për demo
}

// ════════════════════════════════════════
// RENDER FUNCTIONS
// ════════════════════════════════════════

function renderCarsTable() {
    var tbody = document.getElementById('cars-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    allCars.forEach(function(car) {
        var row = document.createElement('tr');
        var status = car._available ? '✓ Disponueshme' : '⊗ E zënë';
        var statusColor = car._available ? 'color:var(--text)' : 'color:var(--primary)';
        
        row.innerHTML = `
            <td>${car._brand}</td>
            <td>${car._model}</td>
            <td>${car._year}</td>
            <td>$${car._pricePerDay}/ditë</td>
            <td style="${statusColor}; font-weight: 600;">${status}</td>
            <td>
                <button class="btn btn--sm btn--ghost" onclick="editCar('${car._id}')">✎ Ndrysho</button>
                <button class="btn btn--sm btn--danger" onclick="deleteCar('${car._id}')">✕ Fshi</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderCarsList() {
    var tbody = document.getElementById('recent-cars');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><th>Marka</th><th>Modeli</th><th>Viti</th><th>Çmimi</th><th>Statusi</th></tr>';
    allCars.slice(0, 5).forEach(function(car) {
        var status = car._available ? '✓ Lirë' : '⊗ E zënë';
        var row = document.createElement('tr');
        row.innerHTML = `
            <td>${car._brand}</td>
            <td>${car._model}</td>
            <td>${car._year}</td>
            <td>$${car._pricePerDay}</td>
            <td>${status}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderRecentBookings() {
    var tbody = document.getElementById('recent-bookings');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><th>ID</th><th>Përdoruesi</th><th>Makina</th><th>Datat</th></tr>';
    // Demo data
    var demoBookings = [
        { id: 'BK001', user: 'Arben Gashi', car: 'Toyota Corolla', dates: '10-12 Mai' },
        { id: 'BK002', user: 'Florina Kelmendi', car: 'BMW 320i', dates: '11-15 Mai' }
    ];
    
    demoBookings.forEach(function(booking) {
        var row = document.createElement('tr');
        row.innerHTML = `
            <td>${booking.id}</td>
            <td>${booking.user}</td>
            <td>${booking.car}</td>
            <td>${booking.dates}</td>
        `;
        tbody.appendChild(row);
    });
}

// ════════════════════════════════════════
// CAR MANAGEMENT
// ════════════════════════════════════════

function addCar(event) {
    event.preventDefault();
    
    var brand = document.getElementById('car-brand').value.trim();
    var model = document.getElementById('car-model').value.trim();
    var year = parseInt(document.getElementById('car-year').value);
    var price = parseFloat(document.getElementById('car-price').value);
    
    if (!brand || !model || !year || !price) {
        showMessage('car-message', 'Plotëso të gjitha fushat!', 'error');
        return;
    }
    
    var token = localStorage.getItem('token');
    
    fetch('http://localhost:5000/api/cars', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
            brand: brand,
            model: model,
            year: year,
            pricePerDay: price
        })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.success) {
            showMessage('car-message', '✓ Makina u shtua me sukses!', 'success');
            document.getElementById('car-form').reset();
            setTimeout(function() { loadCarsData(); }, 500);
        } else {
            showMessage('car-message', '❌ ' + (data.message || 'Gabim'), 'error');
        }
    })
    .catch(function(err) {
        showMessage('car-message', '❌ Gabim në lidhje: ' + err.message, 'error');
    });
}

function editCar(id) {
    var car = allCars.find(function(c) { return c._id === id; });
    if (!car) {
        alert('Makina nuk u gjet');
        return;
    }
    
    var newBrand = prompt('Marka (e vjetër: ' + car._brand + '):', car._brand);
    if (newBrand === null) return;
    
    var newModel = prompt('Modeli (e vjetër: ' + car._model + '):', car._model);
    if (newModel === null) return;
    
    var newYear = prompt('Viti (e vjetër: ' + car._year + '):', car._year);
    if (newYear === null) return;
    
    var newPrice = prompt('Çmimi (e vjetër: ' + car._pricePerDay + '):', car._pricePerDay);
    if (newPrice === null) return;
    
    var token = localStorage.getItem('token');
    
    fetch('http://localhost:5000/api/cars/update/' + id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
            brand: newBrand,
            model: newModel,
            year: parseInt(newYear),
            pricePerDay: parseFloat(newPrice),
            available: car._available
        })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.success) {
            alert('✓ Makina u përditësua!');
            loadCarsData();
        } else {
            alert('❌ ' + (data.message || 'Gabim'));
        }
    })
    .catch(function(err) {
        alert('❌ Gabim: ' + err.message);
    });
}

function deleteCar(id) {
    if (!confirm('Jeni i sigurt të fshini këtë makinë?')) return;
    
    var token = localStorage.getItem('token');
    
    fetch('http://localhost:5000/api/cars/' + id, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.success) {
            alert('✓ Makina u fshi!');
            loadCarsData();
        } else {
            alert('❌ ' + (data.message || 'Gabim'));
        }
    })
    .catch(function(err) {
        alert('❌ Gabim: ' + err.message);
    });
}

// ════════════════════════════════════════
// UI HELPERS
// ════════════════════════════════════════

function showMessage(elementId, message, type) {
    var el = document.getElementById(elementId);
    if (!el) return;
    
    el.textContent = message;
    el.style.display = 'block';
    el.style.backgroundColor = type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)';
    el.style.color = type === 'success' ? '#22C55E' : '#EF4444';
    el.style.border = '1px solid ' + (type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)');
    
    if (type === 'success') {
        setTimeout(function() { el.style.display = 'none'; }, 3000);
    }
}

function setupEventListeners() {
    // Sidebar link handlers
    var sidebarLinks = document.querySelectorAll('.sidebar a[onclick*="showTab"]');
    sidebarLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            document.querySelectorAll('.sidebar a').forEach(function(a) { a.classList.remove('active'); });
            this.classList.add('active');
        });
    });
}

// ════════════════════════════════════════
// AUTH HELPERS
// ════════════════════════════════════════

function checkAuth() {
    var token = localStorage.getItem('token');
    var user = localStorage.getItem('user');
    
    if (!token || !user) {
        return { token: null, user: null };
    }
    
    return {
        token: token,
        user: JSON.parse(user)
    };
}

function logout() {
    if (confirm('Jeni i sigurt të dilni?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}
