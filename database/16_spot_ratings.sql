 CREATE TABLE `spot_ratings` (
  `created_at` datetime(6) NOT NULL,
  `rating` int NOT NULL,
  `spot_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`spot_id`,`user_id`),
  KEY `FKrfeu98gnyn7642gsbcgbu6j5h` (`user_id`),
  CONSTRAINT `FKfed391j65knllfm4oxq5r68lf` FOREIGN KEY (`spot_id`) REFERENCES `spots` (`id`),
  CONSTRAINT `FKrfeu98gnyn7642gsbcgbu6j5h` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci