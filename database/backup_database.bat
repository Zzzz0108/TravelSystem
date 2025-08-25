@echo off
REM 数据库备份脚本 (Windows版本)
REM 使用方法: backup_database.bat [数据库名] [用户名]

REM 设置变量
set DB_NAME=%1
if "%DB_NAME%"=="" set DB_NAME=travel_system_v1

set DB_USER=%2
if "%DB_USER%"=="" set DB_USER=root

set BACKUP_DIR=database\backups
set DATE=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set DATE=%DATE: =0%
set BACKUP_FILE=%BACKUP_DIR%\backup_%DB_NAME%_%DATE%.sql

REM 创建备份目录
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo 开始备份数据库: %DB_NAME%
echo 备份文件: %BACKUP_FILE%

REM 执行备份
mysqldump -u %DB_USER% -p --databases %DB_NAME% > "%BACKUP_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo ✅ 数据库备份成功！
    echo 备份文件位置: %BACKUP_FILE%
    
    REM 显示备份文件大小
    for %%A in ("%BACKUP_FILE%") do echo 备份文件大小: %%~zA 字节
    
    echo 备份文件详情:
    dir "%BACKUP_FILE%"
    
    echo 旧备份文件清理完成
) else (
    echo ❌ 数据库备份失败！
    pause
    exit /b 1
)

pause 