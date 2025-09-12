DROP DATABASE IF EXISTS happytails_db_normalizada;
CREATE DATABASE happytails_db_normalizada CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE happytails_db_normalizada;
-- SECCIÓN 1: ESTRUCTURA DE TABLAS (CREATE TABLES)
-- Tablas de Catálogo (Datos que no cambian a menudo)
CREATE TABLE catalogo_especies (
id INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(50) NOT NULL UNIQUE
);
CREATE TABLE catalogo_razas (
id INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(100) NOT NULL UNIQUE,
especie_id INT NOT NULL,
FOREIGN KEY (especie_id) REFERENCES catalogo_especies(id)
);
CREATE TABLE catalogo_tipos_recordatorio (
id INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(100) NOT NULL UNIQUE,
descripcion TEXT
);
-- Tablas Principales (Datos transaccionales de la aplicación)
CREATE TABLE usuarios (
id INT AUTO_INCREMENT PRIMARY KEY,
nombre_completo VARCHAR(100) NOT NULL,
email VARCHAR(100) NOT NULL UNIQUE,
contrasena_hash VARCHAR(255) NOT NULL,
fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE mascotas (
id INT AUTO_INCREMENT PRIMARY KEY,
propietario_id INT NOT NULL,
nombre VARCHAR(100) NOT NULL,
raza_id INT,
fecha_nacimiento DATE,
peso_kg DECIMAL(5, 2),
estado_vacunacion ENUM('Al día', 'Pendiente', 'No aplica') DEFAULT 'Pendiente',
url_foto VARCHAR(255),
fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (propietario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
FOREIGN KEY (raza_id) REFERENCES catalogo_razas(id)
);
CREATE TABLE historial_medico (
id INT AUTO_INCREMENT PRIMARY KEY,
mascota_id INT NOT NULL,
fecha_evento DATE NOT NULL,
tipo_evento ENUM('Cirugía', 'Diagnóstico', 'Alergia', 'Vacunación', 'Otro') NOT NULL,
descripcion TEXT NOT NULL,
documento_adjunto_url VARCHAR(255),
FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE CASCADE
);
CREATE TABLE recordatorios (
id INT AUTO_INCREMENT PRIMARY KEY,
mascota_id INT NOT NULL,
tipo_recordatorio_id INT NOT NULL,
fecha_vencimiento DATE NOT NULL,
estado ENUM('Pendiente', 'Completado') DEFAULT 'Pendiente',
notas TEXT,
FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE CASCADE,
FOREIGN KEY (tipo_recordatorio_id) REFERENCES catalogo_tipos_recordatorio(id)
);
CREATE TABLE mascotas_adopcion (
id INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
raza_id INT,
edad_aproximada_meses INT,
tamano ENUM('Pequeño', 'Mediano', 'Grande'),
descripcion TEXT NOT NULL,
url_imagen VARCHAR(255),
estado_adopcion ENUM('Disponible', 'En proceso', 'Adoptado') DEFAULT 'Disponible',
FOREIGN KEY (raza_id) REFERENCES catalogo_razas(id)
);
-- SECCIÓN 2: INSERCIÓN DE DATOS DE PRUEBA (INSERT INTO)
-- Poblar catálogos
INSERT INTO catalogo_especies (id, nombre) VALUES (1, 'Perro'), (2, 'Gato'), (3, 'Otro');
INSERT INTO catalogo_razas (id, nombre, especie_id) VALUES
(1, 'Mestizo (Perro)', 1), (2, 'Golden Retriever', 1), (3, 'Boxer', 1), (4, 'Corgi', 1),
(5, 'Mestizo (Gato)', 2), (6, 'Siamés', 2), (7, 'Persa', 2);
INSERT INTO catalogo_tipos_recordatorio (id, nombre, descripcion) VALUES
(1, 'Vacunación Anual', 'Recordatorio para la vacuna polivalente anual.'),
(2, 'Desparasitación Interna', 'Recordatorio para la pastilla de desparasitación interna, usualmente trimestral.'),
(3, 'Protección Pulgas y Garrapatas', 'Recordatorio para la pipeta o pastilla mensual contra parásitos externos.');
-- Crear un usuario de prueba
-- NOTA: En una aplicación real, este hash se generaría con bcrypt.
INSERT INTO usuarios (id, nombre_completo, email, contrasena_hash) VALUES
(1, 'Andrés Celi', 'admin@happytails.ai', 'un_hash_de_prueba_123');
-- Crear mascotas de prueba para el usuario 'Andrés Celi' (ID = 1)
INSERT INTO mascotas (id, propietario_id, nombre, raza_id, fecha_nacimiento, peso_kg, estado_vacunacion) VALUES
(1, 1, 'Max', 2, '2022-01-15', 32.5, 'Al día'),
(2, 1, 'Luna', 6, '2023-05-20', 5.2, 'Pendiente'),
(3, 1, 'Rocky', 4, '2021-11-01', 14.8, 'Al día');
-- Añadir un registro en el historial médico para 'Max' (mascota ID = 1)
INSERT INTO historial_medico (mascota_id, fecha_evento, tipo_evento, descripcion) VALUES
(1, '2023-10-25', 'Diagnóstico', 'Alergia leve al polen. Se recomendó antihistamínico estacional.');
-- Añadir recordatorios pendientes para las mascotas
INSERT INTO recordatorios (mascota_id, tipo_recordatorio_id, fecha_vencimiento, estado) VALUES
(1, 2, '2025-09-15', 'Pendiente'), -- Desparasitación para Max
(2, 1, '2025-10-05', 'Pendiente'), -- Vacunación para Luna
(3, 3, '2025-09-20', 'Pendiente'); -- Protección pulgas para Rocky
-- Añadir mascotas para el módulo de adopción
INSERT INTO mascotas_adopcion (nombre, raza_id, edad_aproximada_meses, tamano, descripcion, estado_adopcion) VALUES
('Nube', 5, 8, 'Pequeño', 'Una gatita mestiza muy juguetona y cariñosa. Encontrada en un parque, busca un hogar definitivo.', 'Disponible'),
('Thor', 1, 24, 'Grande', 'Un perro mestizo con mucha energía. Ideal para una familia activa que disfrute de paseos largos.', 'Disponible');