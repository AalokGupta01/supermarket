# 🛒 Supermarket API

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v14%2B-green)
![Express.js](https://img.shields.io/badge/Express.js-v4-white)

## 🚀 Backend Server URL: https://supermarket-back.onrender.com

**Supermarket** is a comprehensive E-commerce backend application. It features a dual-role system: **Customers** for shopping and order management, and **Admins** for complete control over inventory, product catalogs, and order fulfillment.

---

## 🚀 Features

### 👤 User (Customer)
* **Authentication:** Secure Login, Registration, and Password management (JWT-based).
* **Profile Management:** Update personal details and manage shipping addresses.
* **Shopping Experience:** Search products, filter by categories, and view detailed product info.
* **Cart System:** persistent shopping cart (Add, Update, Remove, Clear).
* **Checkout:** Secure order placement and personal order history tracking.

### 🛡️ Admin (Manager)
* **Product Management:** Create, Update, and Delete products.
* **Inventory Control:** Upload product images and manage stock.
* **Order Fulfillment:** View all customer orders and update status (e.g., Pending → Delivered).
* **Access Control:** Secure Admin Login and Management.

---

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (Mongoose ODM)
* **Authentication:** JSON Web Tokens (JWT) & bcrypt
* **File Handling:** Multer (for product image uploads)

---

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/AalokGupta01/supermarket.git
    cd supermarket
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    PORT=8000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    ACCESS_TOKEN_EXPIRY=1d
    ```

4.  **Run the server**
    ```bash
    npm run super
    ```

---

## 📡 API Endpoints

### 1. User Authentication & Account
**Base URL:** `/api/v1/users`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Login user | Public |
| POST | `/logout` | Logout user | **Private** |
| POST | `/change-password` | Change current password | **Private** |
| PATCH | `/update-account` | Update profile details | **Private** |

### 2. Admin Operations & Dashboard
**Base URL:** `/api/v1/admin`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Register new admin | Public/Secret |
| POST | `/login` | Admin login | Public |
| POST | `/logout` | Admin logout | **Admin** |
| GET | `/get-admin` | Get current admin details | **Admin** |
| GET | `/categories` | Get category statistics | **Admin** |
| GET | `/orders` | View all system orders | **Admin** |
| PATCH | `/orders/:orderId/status` | Update order status | **Admin** |

### 3. Products Management
**Base URL:** `/api/v1/products`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/` | Get all products | Public |
| GET | `/category/:category` | Get products by category | Public |
| GET | `/:id` | Get single product details | Public |
| POST | `/upload` | Upload product image | **Admin** |
| POST | `/` | Create a new product | **Admin** |
| PUT | `/:id` | Update product details | **Admin** |
| DELETE | `/:id` | Delete a product | **Admin** |

### 4. Shopping Cart
**Base URL:** `/api/v1/cart`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/` | Get user's cart | **User** |
| POST | `/add` | Add item to cart | **User** |
| PUT | `/item/:itemId` | Update quantity | **User** |
| DELETE | `/item/:itemId` | Remove specific item | **User** |
| DELETE | `/clear` | Clear entire cart | **User** |

### 5. Orders & Checkout
**Base URL:** `/api/v1/order`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/place` | Place a new order | **User** |
| GET | `/my-orders` | Get personal order history | **User** |

### 6. Address Management
**Base URL:** `/api/v1/address`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/save` | Save a new address | **User** |
| GET | `/all` | Get all saved addresses | **User** |
| DELETE | `/:addressId` | Delete an address | **User** |

---

## 📂 Project Structure

```text
supermarket/
├── src/
│   ├── controllers/    # Logic for Users, Admin, Products, Cart, Orders
│   ├── models/         # Mongoose Schemas
│   ├── routes/         # API Routes
│   ├── middlewares/    # Auth (verifyJWT, verifyAdmin) & Uploads
│   ├── utils/          # Standardized Error & Response handling
│   ├── db/             # Database connection
│   └── app.js          # App configuration
└── index.js            # Server entry point