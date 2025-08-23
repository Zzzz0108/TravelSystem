-- 设置编码
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 删除并创建数据库
DROP DATABASE IF EXISTS travel_system;
CREATE DATABASE travel_system;
USE travel_system;

-- 执行所有SQL文件
SOURCE 01_users.sql;
SOURCE 02_spots.sql;
SOURCE 03_user_favorite_spots.sql;
SOURCE 04_buildings.sql;
SOURCE 05_facilities.sql;
SOURCE 06_road_connections.sql;
SOURCE 07_road_path_points.sql;
SOURCE 08_diaries.sql;
SOURCE 09_diary_images.sql;
SOURCE 10_diary_likes.sql;
SOURCE 11_diary_ratings.sql;
SOURCE 12_diary_spots.sql;
SOURCE 13_diary_tags.sql;
SOURCE 14_diary_comments.sql;
SOURCE 16_spot_ratings.sql;
SOURCE 17_travel_animations.sql;
SOURCE 18_animation_images.sql; 
