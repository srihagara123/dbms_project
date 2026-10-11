# 🏦 Apex Bank Management System

### An Interactive Relational Banking System Simulation

**A DBMS Project by Group C4**  
Amrita School of Computing · Amritapuri Campus

[🌐 Live Demo](https://YOUR-DEPLOYED-APP-URL) · [💻 GitHub Repository](https://github.com/srihagara123/dbms_project)

---

## 📖 About the Project

The **Apex Bank Management System** is an interactive banking interface developed as a Database Management System (DBMS) project by Group C4, Department of Computer Science and Engineering, Amrita School of Computing, Amritapuri Campus.

The application simulates a modern banking environment with customer and manager dashboards, transaction workflows, audit trails, financial analytics, and database administration interfaces.

The project demonstrates how relational database concepts can be applied to banking operations through an intuitive, responsive, dark-themed user interface.

> **Note:** The application currently includes simulated database operations through its frontend. Actual data persistence, database-level security, and transaction guarantees depend on the connected backend implementation.

## 🎯 Project Objectives

- Demonstrate relational database management concepts in a banking environment.
- Illustrate transaction processing and ACID properties.
- Demonstrate role-based access control (RBAC).
- Simulate deposits, withdrawals, transfers, and loan calculations.
- Visualize audit logs, database administration, and system monitoring.
- Develop a responsive and user-friendly banking interface.

## ✨ Key Features

### 🔐 Authentication and Role-Based Access

- Interactive login interface.
- Role-specific dashboards and navigation.
- Customer and bank manager interfaces.
- Administrative interfaces for user and permission management.

### 👤 Customer Banking Portal

- Account balance and portfolio overview.
- Simulated money transfers.
- Transaction history and account statements.
- Loan EMI and amortization calculations.
- Financial data visualization.

### 🏦 Bank Manager Dashboard

- Branch liquidity and financial metrics.
- Reserve and liability reports.
- Loan application review and approval workflows.
- User and role management interfaces.
- Management analytics and reporting.

### 🔄 Transaction Processing Simulation

- Transaction lifecycle visualization.
- Balance and constraint validation.
- Simulated `BEGIN`, `COMMIT`, and `ROLLBACK` operations.
- Illustrations of atomicity and transaction isolation.

### 📜 Audit and Database Administration

- Audit log interface for simulated user actions.
- Before-and-after state visualization.
- Database trigger concepts for balance validation and interest calculations.
- Backup and recovery workflow demonstrations.
- System health and monitoring interfaces.

## 🧠 DBMS Concepts Demonstrated

| DBMS Concept | Application in the Project |
|---|---|
| Relational Database Management | Organizing banking and account-related information |
| ACID Properties | Visualizing transaction processing and commit/rollback workflows |
| Role-Based Access Control | Role-specific dashboards and actions |
| SQL Transactions | Representing transaction lifecycle stages |
| Database Triggers | Demonstrating automated validation and calculation concepts |
| Audit Logging | Recording simulated actions and data changes |
| OLAP and Analytical Reporting | Presenting financial metrics and management dashboards |
| Backup and Recovery | Illustrating database snapshot and recovery workflows |

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React 19 | Frontend component architecture |
| TypeScript | Type-safe application development |
| Vite | Development server and build tooling |
| Tailwind CSS 4 | Styling and responsive layouts |
| Recharts | Charts and financial data visualization |
| Lucide React | Interface icons |
| Vercel | Frontend deployment |

## 🖥️ Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js 18 or later
- npm
- Git

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/srihagara123/dbms_project.git
```

**2. Navigate to the project directory**

```bash
cd dbms_project
```

> If the cloned repository creates a folder with a different name, navigate to that folder instead.

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

**5. Open the application**

Open the local URL displayed in your terminal. The default Vite development URL is usually:

```text
http://localhost:5173
```

## 📂 Project Structure

The following is an illustrative project structure. The actual files may vary depending on the repository implementation.

```text
DBMS-UI-DESIGN/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   ├── data/               # Application and mock data
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

## 🎨 UI/UX Highlights

- **Dark-themed interface:** A modern visual style for banking dashboards.
- **Responsive layouts:** Designed for different screen sizes.
- **Interactive components:** Forms, charts, modals, and notifications where implemented.
- **Financial visualization:** Charts and dashboards for banking metrics.
- **Role-specific navigation:** Different interfaces for customer and management workflows.

## 👥 Team Members

**Group C4**  
Department of Computer Science and Engineering  
Amrita School of Computing, Amritapuri Campus

| S. No. | Team Member | University ID |
|---:|---|---|
| 1 | Kaki Venkata Pavithra | AM.SC.U4CSE25225 |
| 2 | Singuru Chathurya | AM.SC.U4CSE25250 |
| 3 | Vedulla Sri Vijaya Sai Harshini | AM.SC.U4CSE25257 |
| 4 | Gara Sriha | AM.SC.U4CSE25268 |

## 🤝 Contributing

Suggestions, bug reports, and improvements are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push your branch to your fork.
5. Open a pull request.

## 📌 Project Information

**Project:** Apex Bank Management System  
**Domain:** Database Management Systems  
**Team:** Group C4  
**Institution:** Amrita School of Computing, Amritapuri Campus

---

*Built with React, TypeScript, and DBMS concepts.*
