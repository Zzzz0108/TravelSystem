-- 为diaries表添加city和province列
-- 执行时间：2024年

-- 添加city列
ALTER TABLE diaries ADD COLUMN city VARCHAR(100) COMMENT '景点所属城市';

-- 添加province列  
ALTER TABLE diaries ADD COLUMN province VARCHAR(100) COMMENT '景点所属省份';

-- 为新增列添加索引以提高搜索性能
CREATE INDEX idx_diaries_city ON diaries(city);
CREATE INDEX idx_diaries_province ON diaries(province);

-- 查看表结构确认
DESCRIBE diaries; 