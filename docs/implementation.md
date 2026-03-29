# Implementation Documentation - Rent a Car

## Çfarë Funksionon

### 1. Model + Repository CRUD
- **Car.js** - Model me 6 atribute private
- **FileRepository.js** - Lexon dhe ruan të dhëna në CSV
- **Operacionet:** GetAll, GetById, Add, Save, Update, Delete

### 2. Service me Logjikë
- **listCars(filter)** - Liston makinat me filtrim (të gjitha/disponueshme/të zëna)
- **addCar()** - Shton makinë të re me validim
- **findCar(id)** - Gjen makinë sipas ID
- **updateCar()** - Përditëson makinë me validim (emri jo bosh, çmimi > 0)
- **deleteCar()** - Fshin makinë nga lista

### 3. Validimi i Input
- Emri i markës nuk mund të jetë bosh
- Çmimi duhet të jetë më shumë se 0
- Të gjitha fushat duhet të plotësohen

### 4. UI Funksionale
- Listë e të gjitha makinave
- Filtrim: Te Gjitha / Te Disponueshme / Te Zena
- Formë për shtim të makinës së re
- Buton Rezervo / Kthe
- Buton Edito (shfaq formën e editimit)
- Buton Fshi (me konfirmim)

### 5. Update + Delete
- **Update:** Klikoje Edito → ndrysho të dhënat → Ruaj
- **Delete:** Klikoje Fshi → konfirmo → makina fshihet

## Rrjedha e të Dhënave
```
UI (index.html + app.js)
      ↓ fetch API calls
Server (server.js) - REST API routes
      ↓
CarService (Services/CarService.js) - Business Logic
      ↓
FileRepository (Data/FileRepository.js) - Data Access
      ↓
cars.csv - Data Storage
```

## Screenshot i Aplikacionit

Aplikacioni shfaq:
- Listën e makinave me kartat
- Butonat: Rezervo, Kthe, Edito, Fshi
- Filtrim sipas disponueshmërisë
- Forma për shtim dhe editim

## API Endpoints

| Method | URL | Përshkrimi |
|--------|-----|------------|
| GET | /api/cars | Merr të gjitha makinat |
| GET | /api/cars/:id | Merr makinën sipas ID |
| GET | /api/cars/list/:filter | Liston me filtrim |
| POST | /api/cars | Shton makinë të re |
| PUT | /api/cars/rent/:id | Rezervon makinën |
| PUT | /api/cars/return/:id | Kthen makinën |
| PUT | /api/cars/update/:id | Përditëson makinën |
| DELETE | /api/cars/:id | Fshin makinën |.