const FileRepository = require('../Data/FileRepository');
const Car = require('../Models/Car');
const path = require('path');

class CarService {
  constructor() {
    this.repository = new FileRepository(path.join(__dirname, '../Data/cars.csv'));
  }

  getAllCars() {
    return this.repository.getAll();
  }

  getCarById(id) {
    return this.repository.getById(id);
  }

  addCar(id, brand, model, year, pricePerDay, available) {
    const car = new Car(id, brand, model, year, pricePerDay, available);
    this.repository.add(car);
    return car;
  }

  getAvailableCars() {
    return this.repository.getAll().filter(c => c.isAvailable());
  }

  rentCar(id) {
    const car = this.repository.getById(id);
    if (!car) return { success: false, message: 'Makina nuk u gjet!' };
    if (!car.isAvailable()) return { success: false, message: 'Makina nuk eshte e disponueshme!' };
    car._available = false;
    this.repository.save();
    return { success: true, message: car.getDetails() + ' u rezervua me sukses!' };
  }

  returnCar(id) {
    const car = this.repository.getById(id);
    if (!car) return { success: false, message: 'Makina nuk u gjet!' };
    car._available = true;
    this.repository.save();
    return { success: true, message: car.getDetails() + ' u kthye me sukses!' };
  }

  updateCar(id, brand, model, year, pricePerDay, available) {
    if (!brand || brand.trim() === '') {
      return { success: false, message: 'Emri i markes nuk mund te jete bosh!' };
    }
    if (pricePerDay <= 0) {
      return { success: false, message: 'Cmimi duhet te jete me shume se 0!' };
    }
    var updatedCar = new Car(id, brand, model, year, pricePerDay, available);
    var result = this.repository.update(id, updatedCar);
    if (!result) return { success: false, message: 'Makina nuk u gjet!' };
    return { success: true, message: 'Makina u perditesua me sukses!' };
  }

  deleteCar(id) {
    var result = this.repository.delete(id);
    if (!result) return { success: false, message: 'Makina nuk u gjet!' };
    return { success: true, message: 'Makina u fshi me sukses!' };
  }

  listCars(filter) {
    var cars = this.repository.getAll();
    if (filter === 'available') {
      return cars.filter(function(c) { return c.isAvailable(); });
    }
    if (filter === 'rented') {
      return cars.filter(function(c) { return !c.isAvailable(); });
    }
    return cars;
  }

  findCar(id) {
    var car = this.repository.getById(id);
    if (!car) return { success: false, message: 'Makina nuk u gjet!' };
    return { success: true, car: car };
  }
  searchCars(query, maxPrice) {
    try {
      var cars = this.repository.getAll();
      var results = cars;
      if (query && query.trim() !== '') {
        var q = query.toLowerCase().trim();
        results = results.filter(function(c) {
          return c.getBrand().toLowerCase().indexOf(q) !== -1 ||
                 c.getModel().toLowerCase().indexOf(q) !== -1;
        });
      }
      if (maxPrice && !isNaN(maxPrice) && maxPrice > 0) {
        results = results.filter(function(c) {
          return parseFloat(c.getPricePerDay()) <= parseFloat(maxPrice);
        });
      }
      return { success: true, cars: results, count: results.length };
    } catch (err) {
      return { success: false, message: 'Gabim gjatë kërkimit: ' + err.message, cars: [] };
    }
  }

  sortCars(sortBy) {
    try {
      var cars = this.repository.getAll().slice();
      if (sortBy === 'price-asc') {
        cars.sort(function(a, b) { return parseFloat(a.getPricePerDay()) - parseFloat(b.getPricePerDay()); });
      } else if (sortBy === 'price-desc') {
        cars.sort(function(a, b) { return parseFloat(b.getPricePerDay()) - parseFloat(a.getPricePerDay()); });
      } else if (sortBy === 'year-asc') {
        cars.sort(function(a, b) { return parseInt(a.getYear()) - parseInt(b.getYear()); });
      } else if (sortBy === 'year-desc') {
        cars.sort(function(a, b) { return parseInt(b.getYear()) - parseInt(a.getYear()); });
      } else if (sortBy === 'brand-az') {
        cars.sort(function(a, b) { return a.getBrand().localeCompare(b.getBrand()); });
      } else if (sortBy === 'brand-za') {
        cars.sort(function(a, b) { return b.getBrand().localeCompare(a.getBrand()); });
      }
      return { success: true, cars: cars };
    } catch (err) {
      return { success: false, message: 'Gabim gjatë sortimit: ' + err.message, cars: [] };
    }
  }

  exportReport() {
    try {
      var cars = this.repository.getAll();
      var available = cars.filter(function(c) { return c.isAvailable(); });
      var rented = cars.filter(function(c) { return !c.isAvailable(); });
      var prices = cars.map(function(c) { return parseFloat(c.getPricePerDay()); });
      var totalRev = rented.reduce(function(s, c) { return s + parseFloat(c.getPricePerDay()); }, 0);
      var avgPrice = prices.length ? (prices.reduce(function(a, b) { return a + b; }, 0) / prices.length) : 0;
      var maxPrice = prices.length ? Math.max.apply(null, prices) : 0;
      var minPrice = prices.length ? Math.min.apply(null, prices) : 0;

      var lines = [
        '========================================',
        '         RAPORT I FLEET-IT - DriveX      ',
        '========================================',
        'Data: ' + new Date().toLocaleString(),
        '',
        '--- STATISTIKA GENERALE ---',
        'Makina Gjithsej:      ' + cars.length,
        'Disponueshme:         ' + available.length,
        'Te Zena:              ' + rented.length,
        '',
        '--- STATISTIKA FINANCIARE ---',
        'Cmimi Mesatar/Dite:   $' + avgPrice.toFixed(2),
        'Cmimi Maksimal/Dite:  $' + maxPrice.toFixed(2),
        'Cmimi Minimal/Dite:   $' + minPrice.toFixed(2),
        'Te Ardhura Ditore:    $' + totalRev.toFixed(2),
        '',
        '--- LISTA E PLOTE ---',
        'ID  | Marka          | Modeli    | Viti | $/Dite | Statusi',
        '----+----------------+-----------+------+--------+-----------'
      ];

      cars.forEach(function(c) {
        var line = (c.getId() + '   ').slice(0, 4) + '| ' +
          (c.getBrand() + '               ').slice(0, 15) + '| ' +
          (c.getModel() + '          ').slice(0, 10) + '| ' +
          c.getYear() + ' | $' +
          (parseFloat(c.getPricePerDay()).toFixed(0) + '    ').slice(0, 5) + '  | ' +
          (c.isAvailable() ? 'Lire' : 'Zene');
        lines.push(line);
      });

      lines.push('');
      lines.push('========================================');
      lines.push('   DriveX Fleet Management System       ');
      lines.push('========================================');

      return { success: true, content: lines.join('\n') };
    } catch (err) {
      return { success: false, message: 'Gabim gjatë eksportit: ' + err.message };
    }
  }

  getStatistics() {
    try {
      var cars = this.repository.getAll();
      if (cars.length === 0) return { success: true, total: 0, available: 0, rented: 0, avgPrice: 0, maxPrice: 0, minPrice: 0, totalRevenue: 0 };
      var prices = cars.map(function(c) { return parseFloat(c.getPricePerDay()); });
      var rented = cars.filter(function(c) { return !c.isAvailable(); });
      return {
        success: true,
        total: cars.length,
        available: cars.filter(function(c) { return c.isAvailable(); }).length,
        rented: rented.length,
        avgPrice: (prices.reduce(function(a, b) { return a + b; }, 0) / prices.length).toFixed(2),
        maxPrice: Math.max.apply(null, prices).toFixed(2),
        minPrice: Math.min.apply(null, prices).toFixed(2),
        totalRevenue: rented.reduce(function(s, c) { return s + parseFloat(c.getPricePerDay()); }, 0).toFixed(2)
      };
    } catch (err) {
      return { success: false, message: 'Gabim: ' + err.message };
    }
  }
}

module.exports = CarService;

