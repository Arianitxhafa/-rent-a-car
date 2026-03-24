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
    this.cars = lines.slice(1).filter(l => l.trim()).map(line => {
      const [id, brand, model, year, pricePerDay, available] = line.split(',');
      return new Car(id, brand, model, year, parseFloat(pricePerDay), available.trim() === 'true');
    });
  }

  getAll() {
    return this.cars;
  }

  getById(id) {
    return this.cars.find(c => c.getId() === id);
  }

  add(car) {
    this.cars.push(car);
    this.save();
  }

  save() {
    const header = 'id,brand,model,year,pricePerDay,available\n';
    const rows = this.cars.map(c =>
      `${c.getId()},${c.getBrand()},${c.getModel()},${c.getYear()},${c.getPricePerDay()},${c.isAvailable()}`
    ).join('\n');
    fs.writeFileSync(this.filePath, header + rows, 'utf8');
  }
}

module.exports = FileRepository;
