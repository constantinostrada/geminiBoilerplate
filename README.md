# geminiBoiler — REST API

A production-ready REST API boilerplate built with **Node.js**, **Express**, **TypeScript**, **Sequelize** and **PostgreSQL**, following **Clean Architecture** principles.

---

## Architecture

```
src/
├── domain/                        # Enterprise business rules (no dependencies)
│   ├── entities/                  # TypeScript interfaces & DTOs
│   │   ├── User.ts
│   │   ├── Employee.ts
│   │   ├── VacationRequest.ts
│   │   ├── Equipment.ts
│   │   └── EquipmentAssignment.ts
│   └── repositories/              # Repository interfaces (contracts)
│       ├── IUserRepository.ts
│       ├── IEmployeeRepository.ts
│       ├── IVacationRequestRepository.ts
│       ├── IEquipmentRepository.ts
│       └── IEquipmentAssignmentRepository.ts
│
├── application/                   # Application business rules (use cases)
│   └── use-cases/
│       ├── user/
│       ├── employee/
│       ├── vacationRequest/
│       ├── equipment/
│       └── equipmentAssignment/
│
├── infrastructure/                # Frameworks, drivers, DB (outermost layer)
│   ├── database/
│   │   ├── connection.ts          # Sequelize instance
│   │   ├── index.ts               # DB init / sync
│   │   └── models/                # Sequelize models
│   │       ├── UserModel.ts
│   │       ├── EmployeeModel.ts
│   │       ├── VacationRequestModel.ts
│   │       ├── EquipmentModel.ts
│   │       ├── EquipmentAssignmentModel.ts
│   │       └── index.ts           # Associations
│   └── repositories/              # Sequelize implementations of domain repos
│
└── presentation/                  # HTTP layer (Express)
    ├── app.ts                     # Express application setup
    ├── middlewares/
    │   ├── errorHandler.ts
    │   └── notFound.ts
    └── routes/
        ├── index.ts
        ├── userRoutes.ts
        ├── employeeRoutes.ts
        ├── vacationRequestRoutes.ts
        ├── equipmentRoutes.ts
        └── equipmentAssignmentRoutes.ts
```

---

## Data Models

| Entity                | Table                   | Key fields |
|-----------------------|-------------------------|------------|
| **User**              | `users`                 | id (UUID), name, email (unique), password (hashed), role (admin/manager/employee), isActive |
| **Employee**          | `employees`             | id (UUID), userId (FK→users), employeeCode (unique), firstName, lastName, position, department, employmentType, status, hireDate, vacationDaysAllowed, vacationDaysUsed |
| **VacationRequest**   | `vacation_requests`     | id (UUID), employeeId (FK→employees), reviewedBy (FK→users nullable), startDate, endDate, totalDays, status (pending/approved/rejected/cancelled), reason, reviewNotes, reviewedAt |
| **Equipment**         | `equipment`             | id (UUID), serialNumber (unique), name, category, brand, model, status (available/assigned/maintenance/retired), purchaseDate, purchaseCost, warrantyExpiration, notes |
| **EquipmentAssignment** | `equipment_assignments` | id (UUID), equipmentId (FK→equipment), employeeId (FK→employees), assignedBy (FK→users), assignedAt, returnedAt, status (active/returned/lost), notes |

---

## Setup

### 1. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start development server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
npm start
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by id |
| POST | `/api/users` | Create user |
| GET | `/api/employees` | List all employees |
| GET | `/api/employees/:id` | Get employee by id |
| POST | `/api/employees` | Create employee |
| GET | `/api/vacation-requests` | List all vacation requests |
| GET | `/api/vacation-requests/employee/:employeeId` | Requests by employee |
| POST | `/api/vacation-requests` | Create vacation request |
| GET | `/api/equipment` | List all equipment |
| GET | `/api/equipment/:id` | Get equipment by id |
| POST | `/api/equipment` | Create equipment |
| GET | `/api/equipment-assignments` | List all assignments |
| GET | `/api/equipment-assignments/employee/:employeeId` | Assignments by employee |
| POST | `/api/equipment-assignments` | Create assignment |

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot-reload (ts-node + nodemon) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |
