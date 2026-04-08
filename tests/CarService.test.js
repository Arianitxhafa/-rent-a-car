const CarService = require('../Services/CarService');
const FileRepository = require('../Data/FileRepository');
const Car = require('../Models/Car');
const path = require('path');
const fs = require('fs');

var testCsvPath = path.join(__dirname, 'test-cars.csv');

function createTestService() {
    var content = 'id,brand,model,year,pricePerDay,available\n' +
        '1,BMW,X5,2021,90,true\n' +
        '2,Toyota,Corolla,2020,35,true\n' +
        '3,Mercedes,C200,2022,110,false\n' +
        '4,Audi,A4,2019,75,true\n' +
        '5,Ford,Focus,2020,40,false\n';
    fs.writeFileSync(testCsvPath, content, 'utf8');
    var repo = new FileRepository(testCsvPath);
    var service = new CarService();
    service.repository = repo;
    return service;
}

afterAll(function() {
    if (fs.existsSync(testCsvPath)) fs.unlinkSync(testCsvPath);
});

// ===== TESTS: searchCars =====
test('Search_ExistingBrand_ReturnsCars', function() {
    var service = createTestService();
    var result = service.searchCars('BMW', null);
    expect(result.success).toBe(true);
    expect(result.cars.length).toBe(1);
    expect(result.cars[0].getBrand()).toBe('BMW');
});

test('Search_NonExistingBrand_ReturnsEmpty', function() {
    var service = createTestService();
    var result = service.searchCars('Ferrari', null);
    expect(result.success).toBe(true);
    expect(result.cars.length).toBe(0);
});

test('Search_EmptyQuery_ReturnsAllCars', function() {
    var service = createTestService();
    var result = service.searchCars('', null);
    expect(result.success).toBe(true);
    expect(result.cars.length).toBe(5);
});

test('Search_WithMaxPrice_FiltersCorrectly', function() {
    var service = createTestService();
    var result = service.searchCars('', 40);
    expect(result.success).toBe(true);
    result.cars.forEach(function(car) {
        expect(parseFloat(car.getPricePerDay())).toBeLessThanOrEqual(40);
    });
});

test('Search_WithMaxPriceZero_ReturnsEmpty', function() {
    var service = createTestService();
    var result = service.searchCars('', 0);
    expect(result.success).toBe(true);
    expect(result.cars.length).toBe(0);
});

// ===== TESTS: sortCars =====
test('Sort_ByPriceAsc_ReturnsSortedAscending', function() {
    var service = createTestService();
    var result = service.sortCars('price-asc');
    expect(result.success).toBe(true);
    for (var i = 0; i < result.cars.length - 1; i++) {
        expect(parseFloat(result.cars[i].getPricePerDay()))
            .toBeLessThanOrEqual(parseFloat(result.cars[i + 1].getPricePerDay()));
    }
});

test('Sort_ByPriceDesc_ReturnsSortedDescending', function() {
    var service = createTestService();
    var result = service.sortCars('price-desc');
    expect(result.success).toBe(true);
    for (var i = 0; i < result.cars.length - 1; i++) {
        expect(parseFloat(result.cars[i].getPricePerDay()))
            .toBeGreaterThanOrEqual(parseFloat(result.cars[i + 1].getPricePerDay()));
    }
});

test('Sort_ByBrandAZ_ReturnsSortedAlphabetically', function() {
    var service = createTestService();
    var result = service.sortCars('brand-az');
    expect(result.success).toBe(true);
    for (var i = 0; i < result.cars.length - 1; i++) {
        expect(result.cars[i].getBrand().localeCompare(result.cars[i + 1].getBrand()))
            .toBeLessThanOrEqual(0);
    }
});

test('Sort_ByYearDesc_ReturnsMostRecentFirst', function() {
    var service = createTestService();
    var result = service.sortCars('year-desc');
    expect(result.success).toBe(true);
    expect(parseInt(result.cars[0].getYear())).toBeGreaterThanOrEqual(
        parseInt(result.cars[1].getYear())
    );
});

// ===== TESTS: getStatistics =====
test('Statistics_ReturnsCorrectTotal', function() {
    var service = createTestService();
    var result = service.getStatistics();
    expect(result.success).toBe(true);
    expect(result.total).toBe(5);
});

test('Statistics_ReturnsCorrectAvailableCount', function() {
    var service = createTestService();
    var result = service.getStatistics();
    expect(result.available).toBe(3);
});

test('Statistics_ReturnsCorrectRentedCount', function() {
    var service = createTestService();
    var result = service.getStatistics();
    expect(result.rented).toBe(2);
});

test('Statistics_MaxPriceIsCorrect', function() {
    var service = createTestService();
    var result = service.getStatistics();
    expect(parseFloat(result.maxPrice)).toBe(110);
});

test('Statistics_MinPriceIsCorrect', function() {
    var service = createTestService();
    var result = service.getStatistics();
    expect(parseFloat(result.minPrice)).toBe(35);
});

// ===== TESTS: addCar =====
test('AddCar_ValidCar_AddsSuccessfully', function() {
    var service = createTestService();
    service.addCar('9', 'Tesla', 'Model3', 2023, 120, true);
    var result = service.getStatistics();
    expect(result.total).toBe(6);
});

test('AddCar_EmptyBrand_ValidationFails', function() {
    var service = createTestService();
    var result = service.updateCar('1', '', 'X5', 2021, 90, true);
    expect(result.success).toBe(false);
});

test('AddCar_NegativePrice_ValidationFails', function() {
    var service = createTestService();
    var result = service.updateCar('1', 'BMW', 'X5', 2021, -10, true);
    expect(result.success).toBe(false);
});

// ===== TESTS: exportReport =====
test('ExportReport_ReturnsSuccessAndContent', function() {
    var service = createTestService();
    var result = service.exportReport();
    expect(result.success).toBe(true);
    expect(result.content).toContain('RAPORT');
    expect(result.content).toContain('BMW');
});

test('ExportReport_ContainsStatistics', function() {
    var service = createTestService();
    var result = service.exportReport();
    expect(result.content).toContain('Makina Gjithsej');
    expect(result.content).toContain('Disponueshme');
});

// ===== TESTS: rentCar / returnCar =====
test('RentCar_AvailableCar_ReturnsSuccess', function() {
    var service = createTestService();
    var result = service.rentCar('1');
    expect(result.success).toBe(true);
});

test('RentCar_AlreadyRented_ReturnsFail', function() {
    var service = createTestService();
    service.rentCar('1');
    var result = service.rentCar('1');
    expect(result.success).toBe(false);
});

test('RentCar_NonExistingId_ReturnsFail', function() {
    var service = createTestService();
    var result = service.rentCar('999');
    expect(result.success).toBe(false);
});

test('ReturnCar_RentedCar_ReturnsSuccess', function() {
    var service = createTestService();
    var result = service.returnCar('3');
    expect(result.success).toBe(true);
});

// ===== TESTS: deleteCar =====
test('DeleteCar_ExistingId_ReturnsSuccess', function() {
    var service = createTestService();
    var result = service.deleteCar('1');
    expect(result.success).toBe(true);
    expect(service.getStatistics().total).toBe(4);
});

test('DeleteCar_NonExistingId_ReturnsFail', function() {
    var service = createTestService();
    var result = service.deleteCar('999');
    expect(result.success).toBe(false);
});