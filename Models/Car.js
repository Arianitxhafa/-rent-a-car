 class Car {
  constructor(id, brand, model, year, pricePerDay, available) {
    this._id = id;
    this._brand = brand;
    this._model = model;
    this._year = year;
    this._pricePerDay = pricePerDay;
    this._available = available;
  }

  getId() { return this._id; }
  getBrand() { return this._brand; }
  getModel() { return this._model; }
  getYear() { return this._year; }
  getPricePerDay() { return this._pricePerDay; }
  isAvailable() { return this._available; }

  getDetails() {
    return `${this._brand} ${this._model} (${this._year}) - $${this._pricePerDay}/day`;
  }
}

module.exports = Car;
