-- 为 spots 表补齐缺失的 views 列，兼容不支持 ALTER TABLE ... ADD COLUMN IF NOT EXISTS 的 MySQL 版本

-- 1) 如无 views 列则新增（NOT NULL，默认 0）
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'spots'
    AND COLUMN_NAME = 'views'
);
SET @ddl := IF(
  @col_exists = 0,
  'ALTER TABLE spots ADD COLUMN views INT NOT NULL DEFAULT 0 COMMENT ''浏览次数''',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2) 为缺失/为0的记录生成合理的浏览次数（确定性、可重复）
-- 公式：views = clamp( min=200, max=100000, popularity*12 + hash(name,city)%800 + 类型基数 )
-- 说明：hash 使用 CRC32，确保同一条目每次计算一致；景区基数更高，院校略低
UPDATE spots s
SET s.views = LEAST(
  100000,
  GREATEST(
    200,
    COALESCE(s.popularity, 0) * 12
    + (CRC32(CONCAT(s.name,'-',s.city)) % 800)
    + CASE WHEN s.type = 'SCENIC_AREA' THEN 1500 ELSE 800 END
  )
)
WHERE s.views IS NULL OR s.views = 0; 