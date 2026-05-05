# AbhiShop - Amazon-like E-Commerce Platform

A full-stack e-commerce web application built with **React.js** (frontend) and **.NET 8 Web API** (backend).

## 🚀 Tech Stack

| Layer      | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 19, Redux Toolkit, React Router v6 |
| Backend   | .NET 8 Web API, Entity Framework Core |
| Database  | SQLite (dev) / SQL Server (prod)    |
| Auth      | JWT Bearer tokens, BCrypt           |
| UI Icons  | React Icons (Feather)               |
| Toasts    | React Hot Toast                     |

## 📁 Project Structure

```
ECommerce/
├── AbhiShop.API/          # .NET 8 Web API Backend
│   ├── Controllers/       # API endpoints
│   ├── Models/            # EF Core entities
│   ├── DTOs/              # Data transfer objects
│   ├── Services/          # Business logic (JWT)
│   ├── Data/              # DbContext + Seeder
│   └── Migrations/        # EF Core migrations
└── abhishop-frontend/     # React.js Frontend
    └── src/
        ├── components/    # Reusable components
        ├── pages/         # Route pages
        ├── store/         # Redux Toolkit slices
        └── services/      # Axios API client
```

## 🛠️ Getting Started

### Backend (.NET 8 API)

```bash
cd AbhiShop.API
dotnet restore
dotnet run
```

API runs on: `http://localhost:5000`  
Swagger UI: `http://localhost:5000/swagger`

### Frontend (React)

```bash
cd abhishop-frontend
npm install
npm start
```

App runs on: `http://localhost:3000`

## ✨ Features

- **Product Catalog** — Browse, search, and filter by category, brand, price range
- **Product Details** — Image gallery, star ratings, customer reviews, stock status
- **Shopping Cart** — Add/remove items, quantity controls, shipping & tax calculation
- **Checkout Flow** — 3-step checkout: Shipping → Payment → Review & Place Order
- **User Authentication** — JWT register/login, profile management, password change
- **Order Management** — Place orders, track history, cancel pending orders
- **Customer Reviews** — Rate and review products with verified purchase badge
- **Admin Role** — Manage products, categories, and orders via API (role-based auth)
- **Responsive Design** — Mobile-first, works on all screen sizes
- **Demo Data** — 16 seeded products across 8 categories

## 🔐 Demo Credentials

| Role  | Email                  | Password   |
|-------|------------------------|------------|
| Admin | admin@abhishop.com     | Admin@123  |

## 🌐 API Endpoints

| Method | Route                     | Auth     | Description         |
|--------|---------------------------|----------|---------------------|
| POST   | /api/auth/register        | -        | Register user       |
| POST   | /api/auth/login           | -        | Login               |
| GET    | /api/auth/me              | Required | Get current user    |
| GET    | /api/products             | -        | List products       |
| GET    | /api/products/{id}        | -        | Get product detail  |
| GET    | /api/products/featured    | -        | Featured products   |
| GET    | /api/categories           | -        | List categories     |
| GET    | /api/cart                 | Required | Get cart            |
| POST   | /api/cart                 | Required | Add to cart         |
| PUT    | /api/cart/{id}            | Required | Update cart item    |
| DELETE | /api/cart/{id}            | Required | Remove from cart    |
| GET    | /api/orders               | Required | My orders           |
| POST   | /api/orders               | Required | Place order         |
| GET    | /api/reviews/product/{id} | -        | Product reviews     |
| POST   | /api/reviews              | Required | Add review          |
