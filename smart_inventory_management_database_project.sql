-- Smart Inventory Management System Database
-- Project: Retail Store Inventory & Sales Tracking
-- Database Type: MySQL / PostgreSQL Compatible

CREATE DATABASE smart_inventory_system;
USE smart_inventory_system;

-- =========================
-- TABLE: Users
-- =========================
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Manager', 'Staff') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLE: Suppliers
-- =========================
CREATE TABLE suppliers (
    supplier_id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_name VARCHAR(120) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLE: Categories
-- =========================
CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- =========================
-- TABLE: Products
-- =========================
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(150) NOT NULL,
    category_id INT,
    supplier_id INT,
    sku VARCHAR(50) UNIQUE NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    reorder_level INT DEFAULT 10,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

-- =========================
-- TABLE: Customers
-- =========================
CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    loyalty_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLE: Orders
-- =========================
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    user_id INT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(12,2) DEFAULT 0,
    status ENUM('Pending', 'Completed', 'Cancelled') DEFAULT 'Pending',
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- =========================
-- TABLE: Order Details
-- =========================
CREATE TABLE order_details (
    order_detail_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * price) STORED,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- =========================
-- TABLE: Inventory Logs
-- =========================
CREATE TABLE inventory_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT,
    action_type ENUM('Stock In', 'Stock Out', 'Adjustment') NOT NULL,
    quantity_changed INT NOT NULL,
    performed_by INT,
    log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (performed_by) REFERENCES users(user_id)
);

-- =========================
-- SAMPLE DATA INSERTION
-- =========================

INSERT INTO users (full_name, email, password_hash, role)
VALUES
('Aarav Sharma', 'admin@smartinventory.com', 'hashed_password_1', 'Admin'),
('Maya Thapa', 'manager@smartinventory.com', 'hashed_password_2', 'Manager'),
('Rohan Karki', 'staff@smartinventory.com', 'hashed_password_3', 'Staff');

INSERT INTO suppliers (supplier_name, contact_person, phone, email, address)
VALUES
('Tech Distributors Ltd.', 'Nabin Rai', '+977-9811111111', 'contact@techdist.com', 'Kathmandu, Nepal'),
('FreshMart Suppliers', 'Sita Lama', '+977-9822222222', 'sales@freshmart.com', 'Lalitpur, Nepal');

INSERT INTO categories (category_name, description)
VALUES
('Electronics', 'Electronic gadgets and accessories'),
('Groceries', 'Daily grocery items'),
('Office Supplies', 'Office essentials and stationery');

INSERT INTO products (product_name, category_id, supplier_id, sku, unit_price, stock_quantity, reorder_level, expiry_date)
VALUES
('Wireless Mouse', 1, 1, 'ELEC-001', 25.99, 50, 10, NULL),
('USB Keyboard', 1, 1, 'ELEC-002', 45.50, 30, 8, NULL),
('Organic Rice 5KG', 2, 2, 'GROC-001', 18.75, 100, 20, '2026-12-31'),
('Notebook Pack', 3, 1, 'OFF-001', 8.99, 75, 15, NULL);

INSERT INTO customers (customer_name, phone, email, loyalty_points)
VALUES
('Suman Adhikari', '+977-9800000001', 'suman@gmail.com', 120),
('Priya Joshi', '+977-9800000002', 'priya@gmail.com', 60);

INSERT INTO orders (customer_id, user_id, total_amount, status)
VALUES
(1, 2, 97.48, 'Completed'),
(2, 3, 18.75, 'Pending');

INSERT INTO order_details (order_id, product_id, quantity, price)
VALUES
(1, 1, 2, 25.99),
(1, 4, 5, 8.99),
(2, 3, 1, 18.75);

INSERT INTO inventory_logs (product_id, action_type, quantity_changed, performed_by, remarks)
VALUES
(1, 'Stock Out', -2, 2, 'Sold in Order #1'),
(4, 'Stock Out', -5, 2, 'Sold in Order #1'),
(3, 'Stock Out', -1, 3, 'Reserved for Order #2');

-- =========================
-- USEFUL QUERIES
-- =========================

-- 1. View low stock products
SELECT product_name, stock_quantity, reorder_level
FROM products
WHERE stock_quantity <= reorder_level;

-- 2. Total sales report
SELECT SUM(total_amount) AS total_sales
FROM orders
WHERE status = 'Completed';

-- 3. Best-selling products
SELECT p.product_name, SUM(od.quantity) AS total_sold
FROM order_details od
JOIN products p ON od.product_id = p.product_id
GROUP BY p.product_name
ORDER BY total_sold DESC;

-- 4. Customer purchase history
SELECT c.customer_name, o.order_id, o.total_amount, o.status
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id;

-- 5. Supplier product list
SELECT s.supplier_name, p.product_name
FROM suppliers s
JOIN products p ON s.supplier_id = p.supplier_id;

-- =========================
-- ADVANCED FEATURES INCLUDED
-- =========================
-- Role-based user management
-- Stock tracking and inventory logs
-- Supplier management
-- Customer loyalty system
-- Auto subtotal calculation
-- Reorder level monitoring
-- Sales reporting support
-- Scalable relational structure
