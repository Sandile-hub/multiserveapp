-- =========================================
-- MULTISERVE POSTGRESQL SCHEMA
-- =========================================

DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS provider_availability CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS platform_settings CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =========================================
-- USERS
-- =========================================

CREATE TABLE users (
id SERIAL PRIMARY KEY,

```
full_name VARCHAR(255) NOT NULL,

email VARCHAR(255) NOT NULL UNIQUE,

phone VARCHAR(20) UNIQUE,

password VARCHAR(255) NOT NULL,

role VARCHAR(20) NOT NULL,

profile_image VARCHAR(500),

email_verified BOOLEAN DEFAULT FALSE,

is_active BOOLEAN DEFAULT TRUE,

last_login TIMESTAMP,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

address TEXT,

avatar TEXT,

bio TEXT
```

);

-- =========================================
-- BUSINESSES
-- =========================================

CREATE TABLE businesses (
id SERIAL PRIMARY KEY,

```
provider_id INTEGER NOT NULL,

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

status VARCHAR(20) DEFAULT 'pending',

rejection_reason TEXT,

verified_at TIMESTAMP,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT fk_business_provider
FOREIGN KEY (provider_id)
REFERENCES users(id)
ON DELETE CASCADE
```

);

-- =========================================
-- SERVICES
-- =========================================

CREATE TABLE services (
id SERIAL PRIMARY KEY,

```
business_id INTEGER NOT NULL,

service_name VARCHAR(255) NOT NULL,

description TEXT NOT NULL,

price NUMERIC(10,2) NOT NULL,

duration_minutes INTEGER NOT NULL,

service_image VARCHAR(500),

is_available BOOLEAN DEFAULT TRUE,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

provider_id INTEGER,

image TEXT,

CONSTRAINT fk_service_business
FOREIGN KEY (business_id)
REFERENCES businesses(id)
ON DELETE CASCADE
```

);

-- =========================================
-- BOOKINGS
-- =========================================

CREATE TABLE bookings (
id SERIAL PRIMARY KEY,

```
customer_id INTEGER NOT NULL,

provider_id INTEGER NOT NULL,

business_id INTEGER NOT NULL,

service_id INTEGER NOT NULL,

booking_date DATE NOT NULL,

booking_time TIME NOT NULL,

notes TEXT,

status VARCHAR(20) DEFAULT 'pending',

decline_reason TEXT,

payment_method VARCHAR(20) DEFAULT 'onsite',

payment_status VARCHAR(20) DEFAULT 'pending',

total_amount NUMERIC(10,2) NOT NULL,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

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
```

);

-- =========================================
-- PAYMENTS
-- =========================================

CREATE TABLE payments (
id SERIAL PRIMARY KEY,

```
booking_id INTEGER NOT NULL,

amount NUMERIC(10,2) NOT NULL,

payment_method VARCHAR(20) NOT NULL,

transaction_id VARCHAR(255),

status VARCHAR(20) DEFAULT 'pending',

paid_at TIMESTAMP,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

commission_percentage NUMERIC(5,2) DEFAULT 10,

commission_amount NUMERIC(10,2) DEFAULT 0,

provider_earnings NUMERIC(10,2) DEFAULT 0,

CONSTRAINT fk_payment_booking
FOREIGN KEY (booking_id)
REFERENCES bookings(id)
ON DELETE CASCADE
```

);

-- =========================================
-- REVIEWS
-- =========================================

CREATE TABLE reviews (
id SERIAL PRIMARY KEY,

```
booking_id INTEGER NOT NULL,

customer_id INTEGER NOT NULL,

provider_id INTEGER NOT NULL,

business_id INTEGER NOT NULL,

rating INTEGER CHECK (rating >= 1 AND rating <= 5),

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
```

);

-- =========================================
-- NOTIFICATIONS
-- =========================================

CREATE TABLE notifications (
id SERIAL PRIMARY KEY,

```
user_id INTEGER NOT NULL,

title VARCHAR(255) NOT NULL,

message TEXT NOT NULL,

is_read BOOLEAN DEFAULT FALSE,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT fk_notification_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE
```

);

-- =========================================
-- FAVORITES
-- =========================================

CREATE TABLE favorites (
id SERIAL PRIMARY KEY,

```
customer_id INTEGER NOT NULL,

business_id INTEGER NOT NULL,

service_id INTEGER,

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
```

);

-- =========================================
-- PROVIDER AVAILABILITY
-- =========================================

CREATE TABLE provider_availability (
id SERIAL PRIMARY KEY,

```
provider_id INTEGER NOT NULL,

day_of_week VARCHAR(20) NOT NULL,

start_time TIME NOT NULL,

end_time TIME NOT NULL,

is_available BOOLEAN DEFAULT TRUE,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (provider_id)
REFERENCES users(id)
ON DELETE CASCADE
```

);

-- =========================================
-- CONVERSATIONS
-- =========================================

CREATE TABLE conversations (
id SERIAL PRIMARY KEY,

```
customer_id INTEGER NOT NULL,

provider_id INTEGER NOT NULL,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

);

-- =========================================
-- MESSAGES
-- =========================================

CREATE TABLE messages (
id SERIAL PRIMARY KEY,

```
conversation_id INTEGER NOT NULL,

sender_id INTEGER NOT NULL,

receiver_id INTEGER NOT NULL,

message TEXT NOT NULL,

is_read BOOLEAN DEFAULT FALSE,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

);

-- =========================================
-- ACTIVITIES
-- =========================================

CREATE TABLE activities (
id SERIAL PRIMARY KEY,

```
message TEXT,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

);

-- =========================================
-- PLATFORM SETTINGS
-- =========================================

CREATE TABLE platform_settings (
id SERIAL PRIMARY KEY,

```
commission_percentage NUMERIC(5,2) DEFAULT 10
```

);
