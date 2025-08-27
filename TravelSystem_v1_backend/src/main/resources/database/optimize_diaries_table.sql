-- 优化diaries表结构，将图片字段直接放在diaries表中
-- 执行时间：2024年

-- 1. 为diaries表添加图片字段
ALTER TABLE diaries ADD COLUMN images TEXT COMMENT '图片URL列表，JSON格式存储';

-- 2. 为新增字段添加索引
CREATE INDEX idx_diaries_images ON diaries(images(100));

-- 3. 删除不再需要的图片表（如果存在）
DROP TABLE IF EXISTS diary_images;

-- 4. 查看表结构确认
DESCRIBE diaries; 