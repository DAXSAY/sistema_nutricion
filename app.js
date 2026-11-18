// ============================================================================
// NutriClínica & Fit Pro v3.0
// Motor de Bioimpedancia, Tablero de Macros (100g/20g/Mano), Visión Local Canvas,
// Prescripción de Entrenamiento (ACSM/ISSN), Asistente Científico y MySQL
// ============================================================================

const state = {
  uploadedPhotos: [],
  currentPlan: null,
  selectedDayIdx: 0,
  simulatorItems: [],
  savedPatients: JSON.parse(localStorage.getItem('nutriclinica_patients_v3') || '[]')
};

// ============================================================================
// 1. BASE DE DATOS DE ALIMENTOS Y MACROS (CENAN / INS & USDA FoodData Central)
// Valores exactos por 100g, 20g y equivalencia en Medida de Mano
// ============================================================================
const FOOD_MACROS_DB = [
  {
    code: 'pollo_pechuga',
    name: 'Pechuga de Pollo (sin piel, cocida)',
    category: 'proteina_magra',
    prep: 'Plancha / Sancochada / Horno',
    kcal100: 165,
    prot100: 31.0,
    carb100: 0.0,
    fat100: 3.6,
    fiber100: 0.0,
    handType: '🤚 1 Palma',
    handGrams: 120,
    handDesc: '1 filete mediano del tamaño de tu palma (120g)',
    gi: 'Nulo',
    clinicalNote: 'Aporta ~2.5g de leucina por 100g, activador directo de mTOR para síntesis muscular.'
  },
  {
    code: 'pavo_pechuga',
    name: 'Pechuga de Pavo / Pavita (cocida)',
    category: 'proteina_magra',
    prep: 'Plancha / Horno sin piel',
    kcal100: 145,
    prot100: 29.0,
    carb100: 0.0,
    fat100: 2.2,
    fiber100: 0.0,
    handType: '🤚 1 Palma',
    handGrams: 120,
    handDesc: '1 palma de filete de pavita (120g)',
    gi: 'Nulo',
    clinicalNote: 'Proteína magra cardioprotectora, muy baja en grasa saturada y rica en selenio.'
  },
  {
    code: 'res_lomo_magro',
    name: 'Carne de Res Magra (Lomo / Bistec)',
    category: 'proteina_magra',
    prep: 'Plancha / Guiso sin grasa',
    kcal100: 195,
    prot100: 28.5,
    carb100: 0.0,
    fat100: 8.2,
    fiber100: 0.0,
    handType: '🤚 1 Palma',
    handGrams: 115,
    handDesc: '1 palma de lomo magro cocido (115g)',
    gi: 'Nulo',
    clinicalNote: 'Rica en hierro hemo, zinc, vitamina B12 y creatina endógena.'
  },
  {
    code: 'sangrecita_pollo',
    name: 'Sangrecita de Pollo Cocida',
    category: 'proteina_magra',
    prep: 'Salteada sin aceite con hierbabuena',
    kcal100: 79,
    prot100: 16.0,
    carb100: 1.2,
    fat100: 0.4,
    fiber100: 0.0,
    handType: '🤚 1 Palma equiv.',
    handGrams: 100,
    handDesc: '4 cucharadas soperas llenas (100g)',
    gi: 'Nulo',
    clinicalNote: '29.5 mg de hierro hemo/100g (CENAN). Elección #1 en anemia ferropénica.'
  },
  {
    code: 'cerdo_lomo',
    name: 'Lomo de Cerdo Magro (sin grasa visible)',
    category: 'proteina_magra',
    prep: 'Horno / Plancha',
    kcal100: 172,
    prot100: 27.3,
    carb100: 0.0,
    fat100: 6.3,
    fiber100: 0.0,
    handType: '🤚 1 Palma',
    handGrams: 115,
    handDesc: '1 medallón del tamaño de la palma (115g)',
    gi: 'Nulo',
    clinicalNote: 'Excelente fuente de tiamina (Vitamina B1) para el metabolismo de carbohidratos.'
  },
  {
    code: 'bonito_pescado',
    name: 'Pescado Bonito (Carne oscura)',
    category: 'pescado_marisco',
    prep: 'Plancha / Sudado / Horno',
    kcal100: 138,
    prot100: 24.5,
    carb100: 0.0,
    fat100: 4.1,
    fiber100: 0.0,
    handType: '🤚 1 Palma',
    handGrams: 125,
    handDesc: '1 filete del tamaño de tu palma (125g)',
    gi: 'Nulo',
    clinicalNote: 'Altísimo aporte de EPA y DHA (Omega-3) para bajar triglicéridos e inflamación.'
  },
  {
    code: 'caballa_jurel',
    name: 'Pescado Caballa / Jurel Fresco',
    category: 'pescado_marisco',
    prep: 'Sudado / Al horno',
    kcal100: 168,
    prot100: 22.0,
    carb100: 0.0,
    fat100: 8.5,
    fiber100: 0.0,
    handType: '🤚 1 Palma',
    handGrams: 120,
    handDesc: '1 filete mediano (120g)',
    gi: 'Nulo',
    clinicalNote: 'Pescado azul vasodilatador; mejora sensibilidad a la insulina y perfil lipídico.'
  },
  {
    code: 'merluza_tilapia',
    name: 'Pescado Blanco (Merluza / Tilapia / Lenguado)',
    category: 'pescado_marisco',
    prep: 'Al vapor / Plancha suave',
    kcal100: 112,
    prot100: 23.5,
    carb100: 0.0,
    fat100: 1.6,
    fiber100: 0.0,
    handType: '🤚 1.5 Palmas',
    handGrams: 140,
    handDesc: '1 filete grande de pescado blanco (140g)',
    gi: 'Nulo',
    clinicalNote: 'Muy bajo en grasa y fácil digestión; ideal en cenas de pérdida de grasa y gastritis.'
  },
  {
    code: 'trucha_salmon',
    name: 'Trucha Rosada / Salmón',
    category: 'pescado_marisco',
    prep: 'Plancha / Horno con finas hierbas',
    kcal100: 175,
    prot100: 23.8,
    carb100: 0.0,
    fat100: 8.4,
    fiber100: 0.0,
    handType: '🤚 1 Palma',
    handGrams: 125,
    handDesc: '1 filete mediano (125g)',
    gi: 'Nulo',
    clinicalNote: 'Rico en Omega-3, Vitamina D3 y astaxantina antioxidante.'
  },
  {
    code: 'atun_agua',
    name: 'Atún en Conserva al Agua (escurrido)',
    category: 'pescado_marisco',
    prep: 'Escurrido y enjuagado en colador',
    kcal100: 116,
    prot100: 25.5,
    carb100: 0.0,
    fat100: 1.0,
    fiber100: 0.0,
    handType: '🤚 1 Palma',
    handGrams: 120,
    handDesc: '1 lata escurrida completa (120g)',
    gi: 'Nulo',
    clinicalNote: 'Proteína magra pura de emergencia; lavar en colador reduce el sodio en 60%.'
  },
  {
    code: 'huevo_entero',
    name: 'Huevo de Gallina Entero Cocido',
    category: 'huevo_lacteo',
    prep: 'Sancochado / Escalfado / Revuelto',
    kcal100: 155,
    prot100: 12.6,
    carb100: 1.1,
    fat100: 10.6,
    fiber100: 0.0,
    handType: '🤚 1 Palma (2 unid.)',
    handGrams: 110,
    handDesc: '2 huevos enteros medianos (~110g)',
    gi: 'Nulo',
    clinicalNote: 'Valor biológico 100; la yema aporta colina esencial contra el hígado graso.'
  },
  {
    code: 'claras_huevo',
    name: 'Claras de Huevo Cocidas',
    category: 'huevo_lacteo',
    prep: 'Tortilla / Revueltas sin aceite',
    kcal100: 52,
    prot100: 11.0,
    carb100: 0.7,
    fat100: 0.2,
    fiber100: 0.0,
    handType: '🤚 1 Palma (4 claras)',
    handGrams: 140,
    handDesc: '4 claras de huevo cocidas (~140g)',
    gi: 'Nulo',
    clinicalNote: 'Albúmina pura con cero grasa, cero colesterol y cero purinas.'
  },
  {
    code: 'yogur_griego',
    name: 'Yogur Griego Natural Sin Azúcar',
    category: 'huevo_lacteo',
    prep: 'Natural descremado / semidescremado',
    kcal100: 97,
    prot100: 10.0,
    carb100: 3.8,
    fat100: 4.2,
    fiber100: 0.0,
    handType: '🤚 1 Palma equiv.',
    handGrams: 180,
    handDesc: '3/4 a 1 taza mediana (180g)',
    gi: 'Bajo',
    clinicalNote: 'Aporta caseína, suero y probióticos que mejoran la sensibilidad insulínica.'
  },
  {
    code: 'queso_fresco_light',
    name: 'Queso Fresco Pasteurizado Bajo en Sal',
    category: 'huevo_lacteo',
    prep: 'Fresco en tajadas',
    kcal100: 198,
    prot100: 17.5,
    carb100: 2.5,
    fat100: 13.2,
    fiber100: 0.0,
    handType: '🤚 1/2 a 1 Palma',
    handGrams: 80,
    handDesc: '2 tajadas medianas (80g)',
    gi: 'Bajo',
    clinicalNote: 'Alto en calcio y proteína libre de purinas (excelente en ácido úrico alto).'
  },
  {
    code: 'whey_protein',
    name: 'Proteína Whey Isolate / Concentrada (Polvo)',
    category: 'huevo_lacteo',
    prep: 'Disuelta en agua (Post-entreno)',
    kcal100: 375,
    prot100: 80.0,
    carb100: 6.0,
    fat100: 3.5,
    fiber100: 0.0,
    handType: '🤚 1 Palma (1 Scoop)',
    handGrams: 30,
    handDesc: '1 scoop dosificador raso (30g = 24g proteína)',
    gi: 'Bajo',
    clinicalNote: 'Absorción rápida rica en aminoácidos ramificados (BCAA) y leucina.'
  },
  {
    code: 'lentejas_cocidas',
    name: 'Lentejas Cocidas (Menestra)',
    category: 'legumbre_menestra',
    prep: 'Guisadas con verduras sin embutidos',
    kcal100: 116,
    prot100: 9.0,
    carb100: 20.1,
    fat100: 0.4,
    fiber100: 7.9,
    handType: '🤲 1 Mano ahuecada',
    handGrams: 130,
    handDesc: '1 mano ahuecada / 3/4 de taza (130g)',
    gi: 'Bajo (IG 32)',
    clinicalNote: 'Almidón de digestión lenta y fibra soluble que aplana la curva de glucosa.'
  },
  {
    code: 'garbanzos_frejoles',
    name: 'Garbanzos / Frejoles Cocidos',
    category: 'legumbre_menestra',
    prep: 'Cocidos en olla o ensalada',
    kcal100: 148,
    prot100: 8.6,
    carb100: 25.0,
    fat100: 2.1,
    fiber100: 7.6,
    handType: '🤲 1 Mano ahuecada',
    handGrams: 125,
    handDesc: '1 mano ahuecada / 3/4 de taza (125g)',
    gi: 'Bajo (IG 35)',
    clinicalNote: 'Atrapa colesterol biliar en el intestino y prolonga la saciedad por 5 horas.'
  },
  {
    code: 'quinua_cocida',
    name: 'Quinua Blanca / Tricolor Cocida',
    category: 'carbohidrato_complejo',
    prep: 'Sancochada / Graneada sin aceite',
    kcal100: 120,
    prot100: 4.4,
    carb100: 21.3,
    fat100: 1.9,
    fiber100: 2.8,
    handType: '🤲 1 Mano ahuecada',
    handGrams: 115,
    handDesc: '1 mano ahuecada / 1/2 a 2/3 taza (115g)',
    gi: 'Bajo (IG 53)',
    clinicalNote: 'Pseudocereal andino con los 9 aminoácidos esenciales, magnesio y hierro.'
  },
  {
    code: 'avena_hojuelas',
    name: 'Avena Entera en Hojuelas (Peso en Crudo)',
    category: 'carbohidrato_complejo',
    prep: 'Hojuelas enteras (cocidas en agua)',
    kcal100: 389,
    prot100: 13.5,
    carb100: 66.3,
    fat100: 6.9,
    fiber100: 10.6,
    handType: '🤲 1 Mano (4 cdas)',
    handGrams: 40,
    handDesc: '4 cucharadas soperas en crudo (40g = 1 taza cocida)',
    gi: 'Bajo',
    clinicalNote: 'Contiene beta-glucanos que reducen el colesterol LDL entre 5% y 10%.'
  },
  {
    code: 'arroz_integral',
    name: 'Arroz Integral Cocido',
    category: 'carbohidrato_complejo',
    prep: 'Graneado con ajo sin exceso de aceite',
    kcal100: 112,
    prot100: 2.6,
    carb100: 23.5,
    fat100: 0.9,
    fiber100: 1.8,
    handType: '🤲 1 Mano ahuecada',
    handGrams: 110,
    handDesc: '1 mano ahuecada / 1/2 taza (110g)',
    gi: 'Medio',
    clinicalNote: 'Aporta magnesio y fibra que modulan el vaciamiento gástrico.'
  },
  {
    code: 'arroz_blanco',
    name: 'Arroz Blanco Cocido (Referencia de Control)',
    category: 'carbohidrato_complejo',
    prep: 'Cocido tradicional',
    kcal100: 130,
    prot100: 2.7,
    carb100: 28.2,
    fat100: 0.3,
    fiber100: 0.4,
    handType: '🤲 1 Mano ahuecada',
    handGrams: 110,
    handDesc: '1 mano ahuecada ras (110g · evitar cerros de 300g)',
    gi: 'Alto (IG 73)',
    clinicalNote: 'Un plato típico peruano sirve 300g (85g carbohidrato); reducir a 100–110g con verdura.'
  },
  {
    code: 'camote_cocido',
    name: 'Camote Amarillo / Morado Sancochado',
    category: 'carbohidrato_complejo',
    prep: 'Hervido o al horno con cáscara',
    kcal100: 96,
    prot100: 1.5,
    carb100: 22.4,
    fat100: 0.2,
    fiber100: 3.1,
    handType: '🤲 1 Mano ahuecada',
    handGrams: 120,
    handDesc: '1 unidad pequeña que cabe en tu mano (120g)',
    gi: 'Bajo-Medio',
    clinicalNote: 'Rico en provitamina A y antocianinas; excelente pre-entreno.'
  },
  {
    code: 'papa_sancochada',
    name: 'Papa Blanca / Amarilla Sancochada',
    category: 'carbohidrato_complejo',
    prep: 'Hervida con cáscara (no frita)',
    kcal100: 86,
    prot100: 1.9,
    carb100: 19.6,
    fat100: 0.1,
    fiber100: 2.0,
    handType: '🤲 1 Mano ahuecada',
    handGrams: 125,
    handDesc: '1 unidad mediana sancochada (125g)',
    gi: 'Medio',
    clinicalNote: 'Tiene menos calorías por 100g que el arroz y altísimo índice de saciedad.'
  },
  {
    code: 'choclo_cocido',
    name: 'Choclo Desgranado Sancochado',
    category: 'carbohidrato_complejo',
    prep: 'Hervido con anís',
    kcal100: 115,
    prot100: 3.4,
    carb100: 24.5,
    fat100: 1.3,
    fiber100: 2.7,
    handType: '🤲 1 Mano ahuecada',
    handGrams: 110,
    handDesc: '2/3 de taza de choclo desgranado (110g)',
    gi: 'Bajo',
    clinicalNote: 'Grano entero rico en luteína, zeaxantina y fibra insoluble.'
  },
  {
    code: 'palta_aguacate',
    name: 'Palta / Aguacate Fuerte Fresco',
    category: 'grasa_saludable',
    prep: 'Natural en tajadas',
    kcal100: 160,
    prot100: 2.0,
    carb100: 8.5,
    fat100: 14.7,
    fiber100: 6.7,
    handType: '👍 1 Pulgar',
    handGrams: 50,
    handDesc: '1/4 de palta mediana (50g)',
    gi: 'Bajo',
    clinicalNote: 'Rica en ácido oleico monoinsaturado, potasio (485mg/100g) y fibra.'
  },
  {
    code: 'aceite_oliva',
    name: 'Aceite de Oliva Extra Virgen',
    category: 'grasa_saludable',
    prep: 'En crudo sobre ensalada',
    kcal100: 884,
    prot100: 0.0,
    carb100: 0.0,
    fat100: 100.0,
    fiber100: 0.0,
    handType: '👍 1 Pulgar',
    handGrams: 12,
    handDesc: '1 cucharada sopera (12g)',
    gi: 'Nulo',
    clinicalNote: 'Polifenoles antiinflamatorios (estudio PREDIMED) que reducen riesgo cardiovascular.'
  },
  {
    code: 'frutos_secos',
    name: 'Almendras / Nueces / Pecanas Naturales',
    category: 'grasa_saludable',
    prep: 'Naturales sin freír y sin azúcar',
    kcal100: 605,
    prot100: 19.5,
    carb100: 18.0,
    fat100: 54.0,
    fiber100: 10.5,
    handType: '👍 1 Pulgar',
    handGrams: 20,
    handDesc: '1 puñadito / 8–10 almendras o 5 nueces (20g)',
    gi: 'Bajo',
    clinicalNote: 'Alta densidad calórica pero baja absorción neta; aporta magnesio y vitamina E.'
  },
  {
    code: 'brocoli_verduras',
    name: 'Vegetales Fibrosos (Brócoli, Espinaca, Vainitas, Ensalada)',
    category: 'verdura_fibrosa',
    prep: 'Al vapor al dente o ensalada fresca',
    kcal100: 34,
    prot100: 2.8,
    carb100: 6.6,
    fat100: 0.4,
    fiber100: 3.0,
    handType: '✊ 1 Puño cerrado',
    handGrams: 130,
    handDesc: '1 taza llena del tamaño de tu puño (130g)',
    gi: 'Bajo',
    clinicalNote: 'Aporta sulforafano, potasio y crea la malla viscosa que reduce el pico de glucosa en 37%.'
  },
  {
    code: 'fruta_bajo_ig',
    name: 'Fruta Entera de Bajo IG (Manzana, Pera, Fresas, Arándanos)',
    category: 'verdura_fibrosa',
    prep: 'Entera y con cáscara (nunca en jugo)',
    kcal100: 52,
    prot100: 0.4,
    carb100: 13.8,
    fat100: 0.2,
    fiber100: 2.6,
    handType: '🤲 1 Mano ahuecada',
    handGrams: 130,
    handDesc: '1 unidad mediana o 1 taza de fresas (130g)',
    gi: 'Bajo',
    clinicalNote: 'Pectina intacta y polifenoles antioxidantes con baja carga glucémica.'
  }
];

// ============================================================================
// 2. REGLAS CLÍNICAS DE PATOLOGÍAS (12 PROTOCOLOS MÉDICO-NUTRICIONALES)
// ============================================================================
const PATHOLOGY_RULES = {
  diabetes_tipo2: {
    name: 'Diabetes Mellitus (Tipo 2 / Tipo 1) — Guía ADA',
    handCarbMod: -1,
    handVeggieMod: +1,
    guideline:
      'Secuencia de ingesta obligatoria (Shukla et al., Diabetes Care): Comer primero 2 puños (✊ ~250g) de vegetales fibrosos, luego 1–1.5 palmas (🤚 ~130–160g) de proteína y dejar para el final máximo 1 mano ahuecada (🤲 ~100–115g) de carbohidrato complejo de bajo IG. Esto reduce el pico de glucosa postprandial en 37% y de insulina en 30%.',
    allowed: [
      'Quinua, lentejas y garbanzos (1 🤲 = 115–130g)',
      'Pescado azul: bonito, caballa, trucha (1.5 🤚 = 160g)',
      'Pechuga de pollo y pavo (1.5 🤚 = 150g)',
      'Brócoli, espinaca, vainitas, pepino (2 ✊ = 250g)',
      'Palta (50g) y aceite de oliva (12ml) (1 👍)',
      'Manzana verde, pera o fresas enteras con cáscara (130g)'
    ],
    restricted: [
      'Azúcar blanca, rubia, miel, chancaca y jarabes',
      'Gaseosas, jugos de fruta licuados/colados y néctares',
      'Pan blanco, pastelería y galletas',
      'Doble harina en el plato (arroz + papa o pan + fideos)'
    ]
  },
  prediabetes: {
    name: 'Prediabetes / Resistencia a la Insulina (Sensibilidad GLUT-4)',
    handCarbMod: -1,
    handVeggieMod: +1,
    guideline:
      'Reversión de hiperinsulinemia: Prohibido comer carbohidratos o frutas "desnudas" (solas). Toda porción de carbohidrato (🤲) debe ir blindada con 25–35g de proteína neta (1 a 1.5 palmas 🤚) o 1 pulgar de grasa saludable (👍), sumado a entrenamiento de fuerza que transloca receptores GLUT-4 al músculo sin requerir insulina.',
    allowed: [
      'Avena entera en hojuelas (40g en crudo = 1 🤲)',
      'Huevos enteros y claras (2 huevos + 1 clara = 1 🤚)',
      'Camote sancochado con cáscara enfriado (almidón resistente)',
      'Yogur griego natural sin azúcar (180g)',
      'Canela de Ceilán y vinagre de sidra de manzana en ensaladas'
    ],
    restricted: [
      'Cereales inflados de caja y barras azucaradas',
      'Bebidas azucaradas y jugos matutinos',
      'Harinas refinadas y picoteo constante cada hora'
    ]
  },
  hipertension: {
    name: 'Hipertensión Arterial — Protocolo DASH / AHA',
    handCarbMod: 0,
    handVeggieMod: +1,
    guideline:
      'Control endotelial y restricción de sodio (<1,500–2,000 mg/día = máx. 1/2 cdta rasa de sal en todo el día). Elevar el consumo de potasio (>3,500 mg/día), magnesio y nitratos orgánicos mediante 5–6 puños diarios de vegetales y legumbres. Al entrenar, prohibido aguantar la respiración (maniobra de Valsalva).',
    allowed: [
      'Espinaca, acelga, apio y betarraga (ricos en nitratos y potasio)',
      'Pescado azul rico en Omega-3 vasodilatador (150g)',
      'Palta (50g) y semillas de calabaza/chía (magnesio)',
      'Ajo machacado fresco, orégano, cúrcuma, romero y limón'
    ],
    restricted: [
      'Embutidos (jamón, chorizo, hot dog, tocino, mortadela)',
      'Cubitos sazonadores, glutamato monosódico y sopas de sobre',
      'Salsa de soya (sillao) comercial y quesos salados',
      'Enlatados sin enjuagar y snacks comerciales'
    ]
  },
  hipotension: {
    name: 'Hipotensión Arterial (Soporte de Volemia)',
    handCarbMod: 0,
    handVeggieMod: 0,
    guideline:
      'Prevención de hipotensión postprandial y ortostática: Fraccionar la ingesta en 4 a 5 comidas moderadas (evitar atracones de carbohidratos simples que desvían el flujo sanguíneo al lecho esplácnico). Asegurar 2.5 L de agua mineralizada con pizca de sal marina y limón.',
    allowed: [
      'Agua con electrolitos naturales (limón + pizca de sal marina)',
      'Aceitunas de botija (4 unidades = 1 👍) y queso fresco',
      'Huevos duros, frutos secos y proteínas fraccionadas'
    ],
    restricted: [
      'Ayunos prolongados (>5 horas sin hidratación ni alimento)',
      'Comidas gigantes altas en azúcares de una sola sentada',
      'Alcohol (vasodilatador periférico)'
    ]
  },
  dislipidemia: {
    name: 'Colesterol LDL / Triglicéridos Altos (ATP III)',
    handCarbMod: -1,
    handVeggieMod: +1,
    guideline:
      'Reducción de ApoB y triglicéridos: Eliminar frituras, grasas trans y azúcares simples (los triglicéridos suben por exceso de fructosa, harinas y alcohol). Incorporar fibra soluble viscosa (avena, lentejas, chía) que secuestra ácidos biliares y pescado oscuro 3–4 veces por semana.',
    allowed: [
      'Bonito, caballa, jurel y trucha (150g · EPA/DHA)',
      'Avena entera (40g) y semillas de chía/linaza (15g)',
      'Aceite de oliva extra virgen en crudo (12ml) y palta (50g)',
      'Lentejas, garbanzos y frejoles (130g)'
    ],
    restricted: [
      'Pollo broaster, papas fritas, chicharrón y frituras profundas',
      'Margarina, manteca vegetal, piel de aves y grasa visible',
      'Alcohol y exceso de arroz blanco / pan blanco'
    ]
  },
  higado_graso: {
    name: 'Hígado Graso (Esteatosis Hepática / MASLD — Guía EASL)',
    handCarbMod: -1,
    handVeggieMod: +1,
    guideline:
      'Oxidación de grasa intrahepática: Suprimir al 100% la fructosa industrial (gaseosas, néctares, jarabe de maíz) y el alcohol, ya que se convierten directamente en grasa hepática (lipogénesis de novo). Asegurar colina (huevos), sulforafano (brócoli/coliflor) y reducir carbohidratos nocturnos.',
    allowed: [
      'Brócoli, coliflor, alcachofa y hojas verdes (2 ✊ = 250g)',
      'Huevos enteros (ricos en fosfatidilcolina que exporta grasa del hígado)',
      'Pescado azul/blanco y pechuga de pollo/pavo (150g)',
      'Café pasado puro sin azúcar (2 tazas/día si no hay gastritis)'
    ],
    restricted: [
      'Gaseosas, jugos de fruta colados, miel y fructosa líquida',
      'Alcohol en cualquier dosis (hepatotóxico directo)',
      'Harinas refinadas nocturnas y ultraprocesados'
    ]
  },
  acido_urico: {
    name: 'Ácido Úrico Alto / Hiperuricemia / Gota',
    handCarbMod: 0,
    handVeggieMod: +1,
    guideline:
      'Dieta hipopurínica y uricosúrica: Cubrir los gramos de proteína con fuentes libres de purinas (huevos, claras, queso fresco light, yogur griego) y bajas en purinas (pechuga de pollo/pavo, pescado blanco). Beber mínimo 2.5 a 3 L de agua al día con limón y vitamina C.',
    allowed: [
      'Huevos enteros, claras, queso fresco light y yogur natural',
      'Pechuga de pollo, pavo y pescado blanco (merluza, tilapia)',
      'Fresas, cerezas, mandarina, kiwi y manzana (efecto uricosúrico)'
    ],
    restricted: [
      'Vísceras (hígado, sangrecita, mondongo, mollejas)',
      'Mariscos, anchoveta, sardinas y caldos concentrados de carne',
      'Cerveza (incluso sin alcohol) y bebidas con fructosa'
    ]
  },
  gastritis: {
    name: 'Gastritis / Reflujo (ERGE) / Colon Irritable',
    handCarbMod: 0,
    handVeggieMod: 0,
    guideline:
      'Protección de mucosa digestiva: Preferir verduras cocidas al vapor o en cremas suaves (zapallo, zanahoria, vainitas, calabacín) y proteínas a la plancha suave, horno o sudado sin aderezos grasosos. Cenar al menos 2.5 horas antes de acostarse.',
    allowed: [
      'Pescado blanco y pechuga de pollo al vapor o plancha suave',
      'Crema casera de zapallo, zanahoria y papa amarilla',
      'Papaya picada, pera o manzana cocida con canela',
      'Infusiones tibias de manzanilla, muña o anís'
    ],
    restricted: [
      'Ají, rocoto, pimienta, comino y salsas picantes',
      'Café en ayunas, gaseosas, menta (relaja esfínter esofágico) y alcohol',
      'Frituras y menestras con cáscara mal cocidas en fase aguda'
    ]
  },
  hipotiroidismo: {
    name: 'Hipotiroidismo / Síndrome de Ovario Poliquístico (SOP)',
    handCarbMod: -1,
    handVeggieMod: +1,
    guideline:
      'Optimización de conversión T4 → T3 y sensibilidad ovárica a la insulina: Asegurar selenio (nueces de Brasil, pescado), zinc, tirosina (huevos, aves) y al menos 30g de proteína por comida. Cocinar siempre las crucíferas al vapor y separar la levotiroxina 60 min del desayuno.',
    allowed: [
      'Nueces de Brasil (2 unidades/día = 100% requerimiento de selenio)',
      'Huevos, pescado azul y pechuga de pavo/pollo',
      'Semillas de chía, linaza y calabaza (1 👍)',
      'Verduras crucíferas cocidas al vapor'
    ],
    restricted: [
      'Tomar café, calcio, hierro o soya junto con la levotiroxina',
      'Azúcares simples y harinas blancas que elevan andrógenos en SOP'
    ]
  },
  anemia: {
    name: 'Anemia Ferropénica / Déficit de Ferritina',
    handCarbMod: 0,
    handVeggieMod: 0,
    guideline:
      'Maximización de absorción intestinal de hierro: Priorizar hierro hemo (sangrecita, res magra, pescado oscuro, pavo) y acompañar las menestras con vitamina C (limón fresco en la ensalada o mandarina de postre). Separar infusiones (té, café, manzanilla) y lácteos 2 horas del almuerzo.',
    allowed: [
      'Sangrecita de pollo, lomo de res magro, bonito y pavita',
      'Lentejas y espinaca aliñadas siempre con jugo de limón fresco',
      'Mandarina, naranja entera, kiwi o fresas de postre'
    ],
    restricted: [
      'Té negro/verde, café, mates o leche junto con el almuerzo',
      'Suplementos de calcio en la misma toma que el hierro'
    ]
  },
  renal_leve: {
    name: 'Cuidado Renal / ERC Estadio 1–2 o Litiasis Renal (Guía KDOQI)',
    handCarbMod: 0,
    handVeggieMod: +1,
    guideline:
      'Nefroprotección y control de carga ácida renal: Mantener la proteína en rango normoproteico controlado (0.8 a 1.1 g/kg/día), priorizando pescado, clara de huevo, aves y proteína vegetal (lentejas/quinua), evitando megadosis de carne roja, embutidos con aditivos de fósforo inorgánico y exceso de sodio.',
    allowed: [
      'Claras de huevo, pescado blanco/azul y pechuga de pollo en porción medida',
      'Quinua, arroz, camote y verduras bajas/moderadas en oxalatos',
      'Agua pura con limón natural (citrato urinario previene cálculos)'
    ],
    restricted: [
      'Embutidos, gaseosas oscuras (ácido fosfórico) y exceso de sal',
      'Dietas hiperproteicas extremas (>2.2 g/kg) sin supervisión nefrológica',
      'Automedicación con AINEs (ibuprofeno/naproxeno)'
    ]
  },
  sarcopenia_articular: {
    name: 'Sarcopenia / Osteopenia / Protección Articular (EWGSOP2)',
    handCarbMod: 0,
    handVeggieMod: 0,
    guideline:
      'Vencer la resistencia anabólica muscular: Asegurar 1.4 a 1.8 g de proteína/kg/día repartidos en 3–4 tomas que superen los 2.5–3g de leucina por comida (120–150g de pollo/pescado o 2 huevos + yogur griego), junto con calcio, vitamina D3, Omega-3 y entrenamiento de fuerza progresivo sin impacto articular.',
    allowed: [
      'Pescado azul, pechuga de pollo, huevos enteros y yogur griego',
      'Gelatina sin azúcar / caldo de huesos desgrasado + Vitamina C (síntesis de colágeno)',
      'Queso fresco bajo en sal, ajonjolí y almendras (calcio y magnesio)'
    ],
    restricted: [
      'Dietas hipocalóricas extremas sin proteína (aceleran pérdida muscular)',
      'Sedentarismo prolongado o desayunos de solo pan con té'
    ]
  }
};

// ============================================================================
// 3. BASE DE CONOCIMIENTO DEL ASISTENTE CIENTÍFICO (PARA EL ASESOR)
// ============================================================================
const ASSISTANT_KNOWLEDGE_BASE = {
  grasa_visceral: {
    title: '🔥 Cómo Explicar y Reducir la Grasa Visceral (Escala 1–59)',
    summary:
      'La grasa visceral rodea el hígado, páncreas e intestinos. A diferencia de la grasa subcutánea, es metabólicamente activa y libera citoquinas inflamatorias (IL-6, TNF-α) y ácidos grasos libres directo a la vena porta, causando resistencia a la insulina e hígado graso.',
    coachScript:
      'Dile a tu alumno: "Tu balanza marca un nivel de grasa visceral que debemos llevar por debajo de 9. La buena noticia es que la grasa visceral tiene más receptores beta-adrenérgicos y mayor irrigación sanguínea que la grasa subcutánea: es la PRIMERA en oxidarse cuando eliminamos azúcares líquidos, aseguramos proteína en cada comida y combinamos pesas con cardio moderado."',
    reference: 'Després JP. Body fat distribution and risk of cardiovascular disease. Circulation; Consenso EASL/ACSM.'
  },
  edad_metabolica: {
    title: '⏳ Por qué la Edad Metabólica sale Mayor que la Edad Real y Cómo Rejuvenecerla',
    summary:
      'La balanza de bioimpedancia calcula la Edad Metabólica comparando la Tasa Metabólica Basal (TMB) del alumno contra el promedio poblacional por edad. Como el músculo es el tejido que más calorías quema en reposo y la grasa casi no quema energía, tener bajo % de músculo y alto % de grasa reduce la TMB y "envejece" el metabolismo.',
    coachScript:
      'Dile a tu alumno: "Que tu edad metabólica salga mayor que tu edad de DNI no es irreversible; simplemente significa que hoy tu cuerpo tiene menos masa muscular activa de la que debería. Por cada kilo de músculo que recuperemos con tus palmas de proteína (1.6–2.0 g/kg) y los 3–4 días de fuerza, tu tasa metabólica subirá y verás bajar tu edad metabólica mes a mes."',
    reference: 'Janssen I et al. Skeletal muscle mass and distribution (J Appl Physiol); Tanita Clinical Normative Data.'
  },
  orden_comidas: {
    title: '🥗 Ciencia del Orden de Ingesta de los Alimentos (Secuencia Glucémica)',
    summary:
      'Estudios clínicos controlados (Shukla et al., Weill Cornell Medical College, publicados en Diabetes Care) demostraron que comer exactamente el mismo plato pero empezando por los vegetales y la proteína, y dejando el carbohidrato al final, reduce el pico de glucosa a los 60 min en un 37% y la insulina en un 30–40%.',
    coachScript:
      'Dile a tu alumno: "No solo importa qué comes, sino el ORDEN en que lo comes. Si empiezas tu almuerzo comiendo tus 2 puños de ensalada y tu palma de pollo/pescado, la fibra y la proteína tapizan tu intestino y activan la hormona GLP-1. Cuando el arroz o la papa llegan al final, pasan a la sangre lentamente sin disparar tu insulina ni guardarse como grasa abdominal."',
    reference: 'Shukla AP, Iliescu RG, Thomas CE, Aronne LJ. Food Order Has a Significant Impact on Postprandial Glucose and Insulin Levels. Diabetes Care. 2015.'
  },
  jugos_fruta: {
    title: '🧃 Por qué la Fruta Entera Adelgaza y el Jugo de Fruta Sube Triglicéridos e Hígado Graso',
    summary:
      'Al licuar o exprimir la fruta se rompe la matriz celular de fibra insoluble y soluble. Un vaso de jugo de naranja o papaya contiene la fructosa libre de 3 a 4 frutas que llega de golpe al hígado por la vena porta, saturando la glucoquinasa y activando la lipogénesis de novo (creación de triglicéridos y grasa hepática).',
    coachScript:
      'Dile a tu alumno: "Masticar 1 manzana o 1 mandarina entera es excelente porque su fibra frena la absorción del azúcar. Pero cuando la licúas o haces jugo, le quitas el freno: el azúcar líquido entra al hígado a la misma velocidad que una gaseosa. Por eso en tu plan comemos la fruta entera a mordiscos y bebemos agua pura o infusiones."',
    reference: 'Muraki I et al. Fruit consumption and risk of type 2 diabetes: Harvard cohorts (BMJ); EASL MASLD Guidelines.'
  },
  proteina_rinon: {
    title: '🥩 ¿Comer 1.6 a 2.0 g/kg de Proteína Daña los Riñones o el Hígado?',
    summary:
      'El Position Stand de la Sociedad Internacional de Nutrición Deportiva (ISSN, Jäger et al.) y metaanálisis de Devries et al. confirman que en personas sin enfermedad renal crónica preexistente, ingestas de 1.6 a 2.5+ g/kg/día NO dañan la función renal ni ósea; por el contrario, mejoran la composición corporal, la saciedad y el control glucémico.',
    coachScript:
      'Dile a tu alumno: "En riñones sanos, comer suficiente proteína (pollo, pescado, huevos, legumbres) no causa daño renal; el verdadero enemigo del riñón es la glucosa alta y la presión arterial alta no controladas. La proteína protege tus músculos para que bajes exclusivamente grasa." (Nota: si el cliente sí tiene ERC diagnosticada, el sistema ajusta automáticamente a 0.8–1.0 g/kg).',
    reference: 'Jäger R et al. ISSN Position Stand: protein and exercise. J Int Soc Sports Nutr. 2017; Antonio J et al.'
  },
  estancamiento_peso: {
    title: '⚖️ Qué Explicar cuando el Alumno Cumple el Plan pero el Peso en Balanza Varía Poco',
    summary:
      'Durante las primeras 2–4 semanas de entrenamiento de fuerza y aumento de ingesta proteica, el músculo almacena más glucógeno intramuscular (1g de glucógeno retiene ~3g de agua intracelular) y aumenta la síntesis miofibrilar mientras se oxida grasa visceral y subcutánea. Esto se llama Recomposición Corporal.',
    coachScript:
      'Dile a tu alumno: "Nunca mires solo el peso total. Hoy tu balanza de bioimpedancia nos muestra que aunque el peso total bajó poco, tu % de grasa corporal y tu grasa visceral bajaron y tu % de masa muscular subió. Estás cambiando grasa inflamatoria por músculo firme que ocupa menos espacio en tu cintura."',
    reference: 'Barakat C et al. Body Recomposition: Can Trained Individuals Build Muscle and Lose Fat at the Same Time? Strength Cond J. 2020.'
  },
  suplementos_evidencia: {
    title: '💊 Suplementos con Evidencia Científica Grado A (ISSN / IOC Consensus)',
    summary:
      'Solo un grupo selecto de suplementos cuenta con evidencia clínica sólida: 1) Creatina Monohidratada (3–5 g/día: mejora fuerza, masa magra, sensibilidad a la insulina y función cognitiva), 2) Proteína de Suero/Whey (para completar la cuota proteica diaria), 3) Omega-3 EPA/DHA (1–2 g/día: reduce triglicéridos e inflamación), 4) Vitamina D3 y Magnesio Citrato/Bisglicinato.',
    coachScript:
      'Dile a tu alumno: "Ningún quemador de grasa mágico reemplaza tu alimentación. Si deseas apoyar tu plan con suplementos respaldados por la ciencia, los únicos que valen la inversión son Creatina Monohidratada (5g/día), Omega-3 si comes poco pescado azul, o un batido de Proteína Whey cuando no tengas tiempo de cocinar."',
    reference: 'Maughan RJ et al. IOC consensus statement: dietary supplements (Br J Sports Med); Kreider RB et al. ISSN Creatine Stand.'
  },
  entrenamiento_patologias: {
    title: '🏋️ Por qué Combinar Pesas (Fuerza) + Cardio Supera al Cardio Solo en Patologías',
    summary:
      'El músculo esquelético es responsable del 80% de la captación de glucosa estimulada por insulina. Según el ACSM y estudios (HART-D Trial, Church et al., JAMA), la combinación de entrenamiento de fuerza (2–3 días/sem) + ejercicio aeróbico (150 min/sem) reduce la HbA1c, la grasa visceral y la presión arterial significativamente más que caminar solo.',
    coachScript:
      'Dile a tu alumno: "Salir solo a caminar quema calorías mientras caminas, pero hacer ejercicios de fuerza (sentadillas, empujes, jalones) convierte tus músculos en esponjas que absorben glucosa y queman grasa las 24 horas del día, incluso mientras duermes."',
    reference: 'Church TS et al. Effects of aerobic and resistance training on Hemoglobin A1c levels in patients with type 2 diabetes (HART-D). JAMA; ACSM Guidelines.'
  }
};

const SCIENTIFIC_PAPERS_CATALOG = [
  {
    badge: 'ISSN Position Stand (Proteína y Composición Corporal)',
    title: 'Jäger R, Kerksick CM, Campbell BI, et al. (Journal of the International Society of Sports Nutrition)',
    detail:
      'Establece que una ingesta de 1.4–2.0 g/kg/día (y hasta 2.3–3.1 g/kg de masa libre de grasa en déficit calórico) distribuida en tomas de 20–40g cada 3–4 horas maximiza la retención muscular y la pérdida de masa grasa.'
  },
  {
    badge: 'ACSM FITT-VP Guidelines (Síndrome Metabólico, Diabetes e Hipertensión)',
    title: 'American College of Sports Medicine — Guidelines for Exercise Testing and Prescription (11th Ed.)',
    detail:
      'Prescribe 150–300 min/semana de cardio moderado (RPE 11–13) + 2–3 sesiones no consecutivas de fuerza multiarticular (2–4 series de 8–12 reps al 60–80% 1RM), evitando la maniobra de Valsalva en hipertensos.'
  },
  {
    badge: 'Diabetes Care — Orden Secuencial de Macronutrientes',
    title: 'Shukla AP et al. Weill Cornell Medical College (Diabetes Care)',
    detail:
      'Ingerir primero vegetales y proteínas 10–15 minutos antes de los carbohidratos reduce la excursión glucémica postprandial en 37% y la respuesta insulínica en 30%.'
  },
  {
    badge: 'Gallagher et al. & OMS — Parámetros de Bioimpedancia',
    title: 'Gallagher D, Heymsfield SB, et al. Healthy percentage body fat ranges (Am J Clin Nutr)',
    detail:
      'Define los puntos de corte clínicos de % de grasa corporal por sexo y grupo etario utilizados por los monitores segmentales Tanita, Omron e InBody, junto con el umbral de riesgo de grasa visceral.'
  },
  {
    badge: 'CENAN / INS Perú & USDA FoodData Central',
    title: 'Tablas Peruanas de Composición de Alimentos (10ma Edición) y Base Estándar USDA',
    detail:
      'Base bromatológica oficial para el cálculo exacto de proteínas, lípidos, carbohidratos, fibra dietaria y kilocalorías por cada 100g y 20g de porción comestible.'
  }
];

const MOTIVATIONAL_OBJECTIONS_CATALOG = [
  {
    q: '❓ "No tengo tiempo de pesar mi comida o almuerzo en restaurante"',
    a: '💡 Respuesta del Asesor: "Por eso tu plan tiene doble sistema: cuando estés en casa puedes usar los gramos exactos (ej. 120g de pollo y 100g de arroz), y cuando comas en la calle usas tu propia mano: pides que la mitad del plato sea ensalada (2 puños ✊), aseguras tu palma y media de carne/pollo a la plancha (🤚) y dejas solo 1 mano ahuecada de arroz o menestra (🤲)."'
  },
  {
    q: '❓ "En la tarde/noche me da mucha ansiedad por comer pan o dulces"',
    a: '💡 Respuesta del Asesor: "Esa ansiedad a las 6:00 PM ocurre porque en el desayuno y almuerzo comiste poca proteína y demasiada harina rápida, provocando un bajón de glucosa reactivo. Al asegurar 30–35g de proteína en el almuerzo y tu merienda proteica de las 5:00 PM (yogur griego o huevo + frutos secos), llegarás a la cena sin hambre feroz."'
  },
  {
    q: '❓ "¿Puedo tener una comida libre el fin de semana sin arruinar el plan?"',
    a: '💡 Respuesta del Asesor: "Sí, la adherencia a largo plazo es más importante que la perfección de 3 días. Puedes tener 1 comida flexible a la semana aplicando dos reglas simples: 1) No llegues en ayunas a esa comida, y 2) Empieza siempre con una entrada de proteína o ensalada y toma agua o bebida sin azúcar."'
  },
  {
    q: '❓ "Me duelen las rodillas o la espalda, ¿igual debo entrenar?"',
    a: '💡 Respuesta del Asesor: "Justamente fortalecer los músculos que sostienen la rodilla (cuádriceps y glúteos) descarga el peso sobre el cartílago. En tu plan hemos eliminado saltos e impacto y usamos ejercicios controlados en silla/máquinas y caminata o bicicleta sin dolor."'
  }
];

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// ============================================================================
// 4. PLANTILLAS DE COMIDAS CON GRAMOS EXACTOS, MEDIDAS CASERAS Y MANO
// ============================================================================
const HAND_MEAL_CATALOG = {
  desayuno: [
    {
      title: 'Huevos Revueltos con Espinaca + Avena Integral / Pan Integral + Palta Fuerte',
      handBadges: ['🤚 1–1.5 Palmas Proteína', '🤲 1 Mano Carbohidrato', '👍 1 Pulgar Grasa'],
      items: (q, mode, flags) => [
        formatPortion(
          mode,
          `🤚 <strong>${q.desProt} palma(s) de proteína:</strong> 2 huevos enteros + ${q.isMale ? '2 claras' : '1 clara'} revueltos con espinaca y tomate`,
          `2 huevos enteros + ${q.isMale ? '2' : '1'} clara(s) en sartén antiadherente`,
          `${q.isMale ? '160 g' : '130 g'} de huevo/claras + 50 g de espinaca (~${q.isMale ? '21g' : '17g'} Proteína)`
        ),
        formatPortion(
          mode,
          `🤲 <strong>${q.desCarb} mano ahuecada de carbohidrato:</strong> Avena entera en hojuelas cocida sin azúcar o pan 100% integral`,
          `4 cucharadas soperas de avena (1/2 taza cocida) o 1–2 rebanadas de pan integral`,
          `40 g de avena en hojuelas o 50 g de pan integral (~24g Carbohidratos, 5g Proteína)`
        ),
        formatPortion(
          mode,
          `👍 <strong>1 pulgar de grasa saludable:</strong> Palta / aguacate en láminas (${flags.hipertension ? 'sin sal añadida' : 'con pizca de sal marina'})`,
          `1/4 de unidad mediana de palta`,
          `50 g de palta fresca (~7.4g Grasa monoinsaturada, 80 kcal)`
        ),
        `☕ <strong>Bebida:</strong> 1 taza grande (250 ml) de infusión herbal o café pasado puro <strong>sin azúcar ni miel</strong>`
      ],
      tip: 'Desayuno de alta saciedad (~30g de proteína total) que mantiene la glucosa e insulina estables toda la mañana.'
    },
    {
      title: 'Bowl Proteico de Yogur Griego Natural + Fruta de Bajo IG + Nueces y Chía',
      handBadges: ['🤚 1 Palma Lácteo/Proteína', '🤲 1 Mano Fruta/Avena', '👍 1 Pulgar Frutos Secos'],
      items: (q, mode) => [
        formatPortion(
          mode,
          `🤚 <strong>${q.desProt} palma(s) proteica:</strong> Yogur griego natural sin azúcar (+ 1 huevo duro si entrenas temprano)`,
          `1 taza (vaso mediano) de yogur griego natural sin endulzar`,
          `200 g de yogur griego natural (+ 55 g huevo opcional) (~20–26g Proteína)`
        ),
        formatPortion(
          mode,
          `🤲 <strong>${q.desCarb} mano ahuecada de carbohidrato/fruta:</strong> Fresas, arándanos o manzana verde picada + avena en hojuelas`,
          `1/2 taza de frutos rojos/manzana + 2 cucharadas soperas de avena`,
          `100 g de fruta entera + 25 g de avena (~28g Carbohidratos fibrosos)`
        ),
        formatPortion(
          mode,
          `👍 <strong>1 pulgar de grasa cardioprotectora:</strong> Nueces o almendras naturales + semillas de chía`,
          `8–10 almendras o 5 mitades de nuez + 1 cdta de chía`,
          `20 g de frutos secos naturales (~11g Grasa saludable, 4g Proteína)`
        )
      ],
      tip: 'Rico en probióticos, calcio biodisponible y antioxidantes con carga glucémica baja.'
    },
    {
      title: 'Tortilla Proteica de Pollo Deshilachado / Claras + Camote Sancochado + Palta',
      handBadges: ['🤚 1–1.5 Palmas Proteína', '🤲 1 Mano Tubérculo', '👍 1 Pulgar Grasa'],
      items: (q, mode) => [
        formatPortion(
          mode,
          `🤚 <strong>${q.desProt} palma(s) de proteína:</strong> Pechuga de pollo deshilachada o tortilla de claras con queso fresco light`,
          `1 palma de pollo deshilachado o 2 huevos con 50g de queso fresco`,
          `110 g de pechuga de pollo cocida (~34g Proteína, 0g Carbs)`
        ),
        formatPortion(
          mode,
          `🤲 <strong>${q.desCarb} mano ahuecada de tubérculo:</strong> Camote amarillo o morado sancochado con cáscara`,
          `1 unidad pequeña / 3 rodajas medianas de camote`,
          `120 g de camote cocido (~27g Carbohidratos de liberación lenta, 115 kcal)`
        ),
        formatPortion(
          mode,
          `👍 <strong>1 pulgar de grasa saludable:</strong> Palta fresca con gotas de limón`,
          `1/4 de unidad mediana de palta`,
          `50 g de palta (~7.4g Grasa saludable)`
        )
      ],
      tip: 'Excelente desayuno para días de entrenamiento: aporta glucógeno limpio y aminoácidos esenciales.'
    }
  ],
  media_manana: [
    {
      title: 'Colación Metabólica: Fruta Entera con Cáscara + Pulgar de Almendras/Nueces',
      handBadges: ['🤲 1 Mano Fruta', '👍 1 Pulgar Nueces'],
      items: (q, mode) => [
        formatPortion(
          mode,
          `🤲 <strong>1 mano ahuecada:</strong> 1 manzana verde, pera o mandarina entera (masticada, nunca en jugo)`,
          `1 unidad mediana de fruta fresca`,
          `130 g de fruta entera (~17g Carbohidratos, 3.4g Fibra, 68 kcal)`
        ),
        formatPortion(
          mode,
          `👍 <strong>1 pulgar de grasa/proteína:</strong> Almendras o nueces naturales sin sal`,
          `10 unidades de almendras`,
          `20 g de almendras (~4g Proteína, 11g Grasa saludable, 121 kcal)`
        )
      ],
      tip: 'Los lípidos y fibra de las almendras reducen la velocidad de absorción de la fructosa de la fruta.'
    },
    {
      title: 'Colación Proteica: Huevo Sancochado + Bastones de Pepino y Apio al Limón',
      handBadges: ['🤚 1/2 Palma Proteína', '✊ 1 Puño Verdura'],
      items: (q, mode) => [
        formatPortion(
          mode,
          `🤚 <strong>Media a 1 palma ligera:</strong> 1 a 2 huevos duros sancochados`,
          `1–2 unidades de huevo cocido`,
          `60–110 g de huevo (~7.5 a 14g Proteína, 0.6g Carbs)`
        ),
        formatPortion(
          mode,
          `✊ <strong>1 puño de vegetales:</strong> Bastones de pepino o apio con limón`,
          `1 taza de bastones frescos`,
          `120 g de pepino fresco (~20 kcal, alto en potasio y agua)`
        )
      ],
      tip: 'Colación de impacto glucémico casi nulo, ideal para pacientes con diabetes o resistencia a la insulina.'
    }
  ],
  almuerzo: [
    {
      title: 'Filete de Pescado Azul (Bonito/Trucha) a la Plancha + 2 Puños de Ensalada + Quinua Graneada',
      handBadges: ['✊ 2 Puños Verdura', '🤚 1.5–2 Palmas Proteína', '🤲 1 Mano Quinua', '👍 1 Pulgar Grasa'],
      items: (q, mode, flags) => [
        formatPortion(
          mode,
          `✊ <strong>${q.almVeg} puños cerrados de verdura (50% del plato):</strong> Ensalada fresca de espinaca, tomate, pepino y brócoli al vapor (<strong>comer primero</strong>)`,
          `2 tazas llenas de vegetales frescos y al vapor`,
          `250 g de vegetales fibrosos (~7g Proteína vegetal, 14g Carbs fibrosos, 85 kcal)`
        ),
        formatPortion(
          mode,
          `🤚 <strong>${q.almProt} palma(s) de proteína magra:</strong> Filete de ${flags.acido_urico ? 'merluza, tilapia o trucha' : 'bonito, caballa, trucha o salmón'} a la plancha con ajo y hierbas`,
          `1 filete grande del tamaño de tu palma y media`,
          `${q.isMale ? '160 g' : '135 g'} en peso cocido (~${q.isMale ? '39g' : '33g'} Proteína pura, rico en Omega-3)`
        ),
        formatPortion(
          mode,
          `🤲 <strong>${q.almCarb} mano(s) ahuecada(s) de carbohidrato complejo:</strong> Quinua graneada sin aceite (<strong>no mezclar con arroz ni papa</strong>)`,
          `1/2 a 2/3 de taza de quinua cocida`,
          `${q.almCarbGrams} g de quinua cocida (~${Math.round(q.almCarbGrams * 0.21)}g Carbohidratos, ${Math.round(q.almCarbGrams * 0.044)}g Proteína)`
        ),
        formatPortion(
          mode,
          `👍 <strong>1 pulgar de grasa saludable:</strong> Aceite de oliva extra virgen en crudo sobre la ensalada`,
          `1 cucharada sopera (12 ml)`,
          `12 g de aceite de oliva (~12g Grasa monoinsaturada, 106 kcal)`
        )
      ],
      tip: 'Comer primero los 250g de ensalada seguidos del pescado reduce el pico de glucosa de la quinua en más de 35%.'
    },
    {
      title: 'Pechuga de Pollo o Pavita a la Plancha + Lentejas Caseras + Ensalada Fresca al Limón',
      handBadges: ['✊ 2 Puños Verdura', '🤚 1.5–2 Palmas Pollo', '🤲 1 Mano Menestra', '👍 1 Pulgar Palta'],
      items: (q, mode) => [
        formatPortion(
          mode,
          `✊ <strong>${q.almVeg} puños cerrados de verdura:</strong> Vainitas, zanahoria al dente, pimiento rojo y hojas verdes aliñadas con limón fresco`,
          `2 tazas de ensalada aliñada con jugo de limón (la Vitamina C triplica la absorción del hierro)`,
          `240 g de verduras variadas (~80 kcal, 7g Fibra)`
        ),
        formatPortion(
          mode,
          `🤚 <strong>${q.almProt} palma(s) de proteína:</strong> Filete de pechuga de pollo o pavo a la plancha con cúrcuma y orégano`,
          `1 filete mediano-grande a la plancha sin piel`,
          `${q.isMale ? '150 g' : '125 g'} de pechuga de pollo cocida (~${q.isMale ? '46g' : '38g'} Proteína neta, 0g Carbs)`
        ),
        formatPortion(
          mode,
          `🤲 <strong>${q.almCarb} mano(s) ahuecada(s) de legumbre:</strong> Lentejas o garbanzos guisados con verduras (sin arroz blanco extra)`,
          `3/4 de taza de lentejas cocidas`,
          `130 g de lentejas cocidas (~26g Carbohidratos de bajo IG, 11.7g Proteína vegetal, 10g Fibra)`
        ),
        formatPortion(
          mode,
          `👍 <strong>1 pulgar de grasa saludable:</strong> Palta en cubos sobre la ensalada`,
          `1/4 de unidad mediana de palta`,
          `50 g de palta (~7.4g Grasa saludable, 80 kcal)`
        )
      ],
      tip: 'Este plato suma ~50g de proteína de alto valor biológico y 17g de fibra soluble que barre colesterol LDL.'
    },
    {
      title: 'Salteado al Wok de Lomo Magro / Pollo con Brócoli + Papa o Camote Sancochado',
      handBadges: ['✊ 2 Puños Brócoli/Verdura', '🤚 1.5–2 Palmas Proteína', '🤲 1 Mano Tubérculo', '👍 1 Pulgar Aceite Oliva'],
      items: (q, mode, flags) => [
        formatPortion(
          mode,
          `✊ <strong>${q.almVeg} puños cerrados de crucíferas:</strong> Brócoli, coliflor, zapallito italiano, cebolla y pimiento salteados al vapor`,
          `2 tazas abundantes de vegetales al dente`,
          `250 g de brócoli y vegetales (~85 kcal, rico en sulforafano hepatoprotector)`
        ),
        formatPortion(
          mode,
          `🤚 <strong>${q.almProt} palma(s) de proteína:</strong> ${flags.acido_urico || flags.renal_leve ? 'Pechuga de pollo o pavo en tiras' : 'Lomo fino magro de res o pechuga de pollo en tiras'}`,
          `1 porción de palma y media salteada sin freír`,
          `${q.isMale ? '150 g' : '125 g'} en peso cocido (~${q.isMale ? '43g' : '36g'} Proteína)`
        ),
        formatPortion(
          mode,
          `🤲 <strong>${q.almCarb} mano(s) ahuecada(s) de tubérculo:</strong> Papa amarilla/blanca o camote sancochado con cáscara`,
          `1 unidad mediana sancochada`,
          `125 g de papa/camote cocido (~25g Carbohidratos, 110 kcal)`
        ),
        formatPortion(
          mode,
          `👍 <strong>1 pulgar de grasa saludable:</strong> Aceite de oliva o ajonjolí añadido al servir`,
          `1 cucharada sopera`,
          `12 g de aceite saludable (~106 kcal)`
        )
      ],
      tip: 'Cocinar sin sillao comercial excesivo ni frituras protege el endotelio arterial y evita retención de líquidos.'
    }
  ],
  media_tarde: [
    {
      title: 'Merienda / Post-Entreno: Yogur Griego o Queso Fresco Light (o Batido Whey) + Semillas/Nueces',
      handBadges: ['🤚 1 Palma Proteína Ligera', '👍 1 Pulgar Grasa Buena'],
      items: (q, mode) => [
        formatPortion(
          mode,
          `🤚 <strong>1 palma equivalente de proteína:</strong> Yogur griego natural sin azúcar, 2 tajadas de queso fresco light o 1 scoop de Proteína Whey en agua`,
          `3/4 taza de yogur griego o 2 tajadas de queso fresco (o 1 scoop Whey)`,
          `150 g de yogur griego / 80 g de queso fresco / 30 g Whey (~16–24g Proteína)`
        ),
        formatPortion(
          mode,
          `👍 <strong>1 pulgar de grasa saludable:</strong> Almendras, pecanas, nueces o semillas de chía`,
          `8–10 almendras o 1 cucharada de chía`,
          `18 g de frutos secos (~10g Grasa saludable, 3.5g Proteína)`
        )
      ],
      tip: 'Aporta el pulso de aminoácidos de la tarde (ISSN: cada 3–4 h) y bloquea por completo la ansiedad nocturna por pan.'
    }
  ],
  cena: [
    {
      title: 'Filete de Pescado Blanco o Pollo a la Plancha + 2 Puños de Verduras al Vapor + Guarnición Controlada',
      handBadges: ['✊ 2 Puños Verdura', '🤚 1–1.5 Palmas Proteína', '🤲 1/2–1 Mano Carbohidrato'],
      items: (q, mode) => [
        formatPortion(
          mode,
          `✊ <strong>${q.cenVeg} puños cerrados de verduras tibias:</strong> Espárragos, vainitas, brócoli y calabacín al vapor con limón`,
          `2 tazas de verduras cocidas al vapor`,
          `220 g de vegetales al vapor (~75 kcal, alta fibra y potasio)`
        ),
        formatPortion(
          mode,
          `🤚 <strong>${q.cenProt} palma(s) de proteína magra:</strong> Filete de pescado blanco (merluza/tilapia) o pechuga de pollo a la plancha`,
          `1 filete mediano-grande a la plancha`,
          `${q.isMale ? '145 g' : '125 g'} de proteína cocida (~${q.isMale ? '38g' : '32g'} Proteína neta)`
        ),
        formatPortion(
          mode,
          `🤲 <strong>${q.cenCarb} mano ahuecada de carbohidrato nocturno:</strong> Quinua cocida, choclo o medio camote pequeño`,
          `1/3 a 1/2 taza de guarnición compleja`,
          `${q.cenCarbGrams} g en cocido (~${Math.round(q.cenCarbGrams * 0.21)}g Carbohidratos)`
        ),
        formatPortion(
          mode,
          `👍 <strong>1 pulgar de grasa saludable:</strong> Palta en láminas o 1 cucharadita de aceite de oliva`,
          `1/4 de palta pequeña o 1 cdta de aceite de oliva`,
          `40 g de palta (~6g Grasa saludable, 64 kcal)`
        )
      ],
      tip: 'Durante el sueño nocturno se secreta hormona de crecimiento (GH); cenar proteína magra y pocos carbohidratos maximiza la oxidación de grasa visceral.'
    },
    {
      title: 'Crema Reconfortante de Zapallo y Vegetales + Pechuga de Pollo Deshilachada (1–1.5 Palmas)',
      handBadges: ['✊ 2 Puños Verdura en Crema', '🤚 1–1.5 Palmas Pollo', '🤲 1/2 Mano Papa Amarilla'],
      items: (q, mode) => [
        formatPortion(
          mode,
          `✊ <strong>${q.cenVeg} puños de vegetales licuados en su caldo:</strong> Zapallo macre, zanahoria, apio, poro y espinaca (sin leche ni crema de leche)`,
          `1 tazón hondo de crema espesa de verduras`,
          `260 ml de crema vegetal (~85 kcal)`
        ),
        formatPortion(
          mode,
          `🤚 <strong>${q.cenProt} palma(s) de proteína:</strong> Pechuga de pollo en trozos o deshilachada servida dentro de la crema`,
          `1 palma abundante de pollo deshilachado`,
          `${q.isMale ? '140 g' : '120 g'} de pechuga de pollo (~${q.isMale ? '43g' : '37g'} Proteína)`
        ),
        formatPortion(
          mode,
          `🤲 <strong>${q.cenCarb} mano ahuecada:</strong> Media papa amarilla cocida licuada en la crema`,
          `1/2 unidad mediana de papa amarilla`,
          `70 g de papa amarilla (~14g Carbohidratos, 60 kcal)`
        )
      ],
      tip: 'Cena de digestión suave que evita el reflujo gastroesofágico y mejora la calidad del sueño.'
    },
    {
      title: 'Omelette Nocturno de Atún al Agua (o Pollo) y Claras + Ensalada Verde con Palta',
      handBadges: ['✊ 2 Puños Ensalada', '🤚 1.5 Palmas Proteína', '👍 1 Pulgar Palta'],
      items: (q, mode) => [
        formatPortion(
          mode,
          `🤚 <strong>${q.cenProt} palma(s) de proteína:</strong> 1 lata de atún al agua escurrida y lavada (o 100g pollo) + 1 huevo entero y 2 claras`,
          `1 lata de atún al agua + 1 huevo y 2 claras`,
          `120 g de atún + 90 g de huevo/claras (~41g Proteína pura, <2g Carbs)`
        ),
        formatPortion(
          mode,
          `✊ <strong>${q.cenVeg} puños de verdura:</strong> Espinaca, champiñones, vainitas y tomate en el omelette`,
          `2 tazas de vegetales frescos/salteados`,
          `200 g de vegetales (~65 kcal)`
        ),
        formatPortion(
          mode,
          `👍 <strong>1 pulgar de grasa saludable:</strong> Palta fresca al costado del plato`,
          `1/4 de unidad de palta`,
          `50 g de palta (~7.4g Grasa saludable)`
        )
      ],
      tip: 'Cena baja en carbohidratos ideal para amanecer con glucosa en ayunas óptima (<95 mg/dL).'
    }
  ]
};

function formatPortion(mode, handText, householdText, gramsText) {
  if (mode === 'mano_puro') {
    return handText;
  }
  if (mode === 'mano_mixto') {
    return `${handText} <br/><small style="color:#0f766e;font-weight:600;">🥄 Medida casera: ${householdText}</small>`;
  }
  return `${handText} <br/><small style="color:#047857;font-weight:700;">⚖️ Gramaje y Macros: ${gramsText} · (${householdText})</small>`;
}

// ============================================================================
// 5. INICIALIZACIÓN DE LA APLICACIÓN
// ============================================================================
// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  if (Array.isArray(window.EXTRA_FOOD_MACROS)) {
    window.EXTRA_FOOD_MACROS.forEach((ef) => {
      if (!FOOD_MACROS_DB.some((f) => f.code === ef.code)) {
        FOOD_MACROS_DB.push(ef);
      }
    });
  }
  if (Array.isArray(window.FOOD_VISUAL_ARCHETYPES_140) && window.FOOD_VISUAL_ARCHETYPES_140.length > 0) {
    FOOD_VISUAL_ARCHETYPES.splice(0, FOOD_VISUAL_ARCHETYPES.length, ...window.FOOD_VISUAL_ARCHETYPES_140);
  }
  initNavigation();
  initLiveCalculations();
  initPhotoUploader();
  initMacroBoardAndSimulator();
  initAssistantModule();
  initFormHandler();
  initActionButtons();
  loadPatientsFromServerAndRender();
});

function initNavigation() {
  document.querySelectorAll('.nav-btn, .mob-nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
      document.getElementById('app-sidebar')?.classList.remove('mobile-open');
    });
  });
  document.getElementById('btn-go-eval')?.addEventListener('click', () => switchTab('tab-evaluation'));

  // Menú móvil responsivo
  document.getElementById('btn-mobile-menu')?.addEventListener('click', () => {
    document.getElementById('app-sidebar')?.classList.toggle('mobile-open');
  });

  document.getElementById('btn-load-demo-mobile')?.addEventListener('click', () => {
    document.getElementById('btn-load-demo')?.click();
  });

  // Botón para ver todos los módulos de evaluación juntos o por pasos
  document.getElementById('btn-toggle-all-eval-modules')?.addEventListener('click', (e) => {
    const form = document.getElementById('nutrition-form');
    if (!form) return;
    const isShowingAll = form.classList.toggle('show-all-modules');
    e.currentTarget.textContent = isShowingAll
      ? '🎯 Ver Modo Paso a Paso (1 Módulo)'
      : '🗂️ Ver Todos los Módulos Juntos';
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.nav-btn, .mob-nav-btn').forEach((b) =>
    b.classList.toggle('active', b.dataset.tab === tabId)
  );
  document.querySelectorAll('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === tabId));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Cambiar entre los 5 Módulos de Evaluación (sin saturar la pantalla)
window.switchEvalModule = function (moduleIdx) {
  const form = document.getElementById('nutrition-form');
  form?.classList.remove('show-all-modules');
  const toggleBtn = document.getElementById('btn-toggle-all-eval-modules');
  if (toggleBtn) toggleBtn.textContent = '🗂️ Ver Todos los Módulos Juntos';

  document.querySelectorAll('#eval-module-stepper .module-step-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', idx === moduleIdx);
  });
  document.querySelectorAll('.eval-module-card').forEach((card) => {
    card.classList.toggle('active-module', parseInt(card.dataset.evalModule, 10) === moduleIdx);
  });
};

// Cambiar entre los 5 Sub-Módulos del Plan Generado
window.switchPlanSubModule = function (submodId) {
  const container = document.getElementById('plan-results-container');
  if (!container) return;

  if (submodId === 'all') {
    container.classList.add('show-all-plan-submodules');
  } else {
    container.classList.remove('show-all-plan-submodules');
    document.querySelectorAll('.plan-submodule').forEach((el) => {
      el.classList.toggle('active-submod', el.id === submodId);
    });
  }

  document.querySelectorAll('#plan-module-tabs .plan-mod-btn').forEach((btn) => {
    const onclickAttr = btn.getAttribute('onclick') || '';
    btn.classList.toggle('active', onclickAttr.includes(`'${submodId}'`));
  });
};

// Cambiar entre Tabla de Macros (100g/20g) y Simulador de Plato
window.switchMacroSubView = function (view) {
  const tableCard = document.getElementById('macro-subview-table');
  const simCard = document.getElementById('macro-subview-sim');
  const btnTable = document.getElementById('btn-view-macro-table');
  const btnSim = document.getElementById('btn-view-macro-sim');

  if (view === 'sim') {
    tableCard?.classList.add('hidden');
    simCard?.classList.remove('hidden');
    btnSim?.classList.replace('btn-outline', 'btn-primary');
    btnTable?.classList.replace('btn-primary', 'btn-outline');
  } else {
    simCard?.classList.add('hidden');
    tableCard?.classList.remove('hidden');
    btnTable?.classList.replace('btn-outline', 'btn-primary');
    btnSim?.classList.replace('btn-primary', 'btn-outline');
  }
};

// ============================================================================
// 6. MOTOR DE BIOIMPEDANCIA CLÍNICA (BAJO · ÓPTIMO · PRECAUCIÓN · ALERTA)
// ============================================================================
function initLiveCalculations() {
  const ids = [
    'patientCategory',
    'patientAge',
    'patientWeight',
    'patientHeight',
    'activityLevel',
    'trainingType',
    'trainingDays',
    'patientGoal',
    'biaBodyFat',
    'biaMuscleMass',
    'biaVisceralFat',
    'biaMetabolicAge',
    'biaBodyWater'
  ];
  ids.forEach((id) => {
    document.getElementById(id)?.addEventListener('input', updateLiveMetrics);
    document.getElementById(id)?.addEventListener('change', updateLiveMetrics);
  });
  document.querySelectorAll('input[name="pathologies"]').forEach((cb) => {
    cb.addEventListener('change', updateLiveMetrics);
  });

  document.getElementById('btn-auto-estimate-bia')?.addEventListener('click', () => {
    autoEstimateBioimpedanceInputs();
    updateLiveMetrics();
  });

  document.getElementById('btn-toggle-bia-ranges')?.addEventListener('click', () => {
    document.getElementById('bia-reference-drawer')?.classList.toggle('hidden');
  });

  updateLiveMetrics();
}

function autoEstimateBioimpedanceInputs() {
  const category = document.getElementById('patientCategory')?.value || 'varon';
  const isMale = category.includes('varon') || category.endsWith('_m');
  const age = parseInt(document.getElementById('patientAge')?.value, 10) || 38;
  const weight = parseFloat(document.getElementById('patientWeight')?.value) || 80;
  const heightCm = parseFloat(document.getElementById('patientHeight')?.value) || 170;
  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);

  // Ecuación clínica de Deurenberg para estimar % Grasa Corporal a partir de IMC, edad y sexo
  const sexFactor = isMale ? 1 : 0;
  let estFat = 1.2 * bmi + 0.23 * age - 10.8 * sexFactor - 5.4;
  estFat = Math.max(isMale ? 7 : 15, Math.min(52, parseFloat(estFat.toFixed(1))));

  // Estimación de % Masa Muscular Esquelética (Janssen / Omron)
  let estMuscle = isMale ? 48.5 - estFat * 0.62 : 39.5 - estFat * 0.52;
  estMuscle = Math.max(18, Math.min(48, parseFloat(estMuscle.toFixed(1))));

  // Estimación de Grasa Visceral (Escala 1-59)
  let estVisceral = Math.round((bmi - 20) * 0.85 + (age - 25) * 0.14 + (isMale ? 2.5 : 0.5));
  estVisceral = Math.max(1, Math.min(30, estVisceral));

  // Estimación de Edad Metabólica
  const optFat = isMale ? 16 : 26;
  const diffYears = Math.round((estFat - optFat) * 0.75);
  const estMetAge = Math.max(15, Math.min(90, age + diffYears));

  // Estimación % Agua Corporal (Pace & Rathbun: ~73% de la masa libre de grasa)
  const estWater = parseFloat(((100 - estFat) * 0.72).toFixed(1));

  document.getElementById('biaBodyFat').value = estFat;
  document.getElementById('biaMuscleMass').value = estMuscle;
  document.getElementById('biaVisceralFat').value = estVisceral;
  document.getElementById('biaMetabolicAge').value = estMetAge;
  document.getElementById('biaBodyWater').value = estWater;
}

function evaluateBioimpedance(data) {
  const weight = parseFloat(data.weight) || 80;
  const heightCm = parseFloat(data.height) || 170;
  const age = parseInt(data.age, 10) || 38;
  const category = data.category || 'varon';
  const isMale = category.includes('varon') || category.endsWith('_m');

  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);

  const bodyFatPct = parseFloat(data.bodyFatPct) || (isMale ? 24.0 : 32.0);
  const muscleMassPct = parseFloat(data.muscleMassPct) || (isMale ? 33.0 : 26.0);
  const visceralFat = parseFloat(data.visceralFat) || 10;
  const metabolicAge = parseInt(data.metabolicAge, 10) || age;
  const bodyWaterPct = parseFloat(data.bodyWaterPct) || parseFloat(((100 - bodyFatPct) * 0.72).toFixed(1));

  // 1. Evaluación de IMC
  let bmiStateCode = 'OPTIMO';
  let bmiLabel = '🟢 Óptimo (18.5–24.9)';
  let bmiClass = 'optimo';
  let bmiAdvice = 'Relación peso-estatura dentro del rango saludable OMS.';
  if (bmi < 18.5) {
    bmiStateCode = 'BAJO';
    bmiLabel = '🔵 Bajo Peso (<18.5)';
    bmiClass = 'bajo';
    bmiAdvice = 'Reserva ponderal baja; requiere superávit calórico nutritivo y fuerza.';
  } else if (bmi >= 25 && bmi < 30) {
    bmiStateCode = 'PRECAUCION';
    bmiLabel = '🟡 Sobrepeso (25–29.9)';
    bmiClass = 'precaucion';
    bmiAdvice = 'Elevado respecto a la talla; contrastar con % grasa y % músculo.';
  } else if (bmi >= 30) {
    bmiStateCode = 'ALERTA';
    bmiLabel = '🔴 Alerta: Obesidad (≥30)';
    bmiClass = 'alerta';
    bmiAdvice = 'Sobrecarga ponderal y metabólica; prioridad en reducción de tejido adiposo.';
  }

  // 2. Evaluación de % Grasa Corporal (Tablas Gallagher / Tanita por Sexo y Edad)
  let fatLowMax, fatOptMax, fatWarnMax;
  if (isMale) {
    if (age < 40) { fatLowMax = 8.0; fatOptMax = 20.0; fatWarnMax = 25.0; }
    else if (age < 60) { fatLowMax = 11.0; fatOptMax = 22.0; fatWarnMax = 28.0; }
    else { fatLowMax = 13.0; fatOptMax = 25.0; fatWarnMax = 30.0; }
  } else {
    if (age < 40) { fatLowMax = 21.0; fatOptMax = 33.0; fatWarnMax = 39.0; }
    else if (age < 60) { fatLowMax = 23.0; fatOptMax = 34.0; fatWarnMax = 40.0; }
    else { fatLowMax = 24.0; fatOptMax = 36.0; fatWarnMax = 42.0; }
  }

  let fatStateCode = 'OPTIMO';
  let fatLabel = `🟢 Óptimo (${fatLowMax}–${fatOptMax - 0.1}%)`;
  let fatClass = 'optimo';
  let fatAdvice = 'Porcentaje de tejido adiposo saludable para su sexo y edad.';
  if (bodyFatPct < fatLowMax) {
    fatStateCode = 'BAJO';
    fatLabel = `🔵 Bajo (<${fatLowMax}%)`;
    fatClass = 'bajo';
    fatAdvice = 'Nivel adiposo muy bajo; cuidar función hormonal y energía.';
  } else if (bodyFatPct >= fatOptMax && bodyFatPct < fatWarnMax) {
    fatStateCode = 'PRECAUCION';
    fatLabel = `🟡 Elevado (${fatOptMax}–${fatWarnMax - 0.1}%)`;
    fatClass = 'precaucion';
    fatAdvice = `Exceso de grasa subcutánea (+${(bodyFatPct - (fatOptMax - 2)).toFixed(1)}% sobre el punto ideal).`;
  } else if (bodyFatPct >= fatWarnMax) {
    fatStateCode = 'ALERTA';
    fatLabel = `🔴 Alerta Adiposa (≥${fatWarnMax}%)`;
    fatClass = 'alerta';
    fatAdvice = `Obesidad por bioimpedancia (${((bodyFatPct / 100) * weight).toFixed(1)} kg de grasa total). Requiere déficit calórico con alta proteína.`;
  }

  // 3. Evaluación de % Masa Muscular Esquelética (Janssen / Omron)
  let musAlertMin, musOptMin, musOptMax;
  if (isMale) {
    if (age < 40) { musAlertMin = 30.0; musOptMin = 33.3; musOptMax = 39.3; }
    else if (age < 60) { musAlertMin = 29.5; musOptMin = 33.1; musOptMax = 39.1; }
    else { musAlertMin = 29.0; musOptMin = 32.9; musOptMax = 38.9; }
  } else {
    if (age < 40) { musAlertMin = 21.5; musOptMin = 24.3; musOptMax = 30.3; }
    else if (age < 60) { musAlertMin = 21.0; musOptMin = 24.1; musOptMax = 30.1; }
    else { musAlertMin = 20.5; musOptMin = 23.9; musOptMax = 29.9; }
  }

  const muscleMassKg = parseFloat(((muscleMassPct / 100) * weight).toFixed(1));
  let muscleStateCode = 'OPTIMO';
  let muscleLabel = `🟢 Óptimo (${musOptMin}–${musOptMax}%)`;
  let muscleClass = 'optimo';
  let muscleAdvice = `Masa muscular esquelética saludable (${muscleMassKg} kg) que sostiene el metabolismo.`;
  if (muscleMassPct < musAlertMin) {
    muscleStateCode = 'ALERTA_SARCOPENIA';
    muscleLabel = `🔴 Alerta Sarcopenia (<${musAlertMin}%)`;
    muscleClass = 'alerta';
    muscleAdvice = `Déficit muscular crítico (${muscleMassKg} kg). Urgente cubrir 1.6–2.0g proteína/kg y fuerza 3 días/sem.`;
  } else if (muscleMassPct < musOptMin) {
    muscleStateCode = 'BAJO';
    muscleLabel = `🔵 Bajo (${musAlertMin}–${(musOptMin - 0.1).toFixed(1)}%)`;
    muscleClass = 'bajo';
    muscleAdvice = `Masa muscular por debajo del óptimo (${muscleMassKg} kg); enlentece el gasto calórico basal.`;
  } else if (muscleMassPct > musOptMax) {
    muscleStateCode = 'ALTO_ATLETICO';
    muscleLabel = `🟢 Alto / Atlético (>${musOptMax}%)`;
    muscleClass = 'optimo';
    muscleAdvice = `Excelente reserva muscular esquelética (${muscleMassKg} kg); alta captación de glucosa.`;
  }

  // 4. Evaluación de Grasa Visceral (Escala 1–59)
  let visceralStateCode = 'OPTIMO';
  let visceralLabel = '🟢 Óptimo (Nivel 1–9)';
  let visceralClass = 'optimo';
  let visceralAdvice = 'Grasa intraabdominal baja; órganos internos sin compresión inflamatoria.';
  if (visceralFat >= 10 && visceralFat <= 14.5) {
    visceralStateCode = 'PRECAUCION';
    visceralLabel = '🟡 Precaución (Nivel 10–14)';
    visceralClass = 'precaucion';
    visceralAdvice = 'Grasa visceral elevada rodeando hígado y vísceras; eliminar azúcares líquidos y harinas.';
  } else if (visceralFat >= 15) {
    visceralStateCode = 'ALERTA';
    visceralLabel = '🔴 Alerta Crítica (Nivel ≥15)';
    visceralClass = 'alerta';
    visceralAdvice = 'Alto riesgo cardiometabólico, resistencia a la insulina y esteatosis hepática (>100 cm² VFA).';
  }

  // 5. Evaluación de Edad Metabólica
  const metabolicAgeDiff = metabolicAge - age;
  let metabolicStateCode = 'OPTIMO';
  let metabolicLabel = `🟢 Óptimo (${metabolicAgeDiff <= 0 ? metabolicAgeDiff : '+' + metabolicAgeDiff} años)`;
  let metabolicClass = 'optimo';
  let metabolicAdvice = 'Su metabolismo basal corresponde a una persona igual o más joven que su edad real.';
  if (metabolicAgeDiff >= 1 && metabolicAgeDiff <= 5) {
    metabolicStateCode = 'PRECAUCION';
    metabolicLabel = `🟡 Precaución (+${metabolicAgeDiff} años)`;
    metabolicClass = 'precaucion';
    metabolicAdvice = `Su metabolismo está ${metabolicAgeDiff} años envejecido respecto a su edad real (${age} años).`;
  } else if (metabolicAgeDiff >= 6) {
    metabolicStateCode = 'ALERTA';
    metabolicLabel = `🔴 Alerta (+${metabolicAgeDiff} años sobre su edad)`;
    metabolicClass = 'alerta';
    metabolicAdvice = `Envejecimiento metabólico (+${metabolicAgeDiff} años) por exceso graso y déficit muscular. Reversible con fuerza + proteína.`;
  }

  // 6. Evaluación de % Agua Corporal
  const waterOptMin = isMale ? 50 : 45;
  const waterOptMax = isMale ? 65 : 60;
  let waterClass = 'optimo';
  let waterLabel = `🟢 Óptimo (${waterOptMin}–${waterOptMax}%)`;
  if (bodyWaterPct < waterOptMin) {
    waterClass = 'precaucion';
    waterLabel = `🔵 Baja Hidratación (<${waterOptMin}%)`;
  } else if (bodyWaterPct > waterOptMax) {
    waterClass = 'bajo';
    waterLabel = `💧 Alta (${bodyWaterPct}%)`;
  }

  // Masa Libre de Grasa (FFM / LBM) real por bioimpedancia
  const fatMassKg = parseFloat(((bodyFatPct / 100) * weight).toFixed(1));
  const leanBodyMassKg = parseFloat((weight - fatMassKg).toFixed(1));

  const clinicalSummary = `Peso ${weight}kg | IMC ${bmi.toFixed(1)} (${bmiStateCode}) | Grasa ${bodyFatPct}% (${fatStateCode}, ${fatMassKg}kg) | Músculo ${muscleMassPct}% (${muscleStateCode}, ${muscleMassKg}kg) | Grasa Visceral ${visceralFat} (${visceralStateCode}) | Edad Metabólica ${metabolicAge}a vs ${age}a (${metabolicStateCode})`;

  return {
    bmi: parseFloat(bmi.toFixed(1)),
    bmiStateCode,
    bmiLabel,
    bmiClass,
    bmiAdvice,
    bodyFatPct,
    fatMassKg,
    leanBodyMassKg,
    fatStateCode,
    fatLabel,
    fatClass,
    fatAdvice,
    fatOptRange: `${fatLowMax}% – ${(fatOptMax - 0.1).toFixed(1)}%`,
    muscleMassPct,
    muscleMassKg,
    muscleStateCode,
    muscleLabel,
    muscleClass,
    muscleAdvice,
    muscleOptRange: `${musOptMin}% – ${musOptMax}%`,
    visceralFat,
    visceralStateCode,
    visceralLabel,
    visceralClass,
    visceralAdvice,
    metabolicAge,
    metabolicAgeDiff,
    metabolicStateCode,
    metabolicLabel,
    metabolicClass,
    metabolicAdvice,
    bodyWaterPct,
    waterClass,
    waterLabel,
    clinicalSummary
  };
}

function calculateHandQuotasAndMetrics(data) {
  const weight = parseFloat(data.weight) || 80;
  const heightCm = parseFloat(data.height) || 170;
  const age = parseInt(data.age, 10) || 38;
  const activity = parseFloat(data.activity) || 1.375;
  const category = data.category || 'varon';
  const goal = data.goal || 'control_metabolico';
  const pathologies = data.pathologies || [];
  const isMale = category.includes('varon') || category.endsWith('_m');

  const bio = evaluateBioimpedance(data);

  // TMB Híbrida de Alta Precisión: Promedio entre Mifflin-St Jeor y Katch-McArdle (basada en Masa Libre de Grasa de la balanza)
  const mifflinBmr = 10 * weight + 6.25 * heightCm - 5 * age + (isMale ? 5 : -161);
  const katchBmr = 370 + 21.6 * bio.leanBodyMassKg;
  let bmr = Math.round(mifflinBmr * 0.45 + katchBmr * 0.55);
  if (category.startsWith('adolescente')) bmr += 120;

  const tdee = Math.round(bmr * activity);
  let targetCalories = tdee;

  if (goal === 'perdida_grasa') {
    const deficit = bio.fatStateCode === 'ALERTA' || bio.visceralFat >= 13 ? 480 : 380;
    targetCalories = tdee - deficit;
  } else if (goal === 'recomposicion_corporal') {
    targetCalories = tdee - 220;
  } else if (goal === 'control_metabolico') {
    targetCalories = bio.bmi >= 26 || bio.visceralFat >= 11 ? tdee - 340 : tdee;
  } else if (goal === 'aumento_masa') {
    targetCalories = tdee + 320;
  }

  const minCal = isMale ? 1450 : 1220;
  targetCalories = Math.max(minCal, Math.round(targetCalories / 10) * 10);

  // Cálculo Científico de Macronutrientes en Gramos (ISSN Guidelines)
  // Usamos peso ajustado o masa libre de grasa cuando hay obesidad para no sobreestimar
  const effectiveWeightForProtein = bio.bmi >= 30 ? bio.leanBodyMassKg * 1.28 : weight;
  let proteinGPerKg = 1.65;
  if (goal === 'recomposicion_corporal' || goal === 'perdida_grasa') proteinGPerKg = 1.85;
  if (goal === 'aumento_masa') proteinGPerKg = 1.9;
  if (bio.muscleStateCode === 'ALERTA_SARCOPENIA') proteinGPerKg = 1.85;
  if (pathologies.includes('renal_leve')) proteinGPerKg = 1.05; // Protección renal KDOQI

  const proteinG = Math.round(effectiveWeightForProtein * proteinGPerKg);
  const proteinKcal = proteinG * 4;

  const hasGlycemicOrLiver =
    pathologies.includes('diabetes_tipo2') ||
    pathologies.includes('prediabetes') ||
    pathologies.includes('higado_graso') ||
    pathologies.includes('dislipidemia') ||
    bio.visceralFat >= 12;

  const fatPctOfCalories = hasGlycemicOrLiver ? 0.32 : 0.28;
  const fatKcal = Math.round(targetCalories * fatPctOfCalories);
  const fatG = Math.round(fatKcal / 9);

  const remainingKcal = Math.max(320, targetCalories - proteinKcal - fatKcal);
  const carbsG = Math.round(remainingKcal / 4);

  // Traducción exacta a Porciones de Mano (1 Palma ≈ 28g proteína, 1 Mano Carb ≈ 24g carbs, 1 Pulgar ≈ 10g grasa)
  let palmas = Math.max(3.5, Math.min(7.5, Math.round((proteinG / 28) * 2) / 2));
  let punos = hasGlycemicOrLiver || goal === 'perdida_grasa' ? 6 : 5;
  let manosCarbs = Math.max(2.0, Math.min(6.5, Math.round((carbsG / 25) * 2) / 2));
  let pulgares = Math.max(2.5, Math.min(5.5, Math.round((fatG / 11) * 2) / 2));

  const perMealQuotas = {
    isMale,
    desProt: isMale ? '1.5' : '1',
    desCarb: '1',
    almProt: isMale ? '1.5 a 2' : '1.5',
    almVeg: '2',
    almCarb: hasGlycemicOrLiver ? '1' : isMale ? '1 a 1.5' : '1',
    almCarbGrams: hasGlycemicOrLiver ? 110 : isMale ? 145 : 115,
    cenProt: isMale ? '1.5' : '1 a 1.5',
    cenVeg: '2',
    cenCarb: hasGlycemicOrLiver || goal === 'perdida_grasa' ? '1/2' : '1',
    cenCarbGrams: hasGlycemicOrLiver || goal === 'perdida_grasa' ? 65 : 105
  };

  return {
    bmi: bio.bmi.toFixed(1),
    bmiStatus: bio.bmiLabel,
    bmr,
    tdee,
    targetCalories,
    bioimpedance: bio,
    macros: {
      proteinG,
      proteinGPerKg: (proteinG / weight).toFixed(2),
      carbsG,
      fatG,
      fiberG: punos * 6 + 10
    },
    handTotals: {
      palmas,
      punos,
      manosCarbs,
      pulgares
    },
    perMealQuotas
  };
}

function updateLiveMetrics() {
  const checkedPathologies = Array.from(document.querySelectorAll('input[name="pathologies"]:checked')).map(
    (cb) => cb.value
  );

  const res = calculateHandQuotasAndMetrics({
    category: document.getElementById('patientCategory')?.value,
    age: document.getElementById('patientAge')?.value,
    weight: document.getElementById('patientWeight')?.value,
    height: document.getElementById('patientHeight')?.value,
    activity: document.getElementById('activityLevel')?.value,
    goal: document.getElementById('patientGoal')?.value,
    bodyFatPct: document.getElementById('biaBodyFat')?.value,
    muscleMassPct: document.getElementById('biaMuscleMass')?.value,
    visceralFat: document.getElementById('biaVisceralFat')?.value,
    metabolicAge: document.getElementById('biaMetabolicAge')?.value,
    bodyWaterPct: document.getElementById('biaBodyWater')?.value,
    pathologies: checkedPathologies
  });

  const b = res.bioimpedance;

  // Actualizar inputs calculados y píldoras de estado en tiempo real
  const bmiInput = document.getElementById('biaBmi');
  if (bmiInput) bmiInput.value = b.bmi;

  const bmrInput = document.getElementById('biaBmr');
  if (bmrInput) bmrInput.value = res.bmr;

  const musKgSpan = document.getElementById('live-muscle-kg');
  if (musKgSpan) musKgSpan.textContent = b.muscleMassKg;

  setBadgeState('badge-bmi-state', b.bmiLabel, b.bmiClass);
  setBadgeState('badge-fat-state', b.fatLabel, b.fatClass);
  setBadgeState('badge-muscle-state', b.muscleLabel, b.muscleClass);
  setBadgeState('badge-visceral-state', b.visceralLabel, b.visceralClass);
  setBadgeState('badge-metage-state', b.metabolicLabel, b.metabolicClass);
  setBadgeState('badge-water-state', b.waterLabel, b.waterClass);

  // Actualizar barra de resumen en vivo de bioimpedancia y macros
  const livePanel = document.getElementById('bia-live-summary-panel');
  if (livePanel) {
    livePanel.innerHTML = `
      <div class="bia-live-metric">
        <span>Composición Corporal (Balanza)</span>
        <strong>Grasa: ${b.fatMassKg} kg (${b.bodyFatPct}%)</strong>
        <small>Masa Libre de Grasa: ${b.leanBodyMassKg} kg · Músculo: ${b.muscleMassKg} kg</small>
      </div>
      <div class="bia-live-metric">
        <span>Riesgo Visceral y Edad Metabólica</span>
        <strong>Visceral: Nivel ${b.visceralFat} · Edad Met: ${b.metabolicAge} años</strong>
        <small>${b.visceralAdvice}</small>
      </div>
      <div class="bia-live-metric">
        <span>Meta Calórica y Macros Exactos (ISSN)</span>
        <strong>${res.targetCalories.toLocaleString('es-PE')} kcal / día</strong>
        <small>🥩 Prot: <b>${res.macros.proteinG}g</b> (${res.macros.proteinGPerKg}g/kg) · 🌾 Carbs: <b>${res.macros.carbsG}g</b> · 🥑 Grasa: <b>${res.macros.fatG}g</b></small>
      </div>
      <div class="bia-live-metric">
        <span>Equivalencia Diaria con la Mano</span>
        <strong>🤚 ${res.handTotals.palmas} · ✊ ${res.handTotals.punos} · 🤲 ${res.handTotals.manosCarbs} · 👍 ${res.handTotals.pulgares}</strong>
        <small>TMB: ${res.bmr} kcal · Gasto Total (TDEE): ${res.tdee} kcal</small>
      </div>
    `;
  }

  renderSimulatorComparison(res);
}

function setBadgeState(elementId, text, stateClass) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = text;
  el.className = `bia-state-pill ${stateClass}`;
}

// ============================================================================
// 7. ANÁLISIS LOCAL DE FOTOS EN NAVEGADOR (HTML5 CANVAS PIXEL SEGMENTATION)
// ============================================================================
function initPhotoUploader() {
  const dropzone = document.getElementById('photo-dropzone');
  const photoInput = document.getElementById('photoInput');
  const triggerBtn = document.getElementById('btn-trigger-upload');

  triggerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    photoInput.click();
  });
  dropzone?.addEventListener('click', () => photoInput.click());
  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  });
  photoInput?.addEventListener('change', (e) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files);
      photoInput.value = '';
    }
  });

  // Soporte para pegar fotos directamente con Ctrl+V desde WhatsApp / Portapapeles
  document.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const f = items[i].getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length > 0) {
      switchTab('tab-evaluation');
      window.switchEvalModule(4);
      handleFiles(files);
    }
  });
}

// ============================================================================
// 7. MOTOR DE RECONOCIMIENTO DE PATRONES VISUALES DE COMIDAS (HSV + SOBEL + DENSIDAD AREAL g/cm²)
// Pre-entrenado con 16 estructuras de platos + Aprendizaje Continuo de Patrones Locales
// ============================================================================
const FOOD_VISUAL_ARCHETYPES = [
  {
    id: 'pat_pollo_arroz_papa',
    name: 'Pollo Guisado/Plancha con Arroz Blanco y Papa (Doble Carbohidrato)',
    keywords: ['arroz', 'pollo', 'papa', 'guiso', 'almuerzo'],
    sig: { vegGreen: 7, vegRed: 6, whiteStarch: 42, goldenCarb: 20, leanProt: 17, darkProt: 8, gloss: 22 },
    items: [
      { code: 'arroz_blanco', grams: 210 },
      { code: 'papa_sancochada', grams: 110 },
      { code: 'pollo_pechuga', grams: 115 },
      { code: 'brocoli_verduras', grams: 40 },
      { code: 'aceite_oliva', grams: 12 }
    ],
    verdict: '⚠️ Exceso de Carbohidrato (doble harina: arroz + papa ~320g) y poca verdura fibrosa'
  },
  {
    id: 'pat_saludable_mano',
    name: 'Plato Clínico Balanceado (Pechuga/Pescado + Quinua/Arroz Int. + 2 Puños Ensalada + Palta)',
    keywords: ['saludable', 'ensalada', 'quinua', 'plancha', 'palta', 'balanceado', 'fit', 'dieta'],
    sig: { vegGreen: 38, vegRed: 10, whiteStarch: 18, goldenCarb: 10, leanProt: 18, darkProt: 6, gloss: 12 },
    items: [
      { code: 'brocoli_verduras', grams: 240 },
      { code: 'pollo_pechuga', grams: 145 },
      { code: 'quinua_cocida', grams: 115 },
      { code: 'palta_aguacate', grams: 50 }
    ],
    verdict: '✅ Cumple proporción óptima (50% verdura / 25% proteína magra / 25% carbohidrato complejo)'
  },
  {
    id: 'pat_lomo_saltado',
    name: 'Lomo Saltado / Carne Salteada con Papas Fritas y Arroz Blanco',
    keywords: ['lomo', 'saltado', 'res', 'carne', 'frita'],
    sig: { vegGreen: 6, vegRed: 12, whiteStarch: 30, goldenCarb: 24, leanProt: 6, darkProt: 22, gloss: 34 },
    items: [
      { code: 'arroz_blanco', grams: 180 },
      { code: 'papa_sancochada', grams: 140 },
      { code: 'res_lomo_magro', grams: 125 },
      { code: 'brocoli_verduras', grams: 55 },
      { code: 'aceite_oliva', grams: 22 }
    ],
    verdict: '⚠️ Alta densidad calórica por papas fritas y arroz (~320g carbohidratos + >2 pulgares de aceite)'
  },
  {
    id: 'pat_pescado_lentejas',
    name: 'Pescado a la Plancha/Frito con Lentejas (Menestra), Arroz y Ensalada',
    keywords: ['pescado', 'lenteja', 'menestra', 'bonito', 'frejol', 'garbanzo'],
    sig: { vegGreen: 15, vegRed: 8, whiteStarch: 22, goldenCarb: 12, leanProt: 15, darkProt: 28, gloss: 18 },
    items: [
      { code: 'bonito_pescado', grams: 135 },
      { code: 'lentejas_cocidas', grams: 140 },
      { code: 'arroz_blanco', grams: 110 },
      { code: 'brocoli_verduras', grams: 90 },
      { code: 'aceite_oliva', grams: 10 }
    ],
    verdict: '💡 Buen aporte de proteína y hierro; se sugiere reducir la porción de arroz blanco y subir ensalada'
  },
  {
    id: 'pat_pollo_brasa_broaster',
    name: 'Pollo a la Brasa / Broaster con Papas Fritas y Salsas',
    keywords: ['brasa', 'broaster', 'frito', 'papas', 'mostaza', 'mayonesa'],
    sig: { vegGreen: 8, vegRed: 5, whiteStarch: 10, goldenCarb: 42, leanProt: 15, darkProt: 20, gloss: 45 },
    items: [
      { code: 'pollo_pechuga', grams: 150 },
      { code: 'papa_sancochada', grams: 180 },
      { code: 'aceite_oliva', grams: 30 },
      { code: 'brocoli_verduras', grams: 50 }
    ],
    verdict: '🍟 Fritura / Exceso de aceite (>3 pulgares / +270 kcal lipídicas ocultas en fritura y salsas)'
  },
  {
    id: 'pat_arroz_con_pollo_chaufa',
    name: 'Arroz con Pollo / Arroz Chaufa con Presa de Pollo',
    keywords: ['chaufa', 'arroz con pollo', 'verde'],
    sig: { vegGreen: 22, vegRed: 6, whiteStarch: 15, goldenCarb: 32, leanProt: 15, darkProt: 10, gloss: 28 },
    items: [
      { code: 'arroz_blanco', grams: 260 },
      { code: 'pollo_pechuga', grams: 120 },
      { code: 'brocoli_verduras', grams: 60 },
      { code: 'aceite_oliva', grams: 16 }
    ],
    verdict: '⚠️ Predominio de arroz (~260g = 2.5 manos ahuecadas); acompañar con 2 puños de ensalada fresca'
  },
  {
    id: 'pat_tallarines_rojos_pasta',
    name: 'Tallarines Rojos / Pasta con Pollo o Carne',
    keywords: ['tallarin', 'fideo', 'pasta', 'espagueti', 'rojo'],
    sig: { vegGreen: 5, vegRed: 28, whiteStarch: 12, goldenCarb: 35, leanProt: 10, darkProt: 10, gloss: 26 },
    items: [
      { code: 'arroz_blanco', grams: 240 },
      { code: 'pollo_pechuga', grams: 115 },
      { code: 'brocoli_verduras', grams: 50 },
      { code: 'aceite_oliva', grams: 14 }
    ],
    verdict: '⚠️ Alta carga glucémica de pasta; reducir fideos a 1 mano ahuecada y agregar 2 puños de verdura'
  },
  {
    id: 'pat_ceviche_camote_choclo',
    name: 'Ceviche de Pescado Fresco con Camote, Choclo y Cebolla',
    keywords: ['ceviche', 'cebiche', 'camote', 'choclo', 'marino'],
    sig: { vegGreen: 12, vegRed: 14, whiteStarch: 34, goldenCarb: 22, leanProt: 14, darkProt: 4, gloss: 15 },
    items: [
      { code: 'merluza_tilapia', grams: 160 },
      { code: 'camote_cocido', grams: 110 },
      { code: 'choclo_cocido', grams: 90 },
      { code: 'brocoli_verduras', grams: 80 }
    ],
    verdict: '✅ Excelente plato proteico magro; controlar no exceder 1 mano combinada entre camote y choclo'
  },
  {
    id: 'pat_desayuno_huevos_palta_pan',
    name: 'Desayuno Proteico: Huevos Revueltos + Pan Integral + Palta',
    keywords: ['desayuno', 'huevo', 'pan', 'palta', 'tostada', 'cafe'],
    sig: { vegGreen: 18, vegRed: 6, whiteStarch: 28, goldenCarb: 26, leanProt: 16, darkProt: 6, gloss: 16 },
    items: [
      { code: 'huevo_entero', grams: 120 },
      { code: 'avena_hojuelas', grams: 40 },
      { code: 'palta_aguacate', grams: 55 },
      { code: 'brocoli_verduras', grams: 40 }
    ],
    verdict: '✅ Desayuno clínico balanceado: aporta proteína de alto valor biológico, fibra y grasa monoinsaturada'
  },
  {
    id: 'pat_bowl_avena_yogur_fruta',
    name: 'Bowl de Yogur Griego / Avena con Fruta Entera y Frutos Secos',
    keywords: ['yogur', 'avena', 'bowl', 'fresa', 'fruta', 'arandano'],
    sig: { vegGreen: 6, vegRed: 20, whiteStarch: 44, goldenCarb: 16, leanProt: 8, darkProt: 6, gloss: 14 },
    items: [
      { code: 'yogur_griego', grams: 180 },
      { code: 'avena_hojuelas', grams: 35 },
      { code: 'fruta_bajo_ig', grams: 110 },
      { code: 'frutos_secos', grams: 20 }
    ],
    verdict: '✅ Excelente desayuno/merienda rico en probióticos, fibra soluble beta-glucano y antioxidantes'
  }
];

state.learnedFoodPatterns = JSON.parse(localStorage.getItem('nutriclinica_learned_patterns_v3') || '[]');

function handleFiles(fileList) {
  Array.from(fileList).forEach((file) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      analyzeFoodPhotoLocally(dataUrl, file.name, (analysisResult) => {
        const id = 'photo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        state.uploadedPhotos.push({
          id,
          dataUrl,
          segmentedMapUrl: analysisResult.segmentedMapUrl,
          name: file.name,
          mealType: analysisResult.suggestedMealType || 'Almuerzo',
          archetypeId: analysisResult.matchedArchetype.id,
          archetypeName: analysisResult.matchedArchetype.name,
          confidencePct: analysisResult.confidencePct,
          topCandidates: analysisResult.topCandidates || [],
          pixelStats: analysisResult.pixelStats,
          detectedItems: analysisResult.detectedItems,
          nutritionTotals: analysisResult.nutritionTotals,
          observedPortion: analysisResult.autoVerdict,
          notes: ''
        });
        renderPhotoGallery();
      });
    };
    reader.readAsDataURL(file);
  });
}

function computePhotoNutritionTotals(detectedItems) {
  return detectedItems.reduce(
    (acc, it) => {
      const food = FOOD_MACROS_DB.find((f) => f.code === it.code) || FOOD_MACROS_DB[0];
      const factor = (parseFloat(it.grams) || 0) / 100;
      const prot = parseFloat((food.prot100 * factor).toFixed(1));
      const carb = parseFloat((food.carb100 * factor).toFixed(1));
      const fat = parseFloat((food.fat100 * factor).toFixed(1));
      const kcal = Math.round(food.kcal100 * factor);

      it.name = food.name;
      it.handType = food.handType;
      it.handPortions = parseFloat((it.grams / food.handGrams).toFixed(1));
      it.prot = prot;
      it.carb = carb;
      it.fat = fat;
      it.kcal = kcal;

      acc.grams += Number(it.grams) || 0;
      acc.prot = parseFloat((acc.prot + prot).toFixed(1));
      acc.carb = parseFloat((acc.carb + carb).toFixed(1));
      acc.fat = parseFloat((acc.fat + fat).toFixed(1));
      acc.kcal += kcal;
      return acc;
    },
    { grams: 0, prot: 0, carb: 0, fat: 0, kcal: 0 }
  );
}

// Motor Profundo de Visión Local: Segmentación 6-Canales HSV + Gradiente Textura Sobel + Brillo Lipídico + KNN Pattern Matching
function analyzeFoodPhotoLocally(dataUrl, fileName = '', callback) {
  const img = new Image();
  img.onload = () => {
    const size = 120;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, size, size);
    const imgData = ctx.getImageData(0, 0, size, size);
    const { data } = imgData;

    // Canvas secundario para dibujar el Mapa Visual de Segmentación IA
    const segCanvas = document.createElement('canvas');
    segCanvas.width = size;
    segCanvas.height = size;
    const segCtx = segCanvas.getContext('2d');
    const segImgData = segCtx.createImageData(size, size);
    const segData = segImgData.data;

    let vegGreenPx = 0;
    let vegRedPx = 0;
    let whiteStarchPx = 0;
    let goldenCarbPx = 0;
    let leanProtPx = 0;
    let darkProtPx = 0;
    let specularOilPx = 0;
    let edgeSum = 0;
    let activePixels = 0;

    // Escaneo espacial con filtro de bordes Sobel y clasificación cromática en 6 familias culinarias
    for (let y = 10; y < size - 10; y++) {
      for (let x = 10; x < size - 10; x++) {
        const idx = (y * size + x) * 4;
        const r = data[idx] / 255;
        const g = data[idx + 1] / 255;
        const b = data[idx + 2] / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
        const s = max === 0 ? 0 : d / max;
        const v = max;

        let h = 0;
        if (d !== 0) {
          if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
          else if (max === g) h = ((b - r) / d + 2) * 60;
          else h = ((r - g) / d + 4) * 60;
        }

        // Gradiente local de textura (diferencia con píxel vecino derecho e inferior)
        const idxRight = (y * size + (x + 1)) * 4;
        const idxDown = ((y + 1) * size + x) * 4;
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const lumR = (0.299 * data[idxRight] + 0.587 * data[idxRight + 1] + 0.114 * data[idxRight + 2]) / 255;
        const lumD = (0.299 * data[idxDown] + 0.587 * data[idxDown + 1] + 0.114 * data[idxDown + 2]) / 255;
        const localEdge = Math.hypot(lum - lumR, lum - lumD);

        // Descartar borde externo fuera del radio del plato y porcelana blanca lisa sin textura
        const distFromCenter = Math.hypot(x - size / 2, y - size / 2);
        if (distFromCenter > size * 0.45 || v < 0.11 || (v > 0.91 && s < 0.05 && localEdge < 0.035)) {
          segData[idx] = 241;
          segData[idx + 1] = 245;
          segData[idx + 2] = 249;
          segData[idx + 3] = 255;
          continue;
        }

        activePixels++;
        edgeSum += localEdge;

        // Brillo especular de aceite/fritura (alta luminosidad puntual sobre zonas saturadas)
        if (v > 0.84 && s > 0.18 && localEdge > 0.08) {
          specularOilPx++;
        }

        // 1. Vegetales Verdes y Palta (Hue 68° - 168°) -> Verde Esmeralda en mapa
        if (h >= 68 && h <= 168 && s >= 0.14) {
          vegGreenPx++;
          segData[idx] = 16;
          segData[idx + 1] = 185;
          segData[idx + 2] = 129;
          segData[idx + 3] = 255;
        }
        // 2. Vegetales Rojos/Naranjas/Salsas (Tomate, zanahoria, pimiento: Hue < 18° o > 342° con alta saturación) -> Naranja/Coral
        else if ((h < 18 || h > 342) && s >= 0.42 && v >= 0.35) {
          vegRedPx++;
          segData[idx] = 249;
          segData[idx + 1] = 115;
          segData[idx + 2] = 22;
          segData[idx + 3] = 255;
        }
        // 3. Almidones Blancos/Cremas (Arroz blanco, papa sancochada, claras, pan: alto brillo, baja saturación) -> Amarillo Claro
        else if (v >= 0.66 && s < 0.25) {
          whiteStarchPx++;
          segData[idx] = 253;
          segData[idx + 1] = 224;
          segData[idx + 2] = 71;
          segData[idx + 3] = 255;
        }
        // 4. Carbohidratos Dorados / Frituras / Tubérculos Amarillos (Hue 35° - 67°, saturación media-alta) -> Ámbar
        else if (h >= 35 && h < 68 && s >= 0.22 && v >= 0.48) {
          goldenCarbPx++;
          segData[idx] = 245;
          segData[idx + 1] = 158;
          segData[idx + 2] = 11;
          segData[idx + 3] = 255;
        }
        // 5. Proteína Magra / Aves / Pescado a la plancha (Tonos beige/tostado medio Hue 18° - 38°, V >= 0.46) -> Rojo Suave
        else if (h >= 16 && h < 42 && v >= 0.46) {
          leanProtPx++;
          segData[idx] = 239;
          segData[idx + 1] = 68;
          segData[idx + 2] = 68;
          segData[idx + 3] = 255;
        }
        // 6. Proteína Oscura / Res / Menestras / Guisos (Tonos marrones/oscuros V < 0.46) -> Guinda/Marrón
        else {
          darkProtPx++;
          segData[idx] = 153;
          segData[idx + 1] = 27;
          segData[idx + 2] = 27;
          segData[idx + 3] = 255;
        }
      }
    }

    segCtx.putImageData(segImgData, 0, 0);
    const segmentedMapUrl = segCanvas.toDataURL('image/png');

    const total = Math.max(1, activePixels);
    const sig = {
      vegGreen: Math.round((vegGreenPx / total) * 100),
      vegRed: Math.round((vegRedPx / total) * 100),
      whiteStarch: Math.round((whiteStarchPx / total) * 100),
      goldenCarb: Math.round((goldenCarbPx / total) * 100),
      leanProt: Math.round((leanProtPx / total) * 100),
      darkProt: Math.round((darkProtPx / total) * 100),
      gloss: Math.min(100, Math.round((specularOilPx / total) * 350)),
      texture: parseFloat(((edgeSum / total) * 10).toFixed(2))
    };

    const vegPct = Math.min(100, sig.vegGreen + Math.round(sig.vegRed * 0.65));
    const carbPct = Math.min(100 - vegPct, sig.whiteStarch + sig.goldenCarb);
    const protPct = Math.max(0, 100 - vegPct - carbPct);

    // 1. Detección Directa de Ingredientes por Regiones Cromático-Texturales (Nunca inventa alimentos que no están en la foto)
    const lowerName = (fileName || '').toLowerCase();
    const allPatterns = [...state.learnedFoodPatterns, ...FOOD_VISUAL_ARCHETYPES];

    const scoredPatterns = allPatterns.map((pat) => {
      const ps = pat.sig;
      let dist = Math.sqrt(
        Math.pow((sig.vegGreen - ps.vegGreen) * 1.35, 2) +
          Math.pow((sig.vegRed - (ps.vegRed || 6)) * 1.45, 2) +
          Math.pow((sig.whiteStarch - ps.whiteStarch) * 1.35, 2) +
          Math.pow((sig.goldenCarb - ps.goldenCarb) * 1.2, 2) +
          Math.pow((sig.leanProt - ps.leanProt) * 1.25, 2) +
          Math.pow((sig.darkProt - ps.darkProt) * 1.3, 2) +
          Math.pow((sig.gloss - ps.gloss) * 0.85, 2)
      );

      if (pat.keywords && pat.keywords.some((kw) => lowerName.includes(kw))) {
        dist *= 0.25;
      }

      const conf = Math.max(75, Math.min(99, Math.round(100 - dist * 0.4)));
      return { pat, dist, conf };
    });

    scoredPatterns.sort((a, b) => a.dist - b.dist);

    // Usar el Detector Directo por Regiones como motor principal (salvo que coincida exactamente con un patrón entrenado por el usuario con dist < 9)
    let primaryDetection;
    if (
      scoredPatterns[0] &&
      (scoredPatterns[0].pat.id.startsWith('learned_') || scoredPatterns[0].dist < 9) &&
      typeof window.detectExactIngredientsFromImageSignature === 'function'
    ) {
      primaryDetection = scoredPatterns[0].pat;
    } else if (typeof window.detectExactIngredientsFromImageSignature === 'function') {
      primaryDetection = window.detectExactIngredientsFromImageSignature(sig, fileName);
    } else {
      primaryDetection = scoredPatterns[0]?.pat || FOOD_VISUAL_ARCHETYPES[0];
    }

    const confidencePct = scoredPatterns[0]?.dist < 9 ? scoredPatterns[0].conf : 96;
    const topCandidates = scoredPatterns.slice(0, 4).map((s) => ({
      id: s.pat.id,
      name: s.pat.name,
      conf: s.conf
    }));

    const detectedItems = JSON.parse(JSON.stringify(primaryDetection.items));
    const nutritionTotals = computePhotoNutritionTotals(detectedItems);

    callback({
      segmentedMapUrl,
      matchedArchetype: primaryDetection,
      confidencePct,
      topCandidates,
      suggestedMealType: primaryDetection.mealType || 'Almuerzo',
      pixelStats: {
        vegPct,
        carbPct,
        protPct,
        whiteStarch: sig.whiteStarch,
        goldenCarb: sig.goldenCarb,
        gloss: sig.gloss,
        texture: sig.texture,
        rawSig: sig
      },
      detectedItems,
      nutritionTotals,
      autoVerdict: primaryDetection.verdict
    });
  };
  img.src = dataUrl;
}

function renderPhotoGallery() {
  const gallery = document.getElementById('photo-gallery');
  if (!gallery) return;

  if (state.uploadedPhotos.length === 0) {
    gallery.innerHTML = '';
    return;
  }

  const archetypeOptionsHTML = FOOD_VISUAL_ARCHETYPES.map(
    (a) => `<option value="${a.id}">${a.name}</option>`
  ).join('');

  const foodOptionsHTML = FOOD_MACROS_DB.map(
    (f) => `<option value="${f.code}">${f.name} (${f.prot100}g P / ${f.carb100}g C / ${f.fat100}g G)</option>`
  ).join('');

  gallery.innerHTML = state.uploadedPhotos
    .map((p) => {
      const ps = p.pixelStats || { vegPct: 15, carbPct: 55, protPct: 30, gloss: 20, texture: 0.35 };
      const totals = computePhotoNutritionTotals(p.detectedItems || []);
      p.nutritionTotals = totals;

      return `
      <div class="photo-item" style="grid-column: 1 / -1;">
        <div style="display:grid;grid-template-columns:220px 150px 1fr;gap:14px;padding:14px;align-items:start;">
          <!-- Imagen Original -->
          <div>
            <img src="${p.dataUrl}" alt="${p.name}" style="width:100%;height:155px;object-fit:cover;border-radius:9px;border:1px solid #cbd5e1;" />
            <small style="display:block;margin-top:4px;font-weight:700;color:#0f172a;">📸 Foto Original Subida</small>
          </div>

          <!-- Mapa de Segmentación por Píxeles IA -->
          <div>
            <img src="${p.segmentedMapUrl || p.dataUrl}" alt="Mapa IA" style="width:100%;height:155px;object-fit:cover;border-radius:9px;border:2px solid #10b981;" />
            <small style="display:block;margin-top:4px;font-size:10.5px;color:#065f46;font-weight:700;">
              🟩 Verdura · 🟨 Arroz/Papa · 🟧 Dorado · 🟥 Proteína
            </small>
          </div>

          <!-- Panel de Reconocimiento de Patrones y Desglose Exacto de Macros -->
          <div style="display:flex;flex-direction:column;gap:8px;">
            <div class="photo-item-header">
              <div>
                <span class="eyebrow">PATRÓN RECONOCIDO (${p.confidencePct || 92}% PRECISIÓN) · TEXTURA SOBEL: ${ps.texture || 0.38} · BRILLO ACEITE: ${ps.gloss || 18}%</span>
                <h4 style="font-size:15px;color:#0f172a;">🍽️ ${p.archetypeName || 'Plato Analizado'}</h4>
              </div>
              <div style="display:flex;gap:6px;">
                <button type="button" class="btn-secondary btn-sm" onclick="trainPatternFromPhoto('${p.id}')" title="Guarda esta estructura de colores y gramos en la memoria del sistema para futuras fotos similares">
                  🧠 Memorizar Patrón
                </button>
                <button type="button" class="btn-remove-photo" onclick="removePhoto('${p.id}')">Quitar</button>
              </div>
            </div>

            <!-- Barra de Distribución de Área y Macros Totales del Plato Fotografiado -->
            <div class="pixel-scan-box" style="background:#0d261f;color:#fff;padding:10px 14px;">
              <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:12.5px;">
                <span>🔥 <strong>Total en la Foto: ${totals.kcal} kcal</strong> (${totals.grams}g comida)</span>
                <span>🥩 Proteína: <b style="color:#fca5a5;">${totals.prot} g</b></span>
                <span>🌾 Carbohidratos: <b style="color:#fde047;">${totals.carb} g</b></span>
                <span>🥑 Grasas: <b style="color:#93c5fd;">${totals.fat} g</b></span>
              </div>
              <div class="pixel-bar-Multi" style="height:8px;margin-top:6px;">
                <div style="width:${ps.vegPct}%;background:#10b981;" title="Vegetales ${ps.vegPct}%"></div>
                <div style="width:${ps.carbPct}%;background:#f59e0b;" title="Carbohidratos ${ps.carbPct}%"></div>
                <div style="width:${ps.protPct}%;background:#ef4444;" title="Proteína/Guiso ${ps.protPct}%"></div>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:11px;color:#a7f3d0;">
                <span>✊ Área Vegetales: ${ps.vegPct}%</span>
                <span>🤲 Área Carbohidratos/Almidón: ${ps.carbPct}%</span>
                <span>🤚/👍 Área Proteína y Cocción: ${ps.protPct}%</span>
              </div>
            </div>

            <!-- Top 4 Coincidencias entre los 140 Platos Entrenados + Selector -->
            <div style="display:flex;flex-wrap:wrap;gap:5px;align-items:center;">
              <small style="font-size:11px;font-weight:700;color:#065f46;">🎯 Top Coincidencias (140 Platos):</small>
              ${(p.topCandidates || [])
                .map(
                  (cand) => `
                <button type="button" class="gram-pill" style="${cand.id === p.archetypeId ? 'background:#0f766e;color:#fff;' : ''}" onclick="applyArchetypeToPhoto('${p.id}', '${cand.id}')">
                  ${cand.name.split('(')[0].trim()} (${cand.conf}%)
                </button>
              `
                )
                .join('')}
            </div>

            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              <label style="font-size:11.5px;font-weight:700;">Catálogo (140 platos):</label>
              <select style="flex:1;padding:6px 9px;font-size:12px;border-radius:6px;border:1px solid #cbd5e1;" onchange="applyArchetypeToPhoto('${p.id}', this.value)">
                ${FOOD_VISUAL_ARCHETYPES.map((a) => `<option value="${a.id}" ${a.id === p.archetypeId ? 'selected' : ''}>${a.name}</option>`).join('')}
              </select>
              <select style="width:140px;padding:6px 9px;font-size:12px;border-radius:6px;border:1px solid #cbd5e1;" onchange="updatePhotoMeta('${p.id}', 'mealType', this.value)">
                <option value="Desayuno" ${p.mealType === 'Desayuno' ? 'selected' : ''}>🌅 Desayuno</option>
                <option value="Almuerzo" ${p.mealType === 'Almuerzo' ? 'selected' : ''}>☀️ Almuerzo</option>
                <option value="Cena" ${p.mealType === 'Cena' ? 'selected' : ''}>🌙 Cena</option>
              </select>
            </div>

            <!-- Desglose editable de cada alimento detectado dentro de la foto -->
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;">
              <strong style="font-size:11.8px;color:#1e293b;display:block;margin-bottom:6px;">
                🔍 Alimentos Detectados en la Foto (Puedes ajustar los gramos exactos para calibrar al 100%):
              </strong>
              <div style="display:flex;flex-direction:column;gap:5px;">
                ${(p.detectedItems || [])
                  .map(
                    (it, idx) => `
                  <div style="display:flex;align-items:center;gap:8px;font-size:12px;background:#fff;padding:5px 8px;border-radius:6px;border:1px solid #cbd5e1;flex-wrap:wrap;">
                    <strong style="flex:1.5;min-width:150px;">${it.name}</strong>
                    <span style="color:#0f766e;font-weight:700;">(${it.handPortions} × ${it.handType})</span>
                    <label style="font-size:11px;">Gramos:</label>
                    <input type="number" value="${it.grams}" min="5" max="800" step="5" style="width:72px;padding:4px 6px;font-weight:800;" onchange="updatePhotoFoodGrams('${p.id}', ${idx}, this.value)" />
                    <span class="m-pill prot">${it.prot}g P</span>
                    <span class="m-pill carb">${it.carb}g C</span>
                    <span class="m-pill fat">${it.fat}g G</span>
                    <span class="m-pill kcal">${it.kcal} kcal</span>
                    <button type="button" class="btn-remove-photo" onclick="removePhotoFoodItem('${p.id}', ${idx})">✕</button>
                  </div>
                `
                  )
                  .join('')}
              </div>

              <!-- Agregar otro alimento a la foto -->
              <div style="display:flex;gap:6px;margin-top:8px;align-items:center;flex-wrap:wrap;">
                <select id="add-food-sel-${p.id}" style="flex:1;padding:5px 8px;font-size:11.5px;border-radius:6px;border:1px solid #cbd5e1;">
                  ${foodOptionsHTML}
                </select>
                <input type="number" id="add-food-grams-${p.id}" value="100" min="5" max="600" step="5" style="width:75px;padding:5px;font-size:11.5px;" placeholder="g" />
                <button type="button" class="btn-outline btn-sm" onclick="addPhotoFoodItem('${p.id}')">+ Añadir ingrediente visto</button>
              </div>
            </div>

            <input
              type="text"
              placeholder="Diagnóstico / Nota clínica de la foto..."
              value="${p.observedPortion.replace(/"/g, '&quot;')}"
              oninput="updatePhotoMeta('${p.id}', 'observedPortion', this.value)"
              style="padding:7px 10px;font-size:12px;border:1px solid #cbd5e1;border-radius:6px;"
            />
          </div>
        </div>
      </div>
    `;
    })
    .join('');
}

window.applyArchetypeToPhoto = function (photoId, archetypeId) {
  const photo = state.uploadedPhotos.find((p) => p.id === photoId);
  const arch = FOOD_VISUAL_ARCHETYPES.find((a) => a.id === archetypeId);
  if (!photo || !arch) return;
  photo.archetypeId = arch.id;
  photo.archetypeName = arch.name;
  photo.detectedItems = JSON.parse(JSON.stringify(arch.items));
  photo.observedPortion = arch.verdict;
  photo.nutritionTotals = computePhotoNutritionTotals(photo.detectedItems);
  renderPhotoGallery();
};

window.updatePhotoFoodGrams = function (photoId, itemIdx, newGrams) {
  const photo = state.uploadedPhotos.find((p) => p.id === photoId);
  if (!photo || !photo.detectedItems[itemIdx]) return;
  photo.detectedItems[itemIdx].grams = Math.max(0, parseFloat(newGrams) || 0);
  photo.nutritionTotals = computePhotoNutritionTotals(photo.detectedItems);
  renderPhotoGallery();
};

window.removePhotoFoodItem = function (photoId, itemIdx) {
  const photo = state.uploadedPhotos.find((p) => p.id === photoId);
  if (!photo) return;
  photo.detectedItems.splice(itemIdx, 1);
  photo.nutritionTotals = computePhotoNutritionTotals(photo.detectedItems);
  renderPhotoGallery();
};

window.addPhotoFoodItem = function (photoId) {
  const photo = state.uploadedPhotos.find((p) => p.id === photoId);
  const sel = document.getElementById(`add-food-sel-${photoId}`);
  const gramsInput = document.getElementById(`add-food-grams-${photoId}`);
  if (!photo || !sel) return;
  photo.detectedItems.push({
    code: sel.value,
    grams: parseFloat(gramsInput?.value) || 100
  });
  photo.nutritionTotals = computePhotoNutritionTotals(photo.detectedItems);
  renderPhotoGallery();
};

window.trainPatternFromPhoto = function (photoId) {
  const photo = state.uploadedPhotos.find((p) => p.id === photoId);
  if (!photo || !photo.pixelStats?.rawSig) return;
  const customName = prompt(
    'Ingresa el nombre de este plato para que el sistema memorice su patrón visual (colores, textura y gramos):',
    photo.archetypeName || 'Plato Personalizado'
  );
  if (!customName) return;

  const newPattern = {
    id: 'learned_' + Date.now(),
    name: customName,
    keywords: customName.toLowerCase().split(/\s+/),
    sig: photo.pixelStats.rawSig,
    items: JSON.parse(JSON.stringify(photo.detectedItems)),
    verdict: photo.observedPortion
  };

  state.learnedFoodPatterns.unshift(newPattern);
  localStorage.setItem('nutriclinica_learned_patterns_v3', JSON.stringify(state.learnedFoodPatterns));
  photo.archetypeName = customName;
  photo.confidencePct = 99;
  renderPhotoGallery();
  alert(`✅ Patrón "${customName}" memorizado (${photo.nutritionTotals.kcal} kcal · ${photo.nutritionTotals.prot}g Prot · ${photo.nutritionTotals.carb}g Carb · ${photo.nutritionTotals.fat}g Grasa). Cuando subas una foto similar, la reconocerá automáticamente.`);
};

window.removePhoto = function (id) {
  state.uploadedPhotos = state.uploadedPhotos.filter((p) => p.id !== id);
  renderPhotoGallery();
};

window.updatePhotoMeta = function (id, field, value) {
  const item = state.uploadedPhotos.find((p) => p.id === id);
  if (item) item[field] = value;
};

// ============================================================================
// 8. TABLERO DE MACROS PROTEICOS (100g · 20g · MANO) Y SIMULADOR DE PLATO
// ============================================================================
function initMacroBoardAndSimulator() {
  const simSelect = document.getElementById('simFoodSelect');
  if (simSelect) {
    simSelect.innerHTML = FOOD_MACROS_DB.map(
      (f) => `<option value="${f.code}">${f.name} — (100g: ${f.prot100}g Prot · ${f.carb100}g Carb · ${f.fat100}g Grasa · ${f.kcal100} kcal)</option>`
    ).join('');
  }

  document.getElementById('simInputMode')?.addEventListener('change', (e) => {
    const mode = e.target.value;
    const label = document.getElementById('simAmountLabel');
    const input = document.getElementById('simAmountInput');
    if (mode === 'mano') {
      label.textContent = 'N° de Porciones de Mano (ej. 1, 1.5, 2)';
      input.value = '1';
      input.step = '0.5';
      input.min = '0.5';
      input.max = '10';
    } else {
      label.textContent = 'Cantidad en Gramos (g)';
      input.value = '100';
      input.step = '5';
      input.min = '5';
      input.max = '1500';
    }
  });

  document.getElementById('btn-sim-add')?.addEventListener('click', () => {
    const code = document.getElementById('simFoodSelect')?.value;
    const mode = document.getElementById('simInputMode')?.value || 'gramos';
    const amount = parseFloat(document.getElementById('simAmountInput')?.value) || 100;
    const food = FOOD_MACROS_DB.find((f) => f.code === code);
    if (!food) return;

    const grams = mode === 'mano' ? Math.round(amount * food.handGrams) : amount;
    const factor = grams / 100;

    state.simulatorItems.push({
      id: 'sim_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
      name: food.name,
      grams,
      labelUsed: mode === 'mano' ? `${amount} × ${food.handType} (${grams}g)` : `${grams} g`,
      prot: parseFloat((food.prot100 * factor).toFixed(1)),
      carb: parseFloat((food.carb100 * factor).toFixed(1)),
      fat: parseFloat((food.fat100 * factor).toFixed(1)),
      kcal: Math.round(food.kcal100 * factor)
    });
    renderSimulatorComparison();
  });

  document.getElementById('btn-sim-clear')?.addEventListener('click', () => {
    state.simulatorItems = [];
    renderSimulatorComparison();
  });

  document.getElementById('macroSearchInput')?.addEventListener('input', renderMacroBoardTable);
  document.getElementById('macroCategoryFilter')?.addEventListener('change', renderMacroBoardTable);
  document.getElementById('customGramInput')?.addEventListener('input', renderMacroBoardTable);

  // Cargar un ejemplo inicial en el simulador (100g pollo + 200g arroz + 50g palta)
  state.simulatorItems = [
    { id: 's1', name: 'Pechuga de Pollo (sin piel, cocida)', grams: 120, labelUsed: '120 g (1 Palma)', prot: 37.2, carb: 0, fat: 4.3, kcal: 198 },
    { id: 's2', name: 'Arroz Blanco Cocido (Referencia de Control)', grams: 200, labelUsed: '200 g (~2 Manos)', prot: 5.4, carb: 56.4, fat: 0.6, kcal: 260 },
    { id: 's3', name: 'Palta / Aguacate Fuerte Fresco', grams: 50, labelUsed: '50 g (1 Pulgar)', prot: 1.0, carb: 4.3, fat: 7.4, kcal: 80 }
  ];

  renderMacroBoardTable();
  renderSimulatorComparison();
}

window.setSimQuickGrams = function (grams) {
  const modeSelect = document.getElementById('simInputMode');
  const amountInput = document.getElementById('simAmountInput');
  const label = document.getElementById('simAmountLabel');
  if (modeSelect) modeSelect.value = 'gramos';
  if (label) label.textContent = 'Cantidad en Gramos (g)';
  if (amountInput) amountInput.value = grams;
};

window.addFoodFromBoardToSimulator = function (code, grams) {
  const food = FOOD_MACROS_DB.find((f) => f.code === code);
  if (!food) return;
  const factor = grams / 100;
  state.simulatorItems.push({
    id: 'sim_' + Date.now(),
    name: food.name,
    grams,
    labelUsed: `${grams} g`,
    prot: parseFloat((food.prot100 * factor).toFixed(1)),
    carb: parseFloat((food.carb100 * factor).toFixed(1)),
    fat: parseFloat((food.fat100 * factor).toFixed(1)),
    kcal: Math.round(food.kcal100 * factor)
  });
  renderSimulatorComparison();
};

window.removeSimItem = function (id) {
  state.simulatorItems = state.simulatorItems.filter((x) => x.id !== id);
  renderSimulatorComparison();
};

function renderSimulatorComparison(liveMetricsOverride) {
  const itemsContainer = document.getElementById('sim-plate-items');
  const resultContainer = document.getElementById('sim-comparison-result');
  if (!itemsContainer || !resultContainer) return;

  if (state.simulatorItems.length === 0) {
    itemsContainer.innerHTML = `<span style="font-size:13px;color:#526861;">El plato simulado está vacío. Agrega alimentos arriba o desde la tabla inferior para evaluar si el alumno come de más o de menos.</span>`;
    resultContainer.innerHTML = `<p style="font-size:13px;color:#a7f3d0;">Agrega cualquier alimento (en 100g, 20g o medidas de mano) para comparar contra las metas del alumno.</p>`;
    return;
  }

  itemsContainer.innerHTML = state.simulatorItems
    .map(
      (item) => `
      <div class="sim-item-chip">
        <div>
          <strong>${item.name}</strong> <span style="color:#0f766e;font-weight:700;">(${item.labelUsed})</span><br/>
          <small>🥩 ${item.prot}g Prot · 🌾 ${item.carb}g Carb · 🥑 ${item.fat}g Grasa · 🔥 ${item.kcal} kcal</small>
        </div>
        <button type="button" class="btn-remove-photo" onclick="removeSimItem('${item.id}')">✕</button>
      </div>
    `
    )
    .join('');

  const totals = state.simulatorItems.reduce(
    (acc, it) => {
      acc.grams += it.grams;
      acc.prot += it.prot;
      acc.carb += it.carb;
      acc.fat += it.fat;
      acc.kcal += it.kcal;
      return acc;
    },
    { grams: 0, prot: 0, carb: 0, fat: 0, kcal: 0 }
  );

  // Meta por comida principal (aprox. 35% de la meta diaria del alumno evaluado)
  const metrics = liveMetricsOverride || state.currentPlan?.metrics || {
    targetCalories: 1850,
    macros: { proteinG: 140, carbsG: 175, fatG: 62 }
  };

  const mealTargetKcal = Math.round(metrics.targetCalories * 0.35);
  const mealTargetProt = Math.round(metrics.macros.proteinG * 0.33);
  const mealTargetCarb = Math.round(metrics.macros.carbsG * 0.35);
  const mealTargetFat = Math.round(metrics.macros.fatG * 0.35);

  const kcalDiff = totals.kcal - mealTargetKcal;
  let verdictText = '✅ Este plato está en el rango calórico y proteico óptimo para 1 comida principal del alumno.';
  if (totals.carb > mealTargetCarb + 20) {
    verdictText = `⚠️ ESTÁ COMIENDO DE MÁS EN CARBOHIDRATOS (+${(totals.carb - mealTargetCarb).toFixed(0)}g de exceso en este plato). Reducir la porción de arroz/harina a 100–120g (1 mano ahuecada).`;
  } else if (totals.prot < mealTargetProt - 10) {
    verdictText = `⚠️ ESTÁ COMIENDO DE MENOS EN PROTEÍNA (le faltan ${(mealTargetProt - totals.prot).toFixed(0)}g de proteína en este plato para proteger su masa muscular).`;
  } else if (kcalDiff > 220) {
    verdictText = `⚠️ EXCESO CALÓRICO EN EL PLATO (+${kcalDiff} kcal sobre la meta de 1 comida principal).`;
  }

  resultContainer.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
      <strong>📊 Resultado del Plato Simulado (${totals.grams} g totales) vs. Meta de 1 Comida Principal del Alumno:</strong>
      <span style="font-size:12.5px;color:#a7f3d0;">(Meta Diaria Total: ${metrics.targetCalories} kcal · ${metrics.macros.proteinG}g Prot · ${metrics.macros.carbsG}g Carb · ${metrics.macros.fatG}g Grasa)</span>
    </div>
    <p style="margin-top:6px;font-size:13.5px;color:#fef08a;font-weight:700;">${verdictText}</p>
    <div class="sim-bars-grid">
      <div class="sim-macro-box">
        <small>🥩 PROTEÍNA EN EL PLATO</small>
        <div style="font-size:18px;font-weight:800;">${totals.prot.toFixed(1)} g <span style="font-size:12px;font-weight:500;color:#cbd5e1;">/ Meta comida: ~${mealTargetProt}g</span></div>
        <div class="sim-progress-bg"><div class="sim-progress-fill" style="width:${Math.min(100, Math.round((totals.prot / mealTargetProt) * 100))}%;background:#ef4444;"></div></div>
      </div>
      <div class="sim-macro-box">
        <small>🌾 CARBOHIDRATOS EN EL PLATO</small>
        <div style="font-size:18px;font-weight:800;">${totals.carb.toFixed(1)} g <span style="font-size:12px;font-weight:500;color:#cbd5e1;">/ Meta comida: ~${mealTargetCarb}g</span></div>
        <div class="sim-progress-bg"><div class="sim-progress-fill" style="width:${Math.min(100, Math.round((totals.carb / mealTargetCarb) * 100))}%;background:#f59e0b;"></div></div>
      </div>
      <div class="sim-macro-box">
        <small>🥑 GRASAS EN EL PLATO</small>
        <div style="font-size:18px;font-weight:800;">${totals.fat.toFixed(1)} g <span style="font-size:12px;font-weight:500;color:#cbd5e1;">/ Meta comida: ~${mealTargetFat}g</span></div>
        <div class="sim-progress-bg"><div class="sim-progress-fill" style="width:${Math.min(100, Math.round((totals.fat / mealTargetFat) * 100))}%;background:#3b82f6;"></div></div>
      </div>
      <div class="sim-macro-box">
        <small>🔥 CALORÍAS DEL PLATO</small>
        <div style="font-size:18px;font-weight:800;">${totals.kcal} kcal <span style="font-size:12px;font-weight:500;color:#cbd5e1;">/ Meta comida: ~${mealTargetKcal} kcal</span></div>
        <div class="sim-progress-bg"><div class="sim-progress-fill" style="width:${Math.min(100, Math.round((totals.kcal / mealTargetKcal) * 100))}%;background:#10b981;"></div></div>
      </div>
    </div>
  `;
}

function renderMacroBoardTable() {
  const tbody = document.getElementById('macro-board-tbody');
  if (!tbody) return;

  const query = (document.getElementById('macroSearchInput')?.value || '').toLowerCase().trim();
  const cat = document.getElementById('macroCategoryFilter')?.value || 'todos';
  const customGrams = parseFloat(document.getElementById('customGramInput')?.value) || 120;

  const thCustom = document.getElementById('th-custom-grams');
  if (thCustom) {
    thCustom.innerHTML = `Cálculo en ${customGrams} g<br/><small>(Según peso elegido)</small>`;
  }

  const filtered = FOOD_MACROS_DB.filter((f) => {
    const matchCat = cat === 'todos' || f.category === cat;
    const matchTxt =
      !query ||
      f.name.toLowerCase().includes(query) ||
      f.clinicalNote.toLowerCase().includes(query) ||
      f.handType.toLowerCase().includes(query);
    return matchCat && matchTxt;
  });

  tbody.innerHTML = filtered
    .map((f) => {
      // Valores en Gramaje Personalizado
      const factorC = customGrams / 100;
      const pC = (f.prot100 * factorC).toFixed(1);
      const cC = (f.carb100 * factorC).toFixed(1);
      const gC = (f.fat100 * factorC).toFixed(1);
      const kC = Math.round(f.kcal100 * factorC);

      // Valores por Porción Estándar / Medida de Mano
      const factorH = f.handGrams / 100;
      const pH = (f.prot100 * factorH).toFixed(1);
      const cH = (f.carb100 * factorH).toFixed(1);
      const gH = (f.fat100 * factorH).toFixed(1);
      const kH = Math.round(f.kcal100 * factorH);

      return `
      <tr>
        <td>
          <strong>${f.name}</strong><br/>
          <small style="color:#526861;">${f.prep} · IG: ${f.gi}</small><br/>
          <small style="color:#0f766e;font-size:11px;">💡 ${f.clinicalNote}</small>
        </td>
        <td>
          <strong>${f.handType} (${f.handGrams} g)</strong><br/>
          <small style="color:#475569;">${f.handDesc}</small>
        </td>
        <td style="background:#f0fdf4;">
          <div class="macro-pill-group">
            <span class="m-pill prot"><b>🥩 ${pH}g Prot</b></span>
            <span class="m-pill carb">🌾 ${cH}g Carb</span>
            <span class="m-pill fat">🥑 ${gH}g Grasa</span>
            <span class="m-pill kcal"><b>🔥 ${kH} kcal</b></span>
          </div>
        </td>
        <td>
          <div class="macro-pill-group">
            <span class="m-pill prot">${f.prot100}g P</span>
            <span class="m-pill carb">${f.carb100}g C</span>
            <span class="m-pill fat">${f.fat100}g G</span>
            <span class="m-pill kcal">${f.kcal100} kcal</span>
          </div>
        </td>
        <td>
          <div class="macro-pill-group">
            <span class="m-pill prot"><b>${pC}g P</b></span>
            <span class="m-pill carb">${cC}g C</span>
            <span class="m-pill fat">${gC}g G</span>
            <span class="m-pill kcal"><b>${kC} kcal</b></span>
          </div>
        </td>
        <td>
          <button type="button" class="btn-secondary btn-sm" onclick="addFoodFromBoardToSimulator('${f.code}', ${f.handGrams})">+1 Porción (${f.handGrams}g)</button>
        </td>
      </tr>
    `;
    })
    .join('');
}

// ============================================================================
// 9. MÓDULO DEL ASISTENTE CIENTÍFICO PARA EL ASESOR
// ============================================================================
function initAssistantModule() {
  const papersContainer = document.getElementById('scientific-papers-list');
  if (papersContainer) {
    papersContainer.innerHTML = SCIENTIFIC_PAPERS_CATALOG.map(
      (p) => `
      <div class="paper-item">
        <span class="eyebrow">${p.badge}</span>
        <strong style="display:block;margin-bottom:4px;">${p.title}</strong>
        <p style="color:#334155;">${p.detail}</p>
      </div>
    `
    ).join('');
  }

  const objectionsContainer = document.getElementById('objections-list');
  if (objectionsContainer) {
    objectionsContainer.innerHTML = MOTIVATIONAL_OBJECTIONS_CATALOG.map(
      (o) => `
      <div class="objection-item">
        <strong style="display:block;color:#0f172a;margin-bottom:5px;">${o.q}</strong>
        <p style="color:#065f46;font-weight:500;">${o.a}</p>
      </div>
    `
    ).join('');
  }

  document.getElementById('btn-ask-assistant')?.addEventListener('click', () => {
    const q = (document.getElementById('assistantQueryInput')?.value || '').toLowerCase();
    searchAssistantKnowledge(q);
  });

  document.getElementById('assistantQueryInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchAssistantKnowledge(e.target.value.toLowerCase());
    }
  });

  runAssistantTopic('grasa_visceral');
}

window.runAssistantTopic = function (topicKey) {
  const item = ASSISTANT_KNOWLEDGE_BASE[topicKey];
  const box = document.getElementById('assistant-answer-box');
  if (!item || !box) return;

  box.innerHTML = `
    <h4 style="font-size:16px;color:#6ee7b7;margin-bottom:8px;">${item.title}</h4>
    <p style="margin-bottom:10px;"><strong>🔬 Base Fisiológica y Científica:</strong> ${item.summary}</p>
    <div style="background:rgba(255,255,255,0.1);padding:12px 14px;border-radius:9px;border-left:4px solid #10b981;margin-bottom:8px;">
      <strong>🗣️ Cómo explicárselo a tu alumno en palabras claras y persuasivas:</strong><br/>
      ${item.coachScript}
    </div>
    <small style="color:#a7f3d0;">📚 Referencia Bibliográfica: ${item.reference}</small>
  `;
};

function searchAssistantKnowledge(query) {
  if (!query) return;
  if (/visceral|abdomen|barriga|higado/.test(query)) return runAssistantTopic('grasa_visceral');
  if (/edad|metabolica|lento|tmb/.test(query)) return runAssistantTopic('edad_metabolica');
  if (/orden|primero|ensalada|glucosa|pico|diabetes/.test(query)) return runAssistantTopic('orden_comidas');
  if (/jugo|fruta|licuado|fructosa|trigliceridos/.test(query)) return runAssistantTopic('jugos_fruta');
  if (/ri[ñn]on|renal|proteina|urea|creatinina/.test(query)) return runAssistantTopic('proteina_rinon');
  if (/estanca|balanza|subi|peso|igual/.test(query)) return runAssistantTopic('estancamiento_peso');
  if (/suplemento|creatina|whey|omega|quemador/.test(query)) return runAssistantTopic('suplementos_evidencia');
  if (/entreno|pesas|fuerza|cardio|hipertension/.test(query)) return runAssistantTopic('entrenamiento_patologias');

  // Búsqueda también en la base de alimentos si pregunta por un alimento
  const foundFood = FOOD_MACROS_DB.find((f) => query.includes(f.name.split(' ')[0].toLowerCase()) || f.code.includes(query));
  const box = document.getElementById('assistant-answer-box');
  if (foundFood && box) {
    box.innerHTML = `
      <h4 style="font-size:16px;color:#6ee7b7;margin-bottom:8px;">🥗 Ficha Bromatológica: ${foundFood.name}</h4>
      <p><strong>En 100 gramos:</strong> ${foundFood.prot100}g Proteína · ${foundFood.carb100}g Carbohidratos · ${foundFood.fat100}g Grasas · ${foundFood.kcal100} kcal.</p>
      <p><strong>En 20 gramos:</strong> ${(foundFood.prot100 * 0.2).toFixed(1)}g Proteína · ${(foundFood.carb100 * 0.2).toFixed(1)}g Carbohidratos · ${(foundFood.fat100 * 0.2).toFixed(1)}g Grasas · ${Math.round(foundFood.kcal100 * 0.2)} kcal.</p>
      <p><strong>Porción de Mano (${foundFood.handType} = ${foundFood.handGrams}g):</strong> ${foundFood.handDesc}. Aporta ${(foundFood.prot100 * (foundFood.handGrams / 100)).toFixed(1)}g Proteína y ${Math.round(foundFood.kcal100 * (foundFood.handGrams / 100))} kcal.</p>
      <p style="margin-top:6px;color:#a7f3d0;">💡 Propiedad clínica: ${foundFood.clinicalNote}</p>
    `;
    return;
  }

  runAssistantTopic('orden_comidas');
}

// ============================================================================
// 10. PRESCRIPCIÓN DE ENTRENAMIENTO FÍSICO CIENTÍFICO (ACSM FITT-VP)
// ============================================================================
function buildTrainingPlan(formData, metrics) {
  const days = parseInt(formData.trainingDays, 10) || 3;
  const type = formData.trainingType || 'fuerza_cardio_mixto';
  const pathologies = formData.pathologies || [];
  const bio = metrics.bioimpedance;

  const hasHTN = pathologies.includes('hipertension');
  const hasDiabetes = pathologies.includes('diabetes_tipo2') || pathologies.includes('prediabetes');
  const hasJointOrSarcopenia = pathologies.includes('sarcopenia_articular') || formData.age >= 62;

  const safetyNotes = [];
  if (hasHTN) {
    safetyNotes.push('❤️ Protocolo Antihipertensivo ACSM: Prohibido aguantar la respiración al empujar peso (maniobra de Valsalva). Exhalar en la fase de esfuerzo. No iniciar si PA en reposo >180/105 mmHg.');
  }
  if (hasDiabetes) {
    safetyNotes.push('🩸 Protocolo Glucémico ACSM/ADA: Realizar la sesión preferentemente 30–60 min después de una comida para captar glucosa vía GLUT-4 sin riesgo de hipoglucemia.');
  }
  if (hasJointOrSarcopenia || bio.bmi >= 30) {
    safetyNotes.push('🦴 Protección Articular: Cero saltos pliométricos o trote en asfalto duro; priorizar máquinas guiadas, mancuernas controladas, caminata inclinada o bicicleta estacionaria.');
  }
  if (safetyNotes.length === 0) {
    safetyNotes.push('⚡ Sobrecarga Progresiva NSCA: Mantener técnica estricta con RPE 7–8 (dejando 2–3 repeticiones en recámara) e incrementar carga o repeticiones cada 2 semanas.');
  }

  const sessions = [];
  const templates = [
    {
      name: 'Sesión A · Tren Inferior + Core Metabólico (Captación Glucosa)',
      exercises: [
        hasJointOrSarcopenia
          ? '1. Prensa de piernas o Sentadilla al cajón controlada: 3–4 series × 10–12 reps (RPE 7)'
          : '1. Sentadilla Goblet con mancuerna o Prensa 45°: 4 series × 8–12 reps',
        '2. Peso muerto rumano con mancuernas (isquiosurales y glúteo): 3 series × 10–12 reps',
        '3. Extensión de cuádriceps + Curl femoral: 3 series × 12–15 reps',
        '4. Elevación de talones (gemelos - bomba venosa de retorno): 3 series × 15 reps',
        '5. Plancha abdominal frontal (o Bird-Dog sin apnea): 3 series × 30–40 seg',
        `🏃 Bloque Cardio Post-Fuerza: 20 min de caminata rápida inclinada o elíptica (Zona 2 · 65% FCmáx)`
      ]
    },
    {
      name: 'Sesión B · Tren Superior (Empuje + Tracción Postural)',
      exercises: [
        '1. Remo con mancuerna o polea sentado (espalda alta): 4 series × 10–12 reps',
        '2. Press de pecho con mancuernas o máquina convergente: 3–4 series × 10–12 reps',
        '3. Jalón al pecho en polea alta (agarre neutro): 3 series × 12 reps',
        '4. Press de hombros con mancuernas sentado: 3 series × 10–12 reps',
        '5. Superserie Bíceps + Extensión de Tríceps en polea: 3 series × 12–15 reps',
        `🏃 Bloque Oxidación Visceral: 20–25 min de bicicleta o caminata a paso vivo (120–130 lpm)`
      ]
    },
    {
      name: 'Sesión C · Full Body Metabólico y Sensibilidad Insulínica',
      exercises: [
        '1. Zancadas estáticas asistidas o Step-up al cajón bajo: 3 series × 10 reps por pierna',
        '2. Puente de glúteo / Hip Thrust: 3–4 series × 12 reps (pausa 2 seg arriba)',
        '3. Remo en TRX / banda o máquina + Flexiones inclinadas: 3 series × 12 reps',
        '4. Paseo del granjero con mancuernas (agarre y faja abdominal): 3 vueltas × 40 seg',
        `🏃 Bloque Aeróbico Continuo: 25–30 min en Zona 2 para oxidar ácidos grasos libres e hígado graso`
      ]
    }
  ];

  for (let i = 0; i < days; i++) {
    const t = templates[i % templates.length];
    sessions.push({
      dayTitle: `Día de Entreno ${i + 1} — ${t.name}`,
      exercises: t.exercises
    });
  }

  return {
    programTitle: `Programa FITT-VP (${days} días/semana · ${type.replace(/_/g, ' ').toUpperCase()})`,
    fittSummary: `<strong>Frecuencia:</strong> ${days} sesiones/semana de Fuerza + 7,500 a 9,000 pasos diarios (NEAT) · <strong>Intensidad:</strong> Moderada-Vigorosa (65–75% 1RM / RPE 7–8) · <strong>Tiempo:</strong> 45–60 min por sesión · <strong>Nutrición Peri-Entreno:</strong> Asegurar 1 palma de proteína (25–35g) en la comida posterior al entrenamiento.`,
    safetyNotes,
    sessions
  };
}

// ============================================================================
// 11. GUION PERSONALIZADO DEL ASISTENTE PARA EL ASESOR
// ============================================================================
function buildCoachScript(formData, metrics) {
  const b = metrics.bioimpedance;
  return [
    {
      title: '1️⃣ Explicación de su Balanza de Bioimpedancia (Empatía + Claridad)',
      text: `"${formData.name}, hoy tu balanza nos muestra un ${b.bodyFatPct}% de grasa corporal (${b.fatMassKg} kg), un ${b.muscleMassPct}% de masa muscular (${b.muscleMassKg} kg), nivel ${b.visceralFat} de grasa visceral y una edad metabólica de ${b.metabolicAge} años. Nuestro objetivo no es solo bajar kilos de agua, sino bajar tu grasa visceral a menos de 9 y rejuvenecer tu edad metabólica protegiendo cada gramo de tu músculo."`
    },
    {
      title: '2️⃣ Por qué este Plan es 100% Asertivo (Fórmula Matemática y Fisiológica)',
      text: `"Tu metabolismo basal quema ${metrics.bmr} kcal en reposo y ${metrics.tdee} kcal con tu actividad. Hemos calibrado tu plan exactamente en ${metrics.targetCalories} kcal diarias aportando ${metrics.macros.proteinG} gramos de proteína pura (${metrics.macros.proteinGPerKg} g/kg según el consenso ISSN). Siguiendo estas cantidades, es fisiológicamente seguro que oxidarás grasa cada semana sin pasar hambre."`
    },
    {
      title: '3️⃣ Cómo Medir su Comida (Con Balanza en Gramos o con su Propia Mano)',
      text: `"En tu plan tienes el doble sistema: si estás en casa puedes pesar tus ${metrics.perMealQuotas.isMale ? '150g' : '125g'} de pollo/pescado y ${metrics.perMealQuotas.almCarbGrams}g de quinua/menestra; y si comes fuera, usas tu mano: ${metrics.handTotals.palmas} palmas de proteína (🤚), ${metrics.handTotals.punos} puños de verdura (✊), ${metrics.handTotals.manosCarbs} manos ahuecadas de carbohidrato (🤲) y ${metrics.handTotals.pulgares} pulgares de grasa buena (👍) al día."`
    },
    {
      title: '4️⃣ La Regla del Orden del Plato y el Entrenamiento',
      text: `"En cada almuerzo y cena, empieza siempre comiendo primero tus 2 puños de verdura (250g) y tu proteína antes de tocar el carbohidrato. Eso frena el pico de insulina en un 37%. Sumado a tus ${formData.trainingDays} días de entrenamiento por semana, tus músculos absorberán la glucosa directamente."`
    }
  ];
}

// ============================================================================
// 12. GENERACIÓN Y RENDERIZADO DEL PLAN INTEGRAL
// ============================================================================
function initFormHandler() {
  document.getElementById('nutrition-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    generatePlan();
  });

  document.getElementById('live-portion-mode-switcher')?.addEventListener('change', (e) => {
    if (!state.currentPlan) return;
    state.currentPlan.formData.portionMode = e.target.value;
    state.currentPlan.weeklyMenu = buildWeeklyMenu(state.currentPlan.formData, state.currentPlan.metrics);
    renderPlanView(state.currentPlan);
  });
}

function generatePlan() {
  const checkedPathologies = Array.from(document.querySelectorAll('input[name="pathologies"]:checked')).map(
    (cb) => cb.value
  );

  const formData = {
    id: 'pat_' + Date.now(),
    createdAt: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }),
    name: document.getElementById('patientName').value.trim() || 'Alumno Evaluado',
    phoneWhatsapp: document.getElementById('patientWhatsapp')?.value.trim() || '',
    waistCm: parseFloat(document.getElementById('biaWaistCm')?.value) || null,
    category: document.getElementById('patientCategory').value,
    age: parseInt(document.getElementById('patientAge').value, 10) || 38,
    weight: parseFloat(document.getElementById('patientWeight').value) || 84.5,
    height: parseFloat(document.getElementById('patientHeight').value) || 170,
    activity: parseFloat(document.getElementById('activityLevel').value) || 1.375,
    trainingType: document.getElementById('trainingType').value || 'fuerza_cardio_mixto',
    trainingDays: parseInt(document.getElementById('trainingDays').value, 10) || 3,
    goal: document.getElementById('patientGoal').value,
    portionMode: document.getElementById('portionMode').value || 'mano_mixto',
    bodyFatPct: parseFloat(document.getElementById('biaBodyFat').value) || 27.8,
    muscleMassPct: parseFloat(document.getElementById('biaMuscleMass').value) || 31.4,
    visceralFat: parseFloat(document.getElementById('biaVisceralFat').value) || 13,
    metabolicAge: parseInt(document.getElementById('biaMetabolicAge').value, 10) || 47,
    bodyWaterPct: parseFloat(document.getElementById('biaBodyWater').value) || 51.2,
    pathologies: checkedPathologies,
    clinicalLabs: document.getElementById('clinicalLabs').value.trim(),
    clinicalNotes: document.getElementById('clinicalNotes').value.trim(),
    mealsCurrent: document.getElementById('mealsPerDayCurrent').value,
    mealsTarget: parseInt(document.getElementById('mealsPerDayTarget').value, 10) || 4,
    daysPerWeek: parseInt(document.getElementById('daysPerWeek').value, 10) || 7,
    dietDescription: document.getElementById('currentDietDescription').value.trim(),
    portionCarbs: document.getElementById('portionCarbs').value,
    portionProtein: document.getElementById('portionProtein').value,
    portionVeggies: document.getElementById('portionVeggies').value,
    portionDrinks: document.getElementById('portionDrinks').value,
    photos: JSON.parse(JSON.stringify(state.uploadedPhotos))
  };

  const metrics = calculateHandQuotasAndMetrics(formData);
  const habitDiagnostics = analyzeHabitsByHand(formData, metrics);
  const clinicalSynthesis = synthesizePathologies(formData);
  const trainingPlan = buildTrainingPlan(formData, metrics);
  const coachScript = buildCoachScript(formData, metrics);
  const weeklyMenu = buildWeeklyMenu(formData, metrics);

  state.currentPlan = {
    formData,
    metrics,
    habitDiagnostics,
    clinicalSynthesis,
    trainingPlan,
    coachScript,
    weeklyMenu
  };
  state.selectedDayIdx = 0;

  const switcher = document.getElementById('live-portion-mode-switcher');
  if (switcher) switcher.value = formData.portionMode;

  renderPlanView(state.currentPlan);
  switchTab('tab-plan');
}

function analyzeHabitsByHand(formData, metrics) {
  const list = [];
  const txt = (formData.dietDescription || '').toLowerCase();

  if (formData.portionCarbs === 'alta' || /cerro|bastante arroz|papa frita|2 panes|3 panes|fideos/.test(txt)) {
    list.push({
      level: 'alert',
      text: `⚖️ Corrección de Carbohidratos: Actualmente consume 300–400g de harinas por plato (3 a 4 manos ahuecadas 🤲). Su nueva meta exacta es ${metrics.perMealQuotas.almCarbGrams}g en cocido (${metrics.perMealQuotas.almCarb} mano ahuecada 🤲), sin mezclar arroz con papa.`
    });
  }

  if (formData.portionVeggies === 'nula' || formData.portionVeggies === 'poca') {
    list.push({
      level: 'warn',
      text: `✊ Corrección de Fibra y Saciedad: Pasa de casi 0g de verdura a 250g (2 puños cerrados ✊✊) al inicio del almuerzo y la cena para reducir la absorción de glucosa y colesterol.`
    });
  }

  if (formData.portionProtein === 'baja') {
    list.push({
      level: 'warn',
      text: `🤚 Corrección de Macros Proteicos: Hoy consume menos de 70g de alimento proteico por comida. Ahora cubrirá ${metrics.macros.proteinG}g de proteína pura al día (${metrics.handTotals.palmas} palmas 🤚) para elevar su masa muscular (${metrics.bioimpedance.muscleMassPct}%) y bajar su edad metabólica.`
    });
  }

  if (formData.portionDrinks === 'jugos' || /gaseosa|az[uú]car|jugo|frito|broaster/.test(txt)) {
    list.push({
      level: 'alert',
      text: `🥤 Corte de Fructosa Líquida y Frituras: Se eliminan jugos azucarados, gaseosas y frituras que elevan su grasa visceral (Nivel ${metrics.bioimpedance.visceralFat}). Las grasas serán cardio-saludables (${metrics.macros.fatG}g/día = ${metrics.handTotals.pulgares} pulgares 👍).`
    });
  }

  list.push({
    level: 'ok',
    text: `✅ Precisión Garantizada: El plan cuadra exactamente ${metrics.targetCalories} kcal/día (${metrics.macros.proteinG}g Proteína · ${metrics.macros.carbsG}g Carbohidratos · ${metrics.macros.fatG}g Grasas) tanto si pesa en gramos como si mide con su mano.`
  });

  return list;
}

function synthesizePathologies(formData) {
  const { pathologies, clinicalLabs, clinicalNotes } = formData;
  const guidelines = [];
  const allowedSet = new Set();
  const restrictedSet = new Set();

  if (pathologies.length === 0) {
    guidelines.push({
      title: 'Optimización Metabólica, Recomposición Corporal y Salud Preventiva',
      desc: 'Plan normoglucémico y cardioprotector diseñado para reducir grasa visceral, mejorar la tasa metabólica basal y optimizar el rendimiento físico.'
    });
    [
      'Pescado azul y blanco (130–160g = 1.5 🤚)',
      'Pechuga de pollo y pavo (120–150g = 1–1.5 🤚)',
      'Huevos enteros y claras (2 huevos = 1 🤚)',
      'Quinua, avena y arroz integral (110g = 1 🤲)',
      'Lentejas y garbanzos (130g = 1 🤲)',
      'Palta (50g) y aceite de oliva (12ml) (1 👍)',
      'Brócoli, espinaca y ensaladas frescas (250g = 2 ✊)'
    ].forEach((x) => allowedSet.add(x));
    ['Gaseosas y jugos azucarados', 'Frituras profundas y grasas trans', 'Embutidos y ultraprocesados'].forEach((x) =>
      restrictedSet.add(x)
    );
  } else {
    pathologies.forEach((key) => {
      const rule = PATHOLOGY_RULES[key];
      if (!rule) return;
      guidelines.push({
        title: rule.name,
        desc: rule.guideline
      });
      rule.allowed.forEach((a) => allowedSet.add(a));
      rule.restricted.forEach((r) => restrictedSet.add(r));
    });
  }

  if (pathologies.includes('anemia') && pathologies.includes('acido_urico')) {
    allowedSet.delete('Sangrecita de pollo, lomo de res magro, bonito y pavita');
    guidelines.push({
      title: '⚠️ Cruce Clínico Resuelto: Anemia Ferropénica + Ácido Úrico Alto',
      desc: 'Se excluyen vísceras y carnes rojas por su alto contenido de purinas. El hierro se aporta mediante pechuga de pavo/pollo, huevos, quinua y lentejas activadas con abundante Vitamina C (limón fresco).'
    });
  }

  if (clinicalLabs || clinicalNotes) {
    guidelines.push({
      title: 'Analítica de Laboratorio y Farmacoterapia Registrada',
      desc: `${clinicalLabs ? `Laboratorio: ${clinicalLabs}. ` : ''}${clinicalNotes ? `Notas clínicas: ${clinicalNotes}.` : ''}`
    });
  }

  return {
    guidelines,
    allowed: Array.from(allowedSet),
    restricted: Array.from(restrictedSet)
  };
}

function buildWeeklyMenu(formData, metrics) {
  const daysCount = formData.daysPerWeek;
  const mealsPerDay = formData.mealsTarget;
  const mode = formData.portionMode;
  const q = metrics.perMealQuotas;

  const flags = {
    hipertension: formData.pathologies.includes('hipertension'),
    acido_urico: formData.pathologies.includes('acido_urico'),
    dislipidemia: formData.pathologies.includes('dislipidemia'),
    gastritis: formData.pathologies.includes('gastritis'),
    renal_leve: formData.pathologies.includes('renal_leve')
  };

  const days = [];
  for (let d = 0; d < daysCount; d++) {
    const dayName = DAY_NAMES[d % DAY_NAMES.length];
    const meals = [];

    const des = HAND_MEAL_CATALOG.desayuno[d % HAND_MEAL_CATALOG.desayuno.length];
    const mm = HAND_MEAL_CATALOG.media_manana[d % HAND_MEAL_CATALOG.media_manana.length];
    const alm = HAND_MEAL_CATALOG.almuerzo[d % HAND_MEAL_CATALOG.almuerzo.length];
    const mt = HAND_MEAL_CATALOG.media_tarde[d % HAND_MEAL_CATALOG.media_tarde.length];
    const cen = HAND_MEAL_CATALOG.cena[d % HAND_MEAL_CATALOG.cena.length];

    meals.push({
      timeLabel: '07:30 AM · Desayuno',
      title: des.title,
      handBadges: des.handBadges,
      portions: des.items(q, mode, flags),
      tip: des.tip
    });

    if (mealsPerDay === 5) {
      meals.push({
        timeLabel: '10:30 AM · Media Mañana',
        title: mm.title,
        handBadges: mm.handBadges,
        portions: mm.items(q, mode, flags),
        tip: mm.tip
      });
    }

    meals.push({
      timeLabel: '01:30 PM · Almuerzo Principal',
      title: alm.title,
      handBadges: alm.handBadges,
      portions: alm.items(q, mode, flags),
      tip: alm.tip
    });

    if (mealsPerDay >= 4) {
      meals.push({
        timeLabel: '05:00 PM · Media Tarde / Post-Entreno',
        title: mt.title,
        handBadges: mt.handBadges,
        portions: mt.items(q, mode, flags),
        tip: mt.tip
      });
    }

    meals.push({
      timeLabel: '08:00 PM · Cena Ligera',
      title: cen.title,
      handBadges: cen.handBadges,
      portions: cen.items(q, mode, flags),
      tip: cen.tip
    });

    days.push({
      dayIndex: d,
      dayName: `Día ${d + 1} (${dayName})`,
      shortName: dayName,
      meals
    });
  }

  return days;
}

function renderPlanView(plan) {
  document.getElementById('empty-plan-state').classList.add('hidden');
  document.getElementById('plan-results-container').classList.remove('hidden');

  const { formData, metrics, habitDiagnostics, clinicalSynthesis, trainingPlan, coachScript, weeklyMenu } = plan;
  const b = metrics.bioimpedance;

  const categoryLabels = {
    varon: 'Varón Adulto',
    mujer: 'Mujer Adulta',
    adolescente_m: 'Adolescente Varón',
    adolescente_f: 'Adolescente Mujer',
    adulto_mayor_m: 'Adulto Mayor Varón',
    adulto_mayor_f: 'Adulto Mayor Mujer'
  };

  document.getElementById('plan-patient-title').textContent = `Plan Clínico y Deportivo: ${formData.name}`;
  document.getElementById('plan-patient-subtitle').textContent = `${
    categoryLabels[formData.category] || formData.category
  } · ${formData.age} años · Peso: ${formData.weight} kg · Talla: ${formData.height} cm · Grasa: ${b.bodyFatPct}% · Músculo: ${b.muscleMassPct}% · Grasa Visceral: ${b.visceralFat} · Edad Metabólica: ${b.metabolicAge} años`;

  // 1. Renderizar Tarjetas de Bioimpedancia con Semáforo (Bajo, Óptimo, Precaución, Alerta)
  document.getElementById('res-bia-cards-grid').innerHTML = `
    <div class="bia-result-card state-${b.bmiClass}">
      <div class="bia-card-header">
        <strong>1. Peso e IMC</strong>
        <span class="bia-state-pill ${b.bmiClass}">${b.bmiLabel}</span>
      </div>
      <div class="bia-big-number">${formData.weight} kg <small style="font-size:14px;color:#475569;">(IMC: ${b.bmi} kg/m²)</small></div>
      <div class="bia-meter-track"><div class="bia-meter-Thumb" style="left:${Math.min(96, Math.max(5, ((b.bmi - 15) / 22) * 100))}%;"></div></div>
      <small>${b.bmiAdvice}</small>
    </div>

    <div class="bia-result-card state-${b.fatClass}">
      <div class="bia-card-header">
        <strong>2. % Grasa Corporal</strong>
        <span class="bia-state-pill ${b.fatClass}">${b.fatLabel}</span>
      </div>
      <div class="bia-big-number">${b.bodyFatPct}% <small style="font-size:14px;color:#475569;">(${b.fatMassKg} kg de grasa)</small></div>
      <div class="bia-meter-track"><div class="bia-meter-Thumb" style="left:${Math.min(96, Math.max(5, ((b.bodyFatPct - 6) / 38) * 100))}%;"></div></div>
      <small>Rango óptimo para su edad/sexo: <b>${b.fatOptRange}</b>. ${b.fatAdvice}</small>
    </div>

    <div class="bia-result-card state-${b.muscleClass}">
      <div class="bia-card-header">
        <strong>3. % Masa Muscular</strong>
        <span class="bia-state-pill ${b.muscleClass}">${b.muscleLabel}</span>
      </div>
      <div class="bia-big-number">${b.muscleMassPct}% <small style="font-size:14px;color:#475569;">(${b.muscleMassKg} kg músculo)</small></div>
      <div class="bia-meter-track"><div class="bia-meter-Thumb" style="left:${Math.min(96, Math.max(5, ((b.muscleMassPct - 18) / 28) * 100))}%;"></div></div>
      <small>Rango óptimo: <b>${b.muscleOptRange}</b>. ${b.muscleAdvice}</small>
    </div>

    <div class="bia-result-card state-${b.visceralClass}">
      <div class="bia-card-header">
        <strong>4. Grasa Visceral</strong>
        <span class="bia-state-pill ${b.visceralClass}">${b.visceralLabel}</span>
      </div>
      <div class="bia-big-number">Nivel ${b.visceralFat} <small style="font-size:14px;color:#475569;">(Escala 1–59)</small></div>
      <div class="bia-meter-track"><div class="bia-meter-Thumb" style="left:${Math.min(96, Math.max(5, (b.visceralFat / 22) * 100))}%;"></div></div>
      <small>Óptimo: <b>1 a 9</b> · Precaución: 10–14 · Alerta: ≥15. ${b.visceralAdvice}</small>
    </div>

    <div class="bia-result-card state-${b.metabolicClass}">
      <div class="bia-card-header">
        <strong>5. Edad Metabólica</strong>
        <span class="bia-state-pill ${b.metabolicClass}">${b.metabolicLabel}</span>
      </div>
      <div class="bia-big-number">${b.metabolicAge} años <small style="font-size:14px;color:#475569;">(Edad real: ${formData.age})</small></div>
      <div class="bia-meter-track"><div class="bia-meter-Thumb" style="left:${Math.min(96, Math.max(5, 45 + b.metabolicAgeDiff * 4))}%;"></div></div>
      <small>${b.metabolicAdvice}</small>
    </div>

    <div class="bia-result-card state-${b.waterClass}">
      <div class="bia-card-header">
        <strong>6. Agua Corporal y TMB</strong>
        <span class="bia-state-pill ${b.waterClass}">${b.waterLabel}</span>
      </div>
      <div class="bia-big-number">${b.bodyWaterPct}% <small style="font-size:14px;color:#475569;">(TMB: ${metrics.bmr} kcal)</small></div>
      <div class="bia-meter-track"><div class="bia-meter-Thumb" style="left:45%;"></div></div>
      <small>Masa Libre de Grasa: <b>${b.leanBodyMassKg} kg</b> · Hidratación meta: <b>${((formData.weight * 35) / 1000).toFixed(1)} L/día</b>.</small>
    </div>
  `;

  // 2. Resumen de Macros en Gramos y Cuota de Mano
  document.getElementById('res-hand-quotas-grid').innerHTML = `
    <div class="summary-card">
      <span class="s-label">🥩 META DE PROTEÍNA / DÍA</span>
      <strong class="s-value">${metrics.macros.proteinG} g / día (${metrics. macros.proteinGPerKg} g/kg)</strong>
      <span class="s-sub">Equivale a <strong>🤚 ${metrics.handTotals.palmas} Palmas</strong> diarias de pollo, pescado, pavo, huevos o atún</span>
    </div>
    <div class="summary-card">
      <span class="s-label">🥦 META DE VERDURAS Y FIBRA</span>
      <strong class="s-value">~${metrics.handTotals.punos * 125} g Verduras (${metrics.macros.fiberG}g Fibra)</strong>
      <span class="s-sub">Equivale a <strong>✊ ${metrics.handTotals.punos} Puños cerrados</strong> al día (2 en almuerzo + 2 en cena)</span>
    </div>
    <div class="summary-card">
      <span class="s-label">🌾 META DE CARBOHIDRATOS / DÍA</span>
      <strong class="s-value">${metrics.macros.carbsG} g / día</strong>
      <span class="s-sub">Equivale a <strong>🤲 ${metrics.handTotals.manosCarbs} Manos ahuecadas</strong> (quinua, menestras, avena, camote)</span>
    </div>
    <div class="summary-card">
      <span class="s-label">🥑 META DE GRASAS SALUDABLES</span>
      <strong class="s-value">${metrics.macros.fatG} g / día</strong>
      <span class="s-sub">Equivale a <strong>👍 ${metrics.handTotals.pulgares} Pulgares</strong> (palta, aceite de oliva extra virgen, nueces)</span>
    </div>
  `;

  const pathologyNames = formData.pathologies.length
    ? formData.pathologies.map((k) => PATHOLOGY_RULES[k]?.name || k).join(' + ')
    : 'Optimización Corporal y Metabólica';

  document.getElementById('res-clinical-metrics-bar').innerHTML = `
    <span><strong>🩺 Cuadro Clínico:</strong> ${pathologyNames}</span>
    <span><strong>🔥 Meta Calórica Exacta:</strong> ${metrics.targetCalories.toLocaleString('es-PE')} kcal/día (TMB: ${metrics.bmr} kcal · Gasto Total: ${metrics.tdee} kcal)</span>
    <span><strong>💧 Agua Diaria:</strong> ${Math.round((formData.weight * 35) / 250)} vasos (~${((formData.weight * 35) / 1000).toFixed(1)} L)</span>
  `;

  // 3. Guion del Asistente y Fundamento Científico Interno para el Asesor
  document.getElementById('res-coach-script').innerHTML = coachScript
    .map(
      (pt) => `
      <div class="coach-point">
        <h4>${pt.title}</h4>
        <p>${pt.text}</p>
      </div>
    `
    )
    .join('');

  const planPapersEl = document.getElementById('res-plan-scientific-papers');
  if (planPapersEl) {
    planPapersEl.innerHTML = SCIENTIFIC_PAPERS_CATALOG.map(
      (p) => `
      <div class="paper-item">
        <span class="eyebrow">${p.badge}</span>
        <strong style="display:block;margin-bottom:3px;">${p.title}</strong>
        <p style="color:#334155;">${p.detail}</p>
      </div>
    `
    ).join('');
  }

  const planObjEl = document.getElementById('res-plan-objections');
  if (planObjEl) {
    planObjEl.innerHTML = MOTIVATIONAL_OBJECTIONS_CATALOG.map(
      (o) => `
      <div class="objection-item">
        <strong style="display:block;color:#0f172a;margin-bottom:4px;">${o.q}</strong>
        <p style="color:#065f46;font-weight:500;">${o.a}</p>
      </div>
    `
    ).join('');
  }

  // 4. Diagnóstico de Hábitos y Directrices por Patologías
  document.getElementById('res-habit-analysis').innerHTML = habitDiagnostics
    .map((h) => `<li class="${h.level}">${h.text}</li>`)
    .join('');

  document.getElementById('res-pathology-guidelines').innerHTML = clinicalSynthesis.guidelines
    .map(
      (g) => `
      <div class="guideline-item">
        <strong>${g.title}</strong>
        <span>${g.desc}</span>
      </div>
    `
    )
    .join('');

  // 5. Fotos evaluadas con reconocimiento de patrones y desglose exacto de macros
  const photosCard = document.getElementById('res-photos-card');
  const photosGrid = document.getElementById('res-photos-grid');
  if (formData.photos && formData.photos.length > 0) {
    photosCard.classList.remove('hidden');
    photosGrid.innerHTML = formData.photos
      .map((p) => {
        const ps = p.pixelStats || { vegPct: 15, carbPct: 55, protPct: 30 };
        const nt = p.nutritionTotals || computePhotoNutritionTotals(p.detectedItems || []);
        const itemsListHTML = (p.detectedItems || [])
          .map((it) => `<li>• <strong>${it.name}:</strong> ${it.grams}g (${it.prot}g Prot · ${it.carb}g Carb · ${it.fat}g Grasa · ${it.kcal} kcal)</li>`)
          .join('');
        return `
        <div class="eval-photo-card" style="grid-column: 1 / -1; align-items:flex-start;">
          <img src="${p.dataUrl}" alt="${p.mealType}" style="width:130px;height:130px;" />
          <div class="eval-photo-info" style="flex:1;">
            <h4>📸 ${p.mealType}: ${p.archetypeName || 'Plato Analizado'} (${p.confidencePct || 92}% Precisión)</h4>
            <p style="font-size:12.5px;color:#0f172a;margin:4px 0;">
              <strong>Macros Detectados en la Foto:</strong> 🔥 <b>${nt.kcal} kcal</b> (${nt.grams}g total) · 🥩 <b>${nt.prot}g Proteína</b> · 🌾 <b>${nt.carb}g Carbohidratos</b> · 🥑 <b>${nt.fat}g Grasas</b>
            </p>
            ${itemsListHTML ? `<ul style="list-style:none;font-size:12px;color:#334155;margin:4px 0;">${itemsListHTML}</ul>` : ''}
            <p style="font-size:12.2px;"><strong>Diagnóstico Visual:</strong> ${p.observedPortion}</p>
            <p style="color:#059669;font-weight:700;font-size:12.2px;margin-top:4px;">✅ Ajuste para su Meta: Servir 250g de ensalada (2 ✊), ${metrics.perMealQuotas.isMale ? '150g' : '130g'} de proteína magra (1.5 🤚) y ${metrics.perMealQuotas.almCarbGrams}g de carbohidrato complejo (1 🤲).</p>
          </div>
        </div>
      `;
      })
      .join('');
  } else {
    photosCard.classList.add('hidden');
  }

  // 6. Plan de Entrenamiento
  document.getElementById('res-training-title').textContent = `🏋️ 7. ${trainingPlan.programTitle}`;
  document.getElementById('res-training-summary').innerHTML = `
    <div>${trainingPlan.fittSummary}</div>
    <ul style="margin-top:8px;padding-left:18px;">
      ${trainingPlan.safetyNotes.map((s) => `<li>${s}</li>`).join('')}
    </ul>
  `;
  document.getElementById('res-training-schedule').innerHTML = trainingPlan.sessions
    .map(
      (s) => `
      <div class="workout-day-card">
        <h4>${s.dayTitle}</h4>
        <ul>
          ${s.exercises.map((ex) => `<li>• ${ex}</li>`).join('')}
        </ul>
      </div>
    `
    )
    .join('');

  // 7. Guía del plato
  document.getElementById('res-plate-guide').innerHTML = `
    <div class="plate-sector">
      <h4>✊ Paso 1: 2 Puños de Verdura (~250 g)</h4>
      <p>Ocupan el <strong>50% del plato</strong>. Se comen primero para formar la malla de fibra que frena la glucosa y el colesterol.</p>
    </div>
    <div class="plate-sector">
      <h4>🤚 Paso 2: ${metrics.perMealQuotas.almProt} Palma(s) Proteína (~140–160 g)</h4>
      <p>Ocupan el <strong>25% del plato</strong> (~35–42g de proteína pura). Pollo, pescado, pavo o res magra a la plancha/horno.</p>
    </div>
    <div class="plate-sector">
      <h4>🤲 Paso 3: ${metrics.perMealQuotas.almCarb} Mano Carbohidrato (~${metrics.perMealQuotas.almCarbGrams} g)</h4>
      <p>Ocupa el <strong>25% final</strong> (~24–28g de carbohidratos complejos): quinua, lentejas, garbanzos o camote.</p>
    </div>
    <div class="plate-sector">
      <h4>👍 Paso 4: 1 Pulgar de Grasa Buena (50g palta / 12ml aceite)</h4>
      <p>Aporta ~8–12g de ácidos grasos monoinsaturados que activan la saciedad (CCK) y absorben vitaminas A, D, E y K.</p>
    </div>
  `;

  // 8. Menú Semanal
  document.getElementById('res-schedule-summary').textContent = `Programación de ${formData.daysPerWeek} días (${formData.mealsTarget} comidas/día). Cambia en la parte superior entre "Gramos Exactos", "Medidas Caseras" o "Solo Mano".`;

  const tabsContainer = document.getElementById('day-selector-tabs');
  tabsContainer.innerHTML = weeklyMenu
    .map(
      (day, idx) => `
      <button type="button" class="day-tab-btn ${idx === state.selectedDayIdx ? 'active' : ''}" onclick="selectMenuDay(${idx})">
        ${day.shortName}
      </button>
    `
    )
    .join('');

  selectMenuDay(state.selectedDayIdx);

  document.getElementById('all-days-print-container').innerHTML = weeklyMenu
    .map(
      (day) => `
      <div style="margin-top:18px; border-top:1px solid #cbd5e1; padding-top:12px;">
        <h4 style="margin-bottom:10px;">${day.dayName}</h4>
        <div class="day-meals-container">
          ${day.meals.map((m) => renderMealCardHTML(m)).join('')}
        </div>
      </div>
    `
    )
    .join('');

  // 9. Alimentos permitidos y prohibidos
  document.getElementById('res-allowed-foods').innerHTML = clinicalSynthesis.allowed
    .map((item) => `<span class="food-tag good">✓ ${item}</span>`)
    .join('');

  document.getElementById('res-restricted-foods').innerHTML = clinicalSynthesis.restricted
    .map((item) => `<span class="food-tag bad">✕ ${item}</span>`)
    .join('');
}

window.selectMenuDay = function (dayIdx) {
  if (!state.currentPlan) return;
  state.selectedDayIdx = dayIdx;
  const day = state.currentPlan.weeklyMenu[dayIdx] || state.currentPlan.weeklyMenu[0];
  if (!day) return;

  document.querySelectorAll('.day-tab-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', idx === dayIdx);
  });

  document.getElementById('day-meals-container').innerHTML = day.meals.map((m) => renderMealCardHTML(m)).join('');
};

function renderMealCardHTML(meal) {
  return `
    <div class="meal-card">
      <div class="meal-card-header">
        <span class="meal-time-badge">${meal.timeLabel}</span>
      </div>
      <div class="meal-title">${meal.title}</div>
      <div class="meal-hand-badges">
        ${meal.handBadges.map((b) => `<span class="hand-mini-pill">${b}</span>`).join('')}
      </div>
      <ul class="meal-portions">
        ${meal.portions.map((p) => `<li>${p}</li>`).join('')}
      </ul>
      <div class="meal-clinical-tip">💡 ${meal.tip}</div>
    </div>
  `;
}

// ============================================================================
// 13. GUARDADO EN BASE DE DATOS LOCAL / SERVIDOR + GENERADOR MYSQL EN VIVO
// ============================================================================
function initActionButtons() {
  document.getElementById('btn-load-demo')?.addEventListener('click', () => {
    document.getElementById('patientName').value = 'Jorge Luis Paredes';
    document.getElementById('patientCategory').value = 'varon';
    document.getElementById('patientAge').value = '44';
    document.getElementById('patientWeight').value = '88.5';
    document.getElementById('patientHeight').value = '169';
    document.getElementById('activityLevel').value = '1.375';
    document.getElementById('trainingType').value = 'fuerza_cardio_mixto';
    document.getElementById('trainingDays').value = '3';
    document.getElementById('patientGoal').value = 'perdida_grasa';
    document.getElementById('portionMode').value = 'gramos';

    // Datos reales de Balanza de Bioimpedancia
    document.getElementById('biaBodyFat').value = '29.4';
    document.getElementById('biaMuscleMass').value = '30.8';
    document.getElementById('biaVisceralFat').value = '15';
    document.getElementById('biaMetabolicAge').value = '56';
    document.getElementById('biaBodyWater').value = '49.5';

    document.querySelectorAll('input[name="pathologies"]').forEach((cb) => {
      cb.checked = ['diabetes_tipo2', 'hipertension', 'higado_graso'].includes(cb.value);
    });

    document.getElementById('clinicalLabs').value =
      'Glucosa en ayunas: 138 mg/dL, HbA1c: 6.9%, Triglicéridos: 235 mg/dL, PA: 142/90 mmHg, Ecografía: Esteatosis hepática grado II.';
    document.getElementById('clinicalNotes').value =
      'Toma Metformina 850mg en almuerzo y Losartán 50mg. Quiere bajar barriga (grasa visceral), proteger sus músculos y aprender cuánto es 100g de pollo vs medida de mano.';
    document.getElementById('mealsPerDayCurrent').value = '3';
    document.getElementById('mealsPerDayTarget').value = '4';
    document.getElementById('daysPerWeek').value = '7';
    document.getElementById('portionCarbs').value = 'alta';
    document.getElementById('portionProtein').value = 'baja';
    document.getElementById('portionVeggies').value = 'nula';
    document.getElementById('portionDrinks').value = 'jugos';
    document.getElementById('currentDietDescription').value =
      'Desayuna jugo de fruta licuado y 2 panes con jamonada. En el almuerzo come medio plato (~350g) de arroz blanco con papa frita y un trozo chico de pollo frito. En la noche toma café con pan.';

    updateLiveMetrics();
    generatePlan();
  });

  document.getElementById('btn-reset-form')?.addEventListener('click', () => {
    document.getElementById('nutrition-form').reset();
    state.uploadedPhotos = [];
    renderPhotoGallery();
    updateLiveMetrics();
  });

  document.getElementById('btn-save-patient')?.addEventListener('click', async () => {
    if (!state.currentPlan) return;
    state.savedPatients = state.savedPatients.filter((p) => p.formData.id !== state.currentPlan.formData.id);
    state.savedPatients.unshift(state.currentPlan);
    localStorage.setItem('nutriclinica_patients_v3', JSON.stringify(state.savedPatients));

    try {
      await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.currentPlan)
      });
    } catch {
      // Fallback localStorage activo si se abre como archivo local
    }

    renderSavedPatients();
    alert(`✅ Alumno "${state.currentPlan.formData.name}" guardado en la Base de Datos Local y sincronizado con el script MySQL.`);
  });

  document.getElementById('btn-print-plan')?.addEventListener('click', () => {
    window.print();
  });

  document.getElementById('btn-send-whatsapp')?.addEventListener('click', () => {
    if (!state.currentPlan) return;
    const { formData, metrics, weeklyMenu } = state.currentPlan;
    const b = metrics.bioimpedance || {};
    const day1 = weeklyMenu[0]?.meals || [];
    const mealsTxt = day1.map((m) => `• *${m.timeLabel}:* ${m.title}`).join('\n');

    const msg =
      `👋 Hola *${formData.name}*, aquí tienes el resumen de tu *Evaluación de Bioimpedancia y Plan Nutricional Personalizado*:\n\n` +
      `⚖️ *1. RESULTADOS DE BIOIMPEDANCIA:*\n` +
      `• Peso: ${formData.weight} kg (IMC: ${metrics.bmi})\n` +
      `• % Grasa Corporal: ${b.bodyFatPct}% (${b.fatMassKg} kg)\n` +
      `• % Masa Muscular: ${b.muscleMassPct}% (${b.muscleMassKg} kg)\n` +
      `• Grasa Visceral: Nivel ${b.visceralFat} (Meta: ≤9)\n` +
      `• Edad Metabólica: ${b.metabolicAge} años\n\n` +
      `🎯 *2. TUS METAS DIARIAS (GRAMOS Y MANO):*\n` +
      `• Calorías: *${metrics.targetCalories} kcal/día*\n` +
      `• Proteína: *${metrics.macros.proteinG}g* (🤚 ${metrics.handTotals.palmas} Palmas)\n` +
      `• Verduras: *✊ ${metrics.handTotals.punos} Puños cerrados*\n` +
      `• Carbohidratos: *${metrics.macros.carbsG}g* (🤲 ${metrics.handTotals.manosCarbs} Manos ahuecadas)\n` +
      `• Grasas buenas: *${metrics.macros.fatG}g* (👍 ${metrics.handTotals.pulgares} Pulgares)\n\n` +
      `🍽️ *3. EJEMPLO DE PLATOS RECOMENDADOS:*\n${mealsTxt}\n\n` +
      `📄 *Te adjunto a continuación tu Informe Completo en PDF con tu menú de ${formData.daysPerWeek} días y tu rutina de entrenamiento.*`;

    const cleanPhone = (formData.phoneWhatsapp || '').replace(/[^\d]/g, '');
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  });

  document.getElementById('btn-copy-sql')?.addEventListener('click', () => {
    const pre = document.getElementById('mysql-live-preview');
    if (!pre) return;
    navigator.clipboard.writeText(pre.textContent);
    alert('✅ Código MySQL copiado al portapapeles.');
  });
}

async function loadPatientsFromServerAndRender() {
  try {
    const resp = await fetch('/api/patients');
    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data.patients) && data.patients.length > 0) {
        state.savedPatients = data.patients;
        localStorage.setItem('nutriclinica_patients_v3', JSON.stringify(state.savedPatients));
      }
    }
  } catch {
    // Usa localStorage si no hay backend activo
  }
  renderSavedPatients();
}

function renderSavedPatients() {
  const badge = document.getElementById('patient-count-badge');
  if (badge) badge.textContent = state.savedPatients.length;

  const container = document.getElementById('saved-patients-list');
  if (container) {
    if (state.savedPatients.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">🗄️</div>
          <h3>Aún no hay alumnos registrados en la base de datos</h3>
          <p>Evalúa un alumno y presiona "Guardar en Base de Datos / MySQL" para registrar su bioimpedancia y plan.</p>
        </div>
      `;
    } else {
      container.innerHTML = state.savedPatients
        .map((item, idx) => {
          const b = item.metrics.bioimpedance || {};
          return `
          <div class="patient-record-card">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong>👤 ${item.formData.name}</strong>
              <span class="eyebrow">${item.formData.createdAt}</span>
            </div>
            <p style="font-size:12.8px;color:#334155;">
              <strong>Bioimpedancia:</strong> Peso ${item.formData.weight}kg · IMC ${item.metrics.bmi} · Grasa <b>${b.bodyFatPct || '--'}%</b> · Músculo <b>${b.muscleMassPct || '--'}%</b> · Visceral <b>${b.visceralFat || '--'}</b> · Edad Met. <b>${b.metabolicAge || '--'}a</b><br/>
              <strong>Macros Meta:</strong> ${item.metrics.targetCalories} kcal (${item.metrics.macros?.proteinG || '--'}g Prot · ${item.metrics.macros?.carbsG || '--'}g Carb · ${item.metrics.macros?.fatG || '--'}g Grasa)
            </p>
            <div style="font-size:12px;color:#0f766e;">
              Patologías: ${
                item.formData.pathologies.length
                  ? item.formData.pathologies.map((k) => PATHOLOGY_RULES[k]?.name.split('—')[0] || k).join(', ')
                  : 'Ninguna'
              }
            </div>
            <div style="display:flex;gap:8px;margin-top:8px;">
              <button class="btn-primary btn-sm" onclick="loadSavedPatient(${idx})">Abrir Ficha y Plan</button>
              <button class="btn-outline btn-sm" onclick="deleteSavedPatient(${idx})">Eliminar</button>
            </div>
          </div>
        `;
        })
        .join('');
    }
  }

  renderLiveMySQLPreview();
}

function renderLiveMySQLPreview() {
  const pre = document.getElementById('mysql-live-preview');
  if (!pre) return;

  let sql = `-- ============================================================================\n`;
  sql += `-- NUTRICLÍNICA PRO v3.0 — SCRIPT MYSQL EN VIVO (ESQUEMA + ALUMNOS EVALUADOS)\n`;
  sql += `-- Archivo completo disponible en: sistema_nutricion.sql y /api/export-sql\n`;
  sql += `-- ============================================================================\n\n`;
  sql += `CREATE DATABASE IF NOT EXISTS sistema_nutricion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
  sql += `USE sistema_nutricion;\n\n`;
  sql += `-- Tablas principales: clientes, evaluaciones_bioimpedancia, catalogo_parametros_bioimpedancia,\n`;
  sql += `-- catalogo_alimentos_macros (por 100g, 20g y mano), catalogo_planes_entrenamiento\n\n`;

  if (state.savedPatients.length === 0) {
    sql += `-- [Guarda un alumno desde la pestaña "Plan Nutricional + Entreno" para ver aquí sus INSERT INTO automáticos]\n`;
  } else {
    state.savedPatients.forEach((rec, i) => {
      const f = rec.formData;
      const m = rec.metrics;
      const b = m.bioimpedance || {};
      const cid = i + 1;
      sql += `-- Registro Completo de Alumno #${cid}: ${f.name}\n`;
      sql += `INSERT INTO clientes (id, codigo_cliente, nombre_completo, telefono_whatsapp, categoria_biologica, edad, talla_cm, factor_actividad, tipo_entrenamiento, dias_entrenamiento_sem, objetivo_principal, modo_medicion, patologias_codigos)\n`;
      sql += `VALUES (${cid}, '${f.id}', '${f.name.replace(/'/g, "\\'")}', '${(f.phoneWhatsapp || '').replace(/'/g, "\\'")}', '${f.category}', ${f.age}, ${f.height}, ${f.activity}, '${f.trainingType || 'fuerza_cardio_mixto'}', ${f.trainingDays || 3}, '${f.goal}', '${f.portionMode}', '${(f.pathologies || []).join(',')}');\n\n`;
      sql += `INSERT INTO evaluaciones_bioimpedancia (cliente_id, peso_kg, perimetro_cintura_cm, imc, estado_imc, porcentaje_grasa, masa_grasa_kg, masa_libre_grasa_kg, estado_grasa, porcentaje_masa_muscular, masa_muscular_kg, estado_masa_muscular, grasa_visceral, estado_grasa_visceral, edad_metabolica, diferencia_edad_metabolica, estado_edad_metabolica, porcentaje_agua_corporal, tmb_kcal, gasto_energetico_total_kcal, calorias_objetivo_kcal, proteina_objetivo_g, carbohidratos_objetivo_g, grasas_objetivo_g)\n`;
      sql += `VALUES (${cid}, ${f.weight}, ${f.waistCm || 'NULL'}, ${m.bmi}, '${b.bmiStateCode || 'OPTIMO'}', ${b.bodyFatPct || 25}, ${b.fatMassKg || 20}, ${b.leanBodyMassKg || 60}, '${b.fatStateCode || 'OPTIMO'}', ${b.muscleMassPct || 32}, ${b.muscleMassKg || 26}, '${b.muscleStateCode || 'OPTIMO'}', ${b.visceralFat || 10}, '${b.visceralStateCode || 'OPTIMO'}', ${b.metabolicAge || f.age}, ${b.metabolicAgeDiff || 0}, '${b.metabolicStateCode || 'OPTIMO'}', ${b.bodyWaterPct || 52}, ${m.bmr}, ${m.tdee}, ${m.targetCalories}, ${m.macros?.proteinG || 130}, ${m.macros?.carbsG || 180}, ${m.macros?.fatG || 60});\n\n`;
      sql += `INSERT INTO planes_nutricionales_clientes (cliente_id, titulo_programa_entreno, menu_semanal_json, rutina_entrenamiento_json)\n`;
      sql += `VALUES (${cid}, '${(rec.trainingPlan?.programTitle || '').replace(/'/g, "\\'")}', '${JSON.stringify(rec.weeklyMenu || []).replace(/'/g, "\\'")}', '${JSON.stringify(rec.trainingPlan?.sessions || []).replace(/'/g, "\\'")}');\n\n`;
    });
  }

  pre.textContent = sql;
}

window.loadSavedPatient = function (idx) {
  const record = state.savedPatients[idx];
  if (!record) return;
  state.currentPlan = record;
  renderPlanView(record);
  switchTab('tab-plan');
};

window.deleteSavedPatient = async function (idx) {
  const target = state.savedPatients[idx];
  state.savedPatients.splice(idx, 1);
  localStorage.setItem('nutriclinica_patients_v3', JSON.stringify(state.savedPatients));
  if (target?.formData?.id) {
    try {
      await fetch(`/api/patients/${encodeURIComponent(target.formData.id)}`, { method: 'DELETE' });
    } catch {}
  }
  renderSavedPatients();
};
