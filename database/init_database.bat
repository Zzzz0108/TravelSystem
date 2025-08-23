@echo off
echo Initializing database...

REM Check if MySQL is running
echo Checking MySQL service...
mysqladmin ping -h localhost -u root --silent
if errorlevel 1 (
    echo MySQL service is not running. Please start MySQL first.
    pause
    exit /b 1
)

REM Ask for password
set /p MYSQL_PWD=Please enter MySQL root password: 

REM Execute the initialization SQL file
echo Executing database initialization...
mysql -u root -p%MYSQL_PWD% < init.sql
if errorlevel 1 (
    echo Failed to initialize database. Please check error message.
    pause
    exit /b 1
) else (
    echo Database initialization completed successfully
)

pause 