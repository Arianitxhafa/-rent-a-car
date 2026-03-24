var express = require('express');
var path = require('path');
var CarService = require('./Services/CarService');
var routes = require('./server');

var server = express();
var service = new CarService();

server.use(express.json());
server.use(express.static(path.join(__dirname, 'UI')));
routes(server, service);

server.listen(3000, function() { console.log('Server: http://localhost:3000'); });
