
CREATE DATABASE IF NOT EXISTS taskflow_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE taskflow_db;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status ENUM(
        'Pending',
        'In Progress',
        'Completed'
    ) NOT NULL DEFAULT 'Pending',
    priority ENUM(
        'Low',
        'Medium',
        'High'
    ) NOT NULL DEFAULT 'Medium',
    due_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_tasks_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_tasks_user_status
ON tasks(user_id, status);

CREATE INDEX idx_tasks_user_created
ON tasks(user_id, created_at);

CREATE INDEX idx_tasks_user_due
ON tasks(user_id, due_date);
