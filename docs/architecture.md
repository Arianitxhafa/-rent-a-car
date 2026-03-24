 # Arkitektura e Projektit - Rent a Car

## Shtresat e Projektit

### 1. Models/
Përmban klasat e të dhënave (entitetet).
- **Car.js**: Përfaqëson një makinë me të gjitha atributet e saj.
  Përgjegjësia: Ruajtja e të dhënave të një makine.

### 2. Services/
Logjika e biznesit dhe kontratat (interfaces).
- **IRepository.js**: Definon kontratën për çdo repository.
  Përgjegjësia: Sigurimi i një strukture të unifikuar për aksesin e të dhënave.
- **CarService.js**: Menaxhon të gjitha operacionet e biznesit.
  Përgjegjësia: Logjika e rezervimit, kthimit dhe menaxhimit të makinave.

### 3. Data/
Shtresa e aksesit të të dhënave.
- **FileRepository.js**: Implementon IRepository duke lexuar/shkruar CSV.
  Përgjegjësia: Leximi dhe shkrimi i të dhënave nga/në skedarin CSV.
- **cars.csv**: Databaza e thjeshtë në formatin CSV.

### 4. UI/
Ndërfaqja e përdoruesit (HTML/CSS/JS).
- **index.html**: Struktura e faqes web.
- **style.css**: Stilizimi dhe pamja vizuale.
- **app.js**: Logjika e frontend-it dhe komunikimi me API.

---

## Diagrami i Shtresave
```
[ UI Layer ]          → index.html, style.css, app.js
      ↓
[ Service Layer ]     → CarService.js
      ↓
[ Repository Layer ]  → IRepository.js, FileRepository.js
      ↓
[ Data Layer ]        → cars.csv
```

---

## Arsyet e Vendimeve Arkitekturale

1. **CSV mbi databazë**: Lehtësi dhe pa dependencë eksterne
2. **Repository Pattern**: Ndarje e logjikës nga aksesi i të dhënave
3. **4-shtresa**: Mirëmbajtje dhe zgjerim i lehtë i projektit
4. **Express.js**: Framework i lehtë për API REST

---

## Parimet SOLID të Aplikuara (Bonus)

- **S - Single Responsibility**: Çdo klasë ka një përgjegjësi të vetme.
  - Car.js → vetëm ruan të dhëna
  - FileRepository.js → vetëm menaxhon CSV
  - CarService.js → vetëm logjika e biznesit

- **O - Open/Closed**: FileRepository mund të zgjerohet pa modifikuar IRepository.

- **L - Liskov Substitution**: FileRepository mund të zëvendësohet 
  me DatabaseRepository pa ndryshuar CarService.

- **I - Interface Segregation**: IRepository ka vetëm metodat e nevojshme
  (getAll, getById, add, save).

- **D - Dependency Inversion**: CarService varet nga IRepository (abstraksion),
  jo nga FileRepository (implementim konkret).
