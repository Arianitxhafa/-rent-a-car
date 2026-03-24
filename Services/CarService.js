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
    if (!car.isAvailable()) return { success: false, message: 'Makina nuk është e disponueshme!' };
    car._available = false;
    this.repository.save();
    return { success: true, message: `${car.getDetails()} u rezervua me sukses!` };
  }

  returnCar(id) {
    const car = this.repository.getById(id);
    if (!car) return { success: false, message: 'Makina nuk u gjet!' };
    car._available = true;
    this.repository.save();
    return { success: true, message: `${car.getDetails()} u kthye me sukses!` };
  }
}

module.exports = CarService;
