const express = require('express');
const path = require('path');

// Para: server.js kalonte direkt parametrat te service pa asnje validim
// Tani: validim bazik ne server + mesazhe te qarta per inpute te gabuara

module.exports = function(server, service) {

  // GET - Te gjitha makinat
  server.get('/api/cars', function(req, res) {
    try {
      var cars = service.getAllCars();
      res.json(cars);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim i serverit: ' + err.message });
    }
  });

  // GET - Makina sipas ID
  server.get('/api/cars/:id', function(req, res) {
    try {
      var id = req.params.id;
      if (!id || id.trim() === '') {
        return res.status(400).json({ success: false, message: 'ID nuk mund te jete bosh!' });
      }
      var car = service.getCarById(id);
      if (!car) return res.status(404).json({ success: false, message: 'Makina me ID ' + id + ' nuk u gjet!' });
      res.json(car);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim i serverit: ' + err.message });
    }
  });

  // POST - Shto makine te re (me auto-increment ID)
  // Para: kerkonte ID nga useri + nuk validonte fushat
  // Tani: ID gjenerohet automatikisht, fushat validohen ne Service
  server.post('/api/cars', function(req, res) {
    try {
      var body = req.body;
      if (!body) {
        return res.status(400).json({ success: false, message: 'Kerkesa nuk permban te dhena!' });
      }
      var brand = body.brand;
      var model = body.model;
      var year = body.year;
      var pricePerDay = body.pricePerDay;
      var available = body.available !== false;

      var result = service.addCar(brand, model, year, pricePerDay, available);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim i serverit: ' + err.message });
    }
  });

  // PUT - Rezervo makine
  server.put('/api/cars/rent/:id', function(req, res) {
    try {
      var id = req.params.id;
      if (!id || id.trim() === '') {
        return res.status(400).json({ success: false, message: 'ID nuk mund te jete bosh!' });
      }
      var result = service.rentCar(id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim i serverit: ' + err.message });
    }
  });

  // PUT - Kthe makine
  server.put('/api/cars/return/:id', function(req, res) {
    try {
      var id = req.params.id;
      if (!id || id.trim() === '') {
        return res.status(400).json({ success: false, message: 'ID nuk mund te jete bosh!' });
      }
      var result = service.returnCar(id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim i serverit: ' + err.message });
    }
  });

  // PUT - Perditeso makine
  server.put('/api/cars/update/:id', function(req, res) {
    try {
      var id = req.params.id;
      var body = req.body;
      if (!id || id.trim() === '') {
        return res.status(400).json({ success: false, message: 'ID nuk mund te jete bosh!' });
      }
      if (!body) {
        return res.status(400).json({ success: false, message: 'Kerkesa nuk permban te dhena!' });
      }
      var result = service.updateCar(id, body.brand, body.model, body.year, body.pricePerDay, body.available);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim i serverit: ' + err.message });
    }
  });

  // DELETE - Fshi makine
  server.delete('/api/cars/:id', function(req, res) {
    try {
      var id = req.params.id;
      if (!id || id.trim() === '') {
        return res.status(400).json({ success: false, message: 'ID nuk mund te jete bosh!' });
      }
      var result = service.deleteCar(id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim i serverit: ' + err.message });
    }
  });

  // GET - Filtro makinat
  server.get('/api/cars/list/:filter', function(req, res) {
    try {
      var validFilters = ['available', 'rented', 'all'];
      var filter = req.params.filter;
      if (filter !== 'all' && validFilters.indexOf(filter) === -1) {
        return res.status(400).json({ success: false, message: 'Filter i pavlefshem!' });
      }
      var cars = service.listCars(filter === 'all' ? '' : filter);
      res.json(cars);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim i serverit: ' + err.message });
    }
  });

  // GET - Kerko makinat
  server.get('/api/cars/search', function(req, res) {
    try {
      var query = req.query.q || '';
      var maxPrice = req.query.maxPrice || null;
      if (maxPrice && isNaN(parseFloat(maxPrice))) {
        return res.status(400).json({ success: false, message: 'Ju lutem shkruani cmim valid!' });
      }
      var result = service.searchCars(query, maxPrice);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim i serverit: ' + err.message });
    }
  });

  // GET - Sorto makinat
  server.get('/api/cars/sort/:sortBy', function(req, res) {
    try {
      var validSorts = ['price-asc', 'price-desc', 'year-asc', 'year-desc', 'brand-az', 'brand-za'];
      if (validSorts.indexOf(req.params.sortBy) === -1) {
        return res.status(400).json({ success: false, message: 'Opsion sortimi i pavlefshem!' });
      }
      var result = service.sortCars(req.params.sortBy);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim i serverit: ' + err.message });
    }
  });

  // GET - Statistika
  server.get('/api/cars/statistics', function(req, res) {
    try {
      var result = service.getStatistics();
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim: ' + err.message });
    }
  });

  // GET - Eksporto raport
  server.get('/api/cars/export', function(req, res) {
    try {
      var result = service.exportReport();
      if (!result.success) return res.status(500).json(result);
      var exportPath = path.join(__dirname, 'docs', 'raport.txt');
      service.exportToFile(result.content, exportPath);
      res.json({ success: true, message: 'Raporti u gjenerua me sukses!', content: result.content });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gabim gjate eksportit: ' + err.message });
    }
  });

};