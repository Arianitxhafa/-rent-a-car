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
}

module.exports = CarService;

