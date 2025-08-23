-- 数据库迁移脚本
-- 为现有用户表添加email字段和创建验证码表

-- 1. 为users表添加email字段
ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE;

-- 2. 创建验证码表
CREATE TABLE IF NOT EXISTS verification_codes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expire_time DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_email_code (email, code),
    INDEX idx_email_created (email, created_at)
);

-- 3. 为现有用户生成默认邮箱（如果需要的话）
-- 注意：这只是一个示例，实际使用时需要根据具体情况处理
-- UPDATE users SET email = CONCAT(username, '@example.com') WHERE email IS NULL;

-- 4. 设置email字段为NOT NULL（在确保所有用户都有email后）
-- ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NOT NULL;

-- 5. 为现有用户设置默认邮箱（可选，根据实际情况决定是否执行）
-- UPDATE users SET email = CONCAT(username, '@qq.com') WHERE email IS NULL; 