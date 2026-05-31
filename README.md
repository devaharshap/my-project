# ShopNow — Full-Stack E-Commerce Platform

A production-ready E-Commerce platform with Next.js 15 frontend, Spring Boot 3 backend, PostgreSQL, and Redis.

## Quick Start (Docker)

```bash
# 1. Clone and enter directory
git clone <repo-url>
cd my-project

# 2. Copy environment file
cp .env.example .env

# 3. Start all services
docker-compose up -d

# 4. Access the app
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8080
# Swagger:   http://localhost:8080/swagger-ui.html
```

## Demo Credentials

| Role  | Email                      | Password       |
|-------|----------------------------|----------------|
| Admin | admin@ecommerce.com        | Admin@123      |
| User  | user1@ecommerce.com        | Password@123   |

## Tech Stack

**Frontend**
- Next.js 15 + React 19 + TypeScript
- Tailwind CSS + Radix UI (ShadCN-inspired components)
- TanStack Query v5 for data fetching
- Axios for API calls

**Backend**
- Java 21 + Spring Boot 3.3
- Spring Security 6 + JWT (jjwt 0.12)
- Spring Data JPA + Hibernate 6
- Flyway database migrations
- Redis caching
- SpringDoc OpenAPI

**Database**
- PostgreSQL 16

## Project Structure

```
my-project/
├── backend/                    # Spring Boot application
│   ├── src/main/java/com/ecommerce/
│   │   ├── config/             # Security, Redis, OpenAPI config
│   │   ├── controller/         # REST controllers
│   │   ├── dto/                # Request/Response DTOs
│   │   ├── entity/             # JPA entities + enums
│   │   ├── exception/          # Custom exceptions + global handler
│   │   ├── repository/         # Spring Data JPA repositories
│   │   ├── security/           # JWT filter, provider, entry point
│   │   └── service/            # Business logic
│   ├── src/main/resources/
│   │   ├── application.yml     # Application configuration
│   │   └── db/migration/       # Flyway SQL scripts
│   └── Dockerfile
├── frontend/                   # Next.js 15 application
│   ├── src/app/
│   │   ├── (main)/             # Main storefront layout
│   │   ├── (auth)/             # Login/Register
│   │   └── admin/              # Admin panel
│   ├── src/components/         # Reusable components
│   ├── src/contexts/           # Auth & Cart contexts
│   ├── src/lib/                # API client, utils
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

## API Documentation

Swagger UI is available at `http://localhost:8080/swagger-ui.html` when the backend is running.

**Key Endpoints:**

| Method | Endpoint                    | Description           |
|--------|-----------------------------|-----------------------|
| POST   | /api/auth/register          | Register user         |
| POST   | /api/auth/login             | Login & get JWT       |
| GET    | /api/products               | List/filter products  |
| GET    | /api/products/{id}          | Product detail        |
| GET    | /api/categories             | All categories        |
| GET    | /api/cart                   | Get cart              |
| POST   | /api/cart/items             | Add to cart           |
| POST   | /api/orders                 | Place order           |
| GET    | /api/orders                 | Order history         |
| GET    | /api/admin/dashboard        | Dashboard stats       |
| POST   | /api/admin/products         | Create product        |
| PUT    | /api/admin/orders/{id}/status | Update order status |

## Database Schema

12 tables: `users`, `roles`, `user_roles`, `addresses`, `categories`, `products`, `inventory`, `carts`, `cart_items`, `orders`, `order_items`, `payments`, `audit_logs`

## Seed Data

On first start, the seeder creates:
- 1 Admin user
- 100 Customer users (password: `Password@123`)
- 20 Product categories
- 1,000 Products with inventory
- 500 Orders

## Local Development (without Docker)

**Prerequisites:** Java 21, Maven, Node.js 22, PostgreSQL, Redis

```bash
# Backend
cd backend
mvn spring-boot:run

# Frontend
cd frontend
npm install
npm run dev
```

## Environment Variables

| Variable          | Default          | Description                |
|-------------------|------------------|----------------------------|
| POSTGRES_DB       | ecommerce        | Database name              |
| POSTGRES_USER     | ecommerce        | Database user              |
| POSTGRES_PASSWORD | ecommerce123     | Database password          |
| JWT_SECRET        | (base64 string)  | JWT signing key            |
| JWT_EXPIRATION    | 86400000         | Access token TTL (ms)      |
| NEXT_PUBLIC_API_URL | http://localhost:8080/api | Backend URL     |
