CREATE TABLE `animation_images` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_order` int NOT NULL,
  `animation_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_animation_images_animation_id` (`animation_id`),
  CONSTRAINT `animation_images_ibfk_1` FOREIGN KEY (`animation_id`) REFERENCES `travel_animations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci