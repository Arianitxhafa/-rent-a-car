# Improvement Report — Rent a Car
**Autor:** Arianit Xhafa

---

## Përmirësimi 1 — Validim i Centralizuar në Service (Reliability)

### Çka ishte problem para:
Validimi ishte i fragmentuar dhe i paqëndrueshëm. Metoda `updateCar()` kontrollonte vetëm nëse brand ishte bosh dhe nëse çmimi ishte mbi 0, por `addCar()` nuk validonte asgjë — pranonte çmime negative, vite si "abc", dhe modele bosh pa asnjë gabim. Nëse dikush dërgonte kërkesë direkt te API me `{ year: "abc", pricePerDay: -50 }`, të dhënat e pasakta do të ruheshin në CSV pa asnjë paralajmërim.

### Çfarë ndryshova:
Shtova metodën `validateCarInput(brand, model, year, pricePerDay)` në CarService që kontrollon të gjitha fushat para çdo operacioni:
- Brand dhe model nuk mund të jenë bosh ose vetëm hapësira
- Viti duhet të jetë numër i vlefshëm ndërmjet 1900 dhe 2100
- Çmimi duhet të jetë numër pozitiv mbi 0

Të dyja metodat `addCar()` dhe `updateCar()` tani thërrasin këtë funksion si hapin e parë. Nëse validimi dështon, kthehet menjëherë me mesazh të qartë pa prekur Repository.

```javascript
// Para — addCar nuk validonte asgjë:
addCar(id, brand, model, year, pricePerDay, available) {
    const car = new Car(id, brand, model, year, pricePerDay, available);
    this.repository.add(car);
    return car;
}

// Pas — validim i plotë para çdo operacioni:
addCar(brand, model, year, pricePerDay, available) {
    var validation = this.validateCarInput(brand, model, year, pricePerDay);
    if (!validation.valid) {
        return { success: false, message: validation.message };
    }
    // vetëm nëse kaloi validimin vazhdon...
}
```

### Pse versioni i ri është më i mirë:
Validimi i centralizuar garanton konsistencë — nuk ka rëndësi nga ku vjen kërkesa (UI, Postman, teste), të njëjtat rregulla aplikohen gjithmonë. Eliminohet mundësia e të dhënave të korruptuara në CSV. Mesazhet e gabimit janë specifike dhe ndihmojnë userin të kuptojë saktësisht çka duhet të ndryshojë.

---

## Përmirësimi 2 — Auto-Increment ID (Kod/Strukturë)

### Çka ishte problem para:
Useri duhej të fusë manualisht ID-në e çdo makine të re. Kjo krijonte disa probleme serioze:
1. Nëse useri fusë një ID që ekziston, operacioni dështon me gabim
2. Useri duhet të mbajë mend cilat ID janë marrë
3. Formati i ID-ve ishte i paqëndrueshëm — disa makina kishin `"1"`, të tjera `"001"`
4. Ky ishte detaj teknik që nuk duhej të shqetësonte userin e biznesit

### Çfarë ndryshova:
Shtova metodën `generateId()` në CarService që automatikisht gjen ID-në maksimale ekzistuese dhe shton 1:

```javascript
generateId() {
    var cars = this.repository.getAll();
    if (cars.length === 0) return '1';
    var maxId = Math.max.apply(null, cars.map(function(c) {
        return parseInt(c.getId()) || 0;
    }));
    return String(maxId + 1);
}
```

Ndryshova edhe `addCar()` — tani pranon vetëm `(brand, model, year, pricePerDay, available)` pa ID, dhe server.js nuk kërkon më ID nga body i kërkesës. UI u thjeshtua — forma nuk ka më fushë ID.

### Pse versioni i ri është më i mirë:
Useri fokusohet te të dhënat e makinës, jo te menaxhimi i ID-ve. Eliminohet tërësisht kategoria e gabimeve "ID ekziston tashmë". Sistemi bëhet i ngjashëm me si funksionojnë databazat reale me AUTO_INCREMENT. Kodi është më i pastër — `addCar()` ka 5 parametra në vend të 6.

---

## Përmirësimi 3 — Validim në Server.js + Mesazhe HTTP të Sakta (Dokumentim & Reliability)

### Çka ishte problem para:
`server.js` kalonte direkt parametrat nga `req.body` te Service pa asnjë kontroll. Nëse body ishte null ose mungonte, kodi crashonte me `TypeError: Cannot destructure property 'brand' of null`. Gjithashtu, të gjitha përgjigjet ktheheshin me status HTTP 200, edhe kur kishte gabim — kjo e bënte debugging shumë të vështirë.

```javascript
// Para — asnjë validim, gjithmonë 200:
server.post('/api/cars', (req, res) => {
    const { id, brand, model, year, pricePerDay, available } = req.body;
    const car = service.addCar(id, brand, model, year, pricePerDay, available);
    res.json(car);
});
```

### Çfarë ndryshova:
Shtova validim bazik në çdo route të server.js:
- Kontroll nëse `req.body` ekziston para se të aksesohet
- Kontroll nëse ID nuk është bosh
- Kontroll nëse filter/sortBy janë vlera të pranuara
- Status HTTP të sakta: `400` për input të gabuar, `404` për resource jo ekzistues, `500` për gabime serveri
- Çdo route ka `try-catch` me mesazh gabimi të qartë

```javascript
// Pas — validim + status HTTP të saktë:
server.post('/api/cars', function(req, res) {
    try {
        var body = req.body;
        if (!body) {
            return res.status(400).json({ success: false, message: 'Kërkesa nuk përmban të dhëna!' });
        }
        var result = service.addCar(body.brand, body.model, body.year, body.pricePerDay, body.available);
        if (!result.success) {
            return res.status(400).json(result);
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Gabim i serverit: ' + err.message });
    }
});
```

### Pse versioni i ri është më i mirë:
Serveri nuk crashon kurrë, pavarësisht çfarë dërgon klienti. Kodet HTTP të sakta (`400`, `404`, `500`) e bëjnë API-n të lexueshme — çdo zhvillues e kupton menjëherë çfarë shkoi gabim. Debugging bëhet shumë më i shpejtë sepse gabimi identifikohet në shtresën e duhur. Kjo është praktika standarde e ndërtimit të REST API.

---

## Çka Mbetet Ende e Dobët

**1. CSV si databazë nuk është e sigurt për akses të njëkohshëm.**
Nëse dy kërkesa vijnë njëkohësisht, mund të ketë race condition ku të dhënat e njërit mbishkruhen nga tjetri. Zgjidhja reale do të ishte SQLite ose MongoDB.

**2. Nuk ka autentifikim.**
Çdokush me qasje në URL mund të fshijë të gjithë flotën. Duhet sistem login minimal me session ose token.

**3. Testet varen nga skedari CSV i vërtetë.**
Jest testet shkruajnë në disk — duhet të përdoren mock objekte për izolim të plotë dhe teste më të shpejta.

**4. Nuk ka logging i strukturuar.**
`console.log()` pa datë dhe nivel gabimi nuk mjafton për prodhim. Duhet library si Winston ose Morgan.

**5. ID-të janë string, jo numër.**
Kjo krijon probleme potenciale me krahasimin — `"10" < "9"` si string. Duhet standardizim i tipit të ID-ve.