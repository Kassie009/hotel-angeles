CREATE DATABASE IF NOT EXISTS `prestige_inn` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `prestige_inn`;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `room_id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `habitacion` varchar(100) NOT NULL,
  `check_in` date NOT NULL,
  `check_out` date NOT NULL,
  `noches` int NOT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `iva` decimal(10,2) DEFAULT NULL,
  `descuento` decimal(10,2) DEFAULT 0,
  `reembolso` decimal(10,2) DEFAULT 0,
  `total` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','confirmada','checkin_realizado','checkout_realizado','cancelada') DEFAULT 'pendiente',
  `fecha_reserva` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `capacidad` int NOT NULL,
  `descripcion` text,
  `imagen` varchar(255) DEFAULT NULL,
  `amenities` json DEFAULT NULL,
  `estado` enum('disponible','ocupada','mantenimiento','limpieza') DEFAULT 'disponible',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('admin','recepcion') NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `telefono` varchar(20) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

-- ============================================================
-- DATOS INICIALES (sistema limpio)
-- Solo usuarios para iniciar sesión + catálogo de habitaciones.
-- Las reservaciones quedan vacías (se eliminan los datos de prueba).
-- ============================================================

INSERT INTO `rooms` (`id`, `nombre`, `precio`, `capacidad`, `descripcion`, `imagen`, `amenities`, `estado`) VALUES
(1, 'Habitación Sencilla', 850.00, 2, '1 cama Queen, A/C, WiFi, agua caliente, mini refrigerador', '/assets/sencilla.jpg', '["WiFi", "A/C", "TV", "Agua caliente", "Refrigerador"]', 'disponible'),
(2, 'Habitación Sencilla con Cocineta', 950.00, 2, '1 cama Queen con cocineta, A/C, WiFi, agua caliente, mini refrigerador', '/assets/sencilla2.jpg', '["WiFi", "A/C", "TV", "Agua caliente", "Refrigerador", "Cocineta"]', 'disponible'),
(3, 'Habitación Doble', 1100.00, 4, '2 camas Queen, A/C, WiFi, agua caliente, mini refrigerador', '/assets/doble.jpg', '["WiFi", "A/C", "TV", "Agua caliente", "Refrigerador"]', 'disponible'),
(4, 'Habitación Doble con Cocineta', 1300.00, 4, '2 camas Queen con cocineta, A/C, WiFi, agua caliente, mini refrigerador', '/assets/doble2.jpg', '["WiFi", "A/C", "TV", "Agua caliente", "Refrigerador", "Cocineta"]', 'disponible'),
(5, 'Familiar sin Cocineta', 1500.00, 6, '3 camas (Queen, King, Matrimoniales), A/C, WiFi, agua caliente, mini refrigerador', '/assets/familiar3.jpg', '["WiFi", "A/C", "TV", "Agua caliente", "Refrigerador"]', 'disponible'),
(6, 'Familiar con Cocineta', 1850.00, 6, '3 camas con cocineta, A/C, WiFi, agua caliente, mini refrigerador', '/assets/familiar.jpg', '["WiFi", "A/C", "TV", "Agua caliente", "Refrigerador", "Cocineta"]', 'disponible'),
(7, 'Familiar Extra Grande', 1800.00, 6, '2 camas Queen + 1 litera, con cocineta, A/C, WiFi, agua caliente, mini refrigerador', '/assets/familiar.jpg', '["WiFi", "A/C", "TV", "Agua caliente", "Refrigerador", "Cocineta", "Litera"]', 'disponible'),
(8, 'Doble con Litera y Cocineta', 1900.00, 7, '2 camas Queen + litera, con cocineta, A/C, WiFi, agua caliente, mini refrigerador', '/assets/doble3.jpg', '["WiFi", "A/C", "TV", "Agua caliente", "Refrigerador", "Cocineta", "Litera"]', 'disponible');

INSERT INTO `users` (`id`, `nombre`, `email`, `password_hash`, `rol`, `activo`) VALUES
(1, 'Administrador', 'admin@hotelangeles.com', '$2b$10$UW/txKZzBHQL9xOIUj.2i.PnlfvAS.mFpuE8iTGEKPvSB3imIItUa', 'admin', 1),
(2, 'Recepcionista', 'recepcion@hotelangeles.com', '$2b$10$xKBFIpTSDzTNvc3WTpJu2OwzIfYSgNNqUajtVylefsDNdNX3c3IVW', 'recepcion', 1);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

