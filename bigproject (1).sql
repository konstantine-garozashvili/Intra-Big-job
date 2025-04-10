-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: database
-- Generation Time: Apr 10, 2025 at 12:46 PM
-- Server version: 8.0.41
-- PHP Version: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bigproject`
--

-- --------------------------------------------------------

--
-- Table structure for table `address`
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
-- Dumping data for table `address`
--

INSERT INTO `address` (`id`, `city_id`, `user_id`, `postal_code_id`, `name`, `complement`) VALUES
(1, 1, 1, 1, '123 Rue de la Paix', 'Appartement 4B'),
(2, 1, 2, 2, '45 Avenue des Champs-Élysées', NULL),
(3, 1, 3, 3, '78 Boulevard Haussmann', '3ème étage'),
(4, 2, 4, 4, '15 Rue de la République', NULL),
(5, 3, 5, 5, '56 Rue du Vieux Port', 'Bâtiment B'),
(6, 4, 6, 6, '89 Cours de l\'Intendance', NULL),
(7, 5, 7, 7, '34 Rue Faidherbe', 'Résidence Les Lilas'),
(8, 1, 8, 1, '123 Rue de la Paix', 'Appartement 4B'),
(9, 1, 9, 2, '45 Avenue des Champs-Élysées', NULL),
(10, 1, 10, 3, '78 Boulevard Haussmann', '3ème étage');

-- --------------------------------------------------------

--
-- Table structure for table `city`
--

CREATE TABLE `city` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `city`
--

INSERT INTO `city` (`id`, `name`) VALUES
(1, 'Paris'),
(2, 'Lyon'),
(3, 'Marseille'),
(4, 'Bordeaux'),
(5, 'Lille');

-- --------------------------------------------------------

--
-- Table structure for table `diploma`
--

CREATE TABLE `diploma` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `diploma`
--

INSERT INTO `diploma` (`id`, `name`, `institution`) VALUES
(1, 'Brevet des collèges (DNB)', 'Université de Grenoble Alpes'),
(2, 'Certificat d\'aptitude professionnelle (CAP)', 'Conservatoire National des Arts et Métiers (CNAM)'),
(3, 'Brevet d\'études professionnelles (BEP)', 'ESCP Business School'),
(4, 'Baccalauréat général - Série L (Littéraire)', 'ESCP Business School'),
(5, 'Baccalauréat général - Série ES (Économique et Social)', 'ESCP Business School'),
(6, 'Baccalauréat général - Série S (Scientifique)', 'Centre de Formation d\'Apprentis (CFA)'),
(7, 'Baccalauréat technologique - STI2D (Sciences et Technologies de l\'Industrie et du Développement Durable)', 'Lycée professionnel'),
(8, 'Baccalauréat technologique - STL (Sciences et Technologies de Laboratoire)', 'Sciences Po Paris'),
(9, 'Baccalauréat technologique - STMG (Sciences et Technologies du Management et de la Gestion)', 'ESSEC Business School'),
(10, 'Baccalauréat technologique - ST2S (Sciences et Technologies de la Santé et du Social)', 'Université d\'Aix-Marseille'),
(11, 'Baccalauréat technologique - STD2A (Sciences et Technologies du Design et des Arts Appliqués)', 'Centre de Formation d\'Apprentis (CFA)'),
(12, 'Baccalauréat technologique - STAV (Sciences et Technologies de l\'Agronomie et du Vivant)', 'École Centrale Paris'),
(13, 'Baccalauréat technologique - TMD (Techniques de la Musique et de la Danse)', 'École des Mines'),
(14, 'Baccalauréat professionnel', 'Lycée professionnel'),
(15, 'Brevet de technicien supérieur (BTS) - Informatique', 'Conservatoire National des Arts et Métiers (CNAM)'),
(16, 'Brevet de technicien supérieur (BTS) - Commerce', 'Université d\'Aix-Marseille'),
(17, 'Brevet de technicien supérieur (BTS) - Communication', 'École des Ponts ParisTech'),
(18, 'Brevet de technicien supérieur (BTS) - Gestion', 'École Polytechnique'),
(19, 'Brevet de technicien supérieur (BTS) - Tourisme', 'Université de Rennes'),
(20, 'Brevet de technicien supérieur (BTS) - Audiovisuel', 'ESCP Business School'),
(21, 'Brevet de technicien supérieur (BTS) - Design', 'Conservatoire National des Arts et Métiers (CNAM)'),
(22, 'Brevet de technicien supérieur (BTS) - Hôtellerie-Restauration', 'Université de Montpellier'),
(23, 'Diplôme universitaire de technologie (DUT) - Informatique', 'Université d\'Aix-Marseille'),
(24, 'Diplôme universitaire de technologie (DUT) - Gestion des entreprises et des administrations', 'École Centrale Paris'),
(25, 'Diplôme universitaire de technologie (DUT) - Techniques de commercialisation', 'Institut Universitaire de Technologie (IUT)'),
(26, 'Diplôme universitaire de technologie (DUT) - Information-Communication', 'École Normale Supérieure'),
(27, 'Diplôme universitaire de technologie (DUT) - Génie civil', 'Université de Strasbourg'),
(28, 'Diplôme universitaire de technologie (DUT) - Génie électrique et informatique industrielle', 'Conservatoire National des Arts et Métiers (CNAM)'),
(29, 'Diplôme universitaire de technologie (DUT) - Mesures physiques', 'Université Paris-Saclay'),
(30, 'Diplôme d\'études universitaires scientifiques et techniques (DEUST)', 'Université de Toulouse'),
(31, 'Diplôme de comptabilité et de gestion (DCG)', 'École des Mines'),
(32, 'Licence - Droit', 'Université de Nice Sophia Antipolis'),
(33, 'Licence - Économie', 'Université Paris-Saclay'),
(34, 'Licence - Gestion', 'École Normale Supérieure'),
(35, 'Licence - Administration économique et sociale (AES)', 'École Polytechnique'),
(36, 'Licence - Langues étrangères appliquées (LEA)', 'Université de Strasbourg'),
(37, 'Licence - Langues, littératures et civilisations étrangères et régionales (LLCER)', 'Institut Universitaire de Technologie (IUT)'),
(38, 'Licence - Lettres', 'École Polytechnique'),
(39, 'Licence - Histoire', 'École Polytechnique'),
(40, 'Licence - Géographie', 'Université de Nantes'),
(41, 'Licence - Sociologie', 'Université de Nantes'),
(42, 'Licence - Psychologie', 'Université de Nantes'),
(43, 'Licence - Sciences de l\'éducation', 'Lycée général et technologique'),
(44, 'Licence - Mathématiques', 'Conservatoire National des Arts et Métiers (CNAM)'),
(45, 'Licence - Physique', 'École des Ponts ParisTech'),
(46, 'Licence - Chimie', 'Université Paris-Saclay'),
(47, 'Licence - Sciences de la vie', 'ESCP Business School'),
(48, 'Licence - Sciences de la Terre', 'Sciences Po Paris'),
(49, 'Licence - Informatique', 'Institut Universitaire de Technologie (IUT)'),
(50, 'Licence - STAPS (Sciences et techniques des activités physiques et sportives)', 'Université de Strasbourg'),
(51, 'Licence professionnelle - Métiers de l\'informatique', 'Université d\'Aix-Marseille'),
(52, 'Licence professionnelle - Commerce et distribution', 'Université de Lyon'),
(53, 'Licence professionnelle - Management et gestion des organisations', 'École Normale Supérieure'),
(54, 'Licence professionnelle - Métiers de la communication', 'Université Paris-Saclay'),
(55, 'Licence professionnelle - Métiers du BTP', 'Conservatoire National des Arts et Métiers (CNAM)'),
(56, 'Licence professionnelle - Métiers de l\'industrie', 'Sciences Po Paris'),
(57, 'Licence professionnelle - Métiers du tourisme et des loisirs', 'Université de Lyon'),
(58, 'Maîtrise (M1)', 'Université Paris-Sorbonne'),
(59, 'Diplôme supérieur de comptabilité et de gestion (DSCG)', 'Centre de Formation d\'Apprentis (CFA)'),
(60, 'Master - Droit des affaires', 'Université de Rennes'),
(61, 'Master - Droit public', 'Institut Universitaire de Technologie (IUT)'),
(62, 'Master - Droit international', 'Conservatoire National des Arts et Métiers (CNAM)'),
(63, 'Master - Finance', 'Centre de Formation d\'Apprentis (CFA)'),
(64, 'Master - Marketing', 'Université d\'Aix-Marseille'),
(65, 'Master - Management', 'Centre de Formation d\'Apprentis (CFA)'),
(66, 'Master - Ressources humaines', 'École des Ponts ParisTech'),
(67, 'Master - Commerce international', 'Lycée professionnel'),
(68, 'Master - Économie', 'Lycée général et technologique'),
(69, 'Master - Informatique', 'Université de Rennes'),
(70, 'Master - Génie logiciel', 'Université Pierre et Marie Curie'),
(71, 'Master - Intelligence artificielle', 'Sciences Po Paris'),
(72, 'Master - Cybersécurité', 'École Polytechnique'),
(73, 'Master - Data Science', 'Université de Lille'),
(74, 'Master - Réseaux et télécommunications', 'École Polytechnique'),
(75, 'Master - Biologie', 'Université Paris-Sorbonne'),
(76, 'Master - Chimie', 'HEC Paris'),
(77, 'Master - Physique', 'Université Pierre et Marie Curie'),
(78, 'Master - Mathématiques', 'Lycée général et technologique'),
(79, 'Master - Histoire', 'École des Ponts ParisTech'),
(80, 'Master - Géographie', 'Université de Strasbourg'),
(81, 'Master - Sociologie', 'Université Paris-Saclay'),
(82, 'Master - Psychologie', 'Lycée professionnel'),
(83, 'Master - Sciences de l\'éducation', 'Institut Universitaire de Technologie (IUT)'),
(84, 'Master - Langues et cultures étrangères', 'École Polytechnique'),
(85, 'Master - Lettres modernes', 'Université d\'Aix-Marseille'),
(86, 'Master - Communication', 'Institut Universitaire de Technologie (IUT)'),
(87, 'Master - Journalisme', 'Université de Strasbourg'),
(88, 'Master - Arts', 'École Polytechnique'),
(89, 'Master - Cinéma', 'École Polytechnique'),
(90, 'Master - Musique', 'ESSEC Business School'),
(91, 'Master - Architecture', 'Université de Rennes'),
(92, 'Master - Urbanisme', 'Lycée général et technologique'),
(93, 'Diplôme d\'ingénieur', 'Université Paris-Saclay'),
(94, 'Diplôme d\'école de commerce', 'Université de Strasbourg'),
(95, 'Diplôme d\'État de docteur en médecine', 'Conservatoire National des Arts et Métiers (CNAM)'),
(96, 'Diplôme d\'État de docteur en pharmacie', 'Conservatoire National des Arts et Métiers (CNAM)'),
(97, 'Diplôme d\'État de docteur en chirurgie dentaire', 'Université de Grenoble Alpes'),
(98, 'Diplôme d\'État de sage-femme', 'Institut Universitaire de Technologie (IUT)'),
(99, 'Diplôme d\'État d\'architecte', 'Université d\'Aix-Marseille'),
(100, 'Diplôme d\'expertise comptable (DEC)', 'Université de Lille'),
(101, 'Doctorat - Sciences', 'École Polytechnique'),
(102, 'Doctorat - Lettres', 'Sciences Po Paris'),
(103, 'Doctorat - Droit', 'Université de Nice Sophia Antipolis'),
(104, 'Doctorat - Économie', 'Centre de Formation d\'Apprentis (CFA)'),
(105, 'Doctorat - Gestion', 'HEC Paris'),
(106, 'Doctorat - Médecine', 'Université de Rennes'),
(107, 'Doctorat - Pharmacie', 'Université de Strasbourg'),
(108, 'Doctorat - Arts', 'Université de Lyon'),
(109, 'Habilitation à diriger des recherches (HDR)', 'HEC Paris'),
(110, 'Titre professionnel - Développeur web et web mobile', 'École des Ponts ParisTech'),
(111, 'Titre professionnel - Concepteur développeur d\'applications', 'École des Ponts ParisTech'),
(112, 'Titre professionnel - Technicien supérieur en réseaux informatiques et télécommunications', 'GRETA'),
(113, 'Titre professionnel - Designer web', 'Université de Strasbourg'),
(114, 'Titre professionnel - Gestionnaire de paie', 'Lycée professionnel'),
(115, 'Titre professionnel - Comptable assistant', 'Université de Grenoble Alpes'),
(116, 'Titre professionnel - Assistant ressources humaines', 'École Normale Supérieure'),
(117, 'Titre professionnel - Secrétaire assistant', 'Université Pierre et Marie Curie'),
(118, 'Titre professionnel - Vendeur conseil en magasin', 'Centre de Formation d\'Apprentis (CFA)'),
(119, 'Titre professionnel - Responsable de rayon', 'Université de Nantes'),
(120, 'Certification professionnelle RNCP', 'Université de Grenoble Alpes'),
(121, 'Certificat de qualification professionnelle (CQP)', 'Université de Nantes'),
(122, 'Diplôme de l\'École Polytechnique', 'Université de Grenoble Alpes'),
(123, 'Diplôme de l\'École Normale Supérieure (ENS)', 'Conservatoire National des Arts et Métiers (CNAM)'),
(124, 'Diplôme de l\'École des Hautes Études Commerciales (HEC)', 'Université de Strasbourg'),
(125, 'Diplôme de l\'ESSEC Business School', 'Université Paris-Saclay'),
(126, 'Diplôme de l\'ESCP Business School', 'Sciences Po Paris'),
(127, 'Diplôme de l\'EM Lyon Business School', 'École Normale Supérieure'),
(128, 'Diplôme de l\'EDHEC Business School', 'Université Paris-Saclay'),
(129, 'Diplôme de Sciences Po Paris', 'Université Paris-Saclay'),
(130, 'Diplôme de l\'École Centrale', 'HEC Paris'),
(131, 'Diplôme de l\'École des Mines', 'Sciences Po Paris'),
(132, 'Diplôme de l\'École des Ponts ParisTech', 'Université de Grenoble Alpes'),
(133, 'Diplôme de l\'ENSAE Paris', 'École des Mines'),
(134, 'Diplôme de l\'ENSTA Paris', 'Institut Universitaire de Technologie (IUT)'),
(135, 'Diplôme de l\'Institut National des Sciences Appliquées (INSA)', 'HEC Paris'),
(136, 'Diplôme de l\'École Nationale Vétérinaire', 'HEC Paris'),
(137, 'Diplôme de l\'École Nationale de la Magistrature (ENM)', 'École des Ponts ParisTech'),
(138, 'Diplôme de l\'École Nationale d\'Administration (ENA) / Institut National du Service Public (INSP)', 'Lycée professionnel');

-- --------------------------------------------------------

--
-- Table structure for table `document`
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
-- Table structure for table `document_category`
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
-- Dumping data for table `document_category`
--

INSERT INTO `document_category` (`id`, `code`, `name`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'IDENTITY', 'Documents d\'identité', 'Pièces d\'identité et documents officiels', 1, '2025-04-10 07:24:34', '2025-04-10 07:24:34'),
(2, 'ACADEMIC', 'Documents académiques', 'Diplômes, relevés de notes et certificats de formation', 1, '2025-04-10 07:24:34', '2025-04-10 07:24:34'),
(3, 'PROFESSIONAL', 'Documents professionnels', 'CV, lettres de recommandation et certificats professionnels', 1, '2025-04-10 07:24:34', '2025-04-10 07:24:34'),
(4, 'ADMINISTRATIVE', 'Documents administratifs', 'Documents administratifs et formulaires officiels', 1, '2025-04-10 07:24:34', '2025-04-10 07:24:34'),
(5, 'MEDICAL', 'Documents médicaux', 'Certificats médicaux et documents de santé', 1, '2025-04-10 07:24:34', '2025-04-10 07:24:34');

-- --------------------------------------------------------

--
-- Table structure for table `document_history`
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
-- Table structure for table `document_type`
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
-- Dumping data for table `document_type`
--

INSERT INTO `document_type` (`id`, `code`, `name`, `description`, `allowed_mime_types`, `max_file_size`, `is_required`, `deadline_at`, `notification_days`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'ID_CARD', 'Carte d\'identité', 'Carte nationale d\'identité en cours de validité', '[\"application/pdf\", \"image/jpeg\", \"image/png\"]', 5242880, 1, NULL, 7, 1, '2025-04-10 07:24:36', '2025-04-10 07:24:36'),
(2, 'PASSPORT', 'Passeport', 'Passeport en cours de validité', '[\"application/pdf\", \"image/jpeg\", \"image/png\"]', 5242880, 0, NULL, 7, 1, '2025-04-10 07:24:36', '2025-04-10 07:24:36'),
(3, 'DIPLOMA', 'Diplôme', 'Diplôme ou attestation de réussite', '[\"application/pdf\"]', 10485760, 1, NULL, 7, 1, '2025-04-10 07:24:36', '2025-04-10 07:24:36'),
(4, 'TRANSCRIPT', 'Relevé de notes', 'Relevé de notes officiel', '[\"application/pdf\"]', 10485760, 1, NULL, 7, 1, '2025-04-10 07:24:36', '2025-04-10 07:24:36'),
(5, 'CV', 'Curriculum Vitae', 'CV à jour', '[\"application/pdf\", \"application/msword\", \"application/vnd.openxmlformats-officedocument.wordprocessingml.document\"]', 2097152, 1, NULL, 7, 1, '2025-04-10 07:24:36', '2025-04-10 07:24:36'),
(6, 'RECOMMENDATION', 'Lettre de recommandation', 'Lettre de recommandation professionnelle', '[\"application/pdf\"]', 2097152, 0, NULL, 7, 1, '2025-04-10 07:24:36', '2025-04-10 07:24:36'),
(7, 'REGISTRATION', 'Formulaire d\'inscription', 'Formulaire d\'inscription complété et signé', '[\"application/pdf\"]', 5242880, 1, NULL, 7, 1, '2025-04-10 07:24:36', '2025-04-10 07:24:36'),
(8, 'MEDICAL_CERTIFICATE', 'Certificat médical', 'Certificat médical d\'aptitude', '[\"application/pdf\"]', 5242880, 1, NULL, 7, 1, '2025-04-10 07:24:36', '2025-04-10 07:24:36');

-- --------------------------------------------------------

--
-- Table structure for table `document_type_category`
--

CREATE TABLE `document_type_category` (
  `document_type_id` int NOT NULL,
  `document_category_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_type_category`
--

INSERT INTO `document_type_category` (`document_type_id`, `document_category_id`) VALUES
(1, 1),
(2, 1),
(3, 2),
(4, 2),
(5, 3),
(6, 3),
(7, 4),
(8, 5);

-- --------------------------------------------------------

--
-- Table structure for table `domain`
--

CREATE TABLE `domain` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `domain`
--

INSERT INTO `domain` (`id`, `name`, `description`) VALUES
(1, 'Développement', 'Domaine du développement logiciel et web'),
(2, 'Design', 'Domaine du design graphique et UX/UI'),
(3, 'Marketing Digital', 'Domaine du marketing en ligne et stratégies digitales'),
(4, 'Business & Management', 'Domaine de la gestion d\'entreprise et du management'),
(5, 'Data & IA', 'Domaine de l\'analyse de données et intelligence artificielle');

-- --------------------------------------------------------

--
-- Table structure for table `event_participant`
--

CREATE TABLE `event_participant` (
  `id` int NOT NULL,
  `event_id` int NOT NULL,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `formation`
--

CREATE TABLE `formation` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `promotion` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `formation`
--

INSERT INTO `formation` (`id`, `name`, `promotion`, `description`) VALUES
(1, 'Formation 1', '2024-2025', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'),
(2, 'Formation 2', '2024-2025', 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'),
(3, 'Formation 3', '2024-2025', 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.');

-- --------------------------------------------------------

--
-- Table structure for table `formation_student`
--

CREATE TABLE `formation_student` (
  `formation_id` int NOT NULL,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `group`
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
-- Table structure for table `group_user`
--

CREATE TABLE `group_user` (
  `group_id` int NOT NULL,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `message`
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
-- Table structure for table `nationality`
--

CREATE TABLE `nationality` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `nationality`
--

INSERT INTO `nationality` (`id`, `name`, `code`) VALUES
(1, 'Française', NULL),
(2, 'Anglaise', NULL),
(3, 'Allemande', NULL),
(4, 'Espagnole', NULL),
(5, 'Italienne', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `postal_code`
--

CREATE TABLE `postal_code` (
  `id` int NOT NULL,
  `city_id` int NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `postal_code`
--

INSERT INTO `postal_code` (`id`, `city_id`, `code`, `district`) VALUES
(1, 1, '75001', '1er arrondissement'),
(2, 1, '75002', '2ème arrondissement'),
(3, 1, '75003', '3ème arrondissement'),
(4, 2, '69000', NULL),
(5, 3, '13000', NULL),
(6, 4, '33000', NULL),
(7, 5, '59000', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
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
-- Dumping data for table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `refresh_token`, `username`, `valid`, `device_id`, `device_name`, `device_type`) VALUES
(1, '532baa603dc477e45dca698289ce99445d9307b80b6f223ffba94c8a4b7ec75c597aee6de6a48a69d95479c26efaeb88ba442ccc61e9cb601ba396928260b391', 'student@bigproject.com', '2025-05-10 07:46:47', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`id`, `name`, `description`) VALUES
(1, 'ADMIN', 'Administrateur du système avec des droits étendus'),
(2, 'SUPERADMIN', 'Super Administrateur avec tous les droits système'),
(3, 'HR', 'Ressources Humaines - Gestion des utilisateurs et des profils'),
(4, 'TEACHER', 'Formateur - Création et gestion des formations'),
(5, 'STUDENT', 'Élève - Accès aux formations et aux ressources pédagogiques'),
(6, 'GUEST', 'Invité - Accès limité en lecture seule'),
(7, 'RECRUITER', 'Recruteur - Gestion des candidatures et des offres d\'emploi');

-- --------------------------------------------------------

--
-- Table structure for table `schedule_event`
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
-- Table structure for table `signature`
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
-- Table structure for table `specialization`
--

CREATE TABLE `specialization` (
  `id` int NOT NULL,
  `domain_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `specialization`
--

INSERT INTO `specialization` (`id`, `domain_id`, `name`) VALUES
(1, 1, 'Développement PHP'),
(2, 1, 'Développement JavaScript'),
(3, 1, 'Développement Python'),
(4, 2, 'UI Design'),
(5, 2, 'UX Design'),
(6, 3, 'SEO'),
(7, 3, 'SEM & Publicité'),
(8, 4, 'Gestion de Projet'),
(9, 4, 'Analyse d\'Affaires'),
(10, 5, 'Data Science'),
(11, 5, 'Machine Learning');

-- --------------------------------------------------------

--
-- Table structure for table `student_profile`
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
-- Dumping data for table `student_profile`
--

INSERT INTO `student_profile` (`id`, `user_id`, `situation_type_id`, `is_seeking_internship`, `is_seeking_apprenticeship`, `current_internship_company`, `internship_start_date`, `internship_end_date`, `portfolio_url`, `created_at`, `updated_at`) VALUES
(1, 5, 1, 0, 0, NULL, NULL, NULL, NULL, '2025-04-10 07:24:36', '2025-04-10 07:24:36'),
(2, 8, 1, 0, 0, NULL, NULL, NULL, NULL, '2025-04-10 07:24:37', '2025-04-10 07:24:37'),
(3, 9, 1, 0, 0, NULL, NULL, NULL, NULL, '2025-04-10 07:24:37', '2025-04-10 07:24:37'),
(4, 10, 1, 0, 0, NULL, NULL, NULL, NULL, '2025-04-10 07:24:37', '2025-04-10 07:24:37');

-- --------------------------------------------------------

--
-- Table structure for table `theme`
--

CREATE TABLE `theme` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `theme`
--

INSERT INTO `theme` (`id`, `name`, `description`) VALUES
(1, 'light', 'Thème clair'),
(2, 'dark', 'Thème sombre'),
(3, 'system', 'Thème système (suit les préférences du système)');

-- --------------------------------------------------------

--
-- Table structure for table `ticket`
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
-- Table structure for table `ticket_comment`
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
-- Table structure for table `ticket_service`
--

CREATE TABLE `ticket_service` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ticket_service`
--

INSERT INTO `ticket_service` (`id`, `name`, `description`) VALUES
(1, 'Support technique', 'Problèmes techniques liés à l\'application ou au site web'),
(2, 'Facturation', 'Questions concernant vos factures ou paiements'),
(3, 'Contenu pédagogique', 'Questions ou problèmes liés au contenu des cours'),
(4, 'Accès aux cours', 'Problèmes d\'accès aux cours ou aux ressources pédagogiques'),
(5, 'Suggestion', 'Suggestions pour améliorer la plateforme ou les cours'),
(6, 'Autre', 'Toute autre demande ne correspondant pas aux catégories ci-dessus');

-- --------------------------------------------------------

--
-- Table structure for table `ticket_status`
--

CREATE TABLE `ticket_status` (
  `id` int NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ticket_status`
--

INSERT INTO `ticket_status` (`id`, `name`, `description`, `color`) VALUES
(1, 'Ouvert', 'Ticket ouvert en attente de traitement', '#3498db'),
(2, 'En cours', 'Ticket en cours de traitement', '#f39c12'),
(3, 'Résolu', 'Ticket résolu', '#2ecc71'),
(4, 'Fermé', 'Ticket fermé', '#7f8c8d'),
(5, 'En attente', 'En attente d\'informations supplémentaires', '#e74c3c');

-- --------------------------------------------------------

--
-- Table structure for table `user`
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
  `verification_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_password_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_password_expires` datetime DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)',
  `profile_picture_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linkedin_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `nationality_id`, `theme_id`, `specialization_id`, `last_name`, `first_name`, `birth_date`, `email`, `phone_number`, `password`, `created_at`, `updated_at`, `is_email_verified`, `verification_token`, `reset_password_token`, `reset_password_expires`, `profile_picture_path`, `linkedin_url`) VALUES
(1, 1, 1, NULL, 'Dupont', 'Alexandre', '1985-01-01', 'superadmin@bigproject.com', '0600000001', '$2y$13$oT5f3jENvy5asHlY8vjD3.IWNrJJYNGDywqqasdngieOCWmgGuxcW', '2025-04-10 07:24:34', NULL, 1, NULL, NULL, NULL, NULL, NULL),
(2, 1, 1, 3, 'Martin', 'Sophie', '1988-02-15', 'admin@bigproject.com', '0600000002', '$2y$13$NAKK1Eu8qUax.8XRSDe74eHK9jlM0dq3A13L9WshCt9j0FwuPc4Xe', '2025-04-10 07:24:34', NULL, 1, NULL, NULL, NULL, NULL, NULL),
(3, 1, 1, 8, 'Bernard', 'Camille', '1990-03-20', 'hr@bigproject.com', '0600000003', '$2y$13$mRlvW5zlIjrxcF/js2bf..77pSUsLJ/raaTmuqwkVlu48k/lKxaU.', '2025-04-10 07:24:34', NULL, 1, NULL, NULL, NULL, NULL, NULL),
(4, 1, 1, 1, 'Petit', 'Thomas', '1982-04-10', 'teacher@bigproject.com', '0600000004', '$2y$13$XdmeDHdX4X..R96N4.8KhOrVZggdzeg20bjD2H3GpKQRh.KJ/JJlm', '2025-04-10 07:24:35', NULL, 1, NULL, NULL, NULL, NULL, NULL),
(5, 1, 1, 2, 'Dubois', 'Emma', '2000-05-25', 'student@bigproject.com', '0600000005', '$2y$13$5.glgF9crIal5UJWSXlz3eBxPD/oCTooLxiWJcgTdb.dE0Y3bDX8O', '2025-04-10 07:24:35', NULL, 1, NULL, NULL, NULL, NULL, NULL),
(6, 1, 1, 9, 'Moreau', 'Lucas', '1992-06-15', 'recruiter@bigproject.com', '0600000006', '$2y$13$dxxO3WBJgftIbb5XcJ9saeeVwGBH8NORW16TTLx4xRr2wtr.BAESa', '2025-04-10 07:24:36', NULL, 1, NULL, NULL, NULL, NULL, NULL),
(7, 1, 1, NULL, 'Lambert', 'Marie', '1995-07-30', 'guest@bigproject.com', '0600000007', '$2y$13$c6PNIF2qF4xbwZfUdG1TUuiUfDp0B3vZmefnpcVl3rYPx2tSkpDrm', '2025-04-10 07:24:36', NULL, 1, NULL, NULL, NULL, NULL, NULL),
(8, 1, 1, 4, 'Designer', 'Alice', '1999-05-15', 'student.design@bigproject.com', '0600000011', '$2y$13$LVQfoxDb1QOmILht029rOObYOzld4tBnN/Nm5MBYvOPUm6UKf5cQG', '2025-04-10 07:24:36', NULL, 1, NULL, NULL, NULL, NULL, NULL),
(9, 1, 1, 6, 'Marketer', 'Bob', '2000-08-22', 'student.marketing@bigproject.com', '0600000012', '$2y$13$Yzm7StIExKP.U9uxLQSKD.yr4l1AEmLalzMfRjGfFC/JMvaOHqeB6', '2025-04-10 07:24:37', NULL, 1, NULL, NULL, NULL, NULL, NULL),
(10, 1, 1, 10, 'Analyst', 'Charlie', '1998-11-30', 'student.data@bigproject.com', '0600000013', '$2y$13$kYq7.wyDeLK.zS4X53cHZ.euMIkkos6koStQcQOnO9wsJQ.66swXS', '2025-04-10 07:24:37', NULL, 1, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_diploma`
--

CREATE TABLE `user_diploma` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `diploma_id` int NOT NULL,
  `obtained_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_diploma`
--

INSERT INTO `user_diploma` (`id`, `user_id`, `diploma_id`, `obtained_date`) VALUES
(1, 5, 103, '2025-09-27'),
(2, 5, 108, '2021-01-25');

-- --------------------------------------------------------

--
-- Table structure for table `user_role`
--

CREATE TABLE `user_role` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `role_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_role`
--

INSERT INTO `user_role` (`id`, `user_id`, `role_id`) VALUES
(1, 1, 2),
(2, 2, 1),
(3, 3, 3),
(4, 4, 4),
(5, 5, 5),
(6, 6, 7),
(7, 7, 6),
(8, 8, 5),
(9, 9, 5),
(10, 10, 5);

-- --------------------------------------------------------

--
-- Table structure for table `user_situation_type`
--

CREATE TABLE `user_situation_type` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_situation_type`
--

INSERT INTO `user_situation_type` (`id`, `name`, `description`) VALUES
(1, 'Initial', 'Formation initiale'),
(2, 'Alternance', 'Formation en alternance'),
(3, 'Stage', 'En stage'),
(4, 'Emploi', 'En emploi');

-- --------------------------------------------------------

--
-- Table structure for table `user_status`
--

CREATE TABLE `user_status` (
  `id` int NOT NULL,
  `associated_role_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_status`
--

INSERT INTO `user_status` (`id`, `associated_role_id`, `name`, `description`) VALUES
(1, 5, 'Actif', 'Utilisateur actif avec accès complet'),
(2, 6, 'En attente', 'Compte en attente de validation'),
(3, 6, 'Bloqué', 'Compte temporairement bloqué'),
(4, 6, 'Archivé', 'Compte archivé - accès restreint'),
(5, 5, 'Diplômé', 'Étudiant ayant terminé sa formation'),
(6, 5, 'En congé', 'Utilisateur temporairement absent');

-- --------------------------------------------------------

--
-- Table structure for table `user_status_history`
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
-- Indexes for dumped tables
--

--
-- Indexes for table `address`
--
ALTER TABLE `address`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_D4E6F818BAC62AF` (`city_id`),
  ADD KEY `IDX_D4E6F81A76ED395` (`user_id`),
  ADD KEY `IDX_D4E6F81BDBA6A61` (`postal_code_id`);

--
-- Indexes for table `city`
--
ALTER TABLE `city`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `diploma`
--
ALTER TABLE `diploma`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `document`
--
ALTER TABLE `document`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_D8698A76A76ED395` (`user_id`),
  ADD KEY `IDX_D8698A7661232A4F` (`document_type_id`),
  ADD KEY `IDX_D8698A76C69DE5E5` (`validated_by_id`);

--
-- Indexes for table `document_category`
--
ALTER TABLE `document_category`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_898DE89877153098` (`code`);

--
-- Indexes for table `document_history`
--
ALTER TABLE `document_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_83D5D697C33F7837` (`document_id`),
  ADD KEY `IDX_83D5D697A76ED395` (`user_id`);

--
-- Indexes for table `document_type`
--
ALTER TABLE `document_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_2B6ADBBA77153098` (`code`);

--
-- Indexes for table `document_type_category`
--
ALTER TABLE `document_type_category`
  ADD PRIMARY KEY (`document_type_id`,`document_category_id`),
  ADD KEY `IDX_EC1C9AB661232A4F` (`document_type_id`),
  ADD KEY `IDX_EC1C9AB690EFAA88` (`document_category_id`);

--
-- Indexes for table `domain`
--
ALTER TABLE `domain`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `event_participant`
--
ALTER TABLE `event_participant`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_7C16B89171F7E88B` (`event_id`),
  ADD KEY `IDX_7C16B891A76ED395` (`user_id`);

--
-- Indexes for table `formation`
--
ALTER TABLE `formation`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `formation_student`
--
ALTER TABLE `formation_student`
  ADD PRIMARY KEY (`formation_id`,`user_id`),
  ADD KEY `IDX_F2DCEA485200282E` (`formation_id`),
  ADD KEY `IDX_F2DCEA48A76ED395` (`user_id`);

--
-- Indexes for table `group`
--
ALTER TABLE `group`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_6DC044C561220EA6` (`creator_id`);

--
-- Indexes for table `group_user`
--
ALTER TABLE `group_user`
  ADD PRIMARY KEY (`group_id`,`user_id`),
  ADD KEY `IDX_A4C98D39FE54D947` (`group_id`),
  ADD KEY `IDX_A4C98D39A76ED395` (`user_id`);

--
-- Indexes for table `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_B6BD307FF624B39D` (`sender_id`),
  ADD KEY `IDX_B6BD307FE92F8F78` (`recipient_id`),
  ADD KEY `IDX_B6BD307FFE54D947` (`group_id`);

--
-- Indexes for table `nationality`
--
ALTER TABLE `nationality`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `postal_code`
--
ALTER TABLE `postal_code`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_EA98E3768BAC62AF` (`city_id`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_9BACE7E1C74F2195` (`refresh_token`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `schedule_event`
--
ALTER TABLE `schedule_event`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_C7F7CAFBDE12AB56` (`created_by`);

--
-- Indexes for table `signature`
--
ALTER TABLE `signature`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_AE880141A76ED395` (`user_id`);

--
-- Indexes for table `specialization`
--
ALTER TABLE `specialization`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_9ED9F26A115F0EE5` (`domain_id`);

--
-- Indexes for table `student_profile`
--
ALTER TABLE `student_profile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_6C611FF7A76ED395` (`user_id`),
  ADD KEY `IDX_6C611FF747CC2355` (`situation_type_id`);

--
-- Indexes for table `theme`
--
ALTER TABLE `theme`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ticket`
--
ALTER TABLE `ticket`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_97A0ADA361220EA6` (`creator_id`),
  ADD KEY `IDX_97A0ADA3F4BD7827` (`assigned_to_id`),
  ADD KEY `IDX_97A0ADA36BF700BD` (`status_id`),
  ADD KEY `IDX_97A0ADA3ED5CA9E6` (`service_id`);

--
-- Indexes for table `ticket_comment`
--
ALTER TABLE `ticket_comment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_98B80B3E700047D2` (`ticket_id`),
  ADD KEY `IDX_98B80B3EF675F31B` (`author_id`);

--
-- Indexes for table `ticket_service`
--
ALTER TABLE `ticket_service`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ticket_status`
--
ALTER TABLE `ticket_status`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_8D93D649E7927C74` (`email`),
  ADD KEY `IDX_8D93D6491C9DA55` (`nationality_id`),
  ADD KEY `IDX_8D93D64959027487` (`theme_id`),
  ADD KEY `IDX_8D93D649FA846217` (`specialization_id`);

--
-- Indexes for table `user_diploma`
--
ALTER TABLE `user_diploma`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_B42C975DA76ED395` (`user_id`),
  ADD KEY `IDX_B42C975DA99ACEB5` (`diploma_id`);

--
-- Indexes for table `user_role`
--
ALTER TABLE `user_role`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_2DE8C6A3A76ED395` (`user_id`),
  ADD KEY `IDX_2DE8C6A3D60322AC` (`role_id`);

--
-- Indexes for table `user_situation_type`
--
ALTER TABLE `user_situation_type`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_status`
--
ALTER TABLE `user_status`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_1E527E21CD4ADDE8` (`associated_role_id`);

--
-- Indexes for table `user_status_history`
--
ALTER TABLE `user_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_44EFD897A76ED395` (`user_id`),
  ADD KEY `IDX_44EFD8976BF700BD` (`status_id`),
  ADD KEY `idx_user_status_history_dates` (`start_date`,`end_date`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `address`
--
ALTER TABLE `address`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `city`
--
ALTER TABLE `city`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `diploma`
--
ALTER TABLE `diploma`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=139;

--
-- AUTO_INCREMENT for table `document`
--
ALTER TABLE `document`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `document_category`
--
ALTER TABLE `document_category`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `document_history`
--
ALTER TABLE `document_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `document_type`
--
ALTER TABLE `document_type`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `domain`
--
ALTER TABLE `domain`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `event_participant`
--
ALTER TABLE `event_participant`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `formation`
--
ALTER TABLE `formation`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `group`
--
ALTER TABLE `group`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `message`
--
ALTER TABLE `message`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nationality`
--
ALTER TABLE `nationality`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `postal_code`
--
ALTER TABLE `postal_code`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `schedule_event`
--
ALTER TABLE `schedule_event`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `signature`
--
ALTER TABLE `signature`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `specialization`
--
ALTER TABLE `specialization`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `student_profile`
--
ALTER TABLE `student_profile`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `theme`
--
ALTER TABLE `theme`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `ticket`
--
ALTER TABLE `ticket`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ticket_comment`
--
ALTER TABLE `ticket_comment`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ticket_service`
--
ALTER TABLE `ticket_service`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `ticket_status`
--
ALTER TABLE `ticket_status`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `user_diploma`
--
ALTER TABLE `user_diploma`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_role`
--
ALTER TABLE `user_role`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `user_situation_type`
--
ALTER TABLE `user_situation_type`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_status`
--
ALTER TABLE `user_status`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `user_status_history`
--
ALTER TABLE `user_status_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `address`
--
ALTER TABLE `address`
  ADD CONSTRAINT `FK_D4E6F818BAC62AF` FOREIGN KEY (`city_id`) REFERENCES `city` (`id`),
  ADD CONSTRAINT `FK_D4E6F81A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_D4E6F81BDBA6A61` FOREIGN KEY (`postal_code_id`) REFERENCES `postal_code` (`id`);

--
-- Constraints for table `document`
--
ALTER TABLE `document`
  ADD CONSTRAINT `FK_D8698A7661232A4F` FOREIGN KEY (`document_type_id`) REFERENCES `document_type` (`id`),
  ADD CONSTRAINT `FK_D8698A76A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_D8698A76C69DE5E5` FOREIGN KEY (`validated_by_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `document_history`
--
ALTER TABLE `document_history`
  ADD CONSTRAINT `FK_83D5D697A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_83D5D697C33F7837` FOREIGN KEY (`document_id`) REFERENCES `document` (`id`);

--
-- Constraints for table `document_type_category`
--
ALTER TABLE `document_type_category`
  ADD CONSTRAINT `FK_EC1C9AB661232A4F` FOREIGN KEY (`document_type_id`) REFERENCES `document_type` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_EC1C9AB690EFAA88` FOREIGN KEY (`document_category_id`) REFERENCES `document_category` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_participant`
--
ALTER TABLE `event_participant`
  ADD CONSTRAINT `FK_7C16B89171F7E88B` FOREIGN KEY (`event_id`) REFERENCES `schedule_event` (`id`),
  ADD CONSTRAINT `FK_7C16B891A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `formation_student`
--
ALTER TABLE `formation_student`
  ADD CONSTRAINT `FK_F2DCEA485200282E` FOREIGN KEY (`formation_id`) REFERENCES `formation` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_F2DCEA48A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `group`
--
ALTER TABLE `group`
  ADD CONSTRAINT `FK_6DC044C561220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `group_user`
--
ALTER TABLE `group_user`
  ADD CONSTRAINT `FK_A4C98D39A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_A4C98D39FE54D947` FOREIGN KEY (`group_id`) REFERENCES `group` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `message`
--
ALTER TABLE `message`
  ADD CONSTRAINT `FK_B6BD307FE92F8F78` FOREIGN KEY (`recipient_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_B6BD307FF624B39D` FOREIGN KEY (`sender_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_B6BD307FFE54D947` FOREIGN KEY (`group_id`) REFERENCES `group` (`id`);

--
-- Constraints for table `postal_code`
--
ALTER TABLE `postal_code`
  ADD CONSTRAINT `FK_EA98E3768BAC62AF` FOREIGN KEY (`city_id`) REFERENCES `city` (`id`);

--
-- Constraints for table `schedule_event`
--
ALTER TABLE `schedule_event`
  ADD CONSTRAINT `FK_C7F7CAFBDE12AB56` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`);

--
-- Constraints for table `signature`
--
ALTER TABLE `signature`
  ADD CONSTRAINT `FK_AE880141A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `specialization`
--
ALTER TABLE `specialization`
  ADD CONSTRAINT `FK_9ED9F26A115F0EE5` FOREIGN KEY (`domain_id`) REFERENCES `domain` (`id`);

--
-- Constraints for table `student_profile`
--
ALTER TABLE `student_profile`
  ADD CONSTRAINT `FK_6C611FF747CC2355` FOREIGN KEY (`situation_type_id`) REFERENCES `user_situation_type` (`id`),
  ADD CONSTRAINT `FK_6C611FF7A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ticket`
--
ALTER TABLE `ticket`
  ADD CONSTRAINT `FK_97A0ADA361220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_97A0ADA36BF700BD` FOREIGN KEY (`status_id`) REFERENCES `ticket_status` (`id`),
  ADD CONSTRAINT `FK_97A0ADA3ED5CA9E6` FOREIGN KEY (`service_id`) REFERENCES `ticket_service` (`id`),
  ADD CONSTRAINT `FK_97A0ADA3F4BD7827` FOREIGN KEY (`assigned_to_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `ticket_comment`
--
ALTER TABLE `ticket_comment`
  ADD CONSTRAINT `FK_98B80B3E700047D2` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`),
  ADD CONSTRAINT `FK_98B80B3EF675F31B` FOREIGN KEY (`author_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `FK_8D93D6491C9DA55` FOREIGN KEY (`nationality_id`) REFERENCES `nationality` (`id`),
  ADD CONSTRAINT `FK_8D93D64959027487` FOREIGN KEY (`theme_id`) REFERENCES `theme` (`id`),
  ADD CONSTRAINT `FK_8D93D649FA846217` FOREIGN KEY (`specialization_id`) REFERENCES `specialization` (`id`);

--
-- Constraints for table `user_diploma`
--
ALTER TABLE `user_diploma`
  ADD CONSTRAINT `FK_B42C975DA76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_B42C975DA99ACEB5` FOREIGN KEY (`diploma_id`) REFERENCES `diploma` (`id`);

--
-- Constraints for table `user_role`
--
ALTER TABLE `user_role`
  ADD CONSTRAINT `FK_2DE8C6A3A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_2DE8C6A3D60322AC` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`);

--
-- Constraints for table `user_status`
--
ALTER TABLE `user_status`
  ADD CONSTRAINT `FK_1E527E21CD4ADDE8` FOREIGN KEY (`associated_role_id`) REFERENCES `role` (`id`);

--
-- Constraints for table `user_status_history`
--
ALTER TABLE `user_status_history`
  ADD CONSTRAINT `FK_44EFD8976BF700BD` FOREIGN KEY (`status_id`) REFERENCES `user_status` (`id`),
  ADD CONSTRAINT `FK_44EFD897A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
