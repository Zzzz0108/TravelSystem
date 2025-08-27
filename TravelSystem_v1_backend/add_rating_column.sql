-- 为diaries表添加rating列
-- 执行时间：2024年

-- 添加rating列
ALTER TABLE diaries ADD COLUMN rating INT COMMENT '景点评分';

-- 为新增列添加索引
CREATE INDEX idx_diaries_rating ON diaries(rating);

-- 查看表结构确认
DESCRIBE diaries; 