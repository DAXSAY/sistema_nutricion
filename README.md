# 🧬 NutriClínica Pro — Sistema Modular de Nutrición Clínica, Bioimpedancia, Entrenamiento y Visión Local

Sistema integral de evaluación nutricional, análisis de balanza de bioimpedancia, prescripción de entrenamiento físico (ACSM/ISSN), base bromatológica de macronutrientes (CENAN/USDA), guía antropométrica de 10 medidas de porciones y reconocimiento local de alimentos por imagen (`HTML5 Canvas`), con persistencia en MySQL (`sistema_nutricion`).

## 🚀 Características Principales
- **Evaluación Modular en 5 Pasos:** Perfil biológico, balanza de bioimpedancia (Peso, IMC, % Grasa, % Masa Muscular, Grasa Visceral, Edad Metabólica y % Agua Corporal con semáforo clínico: *Bajo, Óptimo, Precaución, Alerta*), 12 protocolos de patologías médicas, auditoría de hábitos y escáner local de fotos.
- **Escáner de Fotos Local (`HTML5 Canvas` + Detección por Regiones):** Segmentación cromático-textural (HSV + Gradiente Sobel + Brillo Lipídico) para detectar ingredientes reales en el plato y estimar gramos y macronutrientes.
- **Plan Generado Modular + Exportación a PDF y WhatsApp:** Menú diario personalizable (en gramos, medidas caseras o porciones de mano), rutina de entrenamiento FITT-VP, fundamento científico interno para el asesor y envío rápido por WhatsApp.
- **Base de Datos MySQL (`sistema_nutricion`):** Esquema completo en `sistema_nutricion.sql` y sincronización automática mediante `server.js`.

## 🛠️ Ejecución Local
1. Ejecuta `ABRIR_SISTEMA.bat` o inicia el servidor con Node.js:
   ```bash
   node server.js
   ```
2. Abre en tu navegador: `http://localhost:8080`
