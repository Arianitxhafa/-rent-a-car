# Demo Plan — Rentigo Rent a Car

---

## 1. Titulli i Projektit

**Rentigo** — Sistem i Menaxhimit të Flotës së Makinave me Qira  
**Stack:** Node.js · Express.js · CSV · HTML · CSS · JavaScript  
**GitHub:** https://github.com/Arianitxhafa/-rent-a-car

---

## 2. Problemi që Zgjidh

Kompanitë e vogla të qirasë së makinave në Kosovë e menaxhojnë flotën
me Excel, letra ose telefon. Kjo shkakton tre probleme reale:

1. **Konflikte rezervimi** — e njëjta makinë i jepet dy klientëve njëkohësisht
2. **Humbje informacioni** — askush nuk di sa makina janë lirë pa i kontrolluar fizikisht
3. **Vonesë** — klienti duhet të telefonojë për çmim dhe disponueshmëri

**Rentigo** e zgjidh këtë duke ofruar sistem web ku statusi i çdo makine
(lirë / zënë) përditësohet menjëherë pas çdo veprimi.

---

## 3. Përdoruesit Kryesorë

| Roli | Çfarë bën |
|------|-----------|
| **Menaxheri i flotës** | Shton, rezervon, kthen, edito, fshin makina |
| **Operatori i zyrës** | Filtron disponueshmet, shikon statusin live |

---

## 4. Flow-i që do ta Demonstroj Live

### Rezervim → Kthim → CRUD i plotë

```
Hap localhost:3000
  → 8 makina me foto, çmim, status
  → Filtro "Disponueshme" → lista tkurret
  → Kliko "Rezervo" te BMW 320i
       → Badge: "Lirë" bëhet "Zënë"
       → Statistikat -1 disponueshme
  → Kliko "Kthe" → makina bëhet lirë
  → Shto Porsche 911, 2023, $150
       → ID automatike → shfaqet menjëherë
  → Edito çmimin → Fshi makinën
  → Shiko Statistikat live
```

**Pse ky flow?** Tregon CRUD të plotë + ndryshim statusi real-time.
Është 100% funksional dhe ekzekutohet pa risk.

---

## 5. Një Problem Real që e Kam Zgjidhur

### Bug: Route Ordering në Express.js

**Problemi:** Rezervimi nuk funksiononte. Butonit "Rezervo" nuk ndryshonte statusin.

**Ku ishte:** `server.js` — rendi i routes ishte gabim:

```javascript
// GABIM: /:id kap GJITHÇKA — edhe /rent/2 dhe /return/2
server.get('/api/cars/:id', ...);       // rreshti 8
server.put('/api/cars/rent/:id', ...);  // kurrë nuk arrihet!
server.put('/api/cars/return/:id', ...);// kurrë nuk arrihet!
```

Express lexon routes nga lart-poshtë. `/api/cars/:id` përputhet me
çdo URL — `/api/cars/rent/2` interpretohej si `id = "rent"` → 404.

**Zgjidhja:** Routes specifike PARA gjenerikës:

```javascript
// SAKTË
server.put('/api/cars/rent/:id', ...);    // para
server.put('/api/cars/return/:id', ...);  // para
server.delete('/api/cars/:id', ...);      // para
server.get('/api/cars/:id', ...);         // FUNDIT
```

**Rezultati:** Të gjitha veprimet filluan të funksionojnë saktë.

---

## 6. Çka Mbetet Ende e Dobët

**Ruajtja me CSV** ka kufizime reale:
- Race condition nëse dy njerëz rezervojnë njëkohësisht
- Nuk ruhet histori (kush rezervoi dhe kur)
- Nuk mund të lidhen rezervime me klientë

Zgjidhja e planifikuar është **PostgreSQL** me tabelat `users`, `cars`, `bookings`
por migrimi nuk u bë brenda afatit.

---

## 7. Struktura e Prezantimit (6 min)

### ⏱ 0:00–0:45 | Hyrja
> *"Imagjino 20 makina me Excel. Çdo ditë telefonate, konflikte rezervimi.
> Rentigo e zgjidh — statusi ndryshon live, gjithçka në një vend."*

### ⏱ 0:45–3:00 | Demo Live

1. `node Program.js` → `http://localhost:3000`
2. Filtro **"Disponueshme"** — filtrim pa reload
3. **"Rezervo"** BMW → badge ndryshon, statistikat -1
4. **"Kthe"** → makina lirohet
5. **Shto** Porsche 911 → ID automatike, shfaqet menjëherë
6. **Edito** çmimin → **Fshi** makinën

### ⏱ 3:00–4:15 | Shpjegimi Teknik

```
UI (fetch) → server.js (routes) → CarService (logjika) → FileRepository → CSV
```

Trego strukturën e folderëve. Shpjego Repository Pattern dhe pse.

### ⏱ 4:15–5:15 | Problemi + Zgjidhja

Hap `server.js` — trego rreshtat para dhe pas rregullimit.
Shpjego pse Express-i lexon routes nga lart-poshtë.

### ⏱ 5:15–6:00 | Mbyllja

Trego Statistikat live, pastaj:
> *"CRUD i plotë funksionon. Dobësia: CSV pa transaksione.
> Hapi tjetër: PostgreSQL."*

---

## 8. Plan B

| Situata | Zgjidhja |
|---------|----------|
| Porta 3000 e zënë | `taskkill /F /IM node.exe` → `node Program.js` |
| Serveri nuk starton | `npm install` pastaj `node Program.js` |
| Makina nuk rezervohet | DevTools → Network → trego API response |
| Nuk hapet fare | Hap `cars.csv` + shpjego kodin në VS Code |

---

## 9. Checklist Para Demo

```
[ ] node Program.js starton pa gabime
[ ] http://localhost:3000 hapet
[ ] 8 makinat shfaqen me foto
[ ] Filtri funksionon
[ ] Rezervo / Kthe ndryshon statusin
[ ] Shto makinë → ID automatike
[ ] Edito → ruhet ndryshimi
[ ] Fshi → hiqet nga lista
[ ] Statistikat janë të sakta
[ ] GitHub i përditësuar
[ ] Praktikoje 1 herë para demo
```

---

## 10. Komanda të Shpejta

```bash
# Starto
cd C:\Users\Lenovo\Desktop\rent-a-car
node Program.js

# Nëse porta 3000 e zënë
taskkill /F /IM node.exe

# GitHub push final
git add .
git commit -m "chore: pergatitje finale per demo"
git push origin main
```

---

*Rentigo — Projekt Semestral 2024–2025*