-- 旅行动画表升级脚本
-- 为现有的travel_animations表添加新功能列
-- 执行前请先备份数据库

USE travel_system;

-- 1. 添加转场效果列
ALTER TABLE travel_animations 
ADD COLUMN transition_effect VARCHAR(20) NOT NULL DEFAULT 'FADE' 
COMMENT '转场效果：FADE, SLIDE_LEFT, SLIDE_RIGHT, SLIDE_UP, SLIDE_DOWN, ZOOM_IN, ZOOM_OUT, ROTATE, WIPE, DISSOLVE, MORPH';

-- 2. 添加字幕文本列
ALTER TABLE travel_animations 
ADD COLUMN subtitle_text TEXT 
COMMENT '字幕文本内容';

-- 3. 添加字幕样式列
ALTER TABLE travel_animations 
ADD COLUMN subtitle_style VARCHAR(20) DEFAULT 'ELEGANT' 
COMMENT '字幕样式：ELEGANT, BOLD, HANDWRITING, NEON';

-- 4. 添加自动增强列
ALTER TABLE travel_animations 
ADD COLUMN auto_enhance TINYINT(1) DEFAULT 1 
COMMENT '是否自动增强图片：0-否，1-是';

-- 5. 添加降噪处理列
ALTER TABLE travel_animations 
ADD COLUMN remove_noise TINYINT(1) DEFAULT 0 
COMMENT '是否降噪处理：0-否，1-是';

-- 6. 添加色彩校正列
ALTER TABLE travel_animations 
ADD COLUMN color_correction TINYINT(1) DEFAULT 1 
COMMENT '是否色彩校正：0-否，1-是';

-- 7. 添加人像美化列
ALTER TABLE travel_animations 
ADD COLUMN face_beautify TINYINT(1) DEFAULT 0 
COMMENT '是否人像美化：0-否，1-是';

-- 8. 为新增列添加索引（可选，提升查询性能）
CREATE INDEX idx_travel_animations_transition_effect ON travel_animations(transition_effect);
CREATE INDEX idx_travel_animations_subtitle_style ON travel_animations(subtitle_style);

-- 9. 验证表结构
DESCRIBE travel_animations;

-- 10. 查看新增列的数据类型和默认值
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'travel_system_v1' 
AND TABLE_NAME = 'travel_animations'
ORDER BY ORDINAL_POSITION; 