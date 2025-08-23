CREATE TABLE IF NOT EXISTS `travel_system`.`diary_images`(
    `diary_id` bigint NOT NULL,
    `image_url` varchar(255) NULL,
    KEY `FK5ld4mw5kij2rxjaat714ekr3f` (`diary_id` ),
    CONSTRAINT `FK5ld4mw5kij2rxjaat714ekr3f` FOREIGN KEY (`diary_id`) REFERENCES `travel_system`.`diaries` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ;

-- 为每个日记添加一张随机图片
INSERT INTO `travel_system`.`diary_images` VALUES (1, 'https://picsum.photos/800/600?random=1');
INSERT INTO `travel_system`.`diary_images` VALUES (2, 'https://picsum.photos/800/600?random=2');
INSERT INTO `travel_system`.`diary_images` VALUES (3, 'https://picsum.photos/800/600?random=3');
INSERT INTO `travel_system`.`diary_images` VALUES (4, 'https://picsum.photos/800/600?random=4');
INSERT INTO `travel_system`.`diary_images` VALUES (5, 'https://picsum.photos/800/600?random=5');
INSERT INTO `travel_system`.`diary_images` VALUES (6, 'https://picsum.photos/800/600?random=6');
INSERT INTO `travel_system`.`diary_images` VALUES (7, 'https://picsum.photos/800/600?random=7');
INSERT INTO `travel_system`.`diary_images` VALUES (8, 'https://picsum.photos/800/600?random=8');
INSERT INTO `travel_system`.`diary_images` VALUES (9, 'https://picsum.photos/800/600?random=9');
INSERT INTO `travel_system`.`diary_images` VALUES (10, 'https://picsum.photos/800/600?random=10');

