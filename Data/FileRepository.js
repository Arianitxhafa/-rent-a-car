const fs = require('fs');
const path = require('path');
const Car = require('../Models/Car');
const IRepository = require('../Services/IRepository');

class FileRepository extends IRepository {
  constructor(filePath) {
    super();
    this.filePath = filePath;
    this.cars = [];
    this.load();
  }

  load() {
    try {
      if (!fs.existsSync(this.filePath)) {
        console.log('File nuk u gjet, po krijoj file te ri...');
        fs.writeFileSync(this.filePath, 'id,brand,model,year,pricePerDay,available\n', 'utf8');
        return;
      }
      var content = fs.readFileSync(this.filePath, 'utf8');
      if (!content || content.trim() === '') {
        console.log('File eshte bosh.');
        return;
      }
      var lines = content.split('\n');
      this.cars = lines.slice(1).filter(function(l) { return l.trim(); }).map(function(line) {
        try {
          var parts = line.split(',');
          if (parts.length < 6) throw new Error('Rresht i pavlefshëm: ' + line);
          return new Car(
            parts[0].trim(), parts[1].trim(), parts[2].trim(),
            parts[3].trim(), parseFloat(parts[4].trim()),
            parts[5].trim() === 'true'
          );
        } catch (err) {
          console.log('Gabim ne leximin e rreshtit: ' + err.message);
          return null;
        }
      }).filter(function(c) { return c !== null; });
    } catch (err) {
      console.log('Gabim gjate leximit te file: ' + err.message);
      this.cars = [];
    }
  }

  getAll() {
    try {
      return this.cars;
    } catch (err) {
      console.log('Gabim ne getAll: ' + err.message);
      return [];
    }
  }

  getById(id) {
    try {
      if (!id) return null;
      return this.cars.find(function(c) { return c.getId() === id; }) || null;
    } catch (err) {
      console.log('Gabim ne getById: ' + err.message);
      return null;
    }
  }

  add(car) {
    try {
      if (!car) throw new Error('Makina nuk mund te jete null!');
      var existing = this.getById(car.getId());
      if (existing) throw new Error('ID ' + car.getId() + ' ekziston tashme!');
      this.cars.push(car);
      this.save();
    } catch (err) {
      console.log('Gabim ne add: ' + err.message);
      throw err;
    }
  }

  save() {
    try {
      var header = 'id,brand,model,year,pricePerDay,available\n';
      var rows = this.cars.map(function(c) {
        return c.getId() + ',' + c.getBrand() + ',' + c.getModel() + ',' +
               c.getYear() + ',' + c.getPricePerDay() + ',' + c.isAvailable();
      }).join('\n');
      fs.writeFileSync(this.filePath, header + rows, 'utf8');
    } catch (err) {
      console.log('Gabim gjate ruajtjes ne file: ' + err.message);
      throw err;
    }
  }

  update(id, updatedCar) {
    try {
      if (!id) throw new Error('ID nuk mund te jete bosh!');
      var index = this.cars.findIndex(function(c) { return c.getId() === id; });
      if (index === -1) return false;
      this.cars[index] = updatedCar;
      this.save();
      return true;
    } catch (err) {
      console.log('Gabim ne update: ' + err.message);
      return false;
    }
  }

  delete(id) {
    try {
      if (!id) throw new Error('ID nuk mund te jete bosh!');
      var index = this.cars.findIndex(function(c) { return c.getId() === id; });
      if (index === -1) return false;
      this.cars.splice(index, 1);
      this.save();
      return true;
    } catch (err) {
      console.log('Gabim ne delete: ' + err.message);
      return false;
    }
  }

  exportToFile(content, exportPath) {
    try {
      fs.writeFileSync(exportPath, content, 'utf8');
      return true;
    } catch (err) {
      console.log('Gabim gjate eksportit: ' + err.message);
      return false;
    }
  }
}

module.exports = FileRepository;
