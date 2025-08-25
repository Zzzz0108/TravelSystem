#!/bin/bash

# 数据库备份脚本
# 使用方法: ./backup_database.sh [数据库名] [用户名]

# 设置变量
DB_NAME=${1:-"travel_system_v1"}
DB_USER=${2:-"root"}
BACKUP_DIR="./database/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${DB_NAME}_${DATE}.sql"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}开始备份数据库: ${DB_NAME}${NC}"
echo -e "${YELLOW}备份文件: ${BACKUP_FILE}${NC}"

# 执行备份
if mysqldump -u "$DB_USER" -p --databases "$DB_NAME" > "$BACKUP_FILE"; then
    echo -e "${GREEN}✅ 数据库备份成功！${NC}"
    echo -e "${GREEN}备份文件位置: ${BACKUP_FILE}${NC}"
    
    # 显示备份文件大小
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}备份文件大小: ${BACKUP_SIZE}${NC}"
    
    # 显示备份文件信息
    echo -e "${YELLOW}备份文件详情:${NC}"
    ls -lh "$BACKUP_FILE"
    
    # 保留最近10个备份文件
    echo -e "${YELLOW}清理旧备份文件...${NC}"
    cd "$BACKUP_DIR"
    ls -t backup_${DB_NAME}_*.sql | tail -n +11 | xargs -r rm -f
    echo -e "${GREEN}旧备份文件清理完成${NC}"
    
else
    echo -e "${RED}❌ 数据库备份失败！${NC}"
    exit 1
fi 