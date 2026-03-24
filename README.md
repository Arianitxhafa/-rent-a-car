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

3. **Start the server**
```bash
node Program.js
```

4. **Open in browser**
```
http://localhost:3000
```

---

## 👤 Author

**Arianit Xhafa**
- Email: arianit.xhafa@umib.net


---

## 📁 Repository

- **GitHub:** [https://github.com/Arianitxhafa/-rent-a-car.git](https://github.com/Arianitxhafa/-rent-a-car.git)
- **Documentation:** [docs/architecture.md](docs/architecture.md)
- **Class Diagram:** [docs/class-diagram.md](docs/class-diagram.md)
