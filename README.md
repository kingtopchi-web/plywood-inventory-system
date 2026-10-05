# Plywood Inventory Management System

An independent, enterprise-grade, transaction-driven Plywood Inventory Management System designed exclusively for **Super Admin** oversight across all branches and warehouses.

---

## 🏛️ Core Architectural Principles

1. **Super Admin Only**: There is strictly **ONE** type of application user: `SUPER_ADMIN`. There are NO customer portals, staff logins, branch logins, or viewer accounts.
2. **Centralized Oversight of Branches**: Branches are business entities/locations (warehouses, depots, showrooms) managed centrally. Super Admin has unrestricted access across all branches.
3. **Transaction-Driven Centralized Inventory Engine**: All physical inventory adjustments, receipts, dispatches, and transfers must flow through the unified backend `InventoryService`. Every stock modification creates an immutable `InventoryTransaction` ledger record.
4. **Backend as the Single Source of Truth**: Stock balances, pricing, discounts, tax, and order statuses are strictly calculated and validated on the backend. Never trust frontend values.

---

## 📁 Project Structure

```
plywood-inventory-system/
├── admin/                           # Dedicated Admin Frontend (React + Vite)
│   ├── public/                      # Static assets & favicon
│   ├── src/
│   │   ├── assets/                  # Images & static media
│   │   ├── components/
│   │   │   ├── common/              # Button, Card, StatCard, LoadingSpinner
│   │   │   └── layout/              # Sidebar, Header, AdminLayout
│   │   ├── constants/               # apiEndpoints, navigation, appConfig
│   │   ├── context/                 # AuthContext (Super Admin state)
│   │   ├── hooks/                   # useAuth
│   │   ├── layouts/                 # AdminLayout, AuthLayout
│   │   ├── pages/
│   │   │   ├── auth/                # LoginPage (/admin/login)
│   │   │   ├── dashboard/           # DashboardPage (/admin/dashboard)
│   │   │   └── placeholder/         # ModulePlaceholders for mapped modules
│   │   ├── routes/                  # ProtectedRoute, AppRoutes
│   │   ├── services/                # api (Axios), authService, inventoryService
│   │   ├── styles/                  # index.css, layout.css, auth.css, dashboard.css
│   │   ├── utils/                   # storage, formatters
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                         # Express & Mongoose API Server
│   ├── src/
│   │   ├── config/                  # environment.js, db.js
│   │   ├── controllers/             # auth.controller, health.controller, inventory.controller
│   │   ├── middleware/              # auth.middleware, error.middleware, audit.middleware
│   │   ├── models/                  # 22 Mongoose Schemas (Admin, Inventory, Product, etc.)
│   │   ├── routes/                  # auth.routes, health.routes, inventory.routes, index.js
│   │   ├── scripts/                 # seedAdmin.js
│   │   ├── services/                # inventory.service (Central Engine), auth.service, audit.service
│   │   ├── utils/                   # apiError, apiResponse, jwt, logger
│   │   └── app.js                   # Express configuration & security stack
│   ├── server.js                    # HTTP listener & DB connection
│   └── package.json
│
├── .env.example                     # Environment variables template
├── .env                             # Local configuration (gitignored)
├── .gitignore
├── README.md
└── package.json                     # Root workspace management
```

---

## 🛠️ Technology Stack

- **Admin Frontend**: React 18, React Router v7, Vanilla CSS design tokens (Timber/Amber Theme), Lucide React, Axios.
- **Backend**: Node.js, Express.js, Mongoose, JWT, bcryptjs, Helmet, Morgan, Cookie-Parser.
- **Database**: MongoDB / MongoDB Atlas.

---

## 🚀 Getting Started

### 1. Configure Environment Variables
Copy `.env.example` to `.env` in the root folder:
```bash
cp .env.example .env
```
Ensure `MONGODB_URI`, `JWT_SECRET`, and `INITIAL_ADMIN_*` credentials are set.

### 2. Install Dependencies
Install all packages for root, backend, and admin:
```bash
npm run install:all
```

### 3. Seed the Initial Super Admin
Run the secure seeding command to initialize the first Super Admin and Head Office branch:
```bash
npm run seed:admin
```

### 4. Run Development Servers
- **Backend API Server** (runs on `http://localhost:5000`):
  ```bash
  npm run dev:backend
  ```
- **Admin Frontend** (runs on `http://localhost:5173`):
  ```bash
  npm run dev:admin
  ```

---

## 🔐 Authentication & Access Flow

- **Login Route**: `/admin/login`
- **Dashboard**: `/admin/dashboard`
- **Protected Routes**: All operational routes require an active JWT session with role `SUPER_ADMIN`.
- Unauthenticated requests are automatically redirected to `/admin/login`.

---

## 📊 Database Models (22 Core Entities)

1. `Admin` - Super Administrator accounts.
2. `Branch` - Physical locations & warehouses.
3. `Category` - Plywood categories (Commercial, Marine, Calibrated, etc.).
4. `Subcategory` - Sub-grades (MR, BWR, BWP).
5. `Brand` - Manufacturers (CenturyPly, Greenply, Austin, etc.).
6. `Unit` - Measuring units (SQFT, SHEET, PIECE).
7. `Product` - Plywood catalog master (thickness in mm, dimensions 8x4/7x4, grade, wood type).
8. `Inventory` - Live stock quantities per branch (`quantityAvailable`, `quantityReserved`, `totalQuantity`).
.
10. `StockTransfer` - Inter-branch inventory dispatch & receipt.
11. `Supplier` - Vendor profiles and GSTIN details.
12. `Purchase` - Purchase Orders and goods inwards.
13. `PurchaseItem` - Purchase order line items.
14. `SupplierPayment` - Payouts made to suppliers.
15. `Customer` - B2B dealers, contractors, and retail buyers.
16. `SalesOrder` - Outbound sales orders.
17. `SalesItem` - Order line items.
18. `Reservation` - Stock allocations for confirmed orders.
19. `Invoice` - GST sales invoices.
20. `CustomerPayment` - Receipts from customers.
21. `StockCount` - Physical stock audits and reconciliation.
22. `AuditLog` - Immutable system activity audit trail.

---

## 📦 Centralized Inventory Engine (`inventory.service.js`)

All physical stock operations use `inventoryService.recordMovement(...)`:
- **Stock In**: Increases available stock, creates `STOCK_IN` transaction.
- **Stock Out**: Decreases available stock after verifying non-negative balance, creates `STOCK_OUT` transaction.
- **Branch Transfer**: Creates `TRANSFER_OUT` from source and `TRANSFER_IN` to destination.
- **Order Reservation**: Moves available stock to reserved stock (`HOLD`).
- **Order Release / Dispatch**: Decrements reserved stock on fulfillment or returns to available on cancellation.
- **Stock Adjustment**: Reconciles damage, scrap, or surplus.
