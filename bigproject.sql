-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Hôte : database
-- Généré le : lun. 05 mai 2025 à 08:13
-- Version du serveur : 8.0.42
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
(11, 11, 12, 8, '123 Rue de la Paix', 'Appartement 4B'),
(12, 11, 13, 9, '45 Avenue des Champs-Élysées', NULL),
(13, 11, 14, 10, '78 Boulevard Haussmann', '3ème étage'),
(14, 12, 15, 11, '15 Rue de la République', NULL),
(15, 13, 16, 12, '56 Rue du Vieux Port', 'Bâtiment B'),
(16, 14, 17, 13, '89 Cours de l\'Intendance', NULL),
(17, 15, 18, 14, '34 Rue Faidherbe', 'Résidence Les Lilas'),
(18, 11, 19, 8, '123 Rue de la Paix', 'Appartement 4B'),
(19, 11, 20, 9, '45 Avenue des Champs-Élysées', NULL),
(20, 11, 21, 10, '78 Boulevard Haussmann', '3ème étage');

-- --------------------------------------------------------

--
-- Structure de la table `audit_log`
--

CREATE TABLE `audit_log` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `action_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `details` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `audit_log`
--

INSERT INTO `audit_log` (`id`, `user_id`, `action_type`, `details`, `timestamp`) VALUES
(1, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:34:49'),
(2, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:34:49'),
(3, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:34:49'),
(4, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:34:49'),
(5, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:34:49'),
(6, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:34:49'),
(7, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:34:50'),
(8, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:34:50'),
(9, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:34:50'),
(10, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:34:51'),
(11, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:34:51'),
(12, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:34:51'),
(13, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:34:52'),
(14, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:34:52'),
(15, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:34:52'),
(16, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:34:58'),
(17, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:34:58'),
(18, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:34:59'),
(19, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:34:59'),
(20, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:34:59'),
(21, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:34:59'),
(22, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:35:47'),
(23, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:35:47'),
(24, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:35:47'),
(25, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:35:47'),
(26, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:35:47'),
(27, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:35:48'),
(28, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:35:48'),
(29, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:35:49'),
(30, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:35:49'),
(31, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:35:50'),
(32, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:35:50'),
(33, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:35:50'),
(34, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:35:56'),
(35, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:35:56'),
(36, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:35:56'),
(37, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:35:56'),
(38, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:35:56'),
(39, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:35:56'),
(40, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:35:57'),
(41, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:33'),
(42, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:37'),
(43, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:37'),
(44, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:38'),
(45, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:38'),
(46, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:48'),
(47, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:48'),
(48, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:48'),
(49, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:49'),
(50, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:49'),
(51, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:49'),
(52, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:50'),
(53, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:50'),
(54, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:50'),
(55, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:51'),
(56, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:52'),
(57, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:52'),
(58, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:58'),
(59, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:58'),
(60, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:58'),
(61, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:58'),
(62, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:58'),
(63, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:40:58'),
(64, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:04'),
(65, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:04'),
(66, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:04'),
(67, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:05'),
(68, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:05'),
(69, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:05'),
(70, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:06'),
(71, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:06'),
(72, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:06'),
(73, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:07'),
(74, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:07'),
(75, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:07'),
(76, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:07'),
(77, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:08'),
(78, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:08'),
(79, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:08'),
(80, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:08'),
(81, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:09'),
(82, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:09'),
(83, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:09'),
(84, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:10'),
(85, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:10'),
(86, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:10'),
(87, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:17'),
(88, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:17'),
(89, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:17'),
(90, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:17'),
(91, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:17'),
(92, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:41:17'),
(93, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:25'),
(94, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:26'),
(95, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:26'),
(96, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:27'),
(97, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:27'),
(98, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:27'),
(99, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:27'),
(100, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:28'),
(101, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:28'),
(102, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:28'),
(103, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:29'),
(104, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:29'),
(105, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:29'),
(106, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:36'),
(107, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:36'),
(108, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:36'),
(109, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:36'),
(110, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:36'),
(111, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:36'),
(112, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:42'),
(113, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:42'),
(114, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:43'),
(115, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:48'),
(116, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:48'),
(117, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:51:49'),
(118, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:52:15'),
(119, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:52:15'),
(120, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:52:45'),
(121, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:52:45'),
(122, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:52:46'),
(123, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:52:46'),
(124, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:52:53'),
(125, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:52:53'),
(126, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:52:53'),
(127, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:53:33'),
(128, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:53:33'),
(129, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:53:33'),
(130, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:54:18'),
(131, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:54:18'),
(132, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:54:19'),
(133, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:54:19'),
(134, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:55:04'),
(135, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:55:06'),
(136, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:55:06'),
(137, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:55:06'),
(138, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:55:07'),
(139, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:55:07'),
(140, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:55:08'),
(141, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:55:09'),
(142, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:55:09'),
(143, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:55:10'),
(144, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:55:10'),
(145, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:55:10'),
(146, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:55:10'),
(147, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:55:11'),
(148, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:55:11'),
(149, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:55:11'),
(150, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:55:17'),
(151, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:55:17'),
(152, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:55:17'),
(153, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:55:17'),
(154, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:55:17'),
(155, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:55:17'),
(156, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:56:46'),
(157, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:56:47'),
(158, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:56:47'),
(159, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:56:48'),
(160, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:56:48'),
(161, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Linux; Android 6.0; Nexus 5 Build\\/MRA58N) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Mobile Safari\\/537.36\"}', '2025-05-05 07:57:50'),
(162, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:59:21'),
(163, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:59:21'),
(164, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:59:21'),
(165, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:59:22'),
(166, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:59:22'),
(167, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:59:22'),
(168, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:59:23'),
(169, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:59:23'),
(170, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:59:23'),
(171, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:59:24'),
(172, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:59:24'),
(173, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:59:31'),
(174, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:59:31'),
(175, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:59:31'),
(176, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:59:31'),
(177, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 07:59:31'),
(178, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:03:55'),
(179, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:03:58'),
(180, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:04:02'),
(181, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:04:02'),
(182, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:04:02'),
(183, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:04:03'),
(184, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:04:03'),
(185, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:04:03'),
(186, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:04:03');
INSERT INTO `audit_log` (`id`, `user_id`, `action_type`, `details`, `timestamp`) VALUES
(187, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:04:03'),
(188, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:04:08'),
(189, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:04:09'),
(190, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:04:09'),
(191, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:04:09'),
(192, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:04:09'),
(193, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:05:31'),
(194, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:05:40'),
(195, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:05:40'),
(196, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:05:40'),
(197, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:05:41'),
(198, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:05:41'),
(199, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:05:41'),
(200, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:05:41'),
(201, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:05:42'),
(202, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:05:43'),
(203, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:05:43'),
(204, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:05:50'),
(205, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:05:50'),
(206, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:05:50'),
(207, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:05:50'),
(208, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:05:50'),
(209, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:06:20'),
(210, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:06:21'),
(211, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:06:21'),
(212, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:07:48'),
(213, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:08:02'),
(214, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:08:02'),
(215, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:08:02'),
(216, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:08:02'),
(217, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:08:02'),
(218, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:08:02'),
(219, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:08:03'),
(220, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:08:03'),
(221, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:08:04'),
(222, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:08:04'),
(223, 18, 'LOGIN_SUCCESS', '{\"user_identifier\":\"guest@bigproject.com\",\"ip_address\":\"172.18.0.6\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36\"}', '2025-05-05 08:13:27');

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
(11, 'Paris'),
(12, 'Lyon'),
(13, 'Marseille'),
(14, 'Bordeaux'),
(15, 'Lille');

-- --------------------------------------------------------

--
-- Structure de la table `diploma`
--

CREATE TABLE `diploma` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `diploma`
--

INSERT INTO `diploma` (`id`, `name`, `institution`) VALUES
(277, 'Brevet des collèges (DNB)', 'École Polytechnique'),
(278, 'Certificat d\'aptitude professionnelle (CAP)', 'Centre de Formation d\'Apprentis (CFA)'),
(279, 'Brevet d\'études professionnelles (BEP)', 'Université de Lille'),
(280, 'Baccalauréat général - Série L (Littéraire)', 'HEC Paris'),
(281, 'Baccalauréat général - Série ES (Économique et Social)', 'Université de Nantes'),
(282, 'Baccalauréat général - Série S (Scientifique)', 'Université de Bordeaux'),
(283, 'Baccalauréat technologique - STI2D (Sciences et Technologies de l\'Industrie et du Développement Durable)', 'Université de Lyon'),
(284, 'Baccalauréat technologique - STL (Sciences et Technologies de Laboratoire)', 'École Centrale Paris'),
(285, 'Baccalauréat technologique - STMG (Sciences et Technologies du Management et de la Gestion)', 'Lycée général et technologique'),
(286, 'Baccalauréat technologique - ST2S (Sciences et Technologies de la Santé et du Social)', 'GRETA'),
(287, 'Baccalauréat technologique - STD2A (Sciences et Technologies du Design et des Arts Appliqués)', 'Université de Grenoble Alpes'),
(288, 'Baccalauréat technologique - STAV (Sciences et Technologies de l\'Agronomie et du Vivant)', 'Lycée professionnel'),
(289, 'Baccalauréat technologique - TMD (Techniques de la Musique et de la Danse)', 'HEC Paris'),
(290, 'Baccalauréat professionnel', 'Université Pierre et Marie Curie'),
(291, 'Brevet de technicien supérieur (BTS) - Informatique', 'Lycée général et technologique'),
(292, 'Brevet de technicien supérieur (BTS) - Commerce', 'ESSEC Business School'),
(293, 'Brevet de technicien supérieur (BTS) - Communication', 'Université de Montpellier'),
(294, 'Brevet de technicien supérieur (BTS) - Gestion', 'GRETA'),
(295, 'Brevet de technicien supérieur (BTS) - Tourisme', 'École des Ponts ParisTech'),
(296, 'Brevet de technicien supérieur (BTS) - Audiovisuel', 'Université de Nantes'),
(297, 'Brevet de technicien supérieur (BTS) - Design', 'Sciences Po Paris'),
(298, 'Brevet de technicien supérieur (BTS) - Hôtellerie-Restauration', 'HEC Paris'),
(299, 'Diplôme universitaire de technologie (DUT) - Informatique', 'École Normale Supérieure'),
(300, 'Diplôme universitaire de technologie (DUT) - Gestion des entreprises et des administrations', 'Université de Rennes'),
(301, 'Diplôme universitaire de technologie (DUT) - Techniques de commercialisation', 'Université de Nice Sophia Antipolis'),
(302, 'Diplôme universitaire de technologie (DUT) - Information-Communication', 'École des Ponts ParisTech'),
(303, 'Diplôme universitaire de technologie (DUT) - Génie civil', 'Lycée professionnel'),
(304, 'Diplôme universitaire de technologie (DUT) - Génie électrique et informatique industrielle', 'Université Paris-Sorbonne'),
(305, 'Diplôme universitaire de technologie (DUT) - Mesures physiques', 'Université de Lille'),
(306, 'Diplôme d\'études universitaires scientifiques et techniques (DEUST)', 'Université Paris-Saclay'),
(307, 'Diplôme de comptabilité et de gestion (DCG)', 'École Polytechnique'),
(308, 'Licence - Droit', 'Centre de Formation d\'Apprentis (CFA)'),
(309, 'Licence - Économie', 'Université de Nantes'),
(310, 'Licence - Gestion', 'HEC Paris'),
(311, 'Licence - Administration économique et sociale (AES)', 'Université Paris-Sorbonne'),
(312, 'Licence - Langues étrangères appliquées (LEA)', 'Université de Grenoble Alpes'),
(313, 'Licence - Langues, littératures et civilisations étrangères et régionales (LLCER)', 'Université de Nantes'),
(314, 'Licence - Lettres', 'Université Paris-Sorbonne'),
(315, 'Licence - Histoire', 'Centre de Formation d\'Apprentis (CFA)'),
(316, 'Licence - Géographie', 'Lycée professionnel'),
(317, 'Licence - Sociologie', 'Conservatoire National des Arts et Métiers (CNAM)'),
(318, 'Licence - Psychologie', 'Université de Nantes'),
(319, 'Licence - Sciences de l\'éducation', 'Université d\'Aix-Marseille'),
(320, 'Licence - Mathématiques', 'École des Mines'),
(321, 'Licence - Physique', 'Institut Universitaire de Technologie (IUT)'),
(322, 'Licence - Chimie', 'Université de Nantes'),
(323, 'Licence - Sciences de la vie', 'École Normale Supérieure'),
(324, 'Licence - Sciences de la Terre', 'Sciences Po Paris'),
(325, 'Licence - Informatique', 'Sciences Po Paris'),
(326, 'Licence - STAPS (Sciences et techniques des activités physiques et sportives)', 'Université de Rennes'),
(327, 'Licence professionnelle - Métiers de l\'informatique', 'Université de Lyon'),
(328, 'Licence professionnelle - Commerce et distribution', 'GRETA'),
(329, 'Licence professionnelle - Management et gestion des organisations', 'Université Paris-Saclay'),
(330, 'Licence professionnelle - Métiers de la communication', 'ESSEC Business School'),
(331, 'Licence professionnelle - Métiers du BTP', 'Sciences Po Paris'),
(332, 'Licence professionnelle - Métiers de l\'industrie', 'Centre de Formation d\'Apprentis (CFA)'),
(333, 'Licence professionnelle - Métiers du tourisme et des loisirs', 'Université Paris-Saclay'),
(334, 'Maîtrise (M1)', 'Université de Bordeaux'),
(335, 'Diplôme supérieur de comptabilité et de gestion (DSCG)', 'Université de Toulouse'),
(336, 'Master - Droit des affaires', 'Lycée professionnel'),
(337, 'Master - Droit public', 'Université de Bordeaux'),
(338, 'Master - Droit international', 'Université de Lille'),
(339, 'Master - Finance', 'École des Ponts ParisTech'),
(340, 'Master - Marketing', 'Université de Toulouse'),
(341, 'Master - Management', 'Institut Universitaire de Technologie (IUT)'),
(342, 'Master - Ressources humaines', 'GRETA'),
(343, 'Master - Commerce international', 'Université de Lille'),
(344, 'Master - Économie', 'Université de Lille'),
(345, 'Master - Informatique', 'Université de Lille'),
(346, 'Master - Génie logiciel', 'Université de Rennes'),
(347, 'Master - Intelligence artificielle', 'GRETA'),
(348, 'Master - Cybersécurité', 'Université d\'Aix-Marseille'),
(349, 'Master - Data Science', 'Université de Nantes'),
(350, 'Master - Réseaux et télécommunications', 'Université Paris-Saclay'),
(351, 'Master - Biologie', 'Université Pierre et Marie Curie'),
(352, 'Master - Chimie', 'GRETA'),
(353, 'Master - Physique', 'ESSEC Business School'),
(354, 'Master - Mathématiques', 'École des Ponts ParisTech'),
(355, 'Master - Histoire', 'HEC Paris'),
(356, 'Master - Géographie', 'Université Pierre et Marie Curie'),
(357, 'Master - Sociologie', 'Lycée général et technologique'),
(358, 'Master - Psychologie', 'Université de Grenoble Alpes'),
(359, 'Master - Sciences de l\'éducation', 'École des Mines'),
(360, 'Master - Langues et cultures étrangères', 'École des Mines'),
(361, 'Master - Lettres modernes', 'École Normale Supérieure'),
(362, 'Master - Communication', 'Conservatoire National des Arts et Métiers (CNAM)'),
(363, 'Master - Journalisme', 'Université de Lille'),
(364, 'Master - Arts', 'Conservatoire National des Arts et Métiers (CNAM)'),
(365, 'Master - Cinéma', 'Université Paris-Sorbonne'),
(366, 'Master - Musique', 'Conservatoire National des Arts et Métiers (CNAM)'),
(367, 'Master - Architecture', 'Conservatoire National des Arts et Métiers (CNAM)'),
(368, 'Master - Urbanisme', 'Université de Strasbourg'),
(369, 'Diplôme d\'ingénieur', 'École Polytechnique'),
(370, 'Diplôme d\'école de commerce', 'Sciences Po Paris'),
(371, 'Diplôme d\'État de docteur en médecine', 'Université de Lille'),
(372, 'Diplôme d\'État de docteur en pharmacie', 'Université de Bordeaux'),
(373, 'Diplôme d\'État de docteur en chirurgie dentaire', 'Université d\'Aix-Marseille'),
(374, 'Diplôme d\'État de sage-femme', 'Université de Bordeaux'),
(375, 'Diplôme d\'État d\'architecte', 'Université Pierre et Marie Curie'),
(376, 'Diplôme d\'expertise comptable (DEC)', 'École Normale Supérieure'),
(377, 'Doctorat - Sciences', 'Sciences Po Paris'),
(378, 'Doctorat - Lettres', 'Université Paris-Saclay'),
(379, 'Doctorat - Droit', 'ESCP Business School'),
(380, 'Doctorat - Économie', 'Université Paris-Saclay'),
(381, 'Doctorat - Gestion', 'Université de Toulouse'),
(382, 'Doctorat - Médecine', 'École des Mines'),
(383, 'Doctorat - Pharmacie', 'Conservatoire National des Arts et Métiers (CNAM)'),
(384, 'Doctorat - Arts', 'HEC Paris'),
(385, 'Habilitation à diriger des recherches (HDR)', 'École Normale Supérieure'),
(386, 'Titre professionnel - Développeur web et web mobile', 'Université de Strasbourg'),
(387, 'Titre professionnel - Concepteur développeur d\'applications', 'Université de Grenoble Alpes'),
(388, 'Titre professionnel - Technicien supérieur en réseaux informatiques et télécommunications', 'ESCP Business School'),
(389, 'Titre professionnel - Designer web', 'Université Pierre et Marie Curie'),
(390, 'Titre professionnel - Gestionnaire de paie', 'Université de Toulouse'),
(391, 'Titre professionnel - Comptable assistant', 'Université de Lyon'),
(392, 'Titre professionnel - Assistant ressources humaines', 'École Normale Supérieure'),
(393, 'Titre professionnel - Secrétaire assistant', 'Centre de Formation d\'Apprentis (CFA)'),
(394, 'Titre professionnel - Vendeur conseil en magasin', 'École des Mines'),
(395, 'Titre professionnel - Responsable de rayon', 'Université de Grenoble Alpes'),
(396, 'Certification professionnelle RNCP', 'École Centrale Paris'),
(397, 'Certificat de qualification professionnelle (CQP)', 'Université de Strasbourg'),
(398, 'Diplôme de l\'École Polytechnique', 'Conservatoire National des Arts et Métiers (CNAM)'),
(399, 'Diplôme de l\'École Normale Supérieure (ENS)', 'Université de Bordeaux'),
(400, 'Diplôme de l\'École des Hautes Études Commerciales (HEC)', 'Lycée général et technologique'),
(401, 'Diplôme de l\'ESSEC Business School', 'Université Paris-Sorbonne'),
(402, 'Diplôme de l\'ESCP Business School', 'Université de Grenoble Alpes'),
(403, 'Diplôme de l\'EM Lyon Business School', 'Université de Strasbourg'),
(404, 'Diplôme de l\'EDHEC Business School', 'GRETA'),
(405, 'Diplôme de Sciences Po Paris', 'Sciences Po Paris'),
(406, 'Diplôme de l\'École Centrale', 'École Centrale Paris'),
(407, 'Diplôme de l\'École des Mines', 'Université Paris-Sorbonne'),
(408, 'Diplôme de l\'École des Ponts ParisTech', 'Université Pierre et Marie Curie'),
(409, 'Diplôme de l\'ENSAE Paris', 'Université de Lille'),
(410, 'Diplôme de l\'ENSTA Paris', 'ESCP Business School'),
(411, 'Diplôme de l\'Institut National des Sciences Appliquées (INSA)', 'Université Paris-Sorbonne'),
(412, 'Diplôme de l\'École Nationale Vétérinaire', 'École des Ponts ParisTech'),
(413, 'Diplôme de l\'École Nationale de la Magistrature (ENM)', 'ESSEC Business School'),
(414, 'Diplôme de l\'École Nationale d\'Administration (ENA) / Institut National du Service Public (INSP)', 'Université de Grenoble Alpes');

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
(6, 'IDENTITY', 'Documents d\'identité', 'Pièces d\'identité et documents officiels', 1, '2025-05-05 07:32:54', '2025-05-05 07:32:54'),
(7, 'ACADEMIC', 'Documents académiques', 'Diplômes, relevés de notes et certificats de formation', 1, '2025-05-05 07:32:54', '2025-05-05 07:32:54'),
(8, 'PROFESSIONAL', 'Documents professionnels', 'CV, lettres de recommandation et certificats professionnels', 1, '2025-05-05 07:32:54', '2025-05-05 07:32:54'),
(9, 'ADMINISTRATIVE', 'Documents administratifs', 'Documents administratifs et formulaires officiels', 1, '2025-05-05 07:32:54', '2025-05-05 07:32:54'),
(10, 'MEDICAL', 'Documents médicaux', 'Certificats médicaux et documents de santé', 1, '2025-05-05 07:32:54', '2025-05-05 07:32:54');

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
(9, 'ID_CARD', 'Carte d\'identité', 'Carte nationale d\'identité en cours de validité', '[\"application/pdf\", \"image/jpeg\", \"image/png\"]', 5242880, 1, NULL, 7, 1, '2025-05-05 07:32:58', '2025-05-05 07:32:58'),
(10, 'PASSPORT', 'Passeport', 'Passeport en cours de validité', '[\"application/pdf\", \"image/jpeg\", \"image/png\"]', 5242880, 0, NULL, 7, 1, '2025-05-05 07:32:58', '2025-05-05 07:32:58'),
(11, 'DIPLOMA', 'Diplôme', 'Diplôme ou attestation de réussite', '[\"application/pdf\"]', 10485760, 1, NULL, 7, 1, '2025-05-05 07:32:58', '2025-05-05 07:32:58'),
(12, 'TRANSCRIPT', 'Relevé de notes', 'Relevé de notes officiel', '[\"application/pdf\"]', 10485760, 1, NULL, 7, 1, '2025-05-05 07:32:58', '2025-05-05 07:32:58'),
(13, 'CV', 'Curriculum Vitae', 'CV à jour', '[\"application/pdf\", \"application/msword\", \"application/vnd.openxmlformats-officedocument.wordprocessingml.document\"]', 2097152, 1, NULL, 7, 1, '2025-05-05 07:32:58', '2025-05-05 07:32:58'),
(14, 'RECOMMENDATION', 'Lettre de recommandation', 'Lettre de recommandation professionnelle', '[\"application/pdf\"]', 2097152, 0, NULL, 7, 1, '2025-05-05 07:32:58', '2025-05-05 07:32:58'),
(15, 'REGISTRATION', 'Formulaire d\'inscription', 'Formulaire d\'inscription complété et signé', '[\"application/pdf\"]', 5242880, 1, NULL, 7, 1, '2025-05-05 07:32:58', '2025-05-05 07:32:58'),
(16, 'MEDICAL_CERTIFICATE', 'Certificat médical', 'Certificat médical d\'aptitude', '[\"application/pdf\"]', 5242880, 1, NULL, 7, 1, '2025-05-05 07:32:58', '2025-05-05 07:32:58');

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
(9, 6),
(10, 6),
(11, 7),
(12, 7),
(13, 8),
(14, 8),
(15, 9),
(16, 10);

-- --------------------------------------------------------

--
-- Structure de la table `domain`
--

CREATE TABLE `domain` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `domain`
--

INSERT INTO `domain` (`id`, `name`, `description`) VALUES
(11, 'Développement', 'Domaine du développement logiciel et web'),
(12, 'Design', 'Domaine du design graphique et UX/UI'),
(13, 'Marketing Digital', 'Domaine du marketing en ligne et stratégies digitales'),
(14, 'Business & Management', 'Domaine de la gestion d\'entreprise et du management'),
(15, 'Data & IA', 'Domaine de l\'analyse de données et intelligence artificielle');

-- --------------------------------------------------------

--
-- Structure de la table `event_participant`
--

CREATE TABLE `event_participant` (
  `id` int NOT NULL,
  `event_id` int NOT NULL,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `formation`
--

CREATE TABLE `formation` (
  `id` int NOT NULL,
  `specialization_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `promotion` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `capacity` int NOT NULL,
  `date_start` date NOT NULL,
  `location` longtext COLLATE utf8mb4_unicode_ci,
  `duration` int NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `formation`
--

INSERT INTO `formation` (`id`, `specialization_id`, `name`, `promotion`, `description`, `capacity`, `date_start`, `location`, `duration`, `image_url`) VALUES
(11, 14, 'Développement Web Full Stack', '2024-A', 'Formation complète en développement web couvrant le front-end et le back-end avec les dernières technologies', 25, '2024-09-01', 'Paris', 12, 'https://bigproject-storage.s3.eu-north-1.amazonaws.com/formations/ecoxqzcgiwobbxidlxhl.webp'),
(12, 23, 'Data Science & Intelligence Artificielle', '2024-B', 'Formation approfondie en science des données et IA avec Python et les frameworks modernes', 20, '2024-09-15', 'Lyon', 15, 'https://bigproject-storage.s3.eu-north-1.amazonaws.com/formations/es41kuu8vogp6qhqzkfv.webp'),
(13, 25, 'DevOps & Cloud Computing', '2024-A', 'Maîtrisez les pratiques DevOps et le cloud computing avec AWS et Azure', 18, '2024-10-01', 'Bordeaux', 14, 'https://bigproject-storage.s3.eu-north-1.amazonaws.com/formations/nmajfu6mzcqor4dmiwpz.webp'),
(14, 26, 'Cybersécurité Avancée', '2024-B', 'Formation spécialisée en sécurité informatique et protection des données', 15, '2024-09-30', 'Paris', 16, 'https://bigproject-storage.s3.eu-north-1.amazonaws.com/formations/nxguch0uavka6bzwnxsb.webp'),
(15, 15, 'Développement Mobile React Native', '2024-A', 'Créez des applications mobiles multiplateformes avec React Native', 22, '2024-10-15', 'Nantes', 10, 'https://bigproject-storage.s3.eu-north-1.amazonaws.com/formations/qp9jlgefiuczsjnrqhyt.webp'),
(16, 15, 'UX/UI Design & Développement Frontend', '2024-B', 'Maîtrisez la conception d\'interfaces utilisateur et le développement frontend moderne', 20, '2024-11-01', 'Lille', 11, 'https://bigproject-storage.s3.eu-north-1.amazonaws.com/formations/rxoziltjybygtvsnv07k.webp'),
(17, 24, 'Machine Learning Avancé', '2024-A', 'Plongez dans le machine learning avec Python, TensorFlow et PyTorch', 16, '2024-09-20', 'Toulouse', 18, 'https://bigproject-storage.s3.eu-north-1.amazonaws.com/formations/nxguch0uavka6bzwnxsb.webp'),
(18, 16, 'Développement Python Backend', '2024-B', 'Développez des applications backend robustes avec Python et Django/Flask', 24, '2024-10-10', 'Marseille', 13, 'https://bigproject-storage.s3.eu-north-1.amazonaws.com/formations/rxoziltjybygtvsnv07k.webp'),
(19, 25, 'Architecture Cloud & Microservices', '2024-A', 'Concevez et déployez des architectures cloud modernes basées sur les microservices', 18, '2024-11-15', 'Nice', 15, 'https://bigproject-storage.s3.eu-north-1.amazonaws.com/formations/nmajfu6mzcqor4dmiwpz.webp'),
(20, 23, 'Data Engineering & Big Data', '2024-B', 'Formation complète en ingénierie des données et technologies Big Data', 20, '2024-12-01', 'Strasbourg', 16, 'https://bigproject-storage.s3.eu-north-1.amazonaws.com/formations/qp9jlgefiuczsjnrqhyt.webp');

-- --------------------------------------------------------

--
-- Structure de la table `formation_enrollment_request`
--

CREATE TABLE `formation_enrollment_request` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `formation_id` int NOT NULL,
  `reviewed_by_id` int DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `created_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `updated_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `comment` longtext COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `formation_student`
--

CREATE TABLE `formation_student` (
  `formation_id` int NOT NULL,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `group`
--

CREATE TABLE `group` (
  `id` int NOT NULL,
  `creator_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `group_user`
--

CREATE TABLE `group_user` (
  `group_id` int NOT NULL,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `message`
--

CREATE TABLE `message` (
  `id` int NOT NULL,
  `sender_id` int NOT NULL,
  `recipient_id` int DEFAULT NULL,
  `group_id` int DEFAULT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `is_global` tinyint(1) NOT NULL,
  `read_by` json NOT NULL
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
(11, 'Française', NULL),
(12, 'Anglaise', NULL),
(13, 'Allemande', NULL),
(14, 'Espagnole', NULL),
(15, 'Italienne', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `nom_de_la_table`
--

CREATE TABLE `nom_de_la_table` (
  `id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(8, 11, '75001', '1er arrondissement'),
(9, 11, '75002', '2ème arrondissement'),
(10, 11, '75003', '3ème arrondissement'),
(11, 12, '69000', NULL),
(12, 13, '13000', NULL),
(13, 14, '33000', NULL),
(14, 15, '59000', NULL);

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
(1, '0830376857285890e3dcb2dbad1de686da7eccd87eb7d9345291f50441243a6165ca6c2541fddd375a50897d7c1b9628fc7359e0b86df83e87efd2ba26917d72', 'guest@bigproject.com', '2025-06-04 07:34:49', 'eb53ca14-cd32-4dcc-8f18-88e61b0c1676', NULL, NULL);

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
(15, 'ADMIN', 'Administrateur du système avec des droits étendus'),
(16, 'SUPERADMIN', 'Super Administrateur avec tous les droits système'),
(17, 'HR', 'Ressources Humaines - Gestion des utilisateurs et des profils'),
(18, 'TEACHER', 'Formateur - Création et gestion des formations'),
(19, 'STUDENT', 'Élève - Accès aux formations et aux ressources pédagogiques'),
(20, 'GUEST', 'Invité - Accès limité en lecture seule'),
(21, 'RECRUITER', 'Recruteur - Gestion des candidatures et des offres d\'emploi');

-- --------------------------------------------------------

--
-- Structure de la table `schedule_event`
--

CREATE TABLE `schedule_event` (
  `id` int NOT NULL,
  `created_by` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `start_date_time` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `end_date_time` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `signature`
--

CREATE TABLE `signature` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `date` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `period` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `drawing` longtext COLLATE utf8mb4_unicode_ci,
  `validated` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(14, 11, 'Développement PHP'),
(15, 11, 'Développement JavaScript'),
(16, 11, 'Développement Python'),
(17, 12, 'UI Design'),
(18, 12, 'UX Design'),
(19, 13, 'SEO'),
(20, 13, 'SEM & Publicité'),
(21, 14, 'Gestion de Projet'),
(22, 14, 'Analyse d\'Affaires'),
(23, 15, 'Data Science'),
(24, 15, 'Machine Learning'),
(25, 11, 'DevOps & Cloud'),
(26, 11, 'Cybersécurité');

-- --------------------------------------------------------

--
-- Structure de la table `student_profile`
--

CREATE TABLE `student_profile` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `situation_type_id` int DEFAULT NULL,
  `is_seeking_internship` tinyint(1) NOT NULL,
  `is_seeking_apprenticeship` tinyint(1) NOT NULL,
  `current_internship_company` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `internship_start_date` date DEFAULT NULL,
  `internship_end_date` date DEFAULT NULL,
  `portfolio_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `student_profile`
--

INSERT INTO `student_profile` (`id`, `user_id`, `situation_type_id`, `is_seeking_internship`, `is_seeking_apprenticeship`, `current_internship_company`, `internship_start_date`, `internship_end_date`, `portfolio_url`, `created_at`, `updated_at`) VALUES
(5, 16, 9, 0, 0, NULL, NULL, NULL, NULL, '2025-05-05 07:32:56', '2025-05-05 07:32:56'),
(6, 19, 9, 0, 0, NULL, NULL, NULL, NULL, '2025-05-05 07:32:58', '2025-05-05 07:32:58'),
(7, 20, 9, 0, 0, NULL, NULL, NULL, NULL, '2025-05-05 07:32:59', '2025-05-05 07:32:59'),
(8, 21, 9, 0, 0, NULL, NULL, NULL, NULL, '2025-05-05 07:32:59', '2025-05-05 07:32:59');

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
(7, 'light', 'Thème clair'),
(8, 'dark', 'Thème sombre'),
(9, 'system', 'Thème système (suit les préférences du système)');

-- --------------------------------------------------------

--
-- Structure de la table `ticket`
--

CREATE TABLE `ticket` (
  `id` int NOT NULL,
  `creator_id` int NOT NULL,
  `assigned_to_id` int DEFAULT NULL,
  `status_id` int NOT NULL,
  `service_id` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `updated_at` datetime DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)',
  `priority` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `ticket_comment`
--

CREATE TABLE `ticket_comment` (
  `id` int NOT NULL,
  `ticket_id` int NOT NULL,
  `author_id` int DEFAULT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `is_from_admin` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `ticket_service`
--

CREATE TABLE `ticket_service` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `ticket_service`
--

INSERT INTO `ticket_service` (`id`, `name`, `description`) VALUES
(13, 'Support technique', 'Problèmes techniques liés à l\'application ou au site web'),
(14, 'Facturation', 'Questions concernant vos factures ou paiements'),
(15, 'Contenu pédagogique', 'Questions ou problèmes liés au contenu des cours'),
(16, 'Accès aux cours', 'Problèmes d\'accès aux cours ou aux ressources pédagogiques'),
(17, 'Suggestion', 'Suggestions pour améliorer la plateforme ou les cours'),
(18, 'Autre', 'Toute autre demande ne correspondant pas aux catégories ci-dessus');

-- --------------------------------------------------------

--
-- Structure de la table `ticket_status`
--

CREATE TABLE `ticket_status` (
  `id` int NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `ticket_status`
--

INSERT INTO `ticket_status` (`id`, `name`, `description`, `color`) VALUES
(11, 'Ouvert', 'Ticket ouvert en attente de traitement', '#3498db'),
(12, 'En cours', 'Ticket en cours de traitement', '#f39c12'),
(13, 'Résolu', 'Ticket résolu', '#2ecc71'),
(14, 'Fermé', 'Ticket fermé', '#7f8c8d'),
(15, 'En attente', 'En attente d\'informations supplémentaires', '#e74c3c');

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
  `email` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `updated_at` datetime DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)',
  `is_email_verified` tinyint(1) NOT NULL,
  `is_profile_completion_acknowledged` tinyint(1) NOT NULL DEFAULT '0',
  `verification_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_password_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_password_expires` datetime DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)',
  `profile_picture_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linkedin_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`id`, `nationality_id`, `theme_id`, `specialization_id`, `last_name`, `first_name`, `birth_date`, `email`, `phone_number`, `password`, `created_at`, `updated_at`, `is_email_verified`, `is_profile_completion_acknowledged`, `verification_token`, `reset_password_token`, `reset_password_expires`, `profile_picture_path`, `linkedin_url`) VALUES
(12, 11, 7, NULL, 'Dupont', 'Alexandre', '1985-01-01', 'superadmin@bigproject.com', '0600000001', '$2y$13$AuVBudgz6Y28iDLcyrPDW.e/wmEk6XcVGo1oKqAeI1RmefGr9mywi', '2025-05-05 07:32:54', NULL, 1, 0, NULL, NULL, NULL, NULL, NULL),
(13, 11, 7, 16, 'Martin', 'Sophie', '1988-02-15', 'admin@bigproject.com', '0600000002', '$2y$13$pRw3L2zqquUlxnw.Ci6vje4/4GJN0sVouZK6DtxbGMrjIAsWdYM32', '2025-05-05 07:32:55', NULL, 1, 0, NULL, NULL, NULL, NULL, NULL),
(14, 11, 7, 21, 'Bernard', 'Camille', '1990-03-20', 'hr@bigproject.com', '0600000003', '$2y$13$Yi0vnaeH1XNiInsxF7WU5u2A.BVwJ9x8onXXPDnUUFiY1nXFuJFFK', '2025-05-05 07:32:55', NULL, 1, 0, NULL, NULL, NULL, NULL, NULL),
(15, 11, 7, 14, 'Petit', 'Thomas', '1982-04-10', 'teacher@bigproject.com', '0600000004', '$2y$13$5baeWvOwvj6JOLPfI3cp9O2C4e5p1IcvFRsAr3mf7LSus192PT0l2', '2025-05-05 07:32:56', NULL, 1, 0, NULL, NULL, NULL, NULL, NULL),
(16, 11, 7, 15, 'Dubois', 'Emma', '2000-05-25', 'student@bigproject.com', '0600000005', '$2y$13$1WnY.VNgZwURt49qUS8glei/7uT4PwrXq0SeA2p7vBU.hRuvTLbLO', '2025-05-05 07:32:56', NULL, 1, 0, NULL, NULL, NULL, NULL, NULL),
(17, 11, 7, 22, 'Moreau', 'Lucas', '1992-06-15', 'recruiter@bigproject.com', '0600000006', '$2y$13$yJsq3T1v/uzwM.yisDFZxONyA9AvWk8N4pTri6uV5krMHBWlZBxTy', '2025-05-05 07:32:56', NULL, 1, 0, NULL, NULL, NULL, NULL, NULL),
(18, 11, 7, NULL, 'Lambert', 'Marie', '1995-07-30', 'guest@bigproject.com', '0600000007', '$2y$13$GzVkbU84vF5RlxPxL7nDduhgxRjmL5Ck3HOCXI77.jPGN98I51NF6', '2025-05-05 07:32:57', NULL, 1, 0, NULL, NULL, NULL, NULL, NULL),
(19, 11, 7, 17, 'Designer', 'Alice', '1999-05-15', 'student.design@bigproject.com', '0600000011', '$2y$13$PmN19HkIX19WXwLa5fw.EOyBk5/bHQUDmHA6fO0W1J.HH/ybKND6u', '2025-05-05 07:32:58', NULL, 1, 0, NULL, NULL, NULL, NULL, NULL),
(20, 11, 7, 19, 'Marketer', 'Bob', '2000-08-22', 'student.marketing@bigproject.com', '0600000012', '$2y$13$UNesbz5bgNr3ZR.8KQ2J8OorEgthekLe10RMI3EUtNA.akfgco1S2', '2025-05-05 07:32:58', NULL, 1, 0, NULL, NULL, NULL, NULL, NULL),
(21, 11, 7, 23, 'Analyst', 'Charlie', '1998-11-30', 'student.data@bigproject.com', '0600000013', '$2y$13$qiwhMPf2h8eU2qpbO/Q2xe3lUHMHjS7J8dTFhqLgztF3DKWbd70y2', '2025-05-05 07:32:59', NULL, 1, 0, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `user_diploma`
--

CREATE TABLE `user_diploma` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `diploma_id` int NOT NULL,
  `obtained_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `user_diploma`
--

INSERT INTO `user_diploma` (`id`, `user_id`, `diploma_id`, `obtained_date`) VALUES
(4, 16, 283, '2021-12-24');

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
(11, 12, 16),
(12, 13, 15),
(13, 14, 17),
(14, 15, 18),
(15, 16, 19),
(16, 17, 21),
(17, 18, 20),
(18, 19, 19),
(19, 20, 19),
(20, 21, 19);

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
(9, 'Initial', 'Formation initiale'),
(10, 'Alternance', 'Formation en alternance'),
(11, 'Stage', 'En stage'),
(12, 'Emploi', 'En emploi');

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
(7, 19, 'Actif', 'Utilisateur actif avec accès complet'),
(8, 20, 'En attente', 'Compte en attente de validation'),
(9, 20, 'Bloqué', 'Compte temporairement bloqué'),
(10, 20, 'Archivé', 'Compte archivé - accès restreint'),
(11, 19, 'Diplômé', 'Étudiant ayant terminé sa formation'),
(12, 19, 'En congé', 'Utilisateur temporairement absent');

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
  ADD KEY `IDX_D4E6F81BDBA6A61` (`postal_code_id`);

--
-- Index pour la table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_F6E1C0F5A76ED395` (`user_id`);

--
-- Index pour la table `city`
--
ALTER TABLE `city`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `diploma`
--
ALTER TABLE `diploma`
  ADD PRIMARY KEY (`id`);

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
-- Index pour la table `event_participant`
--
ALTER TABLE `event_participant`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_7C16B89171F7E88B` (`event_id`),
  ADD KEY `IDX_7C16B891A76ED395` (`user_id`);

--
-- Index pour la table `formation`
--
ALTER TABLE `formation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_404021BFFA846217` (`specialization_id`);

--
-- Index pour la table `formation_enrollment_request`
--
ALTER TABLE `formation_enrollment_request`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_78BA3D5BA76ED395` (`user_id`),
  ADD KEY `IDX_78BA3D5B5200282E` (`formation_id`),
  ADD KEY `IDX_78BA3D5BFC6B21F1` (`reviewed_by_id`);

--
-- Index pour la table `formation_student`
--
ALTER TABLE `formation_student`
  ADD PRIMARY KEY (`formation_id`,`user_id`),
  ADD KEY `IDX_F2DCEA485200282E` (`formation_id`),
  ADD KEY `IDX_F2DCEA48A76ED395` (`user_id`);

--
-- Index pour la table `group`
--
ALTER TABLE `group`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_6DC044C561220EA6` (`creator_id`);

--
-- Index pour la table `group_user`
--
ALTER TABLE `group_user`
  ADD PRIMARY KEY (`group_id`,`user_id`),
  ADD KEY `IDX_A4C98D39FE54D947` (`group_id`),
  ADD KEY `IDX_A4C98D39A76ED395` (`user_id`);

--
-- Index pour la table `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_B6BD307FF624B39D` (`sender_id`),
  ADD KEY `IDX_B6BD307FE92F8F78` (`recipient_id`),
  ADD KEY `IDX_B6BD307FFE54D947` (`group_id`);

--
-- Index pour la table `nationality`
--
ALTER TABLE `nationality`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `nom_de_la_table`
--
ALTER TABLE `nom_de_la_table`
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
-- Index pour la table `schedule_event`
--
ALTER TABLE `schedule_event`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_C7F7CAFBDE12AB56` (`created_by`);

--
-- Index pour la table `signature`
--
ALTER TABLE `signature`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_AE880141A76ED395` (`user_id`);

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
  ADD KEY `IDX_6C611FF747CC2355` (`situation_type_id`);

--
-- Index pour la table `theme`
--
ALTER TABLE `theme`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `ticket`
--
ALTER TABLE `ticket`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_97A0ADA361220EA6` (`creator_id`),
  ADD KEY `IDX_97A0ADA3F4BD7827` (`assigned_to_id`),
  ADD KEY `IDX_97A0ADA36BF700BD` (`status_id`),
  ADD KEY `IDX_97A0ADA3ED5CA9E6` (`service_id`);

--
-- Index pour la table `ticket_comment`
--
ALTER TABLE `ticket_comment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_98B80B3E700047D2` (`ticket_id`),
  ADD KEY `IDX_98B80B3EF675F31B` (`author_id`);

--
-- Index pour la table `ticket_service`
--
ALTER TABLE `ticket_service`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `ticket_status`
--
ALTER TABLE `ticket_status`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_8D93D649E7927C74` (`email`),
  ADD KEY `IDX_8D93D6491C9DA55` (`nationality_id`),
  ADD KEY `IDX_8D93D64959027487` (`theme_id`),
  ADD KEY `IDX_8D93D649FA846217` (`specialization_id`);

--
-- Index pour la table `user_diploma`
--
ALTER TABLE `user_diploma`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_B42C975DA76ED395` (`user_id`),
  ADD KEY `IDX_B42C975DA99ACEB5` (`diploma_id`);

--
-- Index pour la table `user_role`
--
ALTER TABLE `user_role`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_2DE8C6A3A76ED395` (`user_id`),
  ADD KEY `IDX_2DE8C6A3D60322AC` (`role_id`);

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT pour la table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=224;

--
-- AUTO_INCREMENT pour la table `city`
--
ALTER TABLE `city`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `diploma`
--
ALTER TABLE `diploma`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=415;

--
-- AUTO_INCREMENT pour la table `document`
--
ALTER TABLE `document`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `document_category`
--
ALTER TABLE `document_category`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `document_history`
--
ALTER TABLE `document_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `document_type`
--
ALTER TABLE `document_type`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT pour la table `domain`
--
ALTER TABLE `domain`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `event_participant`
--
ALTER TABLE `event_participant`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `formation`
--
ALTER TABLE `formation`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT pour la table `formation_enrollment_request`
--
ALTER TABLE `formation_enrollment_request`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `group`
--
ALTER TABLE `group`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `message`
--
ALTER TABLE `message`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `nationality`
--
ALTER TABLE `nationality`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `nom_de_la_table`
--
ALTER TABLE `nom_de_la_table`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `postal_code`
--
ALTER TABLE `postal_code`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT pour la table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `role`
--
ALTER TABLE `role`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT pour la table `schedule_event`
--
ALTER TABLE `schedule_event`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `signature`
--
ALTER TABLE `signature`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `specialization`
--
ALTER TABLE `specialization`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT pour la table `student_profile`
--
ALTER TABLE `student_profile`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `theme`
--
ALTER TABLE `theme`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `ticket`
--
ALTER TABLE `ticket`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `ticket_comment`
--
ALTER TABLE `ticket_comment`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `ticket_service`
--
ALTER TABLE `ticket_service`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT pour la table `ticket_status`
--
ALTER TABLE `ticket_status`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `user`
--
ALTER TABLE `user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT pour la table `user_diploma`
--
ALTER TABLE `user_diploma`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `user_role`
--
ALTER TABLE `user_role`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT pour la table `user_situation_type`
--
ALTER TABLE `user_situation_type`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pour la table `user_status`
--
ALTER TABLE `user_status`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

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
-- Contraintes pour la table `audit_log`
--
ALTER TABLE `audit_log`
  ADD CONSTRAINT `FK_F6E1C0F5A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

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
-- Contraintes pour la table `event_participant`
--
ALTER TABLE `event_participant`
  ADD CONSTRAINT `FK_7C16B89171F7E88B` FOREIGN KEY (`event_id`) REFERENCES `schedule_event` (`id`),
  ADD CONSTRAINT `FK_7C16B891A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `formation`
--
ALTER TABLE `formation`
  ADD CONSTRAINT `FK_404021BFFA846217` FOREIGN KEY (`specialization_id`) REFERENCES `specialization` (`id`);

--
-- Contraintes pour la table `formation_enrollment_request`
--
ALTER TABLE `formation_enrollment_request`
  ADD CONSTRAINT `FK_78BA3D5B5200282E` FOREIGN KEY (`formation_id`) REFERENCES `formation` (`id`),
  ADD CONSTRAINT `FK_78BA3D5BA76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_78BA3D5BFC6B21F1` FOREIGN KEY (`reviewed_by_id`) REFERENCES `user` (`id`);

--
-- Contraintes pour la table `formation_student`
--
ALTER TABLE `formation_student`
  ADD CONSTRAINT `FK_F2DCEA485200282E` FOREIGN KEY (`formation_id`) REFERENCES `formation` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_F2DCEA48A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `group`
--
ALTER TABLE `group`
  ADD CONSTRAINT `FK_6DC044C561220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`);

--
-- Contraintes pour la table `group_user`
--
ALTER TABLE `group_user`
  ADD CONSTRAINT `FK_A4C98D39A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_A4C98D39FE54D947` FOREIGN KEY (`group_id`) REFERENCES `group` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `message`
--
ALTER TABLE `message`
  ADD CONSTRAINT `FK_B6BD307FE92F8F78` FOREIGN KEY (`recipient_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_B6BD307FF624B39D` FOREIGN KEY (`sender_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_B6BD307FFE54D947` FOREIGN KEY (`group_id`) REFERENCES `group` (`id`);

--
-- Contraintes pour la table `postal_code`
--
ALTER TABLE `postal_code`
  ADD CONSTRAINT `FK_EA98E3768BAC62AF` FOREIGN KEY (`city_id`) REFERENCES `city` (`id`);

--
-- Contraintes pour la table `schedule_event`
--
ALTER TABLE `schedule_event`
  ADD CONSTRAINT `FK_C7F7CAFBDE12AB56` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`);

--
-- Contraintes pour la table `signature`
--
ALTER TABLE `signature`
  ADD CONSTRAINT `FK_AE880141A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

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
  ADD CONSTRAINT `FK_6C611FF7A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `ticket`
--
ALTER TABLE `ticket`
  ADD CONSTRAINT `FK_97A0ADA361220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_97A0ADA36BF700BD` FOREIGN KEY (`status_id`) REFERENCES `ticket_status` (`id`),
  ADD CONSTRAINT `FK_97A0ADA3ED5CA9E6` FOREIGN KEY (`service_id`) REFERENCES `ticket_service` (`id`),
  ADD CONSTRAINT `FK_97A0ADA3F4BD7827` FOREIGN KEY (`assigned_to_id`) REFERENCES `user` (`id`);

--
-- Contraintes pour la table `ticket_comment`
--
ALTER TABLE `ticket_comment`
  ADD CONSTRAINT `FK_98B80B3E700047D2` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`),
  ADD CONSTRAINT `FK_98B80B3EF675F31B` FOREIGN KEY (`author_id`) REFERENCES `user` (`id`);

--
-- Contraintes pour la table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `FK_8D93D6491C9DA55` FOREIGN KEY (`nationality_id`) REFERENCES `nationality` (`id`),
  ADD CONSTRAINT `FK_8D93D64959027487` FOREIGN KEY (`theme_id`) REFERENCES `theme` (`id`),
  ADD CONSTRAINT `FK_8D93D649FA846217` FOREIGN KEY (`specialization_id`) REFERENCES `specialization` (`id`);

--
-- Contraintes pour la table `user_diploma`
--
ALTER TABLE `user_diploma`
  ADD CONSTRAINT `FK_B42C975DA76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_B42C975DA99ACEB5` FOREIGN KEY (`diploma_id`) REFERENCES `diploma` (`id`);

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
