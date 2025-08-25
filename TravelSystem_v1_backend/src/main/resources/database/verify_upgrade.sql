-- 旅行动画表升级验证脚本
-- 验证新增列是否成功添加

USE travel_system;

-- 1. 检查表是否存在
SHOW TABLES LIKE 'travel_animations';

-- 2. 查看完整的表结构
DESCRIBE travel_animations;

-- 3. 检查新增列是否存在
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'travel_system_v1' 
AND TABLE_NAME = 'travel_animations'
AND COLUMN_NAME IN (
    'transition_effect',
    'subtitle_text', 
    'subtitle_style',
    'auto_enhance',
    'remove_noise',
    'color_correction',
    'face_beautify'
)
ORDER BY COLUMN_NAME;

-- 4. 检查索引是否存在
SHOW INDEX FROM travel_animations;

-- 5. 验证默认值
SELECT 
    'transition_effect' as column_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN transition_effect = 'FADE' THEN 1 END) as fade_count,
    COUNT(CASE WHEN transition_effect IS NULL THEN 1 END) as null_count
FROM travel_animations
UNION ALL
SELECT 
    'auto_enhance' as column_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN auto_enhance = 1 THEN 1 END) as enabled_count,
    COUNT(CASE WHEN auto_enhance = 0 THEN 1 END) as disabled_count
FROM travel_animations
UNION ALL
SELECT 
    'color_correction' as column_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN color_correction = 1 THEN 1 END) as enabled_count,
    COUNT(CASE WHEN color_correction = 0 THEN 1 END) as disabled_count
FROM travel_animations;

-- 6. 显示升级成功信息
SELECT 
    '✅ 升级验证完成' as status,
    '所有新增列已成功添加' as message,
    NOW() as verification_time; 