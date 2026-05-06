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

  // Serialize to plain JSON for API responses
  toJSON() {
    return {
      id: this._id,
      brand: this._brand,
      model: this._model,
      year: this._year,
      pricePerDay: this._pricePerDay,
      available: this._available
    };
  }
}

module.exports = Car;
