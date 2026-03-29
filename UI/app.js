function loadCars(filter) {
    var url = filter ? '/api/cars/list/' + filter : '/api/cars';
    fetch(url)
        .then(function(res) { return res.json(); })
        .then(function(cars) {
            var container = document.getElementById('cars-container');
            container.innerHTML = '';
            cars.forEach(function(car) {
                var available = car._available;
                var card = document.createElement('div');
                card.className = 'car-card';
                card.innerHTML =
                    '<h3>' + car._brand + ' ' + car._model + '</h3>' +
                    '<p>ID: ' + car._id + '</p>' +
                    '<p>Viti: ' + car._year + '</p>' +
                    '<p>Cmimi: $' + car._pricePerDay + '/dite</p>' +
                    '<p class="' + (available ? 'available' : 'not-available') + '">' +
                    (available ? 'E disponueshme' : 'E zene') + '</p>' +
                    (available ?
                        '<button class="btn-rent" onclick="rentCar(\'' + car._id + '\')">Rezervo</button>' :
                        '<button class="btn-return" onclick="returnCar(\'' + car._id + '\')">Kthe</button>'
                    ) +
                    '<button class="btn-update" onclick="fillUpdate(\'' + car._id + '\',\'' + car._brand + '\',\'' + car._model + '\',\'' + car._year + '\',\'' + car._pricePerDay + '\')">Edito</button>' +
                    '<button class="btn-delete" onclick="deleteCar(\'' + car._id + '\')">Fshi</button>';
                container.appendChild(card);
            });
        });
}

function rentCar(id) {
    fetch('/api/cars/rent/' + id, { method: 'PUT' })
        .then(function(res) { return res.json(); })
        .then(function(result) {
            alert(result.message);
            loadCars();
        });
}

function returnCar(id) {
    fetch('/api/cars/return/' + id, { method: 'PUT' })
        .then(function(res) { return res.json(); })
        .then(function(result) {
            alert(result.message);
            loadCars();
        });
}

function deleteCar(id) {
    if (!confirm('A jeni i sigurt qe doni ta fshini kete makine?')) return;
    fetch('/api/cars/' + id, { method: 'DELETE' })
        .then(function(res) { return res.json(); })
        .then(function(result) {
            alert(result.message);
            loadCars();
        });
}

function fillUpdate(id, brand, model, year, price) {
    document.getElementById('update-id').value = id;
    document.getElementById('update-brand').value = brand;
    document.getElementById('update-model').value = model;
    document.getElementById('update-year').value = year;
    document.getElementById('update-price').value = price;
    document.getElementById('update-section').style.display = 'block';
    window.scrollTo(0, document.body.scrollHeight);
}

function updateCar() {
    var id = document.getElementById('update-id').value;
    var brand = document.getElementById('update-brand').value;
    var model = document.getElementById('update-model').value;
    var year = document.getElementById('update-year').value;
    var price = document.getElementById('update-price').value;

    fetch('/api/cars/update/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            brand: brand, model: model,
            year: year, pricePerDay: price, available: true
        })
    })
    .then(function(res) { return res.json(); })
    .then(function(result) {
        alert(result.message);
        document.getElementById('update-section').style.display = 'none';
        loadCars();
    });
}

function addCar() {
    var id = document.getElementById('id').value;
    var brand = document.getElementById('brand').value;
    var model = document.getElementById('model').value;
    var year = document.getElementById('year').value;
    var price = document.getElementById('price').value;

    if (!id || !brand || !model || !year || !price) {
        alert('Ploteso te gjitha fushat!');
        return;
    }

    fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id, brand: brand, model: model,
            year: year, pricePerDay: price, available: true
        })
    })
    .then(function(res) { return res.json(); })
    .then(function() {
        alert('Makina u shtua me sukses!');
        loadCars();
    });
}

function filterCars(filter) {
    loadCars(filter);
}

loadCars();
