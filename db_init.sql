-- 创建数据库（库名你可以改一下，如 my_app_db）
CREATE DATABASE IF NOT EXISTS my_app_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE my_app_db;

-- 1）users 表
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2）posts 表
DROP TABLE IF EXISTS posts;
CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  author_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_posts_user
    FOREIGN KEY (author_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3）comments 表
DROP TABLE IF EXISTS comments;
CREATE TABLE comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  work_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comments_post
    FOREIGN KEY (work_id) REFERENCES posts(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_comments_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
