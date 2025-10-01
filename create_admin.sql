-- Create Admin User Script
-- Run this in Supabase SQL Editor to create an admin account

-- Note: You'll need to manually hash the password using bcrypt
-- Use an online bcrypt generator or Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = bcrypt.hashSync('admin123', 10);

-- Example: Password 'admin123' hashes to:
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO admin_users (email, password_hash) 
VALUES ('admin@restaurant.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON CONFLICT (email) DO NOTHING;

-- Test account created:
-- Email: admin@restaurant.com
-- Password: admin123


