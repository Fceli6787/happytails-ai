-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 18, 2025 at 05:47 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `happytails_db_normalizada`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(255) NOT NULL,
  `meta` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `adopciones`
--

CREATE TABLE `adopciones` (
  `id` int(11) NOT NULL,
  `propietario_id` int(11) DEFAULT NULL,
  `estado` enum('Disponible','Adoptado') NOT NULL DEFAULT 'Disponible',
  `nombre` varchar(100) NOT NULL,
  `especie` enum('Perro','Gato','Ave','Otro') NOT NULL,
  `raza` varchar(100) DEFAULT NULL,
  `edad_anios` int(11) DEFAULT NULL,
  `tamano` enum('Pequeño','Mediano','Grande') DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `pais` varchar(100) DEFAULT NULL,
  `disponible_mes` varchar(50) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `cualidades` text DEFAULT NULL,
  `refugio` varchar(100) DEFAULT NULL,
  `match_score` int(11) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `adopciones`
--

INSERT INTO `adopciones` (`id`, `propietario_id`, `estado`, `nombre`, `especie`, `raza`, `edad_anios`, `tamano`, `ciudad`, `pais`, `disponible_mes`, `descripcion`, `cualidades`, `refugio`, `match_score`, `imagen`, `fecha_registro`) VALUES
(6, NULL, 'Disponible', 'juan', 'Gato', 'negro', 4, 'Pequeño', 'Bogotá, D.C.', 'España', NULL, 'es lindo ', NULL, 'Patas felices', NULL, '/uploads/adopciones/adopcion-a8b83e3f-b35b-4f8b-9b1b-48c965026dac.png', '2025-11-13 06:49:07'),
(7, NULL, 'Disponible', 'camilo', 'Ave', 'aguila', 2, 'Mediano', 'MIAMI', 'eeuu', NULL, 'es linda ', NULL, 'nose', NULL, '/uploads/adopciones/adopcion-657d3c43-db6b-4f47-89c3-be49088dd9d8.png', '2025-11-13 06:57:15');

-- --------------------------------------------------------

--
-- Table structure for table `catalogo_especies`
--

CREATE TABLE `catalogo_especies` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `catalogo_especies`
--

INSERT INTO `catalogo_especies` (`id`, `nombre`) VALUES
(2, 'Gato'),
(3, 'Otro'),
(1, 'Perro');

-- --------------------------------------------------------

--
-- Table structure for table `catalogo_razas`
--

CREATE TABLE `catalogo_razas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `especie_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `catalogo_razas`
--

INSERT INTO `catalogo_razas` (`id`, `nombre`, `especie_id`) VALUES
(1, 'Mestizo (Perro)', 1),
(2, 'Golden Retriever', 1),
(3, 'Boxer', 1),
(4, 'Corgi', 1),
(5, 'Mestizo (Gato)', 2),
(6, 'Siamés', 2),
(7, 'Persa', 2);

-- --------------------------------------------------------

--
-- Table structure for table `catalogo_tipos_recordatorio`
--

CREATE TABLE `catalogo_tipos_recordatorio` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `catalogo_tipos_recordatorio`
--

INSERT INTO `catalogo_tipos_recordatorio` (`id`, `nombre`, `descripcion`) VALUES
(1, 'Vacunación Anual', 'Recordatorio para la vacuna polivalente anual.'),
(2, 'Desparasitación Interna', 'Recordatorio para la pastilla de desparasitación interna, usualmente trimestral.'),
(3, 'Protección Pulgas y Garrapatas', 'Recordatorio para la pipeta o pastilla mensual contra parásitos externos.');

-- --------------------------------------------------------

--
-- Table structure for table `historial_medico`
--

CREATE TABLE `historial_medico` (
  `id` int(11) NOT NULL,
  `mascota_id` int(11) NOT NULL,
  `fecha_evento` date NOT NULL,
  `tipo_evento` enum('Cirugía','Diagnóstico','Alergia','Vacunación','Otro') NOT NULL,
  `descripcion` text NOT NULL,
  `documento_adjunto_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `logs`
--

CREATE TABLE `logs` (
  `id` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `accion` varchar(255) DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mascotas`
--

CREATE TABLE `mascotas` (
  `id` int(11) NOT NULL,
  `propietario_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `especie` varchar(100) DEFAULT NULL,
  `raza_id` int(11) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `peso_kg` decimal(5,2) DEFAULT NULL,
  `estado_vacunacion` enum('Al día','Pendiente','No aplica') DEFAULT 'No aplica',
  `foto_url` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `edad_anios` int(11) DEFAULT NULL,
  `edad_meses` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mascotas`
--

INSERT INTO `mascotas` (`id`, `propietario_id`, `nombre`, `especie`, `raza_id`, `fecha_nacimiento`, `descripcion`, `peso_kg`, `estado_vacunacion`, `foto_url`, `fecha_creacion`, `edad_anios`, `edad_meses`) VALUES
(4, 1, 'Zeus', 'perro', NULL, '2022-06-14', 'Le gustan los patos', 16.00, 'Pendiente', '/uploads/mascotas/mascota-dc13477a-14af-4abf-8ed8-28b74b6cd11c.png', '2025-10-10 21:10:17', 3, 4),
(5, 1, 'Cristian', 'perro', NULL, '2005-09-27', 'Le gusta acosar a las perritas en la calle, y ya ha estado en la perrera 5 veces', 25.00, 'Pendiente', '/uploads/mascotas/mascota-dc817b6a-daff-480f-a447-49d72f9a4a57.png', '2025-10-11 03:27:43', 20, NULL),
(6, 1, 'Axel ', 'perro', NULL, '2003-11-30', 'Le cuesta comunicarse con otros perros y es muy agresivo', 48.00, 'Pendiente', '/uploads/mascotas/mascota-e6e78068-5dfa-4d0c-b018-476a186f9ad6.png', '2025-10-11 03:35:10', 21, 11),
(7, 1, 'Emanuel', 'gato', NULL, '2006-05-15', 'Un gato muy rencoroso', 37.70, 'Pendiente', '/uploads/mascotas/mascota-69d80bc4-1ee8-4116-9c69-5c48e8efc192.png', '2025-10-11 03:55:52', 19, 5),
(8, 1, 'John', 'gato', NULL, '2005-05-11', 'Requiere ser castrado', 11.90, 'Pendiente', '/uploads/mascotas/mascota-c12f43e0-c69d-4a4d-96a1-7cdf140ea358.png', '2025-10-11 04:05:48', 20, 5),
(9, 1, 'Mauricio', 'perro', NULL, '2004-03-18', 'No le gusta hacer nada en todo el dia', 27.90, 'Pendiente', '/uploads/mascotas/mascota-9792ab87-7744-4f21-9f38-e27fd1e85c80.png', '2025-10-11 04:14:38', 21, NULL),
(10, 1, 'Juan David', 'gato', NULL, '2006-03-29', 'Le gusta juzgar todo a su alrededor pero es bueno cuando quiere', 7.50, 'Pendiente', '/uploads/mascotas/mascota-057eb337-9d06-42a9-aa41-e38ab795557d.png', '2025-10-11 04:22:48', 19, 5),
(11, 1, 'Camila', 'gato', NULL, '2005-04-14', 'Le gusta el Jazz', 6.00, 'Pendiente', '/uploads/mascotas/mascota-6159c73b-f91b-4e24-a732-b9d55f1afdec.png', '2025-10-11 04:33:10', 20, 6),
(12, 1, 'TOBY', 'perro', NULL, NULL, NULL, 25.00, 'Pendiente', '/uploads/mascotas/mascota-4e3f31ff-3c19-4345-b5a9-b72c021ea9b8.png', '2025-10-16 19:45:33', 6, 4);

-- --------------------------------------------------------

--
-- Table structure for table `mascotas_backup`
--

CREATE TABLE `mascotas_backup` (
  `id` int(11) NOT NULL DEFAULT 0,
  `propietario_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `raza_id` int(11) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `peso_kg` decimal(5,2) DEFAULT NULL,
  `estado_vacunacion` enum('Al día','Pendiente','No aplica') DEFAULT 'Pendiente',
  `foto_url` varchar(255) DEFAULT NULL,
  `url_foto` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `firebase_uid` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mascotas_backup`
--

INSERT INTO `mascotas_backup` (`id`, `propietario_id`, `nombre`, `raza_id`, `fecha_nacimiento`, `peso_kg`, `estado_vacunacion`, `foto_url`, `url_foto`, `fecha_creacion`, `firebase_uid`) VALUES
(1, 1, 'Max', 2, '2022-01-15', 32.50, 'Al día', NULL, NULL, '2025-09-01 18:45:27', NULL),
(2, 1, 'Luna', 6, '2023-05-20', 5.20, 'Pendiente', NULL, NULL, '2025-09-01 18:45:27', NULL),
(3, 1, 'Rocky', 4, '2021-11-01', 14.80, 'Al día', NULL, NULL, '2025-09-01 18:45:27', NULL),
(4, 1, 'Zeus', NULL, '2022-06-14', NULL, 'Pendiente', '/uploads/mascotas/mascota-dc13477a-14af-4abf-8ed8-28b74b6cd11c.png', NULL, '2025-10-10 21:10:17', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `mensaje` varchar(255) NOT NULL,
  `leido` tinyint(1) DEFAULT 0,
  `fecha` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notificaciones`
--

INSERT INTO `notificaciones` (`id`, `id_usuario`, `mensaje`, `leido`, `fecha`) VALUES
(24, 1, 'Inicio de sesión a las 10:42 p. m.', 0, '2025-11-12 22:42:29'),
(25, 1, 'Inicio de sesión a las 10:42 p. m.', 0, '2025-11-12 22:42:29'),
(26, 1, 'Inicio de sesión a las 10:46 p. m.', 0, '2025-11-12 22:47:00'),
(27, 1, 'Inicio de sesión a las 10:46 p. m.', 0, '2025-11-12 22:47:00'),
(28, 1, 'Inicio de sesión a las 10:48 p. m.', 0, '2025-11-12 22:48:10'),
(29, 1, 'Inicio de sesión a las 10:48 p. m.', 0, '2025-11-12 22:48:10'),
(30, 1, 'Inicio de sesión a las 11:27 p. m.', 0, '2025-11-12 23:27:29'),
(31, 1, 'Inicio de sesión a las 11:27 p. m.', 0, '2025-11-12 23:27:29'),
(32, 1, 'Inicio de sesión a las 11:42 p. m.', 0, '2025-11-12 23:42:49'),
(33, 1, 'Inicio de sesión a las 11:42 p. m.', 0, '2025-11-12 23:42:49'),
(34, 1, 'Inicio de sesión a las 11:43 p. m.', 0, '2025-11-12 23:43:20'),
(35, 1, 'Inicio de sesión a las 11:43 p. m.', 0, '2025-11-12 23:43:20'),
(36, 1, 'Inicio de sesión a las 11:51 p. m.', 0, '2025-11-12 23:51:23'),
(37, 1, 'Inicio de sesión a las 11:51 p. m.', 0, '2025-11-12 23:51:23'),
(38, 1, 'Inicio de sesión a las 11:58 p. m.', 0, '2025-11-12 23:58:21'),
(39, 1, 'Inicio de sesión a las 11:58 p. m.', 0, '2025-11-12 23:58:21'),
(40, 1, 'Inicio de sesión a las 12:02 a. m.', 0, '2025-11-13 00:02:10'),
(41, 1, 'Inicio de sesión a las 12:02 a. m.', 0, '2025-11-13 00:02:10'),
(42, 1, 'Inicio de sesión a las 12:09 a. m.', 0, '2025-11-13 00:09:27'),
(43, 1, 'Inicio de sesión a las 12:09 a. m.', 0, '2025-11-13 00:09:32'),
(44, 1, 'Inicio de sesión a las 12:10 a. m.', 0, '2025-11-13 00:10:31'),
(45, 1, 'Inicio de sesión a las 12:19 a. m.', 0, '2025-11-13 00:19:50'),
(46, 1, 'Inicio de sesión a las 12:19 a. m.', 0, '2025-11-13 00:19:50'),
(47, 1, 'Inicio de sesión a las 12:27 a. m.', 0, '2025-11-13 00:27:23'),
(48, 1, 'Inicio de sesión a las 12:27 a. m.', 0, '2025-11-13 00:27:23'),
(49, 1, 'Inicio de sesión a las 12:29 a. m.', 0, '2025-11-13 00:29:59'),
(50, 1, 'Inicio de sesión a las 12:29 a. m.', 0, '2025-11-13 00:29:59'),
(51, 1, 'Inicio de sesión a las 12:30 a. m.', 0, '2025-11-13 00:30:31'),
(52, 1, 'Inicio de sesión a las 12:30 a. m.', 0, '2025-11-13 00:30:31'),
(53, 1, 'Inicio de sesión a las 12:30 a. m.', 0, '2025-11-13 00:30:35'),
(54, 1, 'Inicio de sesión a las 12:30 a. m.', 0, '2025-11-13 00:30:35'),
(55, 1, 'Inicio de sesión a las 12:36 a. m.', 0, '2025-11-13 00:36:22'),
(56, 1, 'Inicio de sesión a las 12:36 a. m.', 0, '2025-11-13 00:36:22'),
(57, 1, 'Inicio de sesión a las 12:36 a. m.', 0, '2025-11-13 00:36:38'),
(58, 1, 'Inicio de sesión a las 12:36 a. m.', 0, '2025-11-13 00:36:46'),
(59, 1, 'Inicio de sesión a las 12:36 a. m.', 0, '2025-11-13 00:36:46'),
(60, 1, 'Inicio de sesión a las 12:57 a. m.', 0, '2025-11-13 00:57:40'),
(61, 1, 'Inicio de sesión a las 12:57 a. m.', 0, '2025-11-13 00:57:40'),
(62, 1, 'Inicio de sesión a las 01:19 a. m.', 0, '2025-11-13 01:19:50'),
(63, 1, 'Inicio de sesión a las 01:19 a. m.', 0, '2025-11-13 01:19:50'),
(64, 1, 'Inicio de sesión a las 01:27 a. m.', 0, '2025-11-13 01:27:37'),
(65, 1, 'Inicio de sesión a las 01:27 a. m.', 0, '2025-11-13 01:27:37'),
(66, 1, 'Inicio de sesión a las 01:33 a. m.', 0, '2025-11-13 01:33:28'),
(67, 1, 'Inicio de sesión a las 01:33 a. m.', 0, '2025-11-13 01:33:28'),
(68, 1, 'Inicio de sesión a las 01:35 a. m.', 0, '2025-11-13 01:35:52'),
(69, 1, 'Inicio de sesión a las 01:35 a. m.', 0, '2025-11-13 01:35:52'),
(70, 1, 'Inicio de sesión a las 01:45 a. m.', 0, '2025-11-13 01:45:11'),
(71, 1, 'Inicio de sesión a las 01:45 a. m.', 0, '2025-11-13 01:45:11'),
(72, 1, 'Inicio de sesión a las 08:23 p. m.', 0, '2025-11-17 20:23:41'),
(73, 1, 'Inicio de sesión a las 08:23 p. m.', 0, '2025-11-17 20:23:41'),
(74, 1, 'Inicio de sesión a las 08:25 p. m.', 0, '2025-11-17 20:25:01'),
(75, 1, 'Inicio de sesión a las 08:25 p. m.', 0, '2025-11-17 20:25:01'),
(76, 1, 'Inicio de sesión a las 08:25 p. m.', 0, '2025-11-17 20:25:30'),
(77, 1, 'Inicio de sesión a las 08:25 p. m.', 0, '2025-11-17 20:25:30'),
(78, 1, 'Inicio de sesión a las 08:27 p. m.', 0, '2025-11-17 20:27:03'),
(79, 1, 'Inicio de sesión a las 08:27 p. m.', 0, '2025-11-17 20:27:03'),
(80, 1, 'Inicio de sesión a las 08:27 p. m.', 0, '2025-11-17 20:27:10'),
(81, 1, 'Inicio de sesión a las 08:27 p. m.', 0, '2025-11-17 20:27:10'),
(82, 1, 'Inicio de sesión a las 08:30 p. m.', 0, '2025-11-17 20:30:37'),
(83, 1, 'Inicio de sesión a las 08:30 p. m.', 0, '2025-11-17 20:30:37'),
(84, 1, 'Inicio de sesión a las 08:31 p. m.', 0, '2025-11-17 20:31:32'),
(85, 1, 'Inicio de sesión a las 09:03 p. m.', 0, '2025-11-17 21:03:13'),
(86, 1, 'Inicio de sesión a las 09:03 p. m.', 0, '2025-11-17 21:03:13'),
(87, 1, 'Inicio de sesión a las 09:03 p. m.', 0, '2025-11-17 21:03:27'),
(88, 1, 'Inicio de sesión a las 09:03 p. m.', 0, '2025-11-17 21:03:27');

-- --------------------------------------------------------

--
-- Table structure for table `recordatorios`
--

CREATE TABLE `recordatorios` (
  `id` int(11) NOT NULL,
  `mascota_id` int(11) NOT NULL,
  `tipo_recordatorio_id` int(11) NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `estado` enum('Pendiente','Completado') DEFAULT 'Pendiente',
  `notas` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `recordatorios`
--

INSERT INTO `recordatorios` (`id`, `mascota_id`, `tipo_recordatorio_id`, `fecha_vencimiento`, `estado`, `notas`) VALUES
(8, 12, 1, '2025-10-16', 'Pendiente', 'Vacuna'),
(10, 12, 3, '2025-10-17', 'Pendiente', 'toca estar temprano');

-- --------------------------------------------------------

--
-- Table structure for table `solicitudes_adopcion`
--

CREATE TABLE `solicitudes_adopcion` (
  `id` int(11) NOT NULL,
  `adopcion_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `fecha_solicitud` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tipo_recordatorio`
--

CREATE TABLE `tipo_recordatorio` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tipo_recordatorio`
--

INSERT INTO `tipo_recordatorio` (`id`, `nombre`) VALUES
(1, 'Vacunación'),
(2, 'Desparasitación'),
(3, 'Cita médica'),
(4, 'Control dental');

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre_completo` varchar(100) NOT NULL,
  `apellidos` varchar(100) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `tipo_documento` enum('T.I','C.C','C.E','Pasaporte') DEFAULT NULL,
  `cedula` varchar(20) DEFAULT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `rol` enum('user','admin','superadmin') NOT NULL DEFAULT 'user',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre_completo`, `apellidos`, `username`, `email`, `telefono`, `tipo_documento`, `cedula`, `contrasena_hash`, `rol`, `fecha_creacion`) VALUES
(1, 'Andrés Celi', 'Celi', NULL, 'admin@happytails.ai', NULL, NULL, NULL, '$2a$10$DAjdkSf4aHj6/C7UXGA.7eqeNF0sCMlcUFZoZDmHcZETCLCdzPRZu', 'user', '2025-09-01 18:45:27'),
(2, 'Super', 'Administrador', NULL, 'admin@Sadministrador.com', NULL, NULL, NULL, '$2a$10$DAjdkSf4aHj6/C7UXGA.7eqeNF0sCMlcUFZoZDmHcZETCLCdzPRZu', 'superadmin', '2025-11-13 17:42:19');

-- --------------------------------------------------------

--
-- Table structure for table `usuarios_mfa_config`
--

CREATE TABLE `usuarios_mfa_config` (
  `id_usuario` int(11) NOT NULL,
  `mfa_secret` varchar(255) NOT NULL,
  `mfa_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `mfa_verified_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `adopciones`
--
ALTER TABLE `adopciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_adopcion_propietario` (`propietario_id`);

--
-- Indexes for table `catalogo_especies`
--
ALTER TABLE `catalogo_especies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indexes for table `catalogo_razas`
--
ALTER TABLE `catalogo_razas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD KEY `especie_id` (`especie_id`);

--
-- Indexes for table `catalogo_tipos_recordatorio`
--
ALTER TABLE `catalogo_tipos_recordatorio`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indexes for table `historial_medico`
--
ALTER TABLE `historial_medico`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`);

--
-- Indexes for table `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mascotas`
--
ALTER TABLE `mascotas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `propietario_id` (`propietario_id`),
  ADD KEY `raza_id` (`raza_id`);

--
-- Indexes for table `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `recordatorios`
--
ALTER TABLE `recordatorios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `tipo_recordatorio_id` (`tipo_recordatorio_id`);

--
-- Indexes for table `solicitudes_adopcion`
--
ALTER TABLE `solicitudes_adopcion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_solicitud_adopcion` (`adopcion_id`),
  ADD KEY `fk_solicitud_usuario` (`usuario_id`);

--
-- Indexes for table `tipo_recordatorio`
--
ALTER TABLE `tipo_recordatorio`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `usuarios_mfa_config`
--
ALTER TABLE `usuarios_mfa_config`
  ADD PRIMARY KEY (`id_usuario`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `adopciones`
--
ALTER TABLE `adopciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `catalogo_especies`
--
ALTER TABLE `catalogo_especies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `catalogo_razas`
--
ALTER TABLE `catalogo_razas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `catalogo_tipos_recordatorio`
--
ALTER TABLE `catalogo_tipos_recordatorio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `historial_medico`
--
ALTER TABLE `historial_medico`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `logs`
--
ALTER TABLE `logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mascotas`
--
ALTER TABLE `mascotas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT for table `recordatorios`
--
ALTER TABLE `recordatorios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `solicitudes_adopcion`
--
ALTER TABLE `solicitudes_adopcion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tipo_recordatorio`
--
ALTER TABLE `tipo_recordatorio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `adopciones`
--
ALTER TABLE `adopciones`
  ADD CONSTRAINT `fk_adopcion_propietario` FOREIGN KEY (`propietario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `catalogo_razas`
--
ALTER TABLE `catalogo_razas`
  ADD CONSTRAINT `catalogo_razas_ibfk_1` FOREIGN KEY (`especie_id`) REFERENCES `catalogo_especies` (`id`);

--
-- Constraints for table `historial_medico`
--
ALTER TABLE `historial_medico`
  ADD CONSTRAINT `historial_medico_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascotas` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mascotas`
--
ALTER TABLE `mascotas`
  ADD CONSTRAINT `mascotas_ibfk_1` FOREIGN KEY (`propietario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mascotas_ibfk_2` FOREIGN KEY (`raza_id`) REFERENCES `catalogo_razas` (`id`);

--
-- Constraints for table `recordatorios`
--
ALTER TABLE `recordatorios`
  ADD CONSTRAINT `recordatorios_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascotas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `recordatorios_ibfk_2` FOREIGN KEY (`tipo_recordatorio_id`) REFERENCES `catalogo_tipos_recordatorio` (`id`);

--
-- Constraints for table `solicitudes_adopcion`
--
ALTER TABLE `solicitudes_adopcion`
  ADD CONSTRAINT `fk_solicitud_adopcion` FOREIGN KEY (`adopcion_id`) REFERENCES `adopciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_solicitud_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `usuarios_mfa_config`
--
ALTER TABLE `usuarios_mfa_config`
  ADD CONSTRAINT `fk_mfa_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
