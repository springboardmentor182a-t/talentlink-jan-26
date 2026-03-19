-- 1. Create Database (Run this separately if needed)
-- CREATE DATABASE talentlink;

-- 2. Connect to the database before running the following commands
-- \c talentlink

-- Drop tables if they exist to ensure clean slate
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'Client', -- 'Client' or 'Freelancer'
    rating DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_users_username ON users(username);

-- 4. Projects Table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    budget DOUBLE PRECISION DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'Open',
    progress INTEGER DEFAULT 0,
    deadline TIMESTAMP,
    budget_spent DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- For Timeline
    client_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX ix_projects_title ON projects(title);

-- 5. Contracts Table
CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    amount DOUBLE PRECISION,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    freelancer_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- 6. Payments Table (For Spending Chart)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    amount DOUBLE PRECISION NOT NULL,
    status VARCHAR(50) DEFAULT 'Completed',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE
);

-- 7. Activity Logs Table (For Recent Activity)
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    activity_type VARCHAR(50), -- 'proposal', 'payment', 'contract', 'job_post'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
