-- ============================================================================
-- BASE DE DATOS MYSQL: SISTEMA_NUTRICION (v4.0 — SIN PÉRDIDA DE DATOS)
-- Motor: MySQL 8.0+ / MariaDB 10.6+ (Codificación UTF8MB4)
-- Respaldo Científico: CENAN/INS, USDA FoodData Central, ISSN, ACSM, ADA, AHA, EASL, KDOQI
-- ============================================================================

CREATE DATABASE IF NOT EXISTS sistema_nutricion
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sistema_nutricion;

-- ----------------------------------------------------------------------------
-- 1. TABLA DE CLIENTES / ALUMNOS (Incluye WhatsApp y Fecha de Próximo Control)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo_cliente VARCHAR(40) NOT NULL UNIQUE,
  nombre_completo VARCHAR(150) NOT NULL,
  telefono_whatsapp VARCHAR(35) DEFAULT NULL,
  categoria_biologica ENUM('varon', 'mujer', 'adolescente_m', 'adolescente_f', 'adulto_mayor_m', 'adulto_mayor_f') NOT NULL DEFAULT 'varon',
  edad INT NOT NULL,
  talla_cm DECIMAL(5,2) NOT NULL,
  factor_actividad DECIMAL(4,3) NOT NULL DEFAULT 1.375,
  tipo_entrenamiento VARCHAR(60) DEFAULT 'fuerza_cardio_mixto',
  dias_entrenamiento_sem INT DEFAULT 3,
  objetivo_principal VARCHAR(50) NOT NULL DEFAULT 'control_metabolico',
  modo_medicion ENUM('mano_puro', 'mano_mixto', 'gramos') NOT NULL DEFAULT 'gramos',
  comidas_actuales VARCHAR(30) DEFAULT '3',
  comidas_objetivo INT NOT NULL DEFAULT 4,
  dias_plan_semana INT NOT NULL DEFAULT 7,
  fecha_proximo_control DATE DEFAULT NULL,
  patologias_codigos VARCHAR(255) DEFAULT NULL,
  laboratorio_clinico TEXT,
  notas_medicacion_alergias TEXT,
  descripcion_dieta_actual TEXT,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. TABLA DE EVALUACIONES DE BALANZA DE BIOIMPEDANCIA (BIA + Cintura + Masa Magra)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evaluaciones_bioimpedancia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  fecha_medicion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  peso_kg DECIMAL(5,2) NOT NULL,
  perimetro_cintura_cm DECIMAL(5,1) DEFAULT NULL,
  imc DECIMAL(4,1) NOT NULL,
  estado_imc ENUM('BAJO', 'OPTIMO', 'PRECAUCION', 'ALERTA') NOT NULL,
  porcentaje_grasa DECIMAL(4,1) NOT NULL,
  masa_grasa_kg DECIMAL(5,2) DEFAULT NULL,
  masa_libre_grasa_kg DECIMAL(5,2) DEFAULT NULL,
  estado_grasa ENUM('BAJO', 'OPTIMO', 'PRECAUCION', 'ALERTA') NOT NULL,
  porcentaje_masa_muscular DECIMAL(4,1) NOT NULL,
  masa_muscular_kg DECIMAL(5,2) DEFAULT NULL,
  estado_masa_muscular ENUM('BAJO', 'OPTIMO', 'ALTO_ATLETICO', 'ALERTA_SARCOPENIA') NOT NULL,
  grasa_visceral DECIMAL(4,1) NOT NULL,
  estado_grasa_visceral ENUM('OPTIMO', 'PRECAUCION', 'ALERTA') NOT NULL,
  edad_metabolica INT NOT NULL,
  diferencia_edad_metabolica INT NOT NULL,
  estado_edad_metabolica ENUM('OPTIMO', 'PRECAUCION', 'ALERTA') NOT NULL,
  porcentaje_agua_corporal DECIMAL(4,1) DEFAULT NULL,
  tmb_kcal INT NOT NULL,
  gasto_energetico_total_kcal INT NOT NULL,
  calorias_objetivo_kcal INT NOT NULL,
  proteina_objetivo_g INT NOT NULL,
  carbohidratos_objetivo_g INT NOT NULL,
  grasas_objetivo_g INT NOT NULL,
  fibra_objetivo_g INT DEFAULT 35,
  cuota_palmas_proteina DECIMAL(3,1) DEFAULT 5.0,
  cuota_punos_verdura DECIMAL(3,1) DEFAULT 5.0,
  cuota_manos_carbohidrato DECIMAL(3,1) DEFAULT 3.0,
  cuota_pulgares_grasa DECIMAL(3,1) DEFAULT 3.0,
  observacion_bioimpedancia TEXT,
  CONSTRAINT fk_bia_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. TABLA DE PLANES NUTRICIONALES Y DE ENTRENAMIENTO ASIGNADOS AL CLIENTE
-- Guarda el menú semanal completo, rutina de ejercicios y directrices para PDF/WhatsApp
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS planes_nutricionales_clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  titulo_programa_entreno VARCHAR(160),
  resumen_fitt_entreno TEXT,
  menu_semanal_json JSON NOT NULL,
  rutina_entrenamiento_json JSON NOT NULL,
  directrices_patologias_json JSON NOT NULL,
  alimentos_permitidos_json JSON NOT NULL,
  alimentos_prohibidos_json JSON NOT NULL,
  CONSTRAINT fk_plan_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 4. TABLA DE FOTOS DE PLATOS ESCANEADAS DEL CLIENTE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fotos_evaluadas_clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  tipo_comida VARCHAR(40) NOT NULL DEFAULT 'Almuerzo',
  plato_reconocido VARCHAR(160) NOT NULL,
  precision_reconocimiento_pct INT DEFAULT 92,
  area_vegetales_pct INT NOT NULL,
  area_carbohidratos_pct INT NOT NULL,
  area_proteina_pct INT NOT NULL,
  proteina_detectada_g DECIMAL(5,1) NOT NULL,
  carbohidratos_detectados_g DECIMAL(5,1) NOT NULL,
  grasas_detectadas_g DECIMAL(5,1) NOT NULL,
  calorias_detectadas_kcal INT NOT NULL,
  ingredientes_detectados_json JSON NOT NULL,
  diagnostico_visual TEXT,
  fecha_escaneo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_foto_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 5. CATÁLOGO DE PARÁMETROS DE BIOIMPEDANCIA (RANGOS CLÍNICOS TANITA / OMRON / OMS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS catalogo_parametros_bioimpedancia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parametro VARCHAR(60) NOT NULL,
  sexo ENUM('M', 'F', 'AMBOS') NOT NULL,
  edad_min INT NOT NULL DEFAULT 12,
  edad_max INT NOT NULL DEFAULT 99,
  unidad VARCHAR(20) NOT NULL,
  rango_bajo_max DECIMAL(5,2) DEFAULT NULL,
  rango_optimo_min DECIMAL(5,2) NOT NULL,
  rango_optimo_max DECIMAL(5,2) NOT NULL,
  rango_precaucion_min DECIMAL(5,2) NOT NULL,
  rango_precaucion_max DECIMAL(5,2) NOT NULL,
  rango_alerta_min DECIMAL(5,2) NOT NULL,
  interpretacion_bajo VARCHAR(255),
  interpretacion_optimo VARCHAR(255),
  interpretacion_precaucion VARCHAR(255),
  interpretacion_alerta VARCHAR(255),
  fuente_cientifica VARCHAR(120)
) ENGINE=InnoDB;

INSERT INTO catalogo_parametros_bioimpedancia
(parametro, sexo, edad_min, edad_max, unidad, rango_bajo_max, rango_optimo_min, rango_optimo_max, rango_precaucion_min, rango_precaucion_max, rango_alerta_min, interpretacion_bajo, interpretacion_optimo, interpretacion_precaucion, interpretacion_alerta, fuente_cientifica)
VALUES
('IMC', 'AMBOS', 18, 64, 'kg/m2', 18.4, 18.5, 24.9, 25.0, 29.9, 30.0, 'Bajo peso / Reserva energética insuficiente', 'Peso saludable / Relación talla-peso óptima', 'Sobrepeso / Evaluar proporción músculo vs grasa', 'Alerta: Obesidad clínica (Grado I-III)', 'OMS / NIH Clinical Guidelines'),
('PORCENTAJE_GRASA', 'M', 18, 39, '%', 7.9, 8.0, 19.9, 20.0, 24.9, 25.0, 'Grasa esencial baja (<8%)', 'Rango óptimo saludable y atlético (8% - 19.9%)', 'Sobrepeso graso moderado (20% - 24.9%)', 'Alerta: Obesidad adiposa (>=25%) y riesgo cardiometabólico', 'Gallagher et al. AJCN / Tanita-Omron'),
('PORCENTAJE_GRASA', 'M', 40, 59, '%', 10.9, 11.0, 21.9, 22.0, 27.9, 28.0, 'Grasa baja (<11%)', 'Rango óptimo para adulto 40-59 años (11% - 21.9%)', 'Exceso adiposo moderado (22% - 27.9%)', 'Alerta: Obesidad adiposa (>=28%)', 'Gallagher et al. AJCN / Tanita-Omron'),
('PORCENTAJE_GRASA', 'M', 60, 99, '%', 12.9, 13.0, 24.9, 25.0, 29.9, 30.0, 'Grasa baja (<13%)', 'Rango óptimo adulto mayor (13% - 24.9%)', 'Exceso adiposo moderado (25% - 29.9%)', 'Alerta: Obesidad sarcopénica / adiposa (>=30%)', 'Gallagher et al. AJCN / EWGSOP2'),
('PORCENTAJE_GRASA', 'F', 18, 39, '%', 20.9, 21.0, 32.9, 33.0, 38.9, 39.0, 'Grasa baja (<21%, riesgo amenorrea si <15%)', 'Rango óptimo fisiológico femenino (21% - 32.9%)', 'Sobrepeso graso moderado (33% - 38.9%)', 'Alerta: Obesidad adiposa (>=39%)', 'Gallagher et al. AJCN / Tanita-Omron'),
('PORCENTAJE_GRASA', 'F', 40, 59, '%', 22.9, 23.0, 33.9, 34.0, 39.9, 40.0, 'Grasa baja (<23%)', 'Rango óptimo mujer 40-59 años (23% - 33.9%)', 'Exceso adiposo moderado (34% - 39.9%)', 'Alerta: Obesidad adiposa (>=40%)', 'Gallagher et al. AJCN / Tanita-Omron'),
('PORCENTAJE_GRASA', 'F', 60, 99, '%', 23.9, 24.0, 35.9, 36.0, 41.9, 42.0, 'Grasa baja (<24%)', 'Rango óptimo mujer mayor (24% - 35.9%)', 'Exceso adiposo moderado (36% - 41.9%)', 'Alerta: Obesidad adiposa (>=42%)', 'Gallagher et al. AJCN / EWGSOP2'),
('MASA_MUSCULAR_PCT', 'M', 18, 39, '%', 33.2, 33.3, 39.3, 39.4, 55.0, 30.0, 'Alerta: Masa muscular baja / Riesgo de sarcopenia (<33.3%)', 'Masa muscular esquelética óptima (33.3% - 39.3%)', 'Masa muscular alta / Atlética (>39.4%)', 'Déficit muscular severo (<30%)', 'Janssen et al. / Omron Healthcare'),
('MASA_MUSCULAR_PCT', 'F', 18, 39, '%', 24.2, 24.3, 30.3, 30.4, 48.0, 21.5, 'Alerta: Masa muscular baja (<24.3%)', 'Masa muscular esquelética óptima (24.3% - 30.3%)', 'Masa muscular alta / Atlética (>30.4%)', 'Déficit muscular severo (<21.5%)', 'Janssen et al. / Omron Healthcare'),
('GRASA_VISCERAL', 'AMBOS', 12, 99, 'nivel', 0.9, 1.0, 9.0, 10.0, 14.0, 15.0, 'Nivel basal mínimo', 'Óptimo: Grasa intraabdominal saludable (Nivel 1 a 9)', 'Precaución: Grasa visceral elevada (Nivel 10 a 14)', 'Alerta Crítica: Grasa visceral muy alta (>=15, >100 cm2 VFA)', 'Tanita / Omron / Després et al. Circulation'),
('EDAD_METABOLICA_DIFF', 'AMBOS', 12, 99, 'años_diff', -15.0, -12.0, 0.0, 1.0, 5.0, 6.0, 'Tasa metabólica acelerada / Atlética', 'Óptimo: Edad metabólica igual o menor a la edad cronológica', 'Precaución: Edad metabólica +1 a +5 años sobre edad real', 'Alerta: Envejecimiento metabólico (+6 o más años sobre edad real)', 'Tanita BMR Normative Database');

-- ----------------------------------------------------------------------------
-- 6. CATÁLOGO DE ALIMENTOS Y TABLERO DE MACROS (POR 100g, 20g Y MEDIDA DE MANO)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS catalogo_alimentos_macros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(40) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  categoria VARCHAR(40) NOT NULL,
  estado_preparacion VARCHAR(60) NOT NULL DEFAULT 'Cocido / Porción comestible',
  kcal_100g DECIMAL(6,1) NOT NULL,
  proteina_100g DECIMAL(5,1) NOT NULL,
  carbohidratos_100g DECIMAL(5,1) NOT NULL,
  grasas_100g DECIMAL(5,1) NOT NULL,
  fibra_100g DECIMAL(5,1) NOT NULL DEFAULT 0.0,
  kcal_20g DECIMAL(5,1) NOT NULL,
  proteina_20g DECIMAL(4,1) NOT NULL,
  carbohidratos_20g DECIMAL(4,1) NOT NULL,
  grasas_20g DECIMAL(4,1) NOT NULL,
  tipo_medida_mano VARCHAR(30) NOT NULL,
  descripcion_porcion_mano VARCHAR(140) NOT NULL,
  gramos_por_porcion_mano INT NOT NULL,
  indice_glucemico VARCHAR(20) DEFAULT 'NULO',
  destacado_clinico VARCHAR(220),
  fuente_datos VARCHAR(60) DEFAULT 'CENAN INS / USDA'
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 7. CATÁLOGO DE PATRONES VISUALES DE PLATOS (140 PLATOS ENTRENADOS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS catalogo_patrones_visuales_platos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo_patron VARCHAR(60) NOT NULL UNIQUE,
  nombre_plato VARCHAR(160) NOT NULL,
  tipo_comida VARCHAR(30) DEFAULT 'Almuerzo',
  pct_vegetales INT NOT NULL,
  pct_almidones_blancos INT NOT NULL,
  pct_dorados_fritura INT NOT NULL,
  pct_proteina_oscura INT NOT NULL,
  indice_brillo_aceite DECIMAL(5,2) NOT NULL,
  alimentos_detectados_json JSON NOT NULL,
  diagnostico_clinico VARCHAR(255) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
