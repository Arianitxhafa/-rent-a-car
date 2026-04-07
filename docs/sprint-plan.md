# Sprint Plan - Rent a CarS

## Gjendja Aktuale

### Çka funksionon tani:
- Shfaqja e të gjitha makinave në UI
- Shtimi i makinës së re (Create)
- Leximi i makinave nga CSV (Read)
- Përditësimi i makinës (Update)
- Fshirja e makinës (Delete)
- Rezervimi i makinës (rent)
- Kthimi i makinës (return)
- Filtrimi i makinave (të gjitha / disponueshme / të zëna)
- Kërkimi i makinës sipas ID (findCar)
- Ruajtja e të dhënave në CSV (persistence)
- REST API me Express.js
- Validim bazik i inputit (emri jo bosh, çmimi > 0)

### Çka nuk funksionon:
- Nuk ka autentifikim të userit
- Nuk ka kërkim sipas markës ose modelit
- Nuk ka paginim për lista të gjata
- node_modules është i ngarkuar në GitHub (duhet hequr)

### A kompajlohet dhe ekzekutohet programi?
Po - programi ekzekutohet dhe kompajlohet

---

## Plani i Sprintit

### Feature e Re - Kërkim i Makinave sipas Markës
Useri shkruan emrin e markës në një fushë kërkimi (p.sh. "BMW"),
dhe aplikacioni filtron listën duke shfaqur vetëm makinat që
përputhen me markën e kërkuar. Kërkimi bëhet në kohë reale
ndërsa useri shkruan.

### Error Handling - Çka do të shtosh:

1. **FileRepository - skedari CSV nuk ekziston**
   - Tani: programi crashon nëse cars.csv mungon
   - Zgjidhja: kontrollo me `fs.existsSync()` dhe krijo skedarin bosh nëse mungon

2. **CarService - ID duplikate gjatë shtimit**
   - Tani: mund të shtohen dy makina me të njëjtën ID
   - Zgjidhja: kontrollo nëse ID ekziston para se të shtosh makinën e re

3. **Server - kërkesë me body të zbrazët**
   - Tani: serveri crashon nëse body i kërkesës POST/PUT është null
   - Zgjidhja: shto validim në server.js para se të kalojë te CarService

---

## Teste

### Metodat që do të testohen:

| Metoda | Rasti Normal | Rasti Kufitar |
|--------|-------------|---------------|
| getAll() | Kthen të gjitha makinat | Kthen array bosh nëse CSV është bosh |
| getById(id) | Kthen makinën me ID-në e saktë | Kthen undefined nëse ID nuk ekziston |
| add(car) | Shton makinën dhe ruan në CSV | Nuk shton nëse ID ekziston tashmë |
| update(id) | Përditëson makinën ekzistuese | Kthen false nëse ID nuk gjendet |
| delete(id) | Fshin makinën nga lista | Kthen false nëse ID nuk gjendet |
| listCars(filter) | Filtron sipas disponueshmërisë | Kthen të gjitha nëse filter është bosh |

### Rastet Kufitare:
- Shto makinë me ID që ekziston tashmë
- Fshi makinë me ID që nuk ekziston
- Përditëso makinë me çmim negativ (duhet refuzuar)
- Përditëso makinë me markë bosh (duhet refuzuar)
- Kërko makinë me ID bosh ose null
```
