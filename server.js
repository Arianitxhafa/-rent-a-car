const express = require('express');

module.exports = (server, service) => {

  server.get('/api/cars', (req, res) => {
    const cars = service.getAllCars();
    res.json(cars);
  });

  server.get('/api/cars/:id', (req, res) => {
    const car = service.getCarById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Makina nuk u gjet!' });
    res.json(car);
  });

  server.post('/api/cars', (req, res) => {
    const { id, brand, model, year, pricePerDay, available } = req.body;
    const car = service.addCar(id, brand, model, year, pricePerDay, available);
    res.json(car);
  });

  server.put('/api/cars/rent/:id', (req, res) => {
    const result = service.rentCar(req.params.id);
    res.json(result);
  });

  server.put('/api/cars/return/:id', (req, res) => {
    const result = service.returnCar(req.params.id);
    res.json(result);
  });

  server.put('/api/cars/update/:id', function(req, res) {
    var body = req.body;
    var result = service.updateCar(
      req.params.id,
      body.brand,
      body.model,
      body.year,
      body.pricePerDay,
      body.available
    );
    res.json(result);
  });

  server.delete('/api/cars/:id', function(req, res) {
    var result = service.deleteCar(req.params.id);
    res.json(result);
  });

  server.get('/api/cars/list/:filter', function(req, res) {
    var cars = service.listCars(req.params.filter);
    res.json(cars);
  });

  server.get('/api/cars/find/:id', function(req, res) {
    var result = service.findCar(req.params.id);
    res.json(result);
  });

};