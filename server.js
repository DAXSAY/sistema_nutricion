const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8080;
const DATA_DIR = path.join(__dirname, 'data');
const DB_JSON_PATH = path.join(DATA_DIR, 'nutriclinica_db.json');
const SQL_EXPORT_PATH = path.join(DATA_DIR, 'pacientes_registrados_mysql.sql');
const BASE_SQL_PATH = path.join(__dirname, 'sistema_nutricion.sql');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DB_JSON_PATH)) {
  fs.writeFileSync(DB_JSON_PATH, JSON.stringify([], null, 2), 'utf8');
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.sql': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

function sqlEscape(val) {
  if (val === null || val === undefined || val === '') return 'NULL';
  if (typeof val === 'number' && !Number.isNaN(val)) return String(val);
  return "'" + String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

function syncMySQLDumpFile(records) {
  try {
    const baseSql = fs.existsSync(BASE_SQL_PATH) ? fs.readFileSync(BASE_SQL_PATH, 'utf8') : '';
    let dynamicSql = `\n-- ============================================================================\n`;
    dynamicSql += `-- REGISTROS COMPLETOS DE CLIENTES, BIOIMPEDANCIA, PLANES Y FOTOS (${new Date().toISOString()})\n`;
    dynamicSql += `-- ============================================================================\n\n`;

    records.forEach((rec, index) => {
      const f = rec.formData || {};
      const m = rec.metrics || {};
      const b = m.bioimpedance || {};
      const c = rec.clinicalSynthesis || {};
      const t = rec.trainingPlan || {};
      const clientId = index + 1;
      const pathologiesStr = Array.isArray(f.pathologies) ? f.pathologies.join(',') : '';

      // 1. Insertar Cliente
      dynamicSql += `INSERT INTO clientes (id, codigo_cliente, nombre_completo, telefono_whatsapp, categoria_biologica, edad, talla_cm, factor_actividad, tipo_entrenamiento, dias_entrenamiento_sem, objetivo_principal, modo_medicion, comidas_actuales, comidas_objetivo, dias_plan_semana, fecha_proximo_control, patologias_codigos, laboratorio_clinico, notas_medicacion_alergias, descripcion_dieta_actual)\nVALUES (${clientId}, ${sqlEscape(f.id || 'cli_' + clientId)}, ${sqlEscape(f.name)}, ${sqlEscape(f.phoneWhatsapp)}, ${sqlEscape(f.category || 'varon')}, ${Number(f.age) || 35}, ${Number(f.height) || 170}, ${Number(f.activity) || 1.375}, ${sqlEscape(f.trainingType || 'fuerza_cardio_mixto')}, ${Number(f.trainingDays) || 3}, ${sqlEscape(f.goal || 'control_metabolico')}, ${sqlEscape(f.portionMode || 'gramos')}, ${sqlEscape(f.mealsCurrent || '3')}, ${Number(f.mealsTarget) || 4}, ${Number(f.daysPerWeek) || 7}, ${sqlEscape(f.nextCheckDate || null)}, ${sqlEscape(pathologiesStr)}, ${sqlEscape(f.clinicalLabs)}, ${sqlEscape(f.clinicalNotes)}, ${sqlEscape(f.dietDescription)})\nON DUPLICATE KEY UPDATE nombre_completo=VALUES(nombre_completo), telefono_whatsapp=VALUES(telefono_whatsapp), talla_cm=VALUES(talla_cm), objetivo_principal=VALUES(objetivo_principal);\n\n`;

      // 2. Insertar Evaluación de Bioimpedancia
      dynamicSql += `INSERT INTO evaluaciones_bioimpedancia (cliente_id, peso_kg, perimetro_cintura_cm, imc, estado_imc, porcentaje_grasa, masa_grasa_kg, masa_libre_grasa_kg, estado_grasa, porcentaje_masa_muscular, masa_muscular_kg, estado_masa_muscular, grasa_visceral, estado_grasa_visceral, edad_metabolica, diferencia_edad_metabolica, estado_edad_metabolica, porcentaje_agua_corporal, tmb_kcal, gasto_energetico_total_kcal, calorias_objetivo_kcal, proteina_objetivo_g, carbohidratos_objetivo_g, grasas_objetivo_g, fibra_objetivo_g, cuota_palmas_proteina, cuota_punos_verdura, cuota_manos_carbohidrato, cuota_pulgares_grasa, observacion_bioimpedancia)\nVALUES (${clientId}, ${Number(f.weight) || 75}, ${f.waistCm ? Number(f.waistCm) : 'NULL'}, ${Number(m.bmi) || 25}, ${sqlEscape(b.bmiStateCode || 'OPTIMO')}, ${Number(b.bodyFatPct) || 22}, ${Number(b.fatMassKg) || 18}, ${Number(b.leanBodyMassKg) || 57}, ${sqlEscape(b.fatStateCode || 'OPTIMO')}, ${Number(b.muscleMassPct) || 34}, ${Number(b.muscleMassKg) || 26}, ${sqlEscape(b.muscleStateCode || 'OPTIMO')}, ${Number(b.visceralFat) || 8}, ${sqlEscape(b.visceralStateCode || 'OPTIMO')}, ${Number(b.metabolicAge) || 35}, ${Number(b.metabolicAgeDiff) || 0}, ${sqlEscape(b.metabolicStateCode || 'OPTIMO')}, ${Number(b.bodyWaterPct) || 55}, ${Number(m.bmr) || 1600}, ${Number(m.tdee) || 2100}, ${Number(m.targetCalories) || 1800}, ${Number(m.macros?.proteinG) || 130}, ${Number(m.macros?.carbsG) || 180}, ${Number(m.macros?.fatG) || 60}, ${Number(m.macros?.fiberG) || 35}, ${Number(m.handTotals?.palmas) || 5}, ${Number(m.handTotals?.punos) || 5}, ${Number(m.handTotals?.manosCarbs) || 3}, ${Number(m.handTotals?.pulgares) || 3}, ${sqlEscape(b.clinicalSummary || '')});\n\n`;

      // 3. Insertar Plan Nutricional y de Entrenamiento
      dynamicSql += `INSERT INTO planes_nutricionales_clientes (cliente_id, titulo_programa_entreno, resumen_fitt_entreno, menu_semanal_json, rutina_entrenamiento_json, directrices_patologias_json, alimentos_permitidos_json, alimentos_prohibidos_json)\nVALUES (${clientId}, ${sqlEscape(t.programTitle || '')}, ${sqlEscape(t.fittSummary || '')}, ${sqlEscape(JSON.stringify(rec.weeklyMenu || []))}, ${sqlEscape(JSON.stringify(t.sessions || []))}, ${sqlEscape(JSON.stringify(c.guidelines || []))}, ${sqlEscape(JSON.stringify(c.allowed || []))}, ${sqlEscape(JSON.stringify(c.restricted || []))});\n\n`;

      // 4. Insertar Fotos Evaluadas
      if (Array.isArray(f.photos) && f.photos.length > 0) {
        f.photos.forEach((ph) => {
          const ps = ph.pixelStats || {};
          const nt = ph.nutritionTotals || {};
          dynamicSql += `INSERT INTO fotos_evaluadas_clientes (cliente_id, tipo_comida, plato_reconocido, precision_reconocimiento_pct, area_vegetales_pct, area_carbohidratos_pct, area_proteina_pct, proteina_detectada_g, carbohidratos_detectados_g, grasas_detectadas_g, calorias_detectadas_kcal, ingredientes_detectados_json, diagnostico_visual)\nVALUES (${clientId}, ${sqlEscape(ph.mealType || 'Almuerzo')}, ${sqlEscape(ph.archetypeName || 'Plato Analizado')}, ${Number(ph.confidencePct) || 92}, ${Number(ps.vegPct) || 15}, ${Number(ps.carbPct) || 50}, ${Number(ps.protPct) || 35}, ${Number(nt.prot) || 35}, ${Number(nt.carb) || 65}, ${Number(nt.fat) || 15}, ${Number(nt.kcal) || 550}, ${sqlEscape(JSON.stringify(ph.detectedItems || []))}, ${sqlEscape(ph.observedPortion || '')});\n\n`;
        });
      }
    });

    fs.writeFileSync(SQL_EXPORT_PATH, baseSql + dynamicSql, 'utf8');
  } catch (err) {
    console.error('Error sincronizando archivo SQL:', err.message);
  }
}

function readRecords() {
  try {
    const raw = fs.readFileSync(DB_JSON_PATH, 'utf8');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
}

function writeRecords(records) {
  fs.writeFileSync(DB_JSON_PATH, JSON.stringify(records, null, 2), 'utf8');
  syncMySQLDumpFile(records);
}

const server = http.createServer((req, res) => {
  const parsedUrl = req.url.split('?')[0];

  if (parsedUrl === '/api/patients' && req.method === 'GET') {
    const records = readRecords();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, patients: records }));
    return;
  }

  if (parsedUrl === '/api/patients' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const record = JSON.parse(body);
        let records = readRecords();
        records = records.filter((r) => r.formData?.id !== record.formData?.id);
        records.unshift(record);
        writeRecords(records);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true, count: records.length, sqlPath: 'data/pacientes_registrados_mysql.sql' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  if (parsedUrl.startsWith('/api/patients/') && req.method === 'DELETE') {
    const id = decodeURIComponent(parsedUrl.replace('/api/patients/', ''));
    let records = readRecords();
    records = records.filter((r) => r.formData?.id !== id);
    writeRecords(records);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, count: records.length }));
    return;
  }

  if (parsedUrl === '/api/export-sql' && req.method === 'GET') {
    const records = readRecords();
    syncMySQLDumpFile(records);
    const content = fs.existsSync(SQL_EXPORT_PATH)
      ? fs.readFileSync(SQL_EXPORT_PATH, 'utf8')
      : fs.readFileSync(BASE_SQL_PATH, 'utf8');
    res.writeHead(200, {
      'Content-Type': 'application/sql; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sistema_nutricion.sql"'
    });
    res.end(content);
    return;
  }

  const safePath = parsedUrl === '/' ? '/index.html' : parsedUrl;
  const filePath = path.join(__dirname, safePath);
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`;
  syncMySQLDumpFile(readRecords());
  console.log(`NutriClinica Pro v4.0 corriendo en ${url}`);
  exec(`start "" "${url}"`);
});
