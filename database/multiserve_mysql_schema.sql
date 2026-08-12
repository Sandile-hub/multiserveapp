
-- MultiServe MySQL 8 Schema
CREATE DATABASE IF NOT EXISTS multiserve;
USE multiserve;

CREATE TABLE users (
 id INT AUTO_INCREMENT PRIMARY KEY,
 full_name VARCHAR(255) NOT NULL,
 email VARCHAR(255) UNIQUE NOT NULL,
 password VARCHAR(255) NOT NULL,
 role ENUM('admin','provider','customer','super_admin') NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE businesses (
 id INT AUTO_INCREMENT PRIMARY KEY,
 provider_id INT NOT NULL,
 business_name VARCHAR(255) NOT NULL,
 status ENUM('pending','approved','rejected') DEFAULT 'pending',
 FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE service_categories (
 id INT AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE services (
 id INT AUTO_INCREMENT PRIMARY KEY,
 business_id INT NOT NULL,
 category_id INT,
 service_name VARCHAR(255) NOT NULL,
 price DECIMAL(10,2) NOT NULL,
 FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
 FOREIGN KEY (category_id) REFERENCES service_categories(id)
);

CREATE TABLE bookings (
 id INT AUTO_INCREMENT PRIMARY KEY,
 customer_id INT NOT NULL,
 provider_id INT NOT NULL,
 service_id INT NOT NULL,
 status ENUM('pending','accepted','completed','cancelled') DEFAULT 'pending',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
 id INT AUTO_INCREMENT PRIMARY KEY,
 booking_id INT NOT NULL,
 amount DECIMAL(10,2) NOT NULL,
 status ENUM('pending','successful','failed') DEFAULT 'pending'
);
