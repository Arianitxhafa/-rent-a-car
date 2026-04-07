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

  server.get('/api/cars/search', function(req, res) {
    try {
      var query = req.query.q || '';
      var maxPrice = req.query.maxPrice || null;
      if (maxPrice && isNaN(parseFloat(maxPrice))) {
        return res.status(400).json({ success: false, message: 'Ju lutem shkruani çmim valid!' });
      }
      var result = service.searchCars(query, maxPrice);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim i serverit: ' + err.message });
    }
  });

  server.get('/api/cars/sort/:sortBy', function(req, res) {
    try {
      var validSorts = ['price-asc', 'price-desc', 'year-asc', 'year-desc', 'brand-az', 'brand-za'];
      if (validSorts.indexOf(req.params.sortBy) === -1) {
        return res.status(400).json({ success: false, message: 'Sortim i pavlefshëm!' });
      }
      var result = service.sortCars(req.params.sortBy);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim i serverit: ' + err.message });
    }
  });

  server.get('/api/cars/statistics', function(req, res) {
    try {
      var result = service.getStatistics();
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim: ' + err.message });
    }
  });

  server.get('/api/cars/export', function(req, res) {
    try {
      var result = service.exportReport();
      if (!result.success) return res.status(500).json(result);
      var exportPath = require('path').join(__dirname, 'docs', 'raport.txt');
      var saved = service.repository.exportToFile(result.content, exportPath);
      res.json({ success: true, message: saved ? 'Raporti u eksportua!' : 'Raporti u gjenerua!', content: result.content });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim: ' + err.message });
    }
  });

};