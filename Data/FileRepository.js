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
    if (!fs.existsSync(this.filePath)) return;
    const lines = fs.readFileSync(this.filePath, 'utf8').split('\n');
    this.cars = lines.slice(1).filter(function(l) { return l.trim(); }).map(function(line) {
      const parts = line.split(',');
      return new Car(parts[0], parts[1], parts[2], parts[3], parseFloat(parts[4]), parts[5].trim() === 'true');
    });
  }

  getAll() {
    return this.cars;
  }

  getById(id) {
    return this.cars.find(function(c) { return c.getId() === id; });
  }

  add(car) {
    this.cars.push(car);
    this.save();
  }

  save() {
    const header = 'id,brand,model,year,pricePerDay,available\n';
    const rows = this.cars.map(function(c) {
      return c.getId() + ',' + c.getBrand() + ',' + c.getModel() + ',' + c.getYear() + ',' + c.getPricePerDay() + ',' + c.isAvailable();
    }).join('\n');
    fs.writeFileSync(this.filePath, header + rows, 'utf8');
  }

  update(id, updatedCar) {
    var index = this.cars.findIndex(function(c) { return c.getId() === id; });
    if (index === -1) return false;
    this.cars[index] = updatedCar;
    this.save();
    return true;
  }

  delete(id) {
    var index = this.cars.findIndex(function(c) { return c.getId() === id; });
    if (index === -1) return false;
    this.cars.splice(index, 1);
    this.save();
    return true;
  }
}

module.exports = FileRepository;
