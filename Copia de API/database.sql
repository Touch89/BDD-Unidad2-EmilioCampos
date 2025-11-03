CREATE DATABASE IF NOT EXISTS tarea_api;
USE tarea_api;

CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    telefono VARCHAR(20),
    edad INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    created_at DATETIME,
    status INT
);

CREATE TABLE purchases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    total DECIMAL(10,2),
    status VARCHAR(50),
    purchase_date DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    description VARCHAR(255),
    price DECIMAL(10,2),
    stock INT,
    image TEXT,
    created_at DATETIME
);

CREATE TABLE purchase_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    purchase_id INT,
    product_id INT,
    quantity INT,
    price DECIMAL(10,2),
    subtotal DECIMAL(10,2),
    FOREIGN KEY (purchase_id) REFERENCES purchases(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE payment_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50),
    description VARCHAR(150)
);

CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    purchase_id INT,
    payment_type_id INT,
    amount DECIMAL(10,2),
    payment_date DATETIME,
    reference VARCHAR(100),
    FOREIGN KEY (purchase_id) REFERENCES purchases(id),
    FOREIGN KEY (payment_type_id) REFERENCES payment_types(id)
);

INSERT INTO payment_types (name, description) VALUES 
('Efectivo', 'Pago realizado en efectivo en tienda'),
('Tarjeta de Crédito', 'Pago realizado con tarjeta de crédito'),
('Tarjeta de Débito', 'Pago con tarjeta de débito bancaria'),
('Transferencia Bancaria', 'Pago mediante transferencia bancaria'),
('PayPal', 'Pago realizado por plataforma PayPal'),
('Criptomoneda', 'Pago mediante moneda digital (Bitcoin, Ethereum, etc.)'),
('Cheque', 'Pago con cheque bancario'),
('MercadoPago', 'Pago realizado en plataforma MercadoPago'),
('Apple Pay', 'Pago mediante Apple Pay'),
('Google Pay', 'Pago mediante Google Pay');

INSERT INTO usuarios (nombre, email, telefono, edad) VALUES 
('Juan Pérez', 'juan.perez@example.com', '555-1234', 30),
('María López', 'maria.lopez@example.com', '555-5678', 25),
('Carlos Hernández', 'carlos.hernandez@example.com', '555-9876', 35),
('Ana Torres', 'ana.torres@example.com', '555-4321', 28),
('Luis Gómez', 'luis.gomez@example.com', '555-8765', 32);

INSERT INTO users (name, email, created_at, status) VALUES 
('Juan Pérez', 'juan.perez@example.com', NOW(), 1),
('María López', 'maria.lopez@example.com', NOW(), 1),
('Carlos Hernández', 'carlos.hernandez@example.com', NOW(), 1),
('Ana Torres', 'ana.torres@example.com', NOW(), 1),
('Luis Gómez', 'luis.gomez@example.com', NOW(), 1),
('Laura Jiménez', 'laura.jimenez@example.com', NOW(), 1),
('Pedro Sánchez', 'pedro.sanchez@example.com', NOW(), 1),
('Carmen Ruiz', 'carmen.ruiz@example.com', NOW(), 1),
('Miguel Díaz', 'miguel.diaz@example.com', NOW(), 0),
('Daniela Cruz', 'daniela.cruz@example.com', NOW(), 0);

