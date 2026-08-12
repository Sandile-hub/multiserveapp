-- =========================================
-- DATABASE: multiserve-app
-- =========================================

CREATE DATABASE IF NOT EXISTS `multiserve-app`;

USE `multiserve-app`;

-- =========================================
-- USERS TABLE
-- =========================================

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,

    full_name VARCHAR(255) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    phone VARCHAR(20) UNIQUE,

    password VARCHAR(255) NOT NULL,

    role ENUM('admin', 'provider', 'customer') NOT NULL,

    profile_image VARCHAR(500) DEFAULT NULL,

    email_verified BOOLEAN DEFAULT FALSE,

    is_active BOOLEAN DEFAULT TRUE,

    last_login TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================
-- BUSINESSES TABLE
-- =========================================

CREATE TABLE businesses (
    id INT PRIMARY KEY AUTO_INCREMENT,

    provider_id INT NOT NULL,

    business_name VARCHAR(255) NOT NULL,

    category VARCHAR(255) NOT NULL,

    description TEXT NOT NULL,

    address TEXT NOT NULL,

    city VARCHAR(100) NOT NULL,

    province VARCHAR(100) NOT NULL,

    postal_code VARCHAR(20),

    business_phone VARCHAR(20),

    business_email VARCHAR(255),

    logo VARCHAR(500),

    banner_image VARCHAR(500),

    verification_document VARCHAR(500),

    status ENUM(
        'pending',
        'approved',
        'rejected'
    ) DEFAULT 'pending',

    rejection_reason TEXT,

    verified_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_business_provider
    FOREIGN KEY (provider_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- =========================================
-- SERVICES TABLE
-- =========================================

CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,

    business_id INT NOT NULL,

    service_name VARCHAR(255) NOT NULL,

    description TEXT NOT NULL,

    price DECIMAL(10,2) NOT NULL,

    duration_minutes INT NOT NULL,

    service_image VARCHAR(500),

    is_available BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_service_business
    FOREIGN KEY (business_id)
    REFERENCES businesses(id)
    ON DELETE CASCADE
);

-- =========================================
-- BOOKINGS TABLE
-- =========================================

CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,

    customer_id INT NOT NULL,

    provider_id INT NOT NULL,

    business_id INT NOT NULL,

    service_id INT NOT NULL,

    booking_date DATE NOT NULL,

    booking_time TIME NOT NULL,

    notes TEXT,

    status ENUM(
        'pending',
        'accepted',
        'declined',
        'completed',
        'cancelled'
    ) DEFAULT 'pending',

    decline_reason TEXT,

    payment_method ENUM(
        'online',
        'onsite'
    ) DEFAULT 'onsite',

    payment_status ENUM(
        'pending',
        'paid',
        'failed'
    ) DEFAULT 'pending',

    total_amount DECIMAL(10,2) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_booking_customer
    FOREIGN KEY (customer_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_booking_provider
    FOREIGN KEY (provider_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_booking_business
    FOREIGN KEY (business_id)
    REFERENCES businesses(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_booking_service
    FOREIGN KEY (service_id)
    REFERENCES services(id)
    ON DELETE CASCADE
);

-- =========================================
-- PAYMENTS TABLE
-- =========================================

CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,

    booking_id INT NOT NULL,

    amount DECIMAL(10,2) NOT NULL,

    payment_method ENUM(
        'online',
        'onsite'
    ) NOT NULL,

    transaction_id VARCHAR(255),

    status ENUM(
        'pending',
        'successful',
        'failed'
    ) DEFAULT 'pending',

    paid_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_booking
    FOREIGN KEY (booking_id)
    REFERENCES bookings(id)
    ON DELETE CASCADE
);

-- =========================================
-- REVIEWS TABLE
-- =========================================

CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,

    booking_id INT NOT NULL,

    customer_id INT NOT NULL,

    provider_id INT NOT NULL,

    business_id INT NOT NULL,

    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),

    comment TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_review_booking
    FOREIGN KEY (booking_id)
    REFERENCES bookings(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_review_customer
    FOREIGN KEY (customer_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_review_provider
    FOREIGN KEY (provider_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_review_business
    FOREIGN KEY (business_id)
    REFERENCES businesses(id)
    ON DELETE CASCADE
);

-- =========================================
-- NOTIFICATIONS TABLE
-- =========================================

CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    title VARCHAR(255) NOT NULL,

    message TEXT NOT NULL,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- =========================================
-- FAVORITES TABLE
-- =========================================

CREATE TABLE favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,

    customer_id INT NOT NULL,

    business_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(customer_id, business_id),

    CONSTRAINT fk_favorite_customer
    FOREIGN KEY (customer_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_favorite_business
    FOREIGN KEY (business_id)
    REFERENCES businesses(id)
    ON DELETE CASCADE
);

-- =========================================
-- ADMIN ACCOUNT
-- =========================================
-- PASSWORD: Admin@123
-- HASH THIS PASSWORD USING BCRYPT IN REAL PROJECT

INSERT INTO users (
    full_name,
    email,
    phone,
    password,
    role,
    email_verified,
    is_active
)
VALUES (
    'System Admin',
    'admin@multiserve.com',
    '0000000000',
    '$2b$10$5hUN/vzi2DoZMvMvG4LR6e0xM5vR12HPvfQ8l3BGu0TSTYejxxidC',
    'admin',
    TRUE,
    TRUE
);

DELETE FROM users
WHERE email = 'admin@multiserve.com';
CREATE TABLE provider_availability (

    id INT PRIMARY KEY AUTO_INCREMENT,

    provider_id INT NOT NULL,

    day_of_week ENUM(
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
    ) NOT NULL,

    start_time TIME NOT NULL,

    end_time TIME NOT NULL,

    is_available BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (provider_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
CREATE TABLE activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE conversations (

  id INT PRIMARY KEY AUTO_INCREMENT,

  customer_id INT NOT NULL,

  provider_id INT NOT NULL,

  created_at TIMESTAMP
  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (

  id INT PRIMARY KEY AUTO_INCREMENT,

  conversation_id INT NOT NULL,

  sender_id INT NOT NULL,

  receiver_id INT NOT NULL,

  message TEXT NOT NULL,

  is_read BOOLEAN
  DEFAULT FALSE,

  created_at TIMESTAMP
  DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE users
ADD COLUMN address TEXT NULL;
ALTER TABLE services
ADD COLUMN provider_id INT;
UPDATE services s
JOIN businesses b
ON s.business_id = b.id
SET s.provider_id = b.provider_id;
ALTER TABLE users
ADD COLUMN avatar TEXT;
ALTER TABLE users
ADD COLUMN bio TEXT;
ALTER TABLE payments
ADD COLUMN commission_percentage DECIMAL(5,2) DEFAULT 10;

ALTER TABLE payments
ADD COLUMN commission_amount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE payments
ADD COLUMN provider_earnings DECIMAL(10,2) DEFAULT 0;
CREATE TABLE platform_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  commission_percentage DECIMAL(5,2) DEFAULT 10
);
ALTER TABLE favorites
ADD COLUMN service_id INT;
ALTER TABLE services
ADD COLUMN image TEXT;

CREATE TABLE invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT,
  invoice_number VARCHAR(255),
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE payouts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  provider_id INT,
  amount DECIMAL(10,2),
  status VARCHAR(50),
  payout_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

ALTER TABLE bookings 
MODIFY COLUMN payment_status ENUM('pending', 'paid', 'failed', 'unpaid') 
DEFAULT 'pending';

-- Update any bookings with missing total_amount
UPDATE bookings 
SET total_amount = (
  SELECT price 
  FROM services 
  WHERE services.id = bookings.service_id
)
WHERE total_amount IS NULL OR total_amount = 0;

-- Verify the update
SELECT id, total_amount FROM bookings WHERE total_amount IS NOT NULL;

ALTER TABLE payments
MODIFY COLUMN payment_method ENUM(
  'cash',
  'stripe',
  'paypal',
  'card'
) NOT NULL;
ALTER TABLE payments
MODIFY COLUMN payment_method VARCHAR(50) NOT NULL;

ALTER TABLE users
ADD COLUMN city VARCHAR(255) DEFAULT NULL,
ADD COLUMN profession VARCHAR(255) DEFAULT NULL;
ALTER TABLE users
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE users

ADD COLUMN email_otp VARCHAR(10) DEFAULT NULL,
ADD COLUMN otp_expires_at DATETIME DEFAULT NULL;

CREATE TABLE wallet_transactions (

  id INT AUTO_INCREMENT PRIMARY KEY,

  user_id INT NOT NULL,

  type ENUM(
    'deposit',
    'payment',
    'refund',
    'withdrawal',
    'earning'
  ),

  amount DECIMAL(10,2) NOT NULL,

  status ENUM(
    'pending',
    'completed',
    'failed'
  ) DEFAULT 'completed',

  reference_id VARCHAR(255),

  description TEXT,

  created_at TIMESTAMP
  DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)
  REFERENCES users(id)
);
ALTER TABLE users
ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 0.00;
CREATE TABLE withdrawals (

  id INT AUTO_INCREMENT PRIMARY KEY,

  provider_id INT NOT NULL,

  amount DECIMAL(10,2) NOT NULL,

  bank_name VARCHAR(255),

  account_number VARCHAR(255),

  account_holder VARCHAR(255),

  status ENUM(
    'pending',
    'approved',
    'rejected'
  ) DEFAULT 'pending',

  created_at TIMESTAMP
  DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (provider_id)
  REFERENCES users(id)
);