# 🗄️ 数据库备份与恢复指南

## 📋 备份的重要性

在执行数据库升级前，**强烈建议**先备份数据库，以防升级过程中出现问题可以快速恢复。

## 🛠️ 备份方法

### 方法1：使用备份脚本（推荐）

#### macOS/Linux 用户
```bash
# 给脚本执行权限
chmod +x database/backup_database.sh

# 执行备份（使用默认数据库名和用户名）
./database/backup_database.sh

# 或者指定数据库名和用户名
./database/backup_database.sh travel_system_v1 root
```

#### Windows 用户
```cmd
# 直接双击运行，或命令行执行
database\backup_database.bat

# 或者指定参数
database\backup_database.bat travel_system_v1 root
```

### 方法2：手动备份命令

#### 备份整个数据库
```bash
mysqldump -u root -p --databases travel_system_v1 > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### 备份特定表
```bash
mysqldump -u root -p travel_system_v1 travel_animations > backup_travel_animations.sql
```

#### 备份数据库结构（不含数据）
```bash
mysqldump -u root -p --no-data travel_system_v1 > backup_structure.sql
```

## 🔄 恢复方法

### 恢复整个数据库
```bash
mysql -u root -p < backup_20241201_143022.sql
```

### 恢复特定表
```bash
mysql -u root -p travel_system_v1 < backup_travel_animations.sql
```

### 恢复数据库结构
```bash
mysql -u root -p travel_system_v1 < backup_structure.sql
```

## 📁 备份文件管理

### 备份文件命名规则
```
backup_[数据库名]_[日期]_[时间].sql
例如：backup_travel_system_v1_20241201_143022.sql
```

### 备份目录结构
```
database/
├── backups/                    # 备份文件目录
│   ├── backup_travel_system_v1_20241201_143022.sql
│   ├── backup_travel_system_v1_20241201_150000.sql
│   └── ...
├── upgrade_travel_animations.sql    # 升级脚本
├── rollback_travel_animations.sql   # 回滚脚本
└── verify_upgrade.sql               # 验证脚本
```

### 自动清理
- 脚本会自动保留最近10个备份文件
- 旧的备份文件会被自动删除
- 节省磁盘空间

## 🚨 注意事项

### 备份前检查
1. **确认数据库连接**：确保可以正常连接数据库
2. **检查磁盘空间**：确保有足够的空间存储备份文件
3. **选择合适时间**：在业务低峰期进行备份
4. **测试恢复**：重要数据建议先测试恢复流程

### 备份文件安全
1. **存储位置**：将备份文件存储在安全的位置
2. **访问权限**：限制备份文件的访问权限
3. **定期验证**：定期验证备份文件的完整性
4. **异地备份**：重要数据建议异地备份

## 📊 备份策略建议

### 日常备份
- **频率**：每天一次
- **保留时间**：7天
- **类型**：完整备份

### 升级前备份
- **频率**：升级前立即执行
- **保留时间**：永久保留（直到确认升级成功）
- **类型**：完整备份

### 定期备份
- **频率**：每周一次
- **保留时间**：1个月
- **类型**：完整备份

## 🔍 故障排除

### 常见问题

#### 1. 权限不足
```bash
# 错误：Access denied
# 解决：使用有足够权限的用户
mysqldump -u root -p --databases travel_system_v1 > backup.sql
```

#### 2. 磁盘空间不足
```bash
# 检查磁盘空间
df -h

# 清理旧文件
rm -f old_backup_*.sql
```

#### 3. 备份文件损坏
```bash
# 检查文件完整性
file backup_*.sql

# 尝试恢复
mysql -u root -p < backup_*.sql
```

### 联系支持
如果遇到无法解决的问题，请：
1. 检查错误日志
2. 确认MySQL版本兼容性
3. 联系技术支持

## ✅ 升级流程建议

### 完整升级流程
1. **备份数据库**：使用备份脚本
2. **验证备份**：检查备份文件完整性
3. **执行升级**：运行升级脚本
4. **验证升级**：运行验证脚本
5. **测试功能**：测试新功能是否正常
6. **清理备份**：确认无误后清理临时备份

### 快速回滚流程
1. **发现问题**：升级后发现问题
2. **停止服务**：停止应用服务
3. **执行回滚**：运行回滚脚本
4. **恢复数据**：从备份文件恢复
5. **重启服务**：重新启动应用

## 🎯 总结

数据库备份是系统升级的重要保障，建议：

- ✅ **必须执行**：升级前备份
- ✅ **定期执行**：日常备份
- ✅ **测试恢复**：验证备份有效性
- ✅ **安全存储**：保护备份文件

记住：**有备无患，无备必患！** 🛡️ 