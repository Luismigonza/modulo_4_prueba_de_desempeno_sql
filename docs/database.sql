DROP DATABASE IF EXISTS megastore_db;
CREATE DATABASE megastore_db;
USE megastore_db;

CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) UNIQUE NOT NULL,
    customer_address VARCHAR(200),
    customer_phone VARCHAR(20)
);

CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(100) NOT NULL,
    supplier_email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_category VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE products (
    product_sku VARCHAR(50) PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    unit_price DECIMAL(10,2),
    category_id INT,
    supplier_id INT,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

CREATE TABLE transactions (
    transaction_id INT PRIMARY KEY,
    date DATE,
    customer_id INT,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE transaction_details (
    transaction_id INT,
    product_sku VARCHAR(50),
    quantity INT,
    total_line_value DECIMAL(10,2),
    PRIMARY KEY (transaction_id, product_sku),
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id),
    FOREIGN KEY (product_sku) REFERENCES products(product_sku)
);

CREATE VIEW vw_inventory_summary AS
SELECT p.product_name, c.product_category, s.supplier_name, p.unit_price
FROM products p
JOIN categories c ON p.category_id = c.id
JOIN suppliers s ON p.supplier_id = s.id;
