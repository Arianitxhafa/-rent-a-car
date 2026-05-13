# 📧 Sistemi i Email Konfirmimit - Dokumentimi

## 🎯 Funksionalitete të Implementuara

### 1️⃣ Verifikimi i Email-it për Përdoruesit e Rinj
- Kur një përdorues i ri regjistrohet, automatikisht merr një email me kod verifikimi
- Kodi zgjat 60 minuta
- Email-i përmban:
  - Kodin e verifikimit (6 shifra)
  - Lidhje direkte për verifikimin
  - Udhëzime qarte

**Ruta API:** `POST /api/auth/register`
- Krijon përdoruesin
- Gjeneron kodin e verifikimit
- Dërgon email-in e verifikimit

### 2️⃣ Email Konfirmimi për Rezervimet e Makinave
- Kur një klient bën rezervim, automatikisht merr email konfirmimi
- Email-i përmban:
  - ✓ Numrin e referimit të rezervimit (p.sh. RNT-ABC123)
  - 🚗 Detajet e makinës (marke, model, viti)
  - 📅 Data e marrjes dhe kthimit
  - 💰 Çmimin për ditë dhe totalin
  - 👤 Informacionet e kontaktit
  - ⏱ Numrin e ditëve të qirasë

**Ruta API:** `PUT /api/cars/rent/:id`
- Pranon të dhënat e klientit (emri, email, telefon)
- Ruaj rezervimin në `Data/bookings.json`
- Dërgon email konfirmimi me të gjitha detajet

## 📁 Skedarët e të Dhënave

### `Data/bookings.json`
Ruaj të gjitha rezervimet me strukturën:
```json
{
  "id": "1715000000000",
  "referenceNumber": "RNT-ABC123",
  "carId": "1",
  "carBrand": "Toyota",
  "carModel": "Corolla",
  "carYear": 2023,
  "pricePerDay": 45,
  "days": 5,
  "customerName": "Arben Krasniqi",
  "customerEmail": "arben@example.com",
  "customerPhone": "+383 44 123 456",
  "pickupDate": "2024-05-15",
  "returnDate": "2024-05-20",
  "status": "confirmed",
  "createdAt": "2024-05-11T10:30:00.000Z"
}
```

## ⚙️ Konfigurimi i SMTP

Krijo një skedar `.env` në rrënjën e projektit:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Rentigo <no-reply@rentigo.ks>
APP_URL=http://localhost:5000
PORT=5000
```

### Setup për Gmail:
1. Aktivo 2-Factor Authentication në llogarinë tuaj Google
2. Shko në: https://myaccount.google.com/apppasswords
3. Zgjedh "Mail" dhe "Windows Computer"
4. Kopjo passwordin 16-karakteror dhe vendose si `SMTP_PASS`

### Alternativa të tjera (Outlook, SendGrid, etc.):
- Gmail: `smtp.gmail.com:587`
- Outlook: `smtp-mail.outlook.com:587`
- SendGrid: `smtp.sendgrid.net:587`
- MailChimp: `smtp.mandrillapp.com:587`

## 🔄 Flow i Sistemit

### Për Regjistrimin:
```
1. Përdoruesi merr formularin e regjistrimit
2. Plotëson të dhënat
3. POST /api/auth/register
4. → Krijohet përdoruesi (verified: false)
5. → Gjenerohet kod 6-shifror
6. → Email verifikimi i dërgohet
7. → Përdoruesi hyn në email dhe merr kodin
8. → POST /api/auth/verify-email me kodin
9. → Llogarija aktivizohet (verified: true)
10. → Tani mund të hyj në sistem
```

### Për Rezervimin:
```
1. Klienti shfleton makinat
2. Zgjedh makinën, datat, dhe plotëson të dhënat
3. Klikime "Konfirmo Rezervimin"
4. PUT /api/cars/rent/:id me të dhënat e klientit
5. → Sistemi kontrollon disponibilitetin
6. → Krijohet booking me ID unik
7. → Numri i referimit gjenerohet
8. → Booking ruhet në bookings.json
9. → Email konfirmimi i dërgohet me të gjitha detajet
10. → Sukses! Përdoruesi sheh numrin e referimit
```

## 🧪 Testimi Manual

### Test Verifikim Email:
1. Regjistrohu në faqen `/register.html`
2. Merr emailin me kod verifikimi (ose check console nëse SMTP jo konfiguruar)
3. Hyr në `/verify-email.html`
4. Vendose kodin
5. Sukses!

### Test Email Konfirmimi Rezervimi:
1. Shko në `/booking.html`
2. Zgjedh makinën, datat
3. Vendose emrin, emailin, telefonin
4. Klikime "Konfirmo Rezervimin"
5. Merr email konfirmimi me numrin e referimit

## 📊 Funksionet e Përditësuara

### `server.js`
- ✅ `sendVerificationEmail(user, code)` - Dërgon email verifikimi
- ✅ `sendBookingConfirmationEmail(booking)` - Dërgon email konfirmimi rezervimi
- ✅ `PUT /api/cars/rent/:id` - Përditësuar për të pranuarit customer data

### `booking.js` (Frontend)
- ✅ `submitBooking()` - Përditësuar për të dërguar customer data
- ✅ Tregon email-in e dërguar në success modal

## 🔐 Sigurimi

- Email-et janë të HTML-encoded për sigurinë
- Kodet e verifikimit skadojnë pas 60 minuta
- Kodet reset skadon pas 10 minutash
- Booking-u ruhet me timestamp për auditim
- Si fallback, nëse SMTP nuk konfigurohet, email-et shfaqen në console

## 📝 Shënimet

- Nëse SMTP nuk është konfiguruar, email-et do të shfaqen në console si fallback
- Çdo booking ruhet me reference number unik për track-im
- Email-et janë plotësisht të lokalizuara në Shqip
- HTML-et e email-eve janë responsive dhe profesionale

## 🚀 Deploy në Prodhim

1. Krijo skedar `.env` me SMTP credentials të vërteta
2. Vendose `APP_URL` në URL-in e server-it (https://yourdomain.com)
3. Testo me emailin e verifikimit
4. Testo me emailin e konfirmimit të rezervimit
5. I'm ready! 🎉
