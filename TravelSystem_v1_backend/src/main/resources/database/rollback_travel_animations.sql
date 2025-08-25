-- 旅行动画表回滚脚本
-- 撤销新增的列，恢复到升级前的状态
-- 执行前请先备份数据库

USE travel_system;

-- 1. 删除新增的索引
DROP INDEX IF EXISTS idx_travel_animations_transition_effect ON travel_animations;
DROP INDEX IF EXISTS idx_travel_animations_subtitle_style ON travel_animations;

-- 2. 删除新增的列（按照添加顺序的反序删除）
ALTER TABLE travel_animations DROP COLUMN IF EXISTS face_beautify;
ALTER TABLE travel_animations DROP COLUMN IF EXISTS color_correction;
ALTER TABLE travel_animations DROP COLUMN IF EXISTS remove_noise;
ALTER TABLE travel_animations DROP COLUMN IF EXISTS auto_enhance;
ALTER TABLE travel_animations DROP COLUMN IF EXISTS subtitle_style;
ALTER TABLE travel_animations DROP COLUMN IF EXISTS subtitle_text;
ALTER TABLE travel_animations DROP COLUMN IF EXISTS transition_effect;

-- 3. 验证表结构已恢复
DESCRIBE travel_animations;

-- 4. 查看当前表结构
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