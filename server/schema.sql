-- 1. Create Database (Run this separately if needed)
-- CREATE DATABASE talentlink;

-- 2. Connect to the database before running the following commands
-- \c talentlink

-- 3. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255)
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
    client_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX ix_projects_title ON projects(title);

-- 5. Contracts Table
CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    amount DOUBLE PRECISION,
    status VARCHAR(50) DEFAULT 'Active',
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    freelancer_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);
