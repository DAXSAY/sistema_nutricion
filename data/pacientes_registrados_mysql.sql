-- ============================================================================
-- SISTEMA_NUTRICION — BASE DE DATOS CLÍNICA, BIOIMPEDANCIA, MACROS Y ENTRENAMIENTO
-- Motor: MySQL 8.0+ / MariaDB 10.6+ (Codificación UTF8MB4)
-- Respaldo Científico: CENAN/INS, USDA FoodData Central, ISSN, ACSM, ADA, AHA, EASL, KDOQI
-- ============================================================================

CREATE DATABASE IF NOT EXISTS sistema_nutricion
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sistema_nutricion;

-- ----------------------------------------------------------------------------
-- 1. TABLA DE CLIENTES / ALUMNOS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo_cliente VARCHAR(40) NOT NULL UNIQUE,
  nombre_completo VARCHAR(150) NOT NULL,
  categoria_biologica ENUM('varon', 'mujer', 'adolescente_m', 'adolescente_f', 'adulto_mayor_m', 'adulto_mayor_f') NOT NULL DEFAULT 'varon',
  edad INT NOT NULL,
  talla_cm DECIMAL(5,2) NOT NULL,
  factor_actividad DECIMAL(4,3) NOT NULL DEFAULT 1.375,
  tipo_entrenamiento VARCHAR(60) DEFAULT 'fuerza_cardio_mixto',
  dias_entrenamiento_sem INT DEFAULT 3,
  objetivo_principal ENUM('control_metabolico', 'perdida_grasa', 'recomposición_corporal', 'mantenimiento', 'aumento_masa') NOT NULL DEFAULT 'control_metabolico',
  modo_medicion ENUM('mano_puro', 'mano_mixto', 'gramos') NOT NULL DEFAULT 'mano_puro',
  comidas_actuales VARCHAR(30) DEFAULT '3',
  comidas_objetivo INT NOT NULL DEFAULT 4,
  dias_plan_semana INT NOT NULL DEFAULT 7,
  laboratorio_clinico TEXT,
  notas_medicacion_alergias TEXT,
  descripcion_dieta_actual TEXT,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. TABLA DE EVALUACIONES DE BALANZA DE BIOIMPEDANCIA (BIA)
-- Registra peso, % grasa, % masa muscular, IMC, grasa visceral, edad metabólica y estados
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evaluaciones_bioimpedancia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  fecha_medicion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  peso_kg DECIMAL(5,2) NOT NULL,
  imc DECIMAL(4,1) NOT NULL,
  estado_imc ENUM('BAJO', 'OPTIMO', 'PRECAUCION', 'ALERTA') NOT NULL,
  porcentaje_grasa DECIMAL(4,1) NOT NULL,
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
  observacion_bioimpedancia TEXT,
  CONSTRAINT fk_bia_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. CATÁLOGO DE PARÁMETROS DE BIOIMPEDANCIA (RANGOS CLÍNICOS TANITA / OMRON / OMS)
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
('MASA_MUSCULAR_PCT', 'M', 40, 59, '%', 33.0, 33.1, 39.1, 39.2, 55.0, 29.5, 'Alerta: Masa muscular baja (<33.1%)', 'Masa muscular óptima (33.1% - 39.1%)', 'Masa muscular alta / Atlética (>39.2%)', 'Déficit muscular severo (<29.5%)', 'Janssen et al. / Omron Healthcare'),
('MASA_MUSCULAR_PCT', 'M', 60, 99, '%', 32.8, 32.9, 38.9, 39.0, 55.0, 29.0, 'Alerta: Sarcopenia / Pérdida muscular (<32.9%)', 'Masa muscular preservada óptima (32.9% - 38.9%)', 'Masa muscular superior (>39.0%)', 'Sarcopenia clínica (<29.0%)', 'EWGSOP2 / Omron Healthcare'),
('MASA_MUSCULAR_PCT', 'F', 18, 39, '%', 24.2, 24.3, 30.3, 30.4, 48.0, 21.5, 'Alerta: Masa muscular baja (<24.3%)', 'Masa muscular esquelética óptima (24.3% - 30.3%)', 'Masa muscular alta / Atlética (>30.4%)', 'Déficit muscular severo (<21.5%)', 'Janssen et al. / Omron Healthcare'),
('MASA_MUSCULAR_PCT', 'F', 40, 59, '%', 24.0, 24.1, 30.1, 30.2, 48.0, 21.0, 'Alerta: Masa muscular baja (<24.1%)', 'Masa muscular óptima (24.1% - 30.1%)', 'Masa muscular alta / Atlética (>30.2%)', 'Déficit muscular severo (<21.0%)', 'Janssen et al. / Omron Healthcare'),
('MASA_MUSCULAR_PCT', 'F', 60, 99, '%', 23.8, 23.9, 29.9, 30.0, 48.0, 20.5, 'Alerta: Sarcopenia femenina (<23.9%)', 'Masa muscular preservada óptima (23.9% - 29.9%)', 'Masa muscular superior (>30.0%)', 'Sarcopenia clínica (<20.5%)', 'EWGSOP2 / Omron Healthcare'),
('GRASA_VISCERAL', 'AMBOS', 12, 99, 'nivel', 0.9, 1.0, 9.0, 10.0, 14.0, 15.0, 'Nivel basal mínimo', 'Óptimo: Grasa intraabdominal saludable (Nivel 1 a 9)', 'Precaución: Grasa visceral elevada (Nivel 10 a 14) · Iniciar déficit y cardio', 'Alerta Crítica: Grasa visceral muy alta (>=15, >100 cm2 VFA) · Alto riesgo de resistencia a la insulina, hígado graso y evento cardiovascular', 'Tanita / Omron / Després et al. Circulation'),
('EDAD_METABOLICA_DIFF', 'AMBOS', 12, 99, 'años_diff', -15.0, -12.0, 0.0, 1.0, 5.0, 6.0, 'Tasa metabólica acelerada / Atlética', 'Óptimo: Edad metabólica igual o menor a la edad cronológica', 'Precaución: Edad metabólica +1 a +5 años sobre edad real', 'Alerta: Envejecimiento metabólico (+6 o más años sobre edad real) por baja masa muscular y exceso adiposo', 'Tanita BMR Normative Database');

-- ----------------------------------------------------------------------------
-- 4. CATÁLOGO DE ALIMENTOS Y TABLERO DE MACROS (POR 100g, 20g Y MEDIDA DE MANO)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS catalogo_alimentos_macros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(40) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  categoria ENUM('proteina_magra', 'pescado_marisco', 'huevo_lacteo', 'carbohidrato_complejo', 'legumbre_menestra', 'grasa_saludable', 'verdura_fibrosa', 'fruta') NOT NULL,
  estado_preparacion VARCHAR(60) NOT NULL DEFAULT 'Cocido / Porción comestible',
  -- Valores por 100 gramos
  kcal_100g DECIMAL(6,1) NOT NULL,
  proteina_100g DECIMAL(5,1) NOT NULL,
  carbohidratos_100g DECIMAL(5,1) NOT NULL,
  grasas_100g DECIMAL(5,1) NOT NULL,
  fibra_100g DECIMAL(5,1) NOT NULL DEFAULT 0.0,
  -- Valores por 20 gramos (escala fraccionada)
  kcal_20g DECIMAL(5,1) NOT NULL,
  proteina_20g DECIMAL(4,1) NOT NULL,
  carbohidratos_20g DECIMAL(4,1) NOT NULL,
  grasas_20g DECIMAL(4,1) NOT NULL,
  -- Equivalencia en Medida de Mano y Casera
  tipo_medida_mano ENUM('PALMA', 'PUNO', 'MANO_AHUECADA', 'PULGAR') NOT NULL,
  descripcion_porcion_mano VARCHAR(140) NOT NULL,
  gramos_por_porcion_mano INT NOT NULL,
  indice_glucemico ENUM('BAJO', 'MEDIO', 'ALTO', 'NULO') DEFAULT 'NULO',
  destacado_clinico VARCHAR(220),
  fuente_datos VARCHAR(60) DEFAULT 'CENAN INS / USDA'
) ENGINE=InnoDB;

INSERT INTO catalogo_alimentos_macros
(codigo, nombre, categoria, estado_preparacion, kcal_100g, proteina_100g, carbohidratos_100g, grasas_100g, fibra_100g, kcal_20g, proteina_20g, carbohidratos_20g, grasas_20g, tipo_medida_mano, descripcion_porcion_mano, gramos_por_porcion_mano, indice_glucemico, destacado_clinico)
VALUES
('pollo_pechuga', 'Pechuga de Pollo (sin piel)', 'proteina_magra', 'Cocida a la plancha/hervida', 165.0, 31.0, 0.0, 3.6, 0.0, 33.0, 6.2, 0.0, 0.7, 'PALMA', '1 Palma de la mano (filete mediano)', 120, 'NULO', 'Alta densidad de leucina (2.5g/100g) para síntesis proteica muscular'),
('pavo_pechuga', 'Pechuga de Pavo / Pavita', 'proteina_magra', 'Cocida a la plancha', 145.0, 29.0, 0.0, 2.2, 0.0, 29.0, 5.8, 0.0, 0.4, 'PALMA', '1 Palma de la mano', 120, 'NULO', 'Baja en grasa saturada y rica en triptófano y selenio'),
('res_lomo_magro', 'Carne de Res Magra (Lomo / Bistec)', 'proteina_magra', 'Cocida a la plancha', 195.0, 28.5, 0.0, 8.2, 0.0, 39.0, 5.7, 0.0, 1.6, 'PALMA', '1 Palma de la mano', 115, 'NULO', 'Hierro hemo de alta biodisponibilidad, zinc, creatina y vitamina B12'),
('sangrecita_pollo', 'Sangrecita de Pollo', 'proteina_magra', 'Cocida con hierbabuena', 79.0, 16.0, 1.2, 0.4, 0.0, 15.8, 3.2, 0.2, 0.1, 'PALMA', '1 Palma equivalente (4 cucharadas llenas)', 100, 'NULO', '29.5 mg de hierro hemo por 100g: tratamiento #1 contra anemia ferropénica'),
('bonito_pescado', 'Pescado Bonito (Carne oscura)', 'pescado_marisco', 'Cocido al horno/plancha', 138.0, 24.5, 0.0, 4.1, 0.0, 27.6, 4.9, 0.0, 0.8, 'PALMA', '1 Palma de la mano (filete)', 125, 'NULO', 'Rico en ácidos grasos EPA y DHA (Omega-3 cardioprotector y antiinflamatorio)'),
('caballa_jurel', 'Pescado Caballa / Jurel', 'pescado_marisco', 'Cocido al vapor/sudado', 168.0, 22.0, 0.0, 8.5, 0.0, 33.6, 4.4, 0.0, 1.7, 'PALMA', '1 Palma de la mano', 120, 'NULO', 'Reduce triglicéridos séricos y mejora sensibilidad a la insulina'),
('merluza_tilapia', 'Pescado Blanco (Merluza / Tilapia / Lenguado)', 'pescado_marisco', 'Cocido al vapor/plancha', 112.0, 23.5, 0.0, 1.6, 0.0, 22.4, 4.7, 0.0, 0.3, 'PALMA', '1 Palma y media (filete ligero)', 140, 'NULO', 'Digestión ultrarrápida, ideal en cenas, gastritis e hiperuricemia leve'),
('trucha_salmon', 'Trucha Rosada / Salmón', 'pescado_marisco', 'Horneado o a la plancha', 175.0, 23.8, 0.0, 8.4, 0.0, 35.0, 4.8, 0.0, 1.7, 'PALMA', '1 Palma de la mano', 125, 'NULO', 'Aporta astaxantina antioxidante, vitamina D y Omega-3'),
('atun_agua', 'Atún en Conserva al Agua (escurrido)', 'pescado_marisco', 'Escurrido y lavado', 116.0, 25.5, 0.0, 1.0, 0.0, 23.2, 5.1, 0.0, 0.2, 'PALMA', '1 Lata escurrida = 1 Palma', 120, 'NULO', 'Práctico y alto en proteína pura; enjuagar en colador si hay hipertensión'),
('huevo_entero', 'Huevo de Gallina Entero', 'huevo_lacteo', 'Sancochado / Revuelto sin aceite', 155.0, 12.6, 1.1, 10.6, 0.0, 31.0, 2.5, 0.2, 2.1, 'PALMA', '2 Huevos enteros = 1 Palma (~110g)', 110, 'NULO', 'Proteína de valor biológico 100, rica en colina para el hígado y cerebro'),
('claras_huevo', 'Claras de Huevo', 'huevo_lacteo', 'Cocidas en tortilla/revueltas', 52.0, 11.0, 0.7, 0.2, 0.0, 10.4, 2.2, 0.1, 0.0, 'PALMA', '4 Claras de huevo = 1 Palma (~140g)', 140, 'NULO', '100% albúmina libre de grasa y colesterol, cero purinas'),
('yogur_griego', 'Yogur Griego Natural (Sin azúcar)', 'huevo_lacteo', 'Listo para consumo', 97.0, 10.0, 3.8, 4.2, 0.0, 19.4, 2.0, 0.8, 0.8, 'PALMA', '3/4 a 1 Taza = 1 Palma equivalente', 180, 'BAJO', 'Probióticos para microbiota intestinal y saciedad prolongada'),
('queso_fresco_light', 'Queso Fresco Pasteurizado Bajo en Sal', 'huevo_lacteo', 'Porción fresca', 198.0, 17.5, 2.5, 13.2, 0.0, 39.6, 3.5, 0.5, 2.6, 'PALMA', '2 Tajadas medianas = 1/2 a 1 Palma', 80, 'BAJO', 'Rico en calcio biodisponible y caseína de absorción lenta'),
('quinua_cocida', 'Quinua Graneada / Sancochada', 'carbohidrato_complejo', 'Cocida en agua', 120.0, 4.4, 21.3, 1.9, 2.8, 24.0, 0.9, 4.3, 0.4, 'MANO_AHUECADA', '1 Mano ahuecada (1/2 a 2/3 taza)', 115, 'BAJO', 'Pseudocereal con los 9 aminoácidos esenciales y bajo índice glucémico (IG 53)'),
('avena_hojuelas', 'Avena Entera en Hojuelas (Cruda)', 'carbohidrato_complejo', 'Peso en seco / hojuelas', 389.0, 13.5, 66.3, 6.9, 10.6, 77.8, 2.7, 13.3, 1.4, 'MANO_AHUECADA', '4 Cucharadas soperas (40g en crudo = 1 Mano cocida)', 40, 'BAJO', 'Rica en beta-glucanos que reducen colesterol LDL y glucosa postprandial'),
('arroz_integral', 'Arroz Integral Cocido', 'carbohidrato_complejo', 'Cocido sin aceite', 112.0, 2.6, 23.5, 0.9, 1.8, 22.4, 0.5, 4.7, 0.2, 'MANO_AHUECADA', '1 Mano ahuecada (1/2 taza)', 110, 'MEDIO', 'Conserva salvado y magnesio; menor respuesta insulínica que el arroz blanco'),
('arroz_blanco', 'Arroz Blanco Cocido', 'carbohidrato_complejo', 'Cocido graneado', 130.0, 2.7, 28.2, 0.3, 0.4, 26.0, 0.5, 5.6, 0.1, 'MANO_AHUECADA', '1 Mano ahuecada (no exceder)', 110, 'ALTO', 'Rápida absorción; acompañar siempre con 2 puños de verdura y proteína'),
('camote_cocido', 'Camote Amarillo / Morado Sancochado', 'carbohidrato_complejo', 'Cocido con cáscara', 96.0, 1.5, 22.4, 0.2, 3.1, 19.2, 0.3, 4.5, 0.0, 'MANO_AHUECADA', '1 Unidad pequeña del tamaño de tu mano ahuecada', 120, 'BAJO', 'Rico en antocianinas, betacarotenos y almidón resistente si se enfría'),
('papa_sancochada', 'Papa Blanca / Amarilla Sancochada', 'carbohidrato_complejo', 'Hervida con cáscara', 86.0, 1.9, 19.6, 0.1, 2.0, 17.2, 0.4, 3.9, 0.0, 'MANO_AHUECADA', '1 Unidad mediana que quepa en la mano ahuecada', 125, 'MEDIO', 'Aporta alto índice de saciedad por caloría y potasio intracelular'),
('choclo_cocido', 'Choclo Desgranado Sancochado', 'carbohidrato_complejo', 'Hervido en agua', 115.0, 3.4, 24.5, 1.3, 2.7, 23.0, 0.7, 4.9, 0.3, 'MANO_AHUECADA', '1 Mano ahuecada (2/3 de taza)', 110, 'BAJO', 'Fibra insoluble excelente para tránsito intestinal y saciedad'),
('pan_integral', 'Pan 100% Integral de Grano Entero', 'carbohidrato_complejo', 'Horneado', 247.0, 10.5, 41.5, 3.4, 6.8, 49.4, 2.1, 8.3, 0.7, 'MANO_AHUECADA', '1 a 2 Rebanadas = 1 Mano ahuecada', 50, 'MEDIO', 'Preferir masa madre o grano entero real sin jarabe de maíz'),
('lentejas_cocidas', 'Lentejas Cocidas (Menestra)', 'legumbre_menestra', 'Hervidas sin embutidos', 116.0, 9.0, 20.1, 0.4, 7.9, 23.2, 1.8, 4.0, 0.1, 'MANO_AHUECADA', '1 Mano ahuecada (3/4 de taza)', 130, 'BAJO', 'Efecto "segunda comida": estabiliza la glucosa hasta por 6 horas'),
('garbanzos_cocidos', 'Garbanzos / Frejoles Cocidos', 'legumbre_menestra', 'Hervidos', 148.0, 8.6, 25.0, 2.1, 7.6, 29.6, 1.7, 5.0, 0.4, 'MANO_AHUECADA', '1 Mano ahuecada (3/4 de taza)', 125, 'BAJO', 'Proteína vegetal + fibra soluble que secuestra sales biliares y baja LDL'),
('palta_aguacate', 'Palta / Aguacate Fuerte', 'grasa_saludable', 'Fresco natural', 160.0, 2.0, 8.5, 14.7, 6.7, 32.0, 0.4, 1.7, 2.9, 'PULGAR', '1 Pulgar grande = 1/4 de unidad mediana', 50, 'BAJO', 'Ácido oleico monoinsaturado, potasio y fitoesteroles cardioprotectores'),
('aceite_oliva', 'Aceite de Oliva Extra Virgen', 'grasa_saludable', 'En crudo sobre ensalada', 884.0, 0.0, 0.0, 100.0, 0.0, 176.8, 0.0, 0.0, 20.0, 'PULGAR', '1 Pulgar = 1 Cucharada sopera (12g)', 12, 'NULO', 'Polifenoles antiinflamatorios (oleocantal) que protegen el endotelio vascular'),
('frutos_secos', 'Almendras / Nueces / Pecanas Naturales', 'grasa_saludable', 'Tostadas/naturales sin sal', 605.0, 19.5, 18.0, 54.0, 10.5, 121.0, 3.9, 3.6, 10.8, 'PULGAR', '1 Pulgar / centro de palma (8-10 unidades)', 20, 'BAJO', 'Magnesio, arginina, vitamina E y ácidos grasos esenciales'),
('semillas_chia_linaza', 'Semillas de Chía / Linaza', 'grasa_saludable', 'Hidratadas o molidas', 486.0, 16.5, 42.1, 30.7, 34.4, 97.2, 3.3, 8.4, 6.1, 'PULGAR', '1 Pulgar = 1.5 Cucharadas (15g)', 15, 'BAJO', '34g de fibra mucilaginosa por 100g y ácido alfa-linolénico (ALA)'),
('brocoli_verduras', 'Brócoli, Espinaca, Vainitas y Ensalada Verde', 'verdura_fibrosa', 'Al vapor al dente o frescas', 34.0, 2.8, 6.6, 0.4, 3.0, 6.8, 0.6, 1.3, 0.1, 'PUNO', '1 Puño cerrado = 1 Taza llena', 130, 'BAJO', 'Sulforafano hepatoprotector, folatos, potasio, magnesio y malla de fibra'),
('manzana_fresas', 'Fruta de Bajo IG (Manzana Verde / Fresas / Pera)', 'fruta', 'Fruta entera con cáscara', 52.0, 0.4, 13.8, 0.2, 2.6, 10.4, 0.1, 2.8, 0.0, 'MANO_AHUECADA', '1 Mano ahuecada = 1 Unidad mediana o 1 taza de fresas', 130, 'BAJO', 'Pectina prebiótica y quercetina; nunca licuar ni colar');

-- ----------------------------------------------------------------------------
-- 5. CATÁLOGO DE PLANES DE ENTRENAMIENTO CIENTÍFICOS (ACSM / NSCA / ISSN)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS catalogo_planes_entrenamiento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre_programa VARCHAR(140) NOT NULL,
  objetivo_principal VARCHAR(60) NOT NULL,
  frecuencia_semanal VARCHAR(60) NOT NULL,
  intensidad_rpe VARCHAR(60) NOT NULL,
  duracion_sesion VARCHAR(50) NOT NULL,
  fisiologia_mecanismo TEXT NOT NULL,
  estructura_semanal JSON NOT NULL,
  precauciones_patologias TEXT NOT NULL,
  referencia_cientifica VARCHAR(160) NOT NULL
) ENGINE=InnoDB;

-- ============================================================================
-- REGISTROS DE ALUMNOS / PACIENTES Y EVALUACIONES DE BIOIMPEDANCIA (2026-11-18T01:57:48.980Z)
-- ============================================================================

