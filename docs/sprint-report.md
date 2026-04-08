# Sprint 2 Report — Arianit Xhafa

## Çka Përfundova

### Feature e Re (Kërkim + Sortim + Eksport)
- ✅ Kërkim sipas markës, modelit dhe çmimit maksimal
- ✅ Sortim sipas çmimit (ngjitës/zbritës), vitit dhe markës
- ✅ Eksport i raportit në docs/raport.txt dhe modal në UI
- ✅ Rrjedha e plotë: UI → Service → Repository

### Error Handling
- ✅ File CSV mungon → krijohet automatikisht
- ✅ Input invalid → mesazh i qartë për userin
- ✅ ID nuk ekziston → mesazh, programi vazhdon
- ✅ Try-catch në të gjitha shtresat

### Unit Tests
- ✅ 20+ teste me Jest
- ✅ Teste për: searchCars, sortCars, getStatistics, rentCar, deleteCar, exportReport
- ✅ Raste kufitare: ID joekzistuese, çmim negativ, markë bosh

### UI
- ✅ Panel Kërkim & Sortim i integruar
- ✅ Modal Eksport me raport të formatuar
- ✅ Animacione dhe dark mode

## Çka Mbeti
- Autentifikim i userit (jashtë scope-it të sprintit)
- Paginim për lista të gjata

## Çka Mësova
- Si të shkruaj Unit Tests me Jest në Node.js
- Rëndësia e try-catch në çdo shtresë të arkitekturës
- Si të ndërtoj feature që ndjek rrjedhën UI → Service → Repository