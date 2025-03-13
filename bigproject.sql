-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Hôte : database
-- Généré le : sam. 08 mars 2025 à 23:06
-- Version du serveur : 8.0.41
-- Version de PHP : 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `bigproject`
--

-- --------------------------------------------------------

--
-- Structure de la table `address`
--

CREATE TABLE `address` (
  `id` int NOT NULL,
  `city_id` int NOT NULL,
  `user_id` int NOT NULL,
  `postal_code_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `complement` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `address`
--

INSERT INTO `address` (`id`, `city_id`, `user_id`, `postal_code_id`, `name`, `complement`) VALUES
(12, 36, 32, 15, '123 Rue de la Paix', 'Appartement 4B'),
(13, 36, 33, 16, '45 Avenue des Champs-Élysées', NULL),
(14, 36, 34, 17, '78 Boulevard Haussmann', '3ème étage'),
(15, 37, 35, 18, '15 Rue de la République', NULL),
(16, 38, 36, 19, '56 Rue du Vieux Port', 'Bâtiment B'),
(17, 39, 37, 20, '89 Cours de l\'Intendance', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `city`
--

CREATE TABLE `city` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `city`
--

INSERT INTO `city` (`id`, `name`) VALUES
(36, 'Paris'),
(37, 'Lyon'),
(38, 'Marseille'),
(39, 'Bordeaux'),
(40, 'Lille');

-- --------------------------------------------------------

--
-- Structure de la table `diploma`
--

CREATE TABLE `diploma` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `institution` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `doctrine_migration_versions`
--

CREATE TABLE `doctrine_migration_versions` (
  `version` varchar(191) COLLATE utf8mb3_unicode_ci NOT NULL,
  `executed_at` datetime DEFAULT NULL,
  `execution_time` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Déchargement des données de la table `doctrine_migration_versions`
--

INSERT INTO `doctrine_migration_versions` (`version`, `executed_at`, `execution_time`) VALUES
('DoctrineMigrations\\Version20240507_AddMissingIndexes', '2025-03-08 12:32:44', 782),
('DoctrineMigrations\\Version20250306151500', '2025-03-06 15:15:09', 2009),
('DoctrineMigrations\\Version20250306153216', '2025-03-06 15:32:25', 148),
('DoctrineMigrations\\Version20250306200336', '2025-03-06 20:03:44', 89);

-- --------------------------------------------------------

--
-- Structure de la table `document`
--

CREATE TABLE `document` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `document_type_id` int NOT NULL,
  `validated_by_id` int DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` int NOT NULL,
  `path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment` longtext COLLATE utf8mb4_unicode_ci,
  `validated_at` datetime DEFAULT NULL,
  `uploaded_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `document`
--

INSERT INTO `document` (`id`, `user_id`, `document_type_id`, `validated_by_id`, `name`, `filename`, `mime_type`, `size`, `path`, `status`, `comment`, `validated_at`, `uploaded_at`, `updated_at`) VALUES
(23, 36, 21, 36, 'CV DEV WEB.pdf', 'cv-uploads/36/CV-DEV-WEB-67ccace55a0c7.pdf', 'application/pdf', 50789, 'https://bigproject-storage.s3.eu-north-1.amazonaws.com/cv-uploads/36/CV-DEV-WEB-67ccace55a0c7.pdf', 'APPROVED', NULL, '2025-03-08 20:47:33', '2025-03-08 20:47:33', '2025-03-08 20:47:33');

-- --------------------------------------------------------

--
-- Structure de la table `document_category`
--

CREATE TABLE `document_category` (
  `id` int NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `document_category`
--

INSERT INTO `document_category` (`id`, `code`, `name`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(36, 'IDENTITY', 'Documents d\'identité', 'Pièces d\'identité et documents officiels', 1, '2025-03-06 15:38:08', '2025-03-06 15:38:08'),
(37, 'ACADEMIC', 'Documents académiques', 'Diplômes, relevés de notes et certificats de formation', 1, '2025-03-06 15:38:08', '2025-03-06 15:38:08'),
(38, 'PROFESSIONAL', 'Documents professionnels', 'CV, lettres de recommandation et certificats professionnels', 1, '2025-03-06 15:38:08', '2025-03-06 15:38:08'),
(39, 'ADMINISTRATIVE', 'Documents administratifs', 'Documents administratifs et formulaires officiels', 1, '2025-03-06 15:38:08', '2025-03-06 15:38:08'),
(40, 'MEDICAL', 'Documents médicaux', 'Certificats médicaux et documents de santé', 1, '2025-03-06 15:38:08', '2025-03-06 15:38:08');

-- --------------------------------------------------------

--
-- Structure de la table `document_history`
--

CREATE TABLE `document_history` (
  `id` int NOT NULL,
  `document_id` int NOT NULL,
  `user_id` int NOT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `details` json DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `document_history`
--

INSERT INTO `document_history` (`id`, `document_id`, `user_id`, `action`, `details`, `created_at`) VALUES
(112, 23, 36, 'created', NULL, '2025-03-08 20:47:33'),
(113, 23, 36, 'validated', '{\"automatic\": true}', '2025-03-08 20:47:33'),
(114, 23, 36, 'downloaded', NULL, '2025-03-08 20:47:46');

-- --------------------------------------------------------

--
-- Structure de la table `document_type`
--

CREATE TABLE `document_type` (
  `id` int NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `allowed_mime_types` json NOT NULL,
  `max_file_size` int NOT NULL,
  `is_required` tinyint(1) NOT NULL,
  `deadline_at` date DEFAULT NULL,
  `notification_days` int DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `document_type`
--

INSERT INTO `document_type` (`id`, `code`, `name`, `description`, `allowed_mime_types`, `max_file_size`, `is_required`, `deadline_at`, `notification_days`, `is_active`, `created_at`, `updated_at`) VALUES
(17, 'ID_CARD', 'Carte d\'identité', 'Carte nationale d\'identité en cours de validité', '[\"application/pdf\", \"image/jpeg\", \"image/png\"]', 5242880, 1, NULL, 7, 1, '2025-03-06 15:38:11', '2025-03-06 15:38:11'),
(18, 'PASSPORT', 'Passeport', 'Passeport en cours de validité', '[\"application/pdf\", \"image/jpeg\", \"image/png\"]', 5242880, 0, NULL, 7, 1, '2025-03-06 15:38:11', '2025-03-06 15:38:11'),
(19, 'DIPLOMA', 'Diplôme', 'Diplôme ou attestation de réussite', '[\"application/pdf\"]', 10485760, 1, NULL, 7, 1, '2025-03-06 15:38:11', '2025-03-06 15:38:11'),
(20, 'TRANSCRIPT', 'Relevé de notes', 'Relevé de notes officiel', '[\"application/pdf\"]', 10485760, 1, NULL, 7, 1, '2025-03-06 15:38:11', '2025-03-06 15:38:11'),
(21, 'CV', 'Curriculum Vitae', 'CV à jour', '[\"application/pdf\", \"application/msword\", \"application/vnd.openxmlformats-officedocument.wordprocessingml.document\"]', 2097152, 1, NULL, 7, 1, '2025-03-06 15:38:11', '2025-03-06 15:38:11'),
(22, 'RECOMMENDATION', 'Lettre de recommandation', 'Lettre de recommandation professionnelle', '[\"application/pdf\"]', 2097152, 0, NULL, 7, 1, '2025-03-06 15:38:11', '2025-03-06 15:38:11'),
(23, 'REGISTRATION', 'Formulaire d\'inscription', 'Formulaire d\'inscription complété et signé', '[\"application/pdf\"]', 5242880, 1, NULL, 7, 1, '2025-03-06 15:38:11', '2025-03-06 15:38:11'),
(24, 'MEDICAL_CERTIFICATE', 'Certificat médical', 'Certificat médical d\'aptitude', '[\"application/pdf\"]', 5242880, 1, NULL, 7, 1, '2025-03-06 15:38:11', '2025-03-06 15:38:11');

-- --------------------------------------------------------

--
-- Structure de la table `document_type_category`
--

CREATE TABLE `document_type_category` (
  `document_type_id` int NOT NULL,
  `document_category_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `document_type_category`
--

INSERT INTO `document_type_category` (`document_type_id`, `document_category_id`) VALUES
(17, 36),
(18, 36),
(19, 37),
(20, 37),
(21, 38),
(22, 38),
(23, 39),
(24, 40);

-- --------------------------------------------------------

--
-- Structure de la table `domain`
--

CREATE TABLE `domain` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `domain`
--

INSERT INTO `domain` (`id`, `name`) VALUES
(36, 'Développement'),
(37, 'Design'),
(38, 'Marketing Digital'),
(39, 'Business & Management'),
(40, 'Data & IA');

-- --------------------------------------------------------

--
-- Structure de la table `messenger_messages`
--

CREATE TABLE `messenger_messages` (
  `id` bigint NOT NULL,
  `body` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `headers` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue_name` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `available_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `delivered_at` datetime DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `nationality`
--

CREATE TABLE `nationality` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `nationality`
--

INSERT INTO `nationality` (`id`, `name`, `code`) VALUES
(36, 'Française', NULL),
(37, 'Anglaise', NULL),
(38, 'Allemande', NULL),
(39, 'Espagnole', NULL),
(40, 'Italienne', NULL),
(41, 'France', 'FR');

-- --------------------------------------------------------

--
-- Structure de la table `postal_code`
--

CREATE TABLE `postal_code` (
  `id` int NOT NULL,
  `city_id` int NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `postal_code`
--

INSERT INTO `postal_code` (`id`, `city_id`, `code`, `district`) VALUES
(15, 36, '75001', '1er arrondissement'),
(16, 36, '75002', '2ème arrondissement'),
(17, 36, '75003', '3ème arrondissement'),
(18, 37, '69000', NULL),
(19, 38, '13000', NULL),
(20, 39, '33000', NULL),
(21, 40, '59000', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` int NOT NULL,
  `refresh_token` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valid` datetime NOT NULL,
  `device_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `refresh_token`, `username`, `valid`, `device_id`, `device_name`, `device_type`) VALUES
(69, '18816596e3f9d2d3adb6f0d5b8ffcde316f5935d4f8c91ab1ca55fc08707c6b8fedf38d9e675e45a289260f9fc07cc894698fb7bc3f01b13c0256aa299669b26', 'student@bigproject.com', '2025-04-07 22:04:33', '677232aa-99c6-41d0-80a6-ac320bd8be1a', 'Android Device', 'mobile');

-- --------------------------------------------------------

--
-- Structure de la table `role`
--

CREATE TABLE `role` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `role`
--

INSERT INTO `role` (`id`, `name`, `description`) VALUES
(50, 'ADMIN', 'Administrateur du système avec des droits étendus'),
(51, 'SUPERADMIN', 'Super Administrateur avec tous les droits système'),
(52, 'HR', 'Ressources Humaines - Gestion des utilisateurs et des profils'),
(53, 'TEACHER', 'Formateur - Création et gestion des formations'),
(54, 'STUDENT', 'Élève - Accès aux formations et aux ressources pédagogiques'),
(55, 'GUEST', 'Invité - Accès limité en lecture seule'),
(56, 'RECRUITER', 'Recruteur - Gestion des candidatures et des offres d\'emploi');

-- --------------------------------------------------------

--
-- Structure de la table `specialization`
--

CREATE TABLE `specialization` (
  `id` int NOT NULL,
  `domain_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `specialization`
--

INSERT INTO `specialization` (`id`, `domain_id`, `name`) VALUES
(23, 36, 'Développement PHP'),
(24, 36, 'Développement JavaScript'),
(25, 36, 'Développement Python'),
(26, 37, 'UI Design'),
(27, 37, 'UX Design'),
(28, 38, 'SEO'),
(29, 38, 'SEM & Publicité'),
(30, 39, 'Gestion de Projet'),
(31, 39, 'Analyse d\'Affaires'),
(32, 40, 'Data Science'),
(33, 40, 'Machine Learning');

-- --------------------------------------------------------

--
-- Structure de la table `student_profile`
--

CREATE TABLE `student_profile` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `is_seeking_internship` tinyint(1) NOT NULL,
  `is_seeking_apprenticeship` tinyint(1) NOT NULL,
  `current_internship_company` varchar(255) DEFAULT NULL,
  `internship_start_date` date DEFAULT NULL,
  `internship_end_date` date DEFAULT NULL,
  `portfolio_url` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `situation_type_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `student_profile`
--

INSERT INTO `student_profile` (`id`, `user_id`, `is_seeking_internship`, `is_seeking_apprenticeship`, `current_internship_company`, `internship_start_date`, `internship_end_date`, `portfolio_url`, `created_at`, `updated_at`, `situation_type_id`) VALUES
(11, 36, 1, 0, NULL, NULL, NULL, NULL, '2025-03-06 15:38:10', '2025-03-08 20:48:01', 33);

-- --------------------------------------------------------

--
-- Structure de la table `theme`
--

CREATE TABLE `theme` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `theme`
--

INSERT INTO `theme` (`id`, `name`, `description`) VALUES
(22, 'light', 'Thème clair'),
(23, 'dark', 'Thème sombre'),
(24, 'system', 'Thème système (suit les préférences du système)'),
(25, 'Default', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

CREATE TABLE `user` (
  `id` int NOT NULL,
  `nationality_id` int NOT NULL,
  `theme_id` int NOT NULL,
  `specialization_id` int DEFAULT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `birth_date` date NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `updated_at` datetime DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)',
  `is_email_verified` tinyint(1) NOT NULL,
  `verification_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_password_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_password_expires` datetime DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)',
  `profile_picture_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linkedin_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`id`, `nationality_id`, `theme_id`, `specialization_id`, `last_name`, `first_name`, `birth_date`, `email`, `phone_number`, `password`, `created_at`, `updated_at`, `is_email_verified`, `verification_token`, `reset_password_token`, `reset_password_expires`, `profile_picture_path`, `linkedin_url`) VALUES
(32, 36, 22, NULL, 'User', 'Admin', '1985-01-01', 'superadmin@bigproject.com', '0600000002', '$2y$13$bqgwO5nnW0mPQeelfcMr8OGylHBf.Ce2Jh2gC2tXyXHmoZiX6/7Ny', '2025-03-06 15:38:08', '2025-03-07 10:36:39', 1, NULL, NULL, NULL, NULL, 'https://www.linkedin.com/in/user-profile'),
(33, 36, 22, NULL, 'Us', 'Adm', '1988-02-15', 'admin@bigproject.com', '0600000002', '$2y$13$yk82CDr9ah3BoRUAyJPvWuDrOkEVwyxbrhEY50Xaa3rQe8pssLkvK', '2025-03-06 15:38:09', '2025-03-08 21:34:52', 1, NULL, NULL, NULL, NULL, ''),
(34, 36, 22, NULL, 'Manager', 'HR', '1990-03-20', 'hr@bigproject.com', '0600000003', '$2y$13$f2Gcwv5HuLIhKnHebTi3Cupo9FcjaP6QiguLW4wu0Scb4v.yeKBDC', '2025-03-06 15:38:09', NULL, 1, NULL, NULL, NULL, NULL, NULL),
(35, 36, 22, NULL, 'Expert', 'Teacher', '1982-04-10', 'teacher@bigproject.com', '0600000004', '$2y$13$wzoNGNIVkeAiCvFnwtjpA.ChFVMssQOO9bCzaZs9PjMi9YJ1iasPe', '2025-03-06 15:38:09', NULL, 1, NULL, NULL, NULL, NULL, NULL),
(36, 36, 22, NULL, '', '', '2000-05-25', 'student@bigproject.com', '0222222222', '$2y$13$WY3STgKa9HS70/AURlRtbevdu266bY6ZbYPsfhTSP2woxgfsTddma', '2025-03-06 15:38:10', '2025-03-08 21:26:52', 1, NULL, NULL, NULL, 'profile-pictures/tobi-67ccb172e94cd.jpg', ''),
(37, 36, 22, NULL, 'Pro', 'Recruiter', '1992-06-15', 'recruiter@bigproject.com', '0600000006', '$2y$13$pWemRWYYQfTdWmSFA6zYKOY.9YAR/ToDvrBWVgPRReHrB8lI057RC', '2025-03-06 15:38:10', NULL, 1, NULL, NULL, NULL, NULL, NULL),
(38, 41, 25, NULL, 'Petersen', 'Sierra', '1981-03-03', 'guest@bigproject.com', '0888888888', '$2y$13$P4UYJP5UdtjyPJsBXh4VBuwggE7U.hF6VdVoQJAC2ceMpN0I6SZmW', '2025-03-06 17:56:39', NULL, 0, '5b84deb28b1750bb2c8e611ce621f4013af9d451a8aff6794fcbd0b76ffb13c2', NULL, NULL, NULL, NULL),
(39, 41, 25, NULL, 'Peck', 'Hiroko', '1983-02-20', 'dikyqos@mailinator.com', '0777777777', '$2y$13$7iaI/Dm9FYm5/l3rRB.CkuQ5cft3VpMQMdD1L.ImGgjVuEZ..yWUy', '2025-03-06 18:02:51', NULL, 0, 'f9f40512c3912c23526e491cac69e1ed42ac15f3f45e2b36274eabfa6828b542', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `user_role`
--

CREATE TABLE `user_role` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `role_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `user_role`
--

INSERT INTO `user_role` (`id`, `user_id`, `role_id`) VALUES
(32, 32, 51),
(33, 33, 50),
(34, 34, 52),
(35, 35, 53),
(36, 36, 54),
(37, 37, 56),
(38, 38, 55),
(39, 39, 55);

-- --------------------------------------------------------

--
-- Structure de la table `user_situation_type`
--

CREATE TABLE `user_situation_type` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `user_situation_type`
--

INSERT INTO `user_situation_type` (`id`, `name`, `description`) VALUES
(33, 'Initial', 'Formation initiale'),
(34, 'Alternance', 'Formation en alternance'),
(35, 'Stage', 'En stage'),
(36, 'Emploi', 'En emploi');

-- --------------------------------------------------------

--
-- Structure de la table `user_status`
--

CREATE TABLE `user_status` (
  `id` int NOT NULL,
  `associated_role_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `user_status`
--

INSERT INTO `user_status` (`id`, `associated_role_id`, `name`, `description`) VALUES
(13, 54, 'Actif', 'Utilisateur actif avec accès complet'),
(14, 55, 'En attente', 'Compte en attente de validation'),
(15, 55, 'Bloqué', 'Compte temporairement bloqué'),
(16, 55, 'Archivé', 'Compte archivé - accès restreint'),
(17, 54, 'Diplômé', 'Étudiant ayant terminé sa formation'),
(18, 54, 'En congé', 'Utilisateur temporairement absent');

-- --------------------------------------------------------

--
-- Structure de la table `user_status_history`
--

CREATE TABLE `user_status_history` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `status_id` int NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `address`
--
ALTER TABLE `address`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_D4E6F818BAC62AF` (`city_id`),
  ADD KEY `IDX_D4E6F81A76ED395` (`user_id`),
  ADD KEY `IDX_D4E6F81BDBA6A61` (`postal_code_id`),
  ADD KEY `idx_address_user_id` (`user_id`);

--
-- Index pour la table `city`
--
ALTER TABLE `city`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `diploma`
--
ALTER TABLE `diploma`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_EC218957A76ED395` (`user_id`),
  ADD KEY `idx_diploma_user_id` (`user_id`);

--
-- Index pour la table `doctrine_migration_versions`
--
ALTER TABLE `doctrine_migration_versions`
  ADD PRIMARY KEY (`version`);

--
-- Index pour la table `document`
--
ALTER TABLE `document`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_D8698A76A76ED395` (`user_id`),
  ADD KEY `IDX_D8698A7661232A4F` (`document_type_id`),
  ADD KEY `IDX_D8698A76C69DE5E5` (`validated_by_id`);

--
-- Index pour la table `document_category`
--
ALTER TABLE `document_category`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_898DE89877153098` (`code`);

--
-- Index pour la table `document_history`
--
ALTER TABLE `document_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_83D5D697C33F7837` (`document_id`),
  ADD KEY `IDX_83D5D697A76ED395` (`user_id`);

--
-- Index pour la table `document_type`
--
ALTER TABLE `document_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_2B6ADBBA77153098` (`code`);

--
-- Index pour la table `document_type_category`
--
ALTER TABLE `document_type_category`
  ADD PRIMARY KEY (`document_type_id`,`document_category_id`),
  ADD KEY `IDX_EC1C9AB661232A4F` (`document_type_id`),
  ADD KEY `IDX_EC1C9AB690EFAA88` (`document_category_id`);

--
-- Index pour la table `domain`
--
ALTER TABLE `domain`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `messenger_messages`
--
ALTER TABLE `messenger_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_75EA56E0FB7336F0` (`queue_name`),
  ADD KEY `IDX_75EA56E0E3BD61CE` (`available_at`),
  ADD KEY `IDX_75EA56E016BA31DB` (`delivered_at`);

--
-- Index pour la table `nationality`
--
ALTER TABLE `nationality`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `postal_code`
--
ALTER TABLE `postal_code`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_EA98E3768BAC62AF` (`city_id`);

--
-- Index pour la table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_9BACE7E1C74F2195` (`refresh_token`);

--
-- Index pour la table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `specialization`
--
ALTER TABLE `specialization`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_9ED9F26A115F0EE5` (`domain_id`);

--
-- Index pour la table `student_profile`
--
ALTER TABLE `student_profile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_6C611FF7A76ED395` (`user_id`),
  ADD KEY `IDX_6C611FF747CC2355` (`situation_type_id`),
  ADD KEY `idx_student_profile_situation_type` (`situation_type_id`);

--
-- Index pour la table `theme`
--
ALTER TABLE `theme`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_8D93D649E7927C74` (`email`),
  ADD KEY `IDX_8D93D6491C9DA55` (`nationality_id`),
  ADD KEY `IDX_8D93D64959027487` (`theme_id`),
  ADD KEY `IDX_8D93D649FA846217` (`specialization_id`),
  ADD KEY `idx_user_email` (`email`),
  ADD KEY `idx_user_specialization` (`specialization_id`),
  ADD KEY `idx_user_theme` (`theme_id`);

--
-- Index pour la table `user_role`
--
ALTER TABLE `user_role`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_2DE8C6A3A76ED395` (`user_id`),
  ADD KEY `IDX_2DE8C6A3D60322AC` (`role_id`),
  ADD KEY `idx_user_role_user_id` (`user_id`),
  ADD KEY `idx_user_role_role_id` (`role_id`);

--
-- Index pour la table `user_situation_type`
--
ALTER TABLE `user_situation_type`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `user_status`
--
ALTER TABLE `user_status`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_1E527E21CD4ADDE8` (`associated_role_id`);

--
-- Index pour la table `user_status_history`
--
ALTER TABLE `user_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_44EFD897A76ED395` (`user_id`),
  ADD KEY `IDX_44EFD8976BF700BD` (`status_id`),
  ADD KEY `idx_user_status_history_dates` (`start_date`,`end_date`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `address`
--
ALTER TABLE `address`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT pour la table `city`
--
ALTER TABLE `city`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT pour la table `diploma`
--
ALTER TABLE `diploma`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `document`
--
ALTER TABLE `document`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT pour la table `document_category`
--
ALTER TABLE `document_category`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT pour la table `document_history`
--
ALTER TABLE `document_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=115;

--
-- AUTO_INCREMENT pour la table `document_type`
--
ALTER TABLE `document_type`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT pour la table `domain`
--
ALTER TABLE `domain`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT pour la table `messenger_messages`
--
ALTER TABLE `messenger_messages`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `nationality`
--
ALTER TABLE `nationality`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT pour la table `postal_code`
--
ALTER TABLE `postal_code`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT pour la table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT pour la table `role`
--
ALTER TABLE `role`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT pour la table `specialization`
--
ALTER TABLE `specialization`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT pour la table `student_profile`
--
ALTER TABLE `student_profile`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `theme`
--
ALTER TABLE `theme`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT pour la table `user`
--
ALTER TABLE `user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT pour la table `user_role`
--
ALTER TABLE `user_role`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT pour la table `user_situation_type`
--
ALTER TABLE `user_situation_type`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT pour la table `user_status`
--
ALTER TABLE `user_status`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT pour la table `user_status_history`
--
ALTER TABLE `user_status_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `address`
--
ALTER TABLE `address`
  ADD CONSTRAINT `FK_D4E6F818BAC62AF` FOREIGN KEY (`city_id`) REFERENCES `city` (`id`),
  ADD CONSTRAINT `FK_D4E6F81A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_D4E6F81BDBA6A61` FOREIGN KEY (`postal_code_id`) REFERENCES `postal_code` (`id`);

--
-- Contraintes pour la table `diploma`
--
ALTER TABLE `diploma`
  ADD CONSTRAINT `FK_EC218957A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Contraintes pour la table `document`
--
ALTER TABLE `document`
  ADD CONSTRAINT `FK_D8698A7661232A4F` FOREIGN KEY (`document_type_id`) REFERENCES `document_type` (`id`),
  ADD CONSTRAINT `FK_D8698A76A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_D8698A76C69DE5E5` FOREIGN KEY (`validated_by_id`) REFERENCES `user` (`id`);

--
-- Contraintes pour la table `document_history`
--
ALTER TABLE `document_history`
  ADD CONSTRAINT `FK_83D5D697A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_83D5D697C33F7837` FOREIGN KEY (`document_id`) REFERENCES `document` (`id`);

--
-- Contraintes pour la table `document_type_category`
--
ALTER TABLE `document_type_category`
  ADD CONSTRAINT `FK_EC1C9AB661232A4F` FOREIGN KEY (`document_type_id`) REFERENCES `document_type` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_EC1C9AB690EFAA88` FOREIGN KEY (`document_category_id`) REFERENCES `document_category` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `postal_code`
--
ALTER TABLE `postal_code`
  ADD CONSTRAINT `FK_EA98E3768BAC62AF` FOREIGN KEY (`city_id`) REFERENCES `city` (`id`);

--
-- Contraintes pour la table `specialization`
--
ALTER TABLE `specialization`
  ADD CONSTRAINT `FK_9ED9F26A115F0EE5` FOREIGN KEY (`domain_id`) REFERENCES `domain` (`id`);

--
-- Contraintes pour la table `student_profile`
--
ALTER TABLE `student_profile`
  ADD CONSTRAINT `FK_6C611FF747CC2355` FOREIGN KEY (`situation_type_id`) REFERENCES `user_situation_type` (`id`),
  ADD CONSTRAINT `student_profile_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `FK_8D93D6491C9DA55` FOREIGN KEY (`nationality_id`) REFERENCES `nationality` (`id`),
  ADD CONSTRAINT `FK_8D93D64959027487` FOREIGN KEY (`theme_id`) REFERENCES `theme` (`id`),
  ADD CONSTRAINT `FK_8D93D649FA846217` FOREIGN KEY (`specialization_id`) REFERENCES `specialization` (`id`);

--
-- Contraintes pour la table `user_role`
--
ALTER TABLE `user_role`
  ADD CONSTRAINT `FK_2DE8C6A3A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_2DE8C6A3D60322AC` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`);

--
-- Contraintes pour la table `user_status`
--
ALTER TABLE `user_status`
  ADD CONSTRAINT `FK_1E527E21CD4ADDE8` FOREIGN KEY (`associated_role_id`) REFERENCES `role` (`id`);

--
-- Contraintes pour la table `user_status_history`
--
ALTER TABLE `user_status_history`
  ADD CONSTRAINT `FK_44EFD8976BF700BD` FOREIGN KEY (`status_id`) REFERENCES `user_status` (`id`),
  ADD CONSTRAINT `FK_44EFD897A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
