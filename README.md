 # 🚗 Rent a Car

![Node.js](https://img.shields.io/badge/Node.js-v24-green)
![Express](https://img.shields.io/badge/Express-v4-blue)
![License](https://img.shields.io/badge/License-ISC-yellow)

---

## 📋 Overview

Rent a Car is a full-stack web application built for managing a car rental business.
The application allows users to view available cars, rent them, return them, and add
new cars to the fleet. It follows a clean 4-layer architecture with the Repository
Pattern applied for data access.

---

## ✨ Key Features

- 🚘 View all available cars in real-time
- 🔑 Rent a car with a single click
- 🔄 Return a rented car easily
- ➕ Add new cars to the fleet
- 💾 Data is persisted in a CSV file
- 📱 Responsive and clean UI

---

## 🎯 Purpose

Rent a Car is built as a scalable digital solution aimed at modernizing and simplifying car rental operations. The project focuses on delivering a fast, intuitive, and efficient user experience while maintaining a robust and extensible backend architecture.

It is designed as a foundation for a production-ready platform that can evolve into a full-featured rental ecosystem, supporting real-time availability, seamless booking workflows, and efficient fleet management.

From a technical perspective, the system leverages:

A clean, layered architecture to enable rapid development and scalability
The Repository Pattern to ensure flexibility in switching or upgrading data sources
SOLID principles to maintain high code quality and long-term sustainability
Separation of Concerns to streamline development and future feature expansion

The goal is not only to deliver a functional application, but to establish a strong architectural baseline for building a reliable, scalable, and commercially viable rental platform.

---

## 🛠️ Tech Stack

| Technology     | Purpose                        |
|----------------|--------------------------------|
| Node.js        | Backend runtime environment    |
| Express.js     | REST API framework             |
| HTML5          | Frontend structure             |
| CSS3           | Styling and responsive design  |
| JavaScript     | Frontend logic and API calls   |
| CSV            | Lightweight data persistence   |

---

## 🏗️ Project Architecture

The project follows a 4-layer architecture:
```
rent-a-car/
├── Models/                 # Data entities
│   └── Car.js             # Car class with private attributes
├── Services/               # Business logic & contracts
│   ├── IRepository.js     # Interface/contract for repositories
│   └── CarService.js      # Core business operations
├── Data/                   # Data access layer
│   ├── FileRepository.js  # CSV read/write implementation
│   └── cars.csv           # Data storage
├── UI/                     # Presentation layer
│   ├── index.html         # Main page structure
│   ├── style.css          # Styling
│   └── app.js             # Frontend logic
├── docs/                   # Documentation
│   ├── class-diagram.md   # UML Class Diagram
│   └── architecture.md    # Architecture documentation
├── Program.js              # Entry point (max 10 lines)
├── server.js               # API routes
└── README.md
```

### Layer Responsibilities

| Layer      | Folder     | Responsibility                        |
|------------|------------|---------------------------------------|
| UI         | UI/        | User interaction and display          |
| Service    | Services/  | Business rules and logic              |
| Repository | Data/      | Data access and persistence           |
| Model      | Models/    | Data structure and representation     |

---

## 🚀 How to Run the Application

### Prerequisites
- Node.js v18 or higher
- Git

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/Arianitxhafa/-rent-a-car.git
cd rent-a-car
```

2. **Install dependencies**
```bash
npm install
```

3. **Copy environment variables**
```bash
cp .env.example .env
```
Edit `.env` and set your SMTP credentials and app URL.

4. **Start the server**
```bash
npm start
```

5. **Open in browser**
```text
http://localhost:5000
```

---

## 📌 Environment variables
Use `.env` to configure the running app:
- `PORT` – server port
- `SMTP_HOST` – SMTP server host
- `SMTP_PORT` – SMTP server port
- `SMTP_USER` – SMTP username
- `SMTP_PASS` – SMTP password
- `SMTP_FROM` – From address for outgoing emails
- `APP_URL` – base application URL for verification links

---

## 🚀 Deploy
This app is ready for deployment to any Node.js host.

Recommended platforms:
- Render.com
- Railway.app
- Heroku
- DigitalOcean App Platform

### Deploy steps
1. Push the repo to GitHub.
2. Create a new Node.js web service on your host.
3. Set the build command to `npm install`.
4. Set the start command to `npm start`.
5. Add the same env vars from `.env.example` in the host dashboard.

### Deploy on Render.com
1. Log in to Render and select "New" → "Web Service".
2. Connect your GitHub repo and choose the `main` branch.
3. Set `Environment` to `Node`.
4. Set `Build Command` to `npm install`.
5. Set `Start Command` to `npm start`.
6. Add these environment variables in Render's dashboard:
   - `PORT`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `SMTP_FROM`
   - `APP_URL`
7. Deploy and wait until the service is live.

### Deploy on Railway.app
1. Create a new project and link your GitHub repository.
2. Add a new service and choose `Node.js`.
3. Use `npm install` as the build command.
4. Use `npm start` as the start command.
5. Add the same env vars from `.env.example` in Railway's variables section.
6. Deploy and open the generated URL.

> Important: this project currently stores users and reset codes in local JSON files (`Data/users.json`, `Data/reset-codes.json`). Hosted platforms may not preserve the local filesystem across deploys, so for production use a database or a server with persistent disk storage.

---

## 👤 Author

**Arianit Xhafa**
- Email: arianit.xhafa@umib.net


---

## 📁 Repository

- **GitHub:** [https://github.com/Arianitxhafa/-rent-a-car.git](https://github.com/Arianitxhafa/-rent-a-car.git)
- **Documentation:** [docs/architecture.md](docs/architecture.md)
- **Class Diagram:** [docs/class-diagram.md](docs/class-diagram.md)
