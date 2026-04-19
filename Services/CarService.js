const FileRepository = require('../Data/FileRepository');
const Car = require('../Models/Car');
const path = require('path');

class CarService {
  constructor() {
    this.repository = new FileRepository(path.join(__dirname, '../Data/cars.csv'));
  }

  // ===== VALIDIM I CENTRALIZUAR =====
  // Para: validimi ishte i shperndare - pak ne UI, pak ne metoda te ndara
  // Tani: nje funksion i vetem kontrollon te gjitha fushat para cdo operacioni
  validateCarInput(brand, model, year, pricePerDay) {
    if (!brand || String(brand).trim() === '') {
      return { valid: false, message: 'Marka nuk mund te jete bosh!' };
    }
    if (!model || String(model).trim() === '') {
      return { valid: false, message: 'Modeli nuk mund te jete bosh!' };
    }
    var yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      return { valid: false, message: 'Viti duhet te jete numer valid ndermjet 1900 dhe 2100!' };
    }
    var priceNum = parseFloat(pricePerDay);
    if (isNaN(priceNum) || priceNum <= 0) {
      return { valid: false, message: 'Cmimi duhet te jete numer pozitiv me shume se 0!' };
    }
    return { valid: true };
  }

  // ===== AUTO-INCREMENT ID =====
  // Para: useri fusit manualisht ID-ne - shkaktonte konflikte dhe gabime
  // Tani: sistemi gjeneron automatikisht ID unike
  generateId() {
    try {
      var cars = this.repository.getAll();
      if (cars.length === 0) return '1';
      var maxId = Math.max.apply(null, cars.map(function(c) {
        return parseInt(c.getId()) || 0;
      }));
      return String(maxId + 1);
    } catch (err) {
      return String(Date.now());
    }
  }

  getAllCars() {
    try {
      return this.repository.getAll();
    } catch (err) {
      return [];
    }
  }

  getCarById(id) {
    try {
      if (!id || String(id).trim() === '') {
        return null;
      }
      return this.repository.getById(String(id).trim());
    } catch (err) {
      return null;
    }
  }

  // Para: addCar nuk validonte inputin - pranonte vlera bosh ose negative
  // Tani: perdor validateCarInput() para se te shtoje
  addCar(brand, model, year, pricePerDay, available) {
    try {
      var validation = this.validateCarInput(brand, model, year, pricePerDay);
      if (!validation.valid) {
        return { success: false, message: validation.message };
      }
      var id = this.generateId();
      var car = new Car(id, String(brand).trim(), String(model).trim(), parseInt(year), parseFloat(pricePerDay), available !== false);
      this.repository.add(car);
      return { success: true, car: car, message: brand + ' ' + model + ' u shtua me sukses!' };
    } catch (err) {
      return { success: false, message: 'Gabim gjate shtimit: ' + err.message };
    }
  }

  getAvailableCars() {
    try {
      return this.repository.getAll().filter(function(c) { return c.isAvailable(); });
    } catch (err) {
      return [];
    }
  }

  rentCar(id) {
    try {
      if (!id || String(id).trim() === '') {
        return { success: false, message: 'ID nuk mund te jete bosh!' };
      }
      var car = this.repository.getById(String(id).trim());
      if (!car) return { success: false, message: 'Makina me ID ' + id + ' nuk u gjet!' };
      if (!car.isAvailable()) return { success: false, message: 'Makina nuk eshte e disponueshme!' };
      car._available = false;
      this.repository.save();
      return { success: true, message: car.getDetails() + ' u rezervua me sukses!' };
    } catch (err) {
      return { success: false, message: 'Gabim gjate rezervimit: ' + err.message };
    }
  }

  returnCar(id) {
    try {
      if (!id || String(id).trim() === '') {
        return { success: false, message: 'ID nuk mund te jete bosh!' };
      }
      var car = this.repository.getById(String(id).trim());
      if (!car) return { success: false, message: 'Makina me ID ' + id + ' nuk u gjet!' };
      if (car.isAvailable()) return { success: false, message: 'Makina eshte tashmë e disponueshme!' };
      car._available = true;
      this.repository.save();
      return { success: true, message: car.getDetails() + ' u kthye me sukses!' };
    } catch (err) {
      return { success: false, message: 'Gabim gjate kthimit: ' + err.message };
    }
  }

  // Para: updateCar kishte validim te pjesshem - vetem brand dhe price
  // Tani: perdor validateCarInput() per validim te plote te te gjitha fushave
  updateCar(id, brand, model, year, pricePerDay, available) {
    try {
      if (!id || String(id).trim() === '') {
        return { success: false, message: 'ID nuk mund te jete bosh!' };
      }
      var validation = this.validateCarInput(brand, model, year, pricePerDay);
      if (!validation.valid) {
        return { success: false, message: validation.message };
      }
      var existing = this.repository.getById(String(id).trim());
      if (!existing) {
        return { success: false, message: 'Makina me ID ' + id + ' nuk u gjet!' };
      }
      var updatedCar = new Car(
        String(id).trim(),
        String(brand).trim(),
        String(model).trim(),
        parseInt(year),
        parseFloat(pricePerDay),
        available !== false
      );
      var result = this.repository.update(String(id).trim(), updatedCar);
      if (!result) return { success: false, message: 'Makina nuk u perditesua!' };
      return { success: true, message: brand + ' ' + model + ' u perditesua me sukses!' };
    } catch (err) {
      return { success: false, message: 'Gabim gjate perditesimit: ' + err.message };
    }
  }

  deleteCar(id) {
    try {
      if (!id || String(id).trim() === '') {
        return { success: false, message: 'ID nuk mund te jete bosh!' };
      }
      var existing = this.repository.getById(String(id).trim());
      if (!existing) {
        return { success: false, message: 'Makina me ID ' + id + ' nuk u gjet!' };
      }
      var result = this.repository.delete(String(id).trim());
      if (!result) return { success: false, message: 'Makina nuk u fshi!' };
      return { success: true, message: 'Makina u fshi me sukses!' };
    } catch (err) {
      return { success: false, message: 'Gabim gjate fshirjes: ' + err.message };
    }
  }

  listCars(filter) {
    try {
      var cars = this.repository.getAll();
      if (filter === 'available') {
        return cars.filter(function(c) { return c.isAvailable(); });
      }
      if (filter === 'rented') {
        return cars.filter(function(c) { return !c.isAvailable(); });
      }
      return cars;
    } catch (err) {
      return [];
    }
  }

  findCar(id) {
    try {
      if (!id || String(id).trim() === '') {
        return { success: false, message: 'ID nuk mund te jete bosh!' };
      }
      var car = this.repository.getById(String(id).trim());
      if (!car) return { success: false, message: 'Makina me ID ' + id + ' nuk u gjet!' };
      return { success: true, car: car };
    } catch (err) {
      return { success: false, message: 'Gabim: ' + err.message };
    }
  }

  searchCars(query, maxPrice) {
    try {
      var cars = this.repository.getAll();
      var results = cars;
      if (query && String(query).trim() !== '') {
        var q = String(query).toLowerCase().trim();
        results = results.filter(function(c) {
          return c.getBrand().toLowerCase().indexOf(q) !== -1 ||
                 c.getModel().toLowerCase().indexOf(q) !== -1;
        });
      }
      if (maxPrice !== null && maxPrice !== undefined && maxPrice !== '') {
        var maxP = parseFloat(maxPrice);
        if (isNaN(maxP)) {
          return { success: false, message: 'Ju lutem shkruani cmim valid!', cars: [] };
        }
        if (maxP > 0) {
          results = results.filter(function(c) {
            return parseFloat(c.getPricePerDay()) <= maxP;
          });
        }
      }
      return { success: true, cars: results, count: results.length };
    } catch (err) {
      return { success: false, message: 'Gabim gjate kerkimit: ' + err.message, cars: [] };
    }
  }

  sortCars(sortBy) {
    try {
      var valid = ['price-asc', 'price-desc', 'year-asc', 'year-desc', 'brand-az', 'brand-za'];
      if (valid.indexOf(sortBy) === -1) {
        return { success: false, message: 'Opsion sortimi i pavlefshem!', cars: [] };
      }
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
      return { success: false, message: 'Gabim gjate sortimit: ' + err.message, cars: [] };
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
        '      RAPORT I FLEET-IT - DriveX         ',
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
      return { success: false, message: 'Gabim gjate eksportit: ' + err.message };
    }
  }

  getStatistics() {
    try {
      var cars = this.repository.getAll();
      if (cars.length === 0) {
        return { success: true, total: 0, available: 0, rented: 0, avgPrice: '0.00', maxPrice: '0.00', minPrice: '0.00', totalRevenue: '0.00' };
      }
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

  // Metode ndihmese per eksportin e raportit ne file
  exportToFile(content, exportPath) {
    try {
      return this.repository.exportToFile(content, exportPath);
    } catch (err) {
      return false;
    }
  }
}

module.exports = CarService;

