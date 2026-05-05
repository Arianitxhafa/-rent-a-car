const express = require('express');
const path = require('path');
const cors = require('cors');

const CarService = require('./Services/CarService');
const setupRoutes = require('./server');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'UI')));

// Initialize CarService
const carService = new CarService();

// Setup routes
setupRoutes(app, carService);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
    console.log('🚀 Server running on http://localhost:' + PORT);
    console.log('📁 Using FileRepository for cars data');
});
