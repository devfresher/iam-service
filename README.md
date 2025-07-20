# IAM Service

A modular Identity and Access Management (IAM) service built with [NestJS](https://nestjs.com/).  
It provides authentication, authorization, and user management functionalities with support for environment-based configurations and unit and integration testing using an in-memory SQLite database.

---

## 🚀 Features

- User registration & login
- Refresh token rotation
- Role-based access control
- Health record management
- SQLite in-memory DB for testing
- PostgreSQL for production
- Modular architecture with TypeORM

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/iam-service.git
cd iam-service 
```

### 2. Clone the repository

```bash
pnpm install
```

### 3. Setup environment variables

Copy the content of .env.example to .env and update accordingly

### 4. Run Migration

```bash
pnpm run migration:run
```

### 5. Seed Admin Account

```bash
pnpm run seed
```

### 6. Run Service

```bash
pnpm run dev
```

### 7. Run Unit Tests

```bash
pnpm run test
```

### 8. Run Integration Tests

```bash
pnpm run test:e2e
```

## 🛠️ Documentations

### Postman Doc

The Postman collection has been shared with  
It can also be accessed via this [link](https://laoleathers.postman.co/workspace/My-Workspace~ec4258f6-2573-43d7-85b4-4481bf61f7fe/collection/32471171-155b22f8-e46b-440d-a8bd-d55500dd753f?action=share&creator=32471171)

### Design Doc

- [System Design Doc](https://docs.google.com/document/d/1oRxtaOo-zKaMihKeeANZFldZZZEminUfYD05df0vJFY/edit?usp=sharing)
- [ER Diagram](er-diagram.png)
