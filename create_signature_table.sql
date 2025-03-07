-- SQL Script to create the signature table in the bigproject database

-- Create signature table
CREATE TABLE IF NOT EXISTS `signature` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `date` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `validated` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `IDX_USER` (`user_id`),
  CONSTRAINT `FK_SIGNATURE_USER` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create validation table for signature validations
CREATE TABLE IF NOT EXISTS `validation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `signature_id` int NOT NULL,
  `validator_id` int NOT NULL,
  `date` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `comment` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_SIGNATURE` (`signature_id`),
  KEY `IDX_VALIDATOR` (`validator_id`),
  CONSTRAINT `FK_VALIDATION_SIGNATURE` FOREIGN KEY (`signature_id`) REFERENCES `signature` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_VALIDATION_USER` FOREIGN KEY (`validator_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert a test signature (only if you have a user with id=1)
-- INSERT INTO `signature` (`user_id`, `date`, `location`, `validated`) 
-- VALUES (1, NOW(), '43.3029127,5.3757154', 0);

-- Query to view all signatures
-- SELECT s.id, u.firstName, u.lastName, s.date, s.location, s.validated 
-- FROM signature s
-- JOIN user u ON s.user_id = u.id
-- ORDER BY s.date DESC;
