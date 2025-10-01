# Authentication Setup Guide

## Overview

This restaurant app now has complete authentication with:

- **Customer accounts** - Register/login to add items to cart and checkout
- **Admin accounts** - Login required to access admin panel and upload products

## Database Setup

### 1. Create Customers Table

Run this SQL in Supabase SQL Editor:

```sql
-- Add customers table for customer authentication
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_customers_email ON customers(email);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers table
CREATE POLICY "Customers can view their own data" ON customers
  FOR SELECT USING (auth.uid()::text = id::text OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage customers" ON customers
  FOR ALL USING (auth.role() = 'service_role');
```

### 2. Create Admin User

Run this SQL to create an admin account:

```sql
-- Create admin user
-- Email: admin@restaurant.com
-- Password: admin123
INSERT INTO admin_users (email, password_hash)
VALUES ('admin@restaurant.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON CONFLICT (email) DO NOTHING;
```

### 3. Add JWT Secret

Add this to your `.env.local`:

```env
JWT_SECRET=your-secret-jwt-key-change-this-to-something-secure
```

Generate a secure key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Features

### Customer Flow

1. **Register** - `/register` - Create a new customer account
2. **Login** - `/login` - Sign in with email/password
3. **Browse Menu** - `/` - View all products (no login required)
4. **Add to Cart** - Must be logged in as customer
5. **Checkout** - `/checkout` - Place order and pay

### Admin Flow

1. **Login** - `/login` - Sign in with admin credentials
2. **Admin Dashboard** - `/admin` - View all products, stats
3. **Upload Products** - `/admin/upload` - Add products with AI extraction

## Protection

### Routes Protected:

- ✅ `/admin/*` - Admin only
- ✅ `/cart` - Customer only (shown in header)
- ✅ Add to cart button - Customer only

### Public Routes:

- ✅ `/` - Menu (everyone can view)
- ✅ `/login` - Login page
- ✅ `/register` - Registration page
- ✅ `/checkout` - Checkout (logged in customers)

## Test Accounts

### Admin Account

- **Email**: `admin@restaurant.com`
- **Password**: `admin123`

### Customer Account

Register a new account at `/register` or use:

- **Email**: Your choice
- **Password**: Your choice (minimum 6 characters)

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register customer
- `POST /api/auth/login` - Login (admin or customer)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

## User Experience

### Header Changes

- Shows **Login** button when logged out
- Shows **User name + Logout** button when logged in
- **Admin badge** shown for admin users
- **Cart icon** only shown for customers
- **Admin link** only shown for admins

### Product Cards

- Clicking "Add to Cart" without login → Redirects to `/login`
- Only customers can add items to cart
- Admins cannot add to cart (admin view only)

## Security Features

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens with 7-day expiration
- ✅ HttpOnly cookies (XSS protection)
- ✅ Role-based access control
- ✅ Protected API routes
- ✅ Client-side route guards

## Troubleshooting

### Can't login as admin?

1. Make sure you ran the `create_admin.sql` script
2. Check `admin_users` table in Supabase
3. Verify email: `admin@restaurant.com`
4. Password: `admin123`

### Can't add to cart?

1. Make sure you're logged in as a **customer** (not admin)
2. Register a new account at `/register`
3. Check browser console for errors

### JWT errors?

1. Make sure `JWT_SECRET` is set in `.env.local`
2. Restart the dev server after adding env variables

