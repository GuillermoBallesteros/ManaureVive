// ============================================================
// MANAURE VIVE — DATASET SINTÉTICO 2025
// ============================================================
// El dashboard ya no representa a una sola empresa (antes Villa
// Adelaida) sino a un CONVENIO de empresas turísticas en Manaure,
// Cesar. Este archivo genera dos fuentes de datos que alimentan
// todas las vistas:
//
// 1) PARTNERS_DATA — el desempeño financiero mensual de los 10
//    socios del convenio durante 2025 (vistas General y Convenios).
// 2) RESERVATIONS — un dataset sintético de reservas de las 5
//    experiencias turísticas actuales, con su tipo de cliente
//    (Familia, Parejas, Amigos, Otros), usado por las vistas de
//    Experiencias, Comportamiento de clientes y el Simulador.
// ============================================================

// ------------------------------------------------------------
// 0. RNG determinista (mismo dataset siempre, en vez de aleatorio
// en cada render)
// ------------------------------------------------------------
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20250101);
const rand = () => rng();
function weightedPick(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
export const MONTHS = MONTH_NAMES;
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function fmt(y, m, d) { return `${y}-${pad(m)}-${pad(d)}`; }
function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }

// ------------------------------------------------------------
// 1. FESTIVOS COLOMBIA 2025 (calendario oficial)
// ------------------------------------------------------------
export const HOLIDAYS_2025 = [
  { date: '2025-01-01', name: 'Año Nuevo' },
  { date: '2025-01-06', name: 'Día de los Reyes Magos' },
  { date: '2025-03-24', name: 'Día de San José' },
  { date: '2025-04-17', name: 'Jueves Santo' },
  { date: '2025-04-18', name: 'Viernes Santo' },
  { date: '2025-05-01', name: 'Día del Trabajo' },
  { date: '2025-06-02', name: 'Ascensión del Señor' },
  { date: '2025-06-23', name: 'Corpus Christi' },
  { date: '2025-06-30', name: 'Sagrado Corazón de Jesús' },
  { date: '2025-07-20', name: 'Día de la Independencia' },
  { date: '2025-08-07', name: 'Batalla de Boyacá' },
  { date: '2025-08-18', name: 'Asunción de la Virgen' },
  { date: '2025-10-13', name: 'Día de la Raza' },
  { date: '2025-11-03', name: 'Día de Todos los Santos' },
  { date: '2025-12-08', name: 'Día de la Inmaculada Concepción' },
  { date: '2025-12-25', name: 'Navidad' }
];
const HOLIDAY_SET = new Set(HOLIDAYS_2025.map(h => h.date));
// Fechas especiales que usamos para "picos" narrativos
export const SPECIAL_DATES = {
  diaDeLaMadre: '2025-05-11', // domingo
  amorYAmistad: '2025-09-20', // sábado (Colombia lo celebra en septiembre)
  semanaSanta: ['2025-04-17', '2025-04-18', '2025-04-20']
};

// ------------------------------------------------------------
// 2. DÍAS DE OPERACIÓN 2025 (solo sábado=6, domingo=0, o festivo)
// ------------------------------------------------------------
export const OPERATING_DAYS = (() => {
  const days = [];
  for (let m = 1; m <= 12; m++) {
    const total = daysInMonth(2025, m);
    for (let d = 1; d <= total; d++) {
      const dateStr = fmt(2025, m, d);
      const dow = new Date(2025, m - 1, d).getDay(); // 0=Dom,6=Sáb
      const isHoliday = HOLIDAY_SET.has(dateStr);
      if (dow === 6 || dow === 0 || isHoliday) {
        let dayType = isHoliday ? 'Festivo' : dow === 6 ? 'Sábado' : 'Domingo';
        days.push({ date: dateStr, month: m, monthName: MONTH_NAMES[m - 1], dayType, isHoliday });
      }
    }
  }
  return days;
})();

// ============================================================
// 3. SOCIOS DEL CONVENIO (vistas General y Convenios)
// ============================================================
// El orden de ingresos (rank 1 = mayor ingreso del año) fue
// definido explícitamente por el negocio.
export const PARTNERS = [
  { id: 'manaureaventura', name: 'Manaure Aventura', rank: 1 },
  { id: 'cuatritours', name: 'Cuatri Tours', rank: 2 },
  { id: 'mashiramo', name: 'Mashiramo', rank: 3 },
  { id: 'photours', name: 'PHOTours', rank: 4 },
  { id: 'villaadelaida', name: 'Villa Adelaida', rank: 5 },
  { id: 'arepas', name: 'La Casa de las Arepas', rank: 6 },
  { id: 'lospinos', name: 'Los Pinos', rank: 7 },
  { id: 'absolom', name: 'Absolom', rank: 8 },
  { id: 'metallura', name: 'Metallura', rank: 9 },
  { id: 'coruscans', name: 'Coruscans', rank: 10 }
];

// Ingreso anual base por posición del ranking (COP). Fija el
// orden de ingresos exigido por el negocio.
const ANNUAL_REVENUE_BY_RANK = {
  1: 486000000,
  2: 438000000,
  3: 396000000,
  4: 358000000,
  5: 322000000,
  6: 288000000,
  7: 254000000,
  8: 219000000,
  9: 182000000,
  10: 141000000
};

// Estacionalidad genérica del convenio a lo largo del año
// (enero y diciembre altos por vacaciones/fin de año, semana
// santa en abril, mitad de año por vacaciones, septiembre por
// Amor y Amistad).
const MONTH_SEASON_WEIGHT = [1.22, 0.84, 0.93, 1.14, 0.95, 1.08, 1.18, 1.00, 1.06, 0.90, 0.86, 1.32];

// Reparte el ingreso anual de un socio en los 12 meses, con una
// variación propia por socio (deterministic), preservando SIEMPRE
// el total anual exacto asignado por su ranking.
function partnerMonthlyRevenue(annualTotal, seedOffset) {
  const localRng = mulberry32(20250100 + seedOffset);
  const rawWeights = MONTH_SEASON_WEIGHT.map((w) => w * (0.82 + localRng() * 0.4));
  const sum = rawWeights.reduce((a, b) => a + b, 0);
  const monthly = rawWeights.map((w) => Math.round(annualTotal * (w / sum)));
  const diff = annualTotal - monthly.reduce((a, b) => a + b, 0);
  monthly[11] += diff; // ajuste de redondeo en diciembre
  return monthly;
}

export const PARTNERS_DATA = PARTNERS.map((p, idx) => {
  const annualRevenue = ANNUAL_REVENUE_BY_RANK[p.rank];
  const monthly = partnerMonthlyRevenue(annualRevenue, idx * 11 + p.rank);
  const ticketRng = mulberry32(70000 + idx * 13);
  const avgTicket = 55000 + Math.round(ticketRng() * 145000);
  const reservations = monthly.map((v) => Math.max(1, Math.round(v / avgTicket)));
  return {
    ...p,
    annualRevenue,
    monthly,
    reservations,
    avgTicket,
    totalReservations: reservations.reduce((a, b) => a + b, 0)
  };
}).sort((a, b) => a.rank - b.rank);

export const consortiumMonthlyRevenue = MONTH_NAMES.map((name, i) => ({
  month: name,
  ingresos: PARTNERS_DATA.reduce((s, p) => s + p.monthly[i], 0)
}));

export const top5Partners = [...PARTNERS_DATA].sort((a, b) => b.annualRevenue - a.annualRevenue).slice(0, 5);

export const generalKPIs = (() => {
  const totalIncome = PARTNERS_DATA.reduce((s, p) => s + p.annualRevenue, 0);
  const lastMonth = consortiumMonthlyRevenue[consortiumMonthlyRevenue.length - 1];
  const bestMonth = [...consortiumMonthlyRevenue].sort((a, b) => b.ingresos - a.ingresos)[0];
  const weakestMonth = [...consortiumMonthlyRevenue].sort((a, b) => a.ingresos - b.ingresos)[0];
  const topPartner = PARTNERS_DATA.find((p) => p.rank === 1);
  return {
    totalIncome,
    lastMonthIncome: lastMonth.ingresos,
    lastMonthName: lastMonth.month,
    bestMonth,
    weakestMonth,
    topPartner
  };
})();

// ============================================================
// 4. EXPERIENCIAS ACTUALES (catálogo real entregado por el negocio)
// ============================================================
// "weight" define qué tan seguido se consume cada experiencia;
// "price" define su tarifa. Se calibraron a propósito para que el
// orden de consumo NO coincida con el orden de ingresos.
export const EXPERIENCES = [
  {
    id: 'senderismo',
    name: 'Ruta de senderismo por Perijá',
    category: 'Aventura',
    socio: 'Manaure Aventuras',
    location: 'Manaure, Cesar',
    duration: '5 horas',
    price: 80000,
    weight: 30,
    includes: ['Guía local', 'Transporte de salida', 'Refrigerio', 'Fotos del recorrido'],
    description: 'Recorrido guiado por senderos con miradores, naturaleza y descanso en el campo.'
  },
  {
    id: 'aves',
    name: 'Avistamiento de aves',
    category: 'Naturaleza',
    socio: 'Manaure Aventuras',
    location: 'Manaure, Cesar',
    duration: '4 horas',
    price: 70000,
    weight: 22,
    includes: ['Binocular', 'Guía experto', 'Bebida natural', 'Paseo guiado'],
    description: 'Explora humedales y senderos para observar aves y paisajes de la región.'
  },
  {
    id: 'gastronomica',
    name: 'Experiencia gastronómica local',
    category: 'Gastronomía',
    socio: 'Villa Adelaida',
    location: 'Manaure, Cesar',
    duration: '3 horas',
    price: 60000,
    weight: 35,
    includes: ['Degustación local', 'Plato principal', 'Bebida', 'Ambiente natural'],
    description: 'Sabores del territorio con platos típicos, bebida y ambiente campestre.'
  },
  {
    id: 'rio',
    name: 'Paseo al río y cascadas',
    category: 'Tours',
    socio: 'Tours Manaure',
    location: 'Manaure, Cesar',
    duration: '6 horas',
    price: 120000,
    weight: 18,
    includes: ['Guía de recorrido', 'Acceso a cascadas', 'Refrigerio', 'Asistencia en ruta'],
    description: 'Recorrido con descanso, naturaleza y puntos de fotografía en el río y cascadas.'
  },
  {
    id: 'vivemanaure',
    name: 'Tour Vive Manaure: 3 días y 2 noches',
    category: 'Tours',
    socio: 'Manaure Vive',
    location: 'Valledupar y Manaure, Cesar',
    duration: '3 días y 2 noches',
    price: 650000,
    priceOnRequest: true,
    weight: 5,
    includes: [
      'Transporte ida y vuelta para 2 personas',
      'Noche romántica',
      'Hospedaje',
      'Alimentación',
      'Experiencia de cuatrimoto',
      'Experiencia de parapente',
      'Ruta Casa de Vidrio y fogata'
    ],
    description: 'Una escapada en pareja para vivir la naturaleza, la aventura y los paisajes de Manaure y la Serranía del Perijá.'
  }
];

// ------------------------------------------------------------
// 5. TIPOS DE CLIENTE (sin segmento empresarial)
// ------------------------------------------------------------
export const CUSTOMER_TYPES = [
  { id: 'familia', name: 'Familia', color: '#286b45', description: 'Grupos familiares, con más peso los domingos y festivos.' },
  { id: 'parejas', name: 'Parejas', color: '#d28b27', description: 'Escapadas en pareja, con picos en fechas especiales como septiembre.' },
  { id: 'amigos', name: 'Amigos', color: '#719b83', description: 'Grupos de amigos, con picos en temporadas de vacaciones.' },
  { id: 'otros', name: 'Otros', color: '#9b8f7a', description: 'Visitantes que no encajan en los tres segmentos anteriores.' }
];

export const CLIENT_RECURRENCE_DEFINITION =
  'Cliente recurrente = cliente identificado que realiza al menos dos reservas confirmadas durante 2025, en fechas diferentes.';

// Afinidad de cada experiencia con cada tipo de cliente (multiplica
// el peso base). Calibrada para que el Tour Vive Manaure sea el
// producto de mayor afinidad con parejas, y para diferenciar
// claramente consumo de ingreso en la vista de Experiencias.
const EXPERIENCE_AFFINITY = {
  familia: { senderismo: 1.3, aves: 1.2, gastronomica: 1.4, rio: 1.5, vivemanaure: 0.35 },
  parejas: { senderismo: 0.9, aves: 0.8, gastronomica: 1.2, rio: 0.9, vivemanaure: 2.3 },
  amigos: { senderismo: 1.6, aves: 1.1, gastronomica: 1.1, rio: 1.35, vivemanaure: 0.55 },
  otros: { senderismo: 1.0, aves: 1.0, gastronomica: 1.0, rio: 1.0, vivemanaure: 1.0 }
};

// ------------------------------------------------------------
// 6. ESTACIONALIDAD Y VOLUMEN — genera RESERVATIONS día a día
// ------------------------------------------------------------
const MONTH_SEGMENT_MULTIPLIER = {
  1: { familia: 1.05, parejas: 1.0, amigos: 1.5, otros: 1.0 },  // Enero: amigos (vacaciones)
  2: { familia: 1.0, parejas: 1.0, amigos: 1.0, otros: 1.0 },
  3: { familia: 1.0, parejas: 1.0, amigos: 1.0, otros: 1.0 },
  4: { familia: 1.3, parejas: 1.0, amigos: 1.2, otros: 1.0 },   // Abril: Semana Santa
  5: { familia: 1.5, parejas: 1.0, amigos: 0.9, otros: 1.0 },   // Mayo: Día de la Madre
  6: { familia: 1.0, parejas: 1.0, amigos: 1.3, otros: 1.0 },   // Junio: vacaciones
  7: { familia: 1.1, parejas: 0.95, amigos: 1.6, otros: 1.0 },  // Julio: vacaciones
  8: { familia: 1.15, parejas: 1.0, amigos: 1.05, otros: 1.1 },
  9: { familia: 0.95, parejas: 1.8, amigos: 0.95, otros: 1.0 }, // Septiembre: Amor y Amistad
  10: { familia: 1.1, parejas: 1.05, amigos: 1.0, otros: 1.1 },
  11: { familia: 1.0, parejas: 1.0, amigos: 1.0, otros: 1.0 },
  12: { familia: 1.3, parejas: 1.05, amigos: 1.3, otros: 1.0 }  // Diciembre: fin de año
};
const DAYTYPE_SEGMENT_MULTIPLIER = {
  Sábado: { familia: 0.85, parejas: 1.4, amigos: 1.15, otros: 1.0 },
  Domingo: { familia: 1.5, parejas: 0.8, amigos: 0.85, otros: 1.05 },
  Festivo: { familia: 1.1, parejas: 1.1, amigos: 1.15, otros: 1.05 }
};
const BASE_SEGMENT_WEIGHT = { familia: 34, parejas: 28, amigos: 26, otros: 12 };
function segmentWeightsFor(dateInfo) {
  const mm = MONTH_SEGMENT_MULTIPLIER[dateInfo.month];
  const dm = DAYTYPE_SEGMENT_MULTIPLIER[dateInfo.dayType];
  const out = {};
  for (const seg of Object.keys(BASE_SEGMENT_WEIGHT)) {
    out[seg] = BASE_SEGMENT_WEIGHT[seg] * mm[seg] * dm[seg];
  }
  return out;
}
function volumeForDay(dateInfo, dayIndexInYear) {
  const baseByType = { Sábado: 68, Domingo: 76, Festivo: 86 };
  let base = baseByType[dateInfo.dayType];
  const growth = 1 + (dayIndexInYear / OPERATING_DAYS.length) * 0.2;
  const mm = MONTH_SEGMENT_MULTIPLIER[dateInfo.month];
  const monthAvg = (mm.familia + mm.parejas + mm.amigos + mm.otros) / 4;
  let volume = base * growth * monthAvg;
  if (dateInfo.date === SPECIAL_DATES.amorYAmistad) volume *= 1.5;
  if (dateInfo.date === SPECIAL_DATES.diaDeLaMadre) volume *= 1.35;
  if (SPECIAL_DATES.semanaSanta.includes(dateInfo.date)) volume *= 1.2;
  if (dateInfo.month === 2) volume *= 0.9;
  if (dateInfo.month === 11) volume *= 0.93;
  return Math.round(volume * (0.9 + rand() * 0.2));
}

// ------------------------------------------------------------
// 7. GENERACIÓN DE RESERVAS
// ------------------------------------------------------------
const clientPoolByType = { familia: [], parejas: [], amigos: [], otros: [] };
let clientCounter = 1;
const clientVisitDates = {};
function pickClient(type) {
  const pool = clientPoolByType[type];
  const reuseProbability = 0.42;
  if (pool.length > 5 && rand() < reuseProbability) {
    return pool[Math.floor(rand() * pool.length)];
  }
  const id = `${type.slice(0, 3).toUpperCase()}-${String(clientCounter++).padStart(5, '0')}`;
  pool.push(id);
  return id;
}

export const RESERVATIONS = (() => {
  const list = [];
  OPERATING_DAYS.forEach((dateInfo, dayIndex) => {
    const weights = segmentWeightsFor(dateInfo);
    const segIds = Object.keys(weights);
    const segW = segIds.map((s) => weights[s]);
    const totalToday = volumeForDay(dateInfo, dayIndex);
    for (let i = 0; i < totalToday; i++) {
      const customerType = weightedPick(segIds, segW);
      const clientId = pickClient(customerType);
      if (!clientVisitDates[clientId]) clientVisitDates[clientId] = new Set();
      clientVisitDates[clientId].add(dateInfo.date);
      const affinity = EXPERIENCE_AFFINITY[customerType];
      const expWeights = EXPERIENCES.map((e) => e.weight * affinity[e.id]);
      const nExp = rand() < 0.72 ? 1 : 2;
      const chosen = new Set();
      for (let k = 0; k < nExp; k++) {
        chosen.add(weightedPick(EXPERIENCES.map((e) => e.id), expWeights));
      }
      const experiences = [...chosen];
      const revenue = experiences.reduce((s, id) => s + EXPERIENCES.find((e) => e.id === id).price, 0);
      list.push({
        date: dateInfo.date,
        month: dateInfo.month,
        monthName: dateInfo.monthName,
        dayType: dateInfo.dayType,
        customerType,
        clientId,
        experiences,
        revenue
      });
    }
  });
  return list;
})();

const recurringClientIds = new Set(
  Object.entries(clientVisitDates).filter(([, dates]) => dates.size >= 2).map(([id]) => id)
);

// ============================================================
// 8. AGREGADOS — VISTA · EXPERIENCIAS
// ============================================================
export const experienceRanking = EXPERIENCES.map((e) => {
  const count = RESERVATIONS.filter((v) => v.experiences.includes(e.id)).length;
  return { ...e, consumo: count, ingresos: count * e.price };
}).sort((a, b) => b.consumo - a.consumo);

export const experienceBySegment = EXPERIENCES.map((e) => {
  const row = { id: e.id, name: e.name };
  CUSTOMER_TYPES.forEach((ct) => {
    row[ct.id] = RESERVATIONS.filter((v) => v.customerType === ct.id && v.experiences.includes(e.id)).length;
  });
  return row;
});

export const experiencesKPIs = (() => {
  const top = experienceRanking[0];
  const totalRevenue = experienceRanking.reduce((s, e) => s + e.ingresos, 0);
  const totalConsumption = experienceRanking.reduce((s, e) => s + e.consumo, 0);
  const avgPrice = EXPERIENCES.reduce((s, e) => s + e.price, 0) / EXPERIENCES.length;
  return {
    topExperience: top.name,
    avgPrice: Math.round(avgPrice),
    totalRevenue: Math.round(totalRevenue),
    totalConsumption
  };
})();

// ============================================================
// 9. AGREGADOS — VISTA · COMPORTAMIENTO DE CLIENTES
// ============================================================
export const newVsRecurringMonthly = (() => {
  const acc = Array.from({ length: 12 }, (_, i) => ({ month: MONTH_NAMES[i], nuevos: 0, recurrentes: 0 }));
  const seenBefore = new Set();
  RESERVATIONS.forEach((v) => {
    const isFirstTimeEver = !seenBefore.has(v.clientId);
    if (isFirstTimeEver) {
      acc[v.month - 1].nuevos += 1;
      seenBefore.add(v.clientId);
    } else {
      acc[v.month - 1].recurrentes += 1;
    }
  });
  return acc;
})();

export const customerTypeDistribution = CUSTOMER_TYPES.map((ct) => ({
  id: ct.id,
  name: ct.name,
  value: RESERVATIONS.filter((v) => v.customerType === ct.id).length
})).sort((a, b) => b.value - a.value);

export const dayTypeDistribution = ['Sábado', 'Domingo', 'Festivo'].map((dt) => ({
  dayType: dt,
  value: RESERVATIONS.filter((v) => v.dayType === dt).length
}));

export const customerTypeByDayType = ['Sábado', 'Domingo', 'Festivo'].map((dt) => {
  const row = { dayType: dt };
  CUSTOMER_TYPES.forEach((ct) => {
    row[ct.id] = RESERVATIONS.filter((v) => v.dayType === dt && v.customerType === ct.id).length;
  });
  return row;
});

export const recurringEvolution = (() => {
  const acc = Array.from({ length: 12 }, (_, i) => ({ month: MONTH_NAMES[i], clientesActivos: new Set(), recurrentesActivos: new Set() }));
  RESERVATIONS.forEach((v) => {
    acc[v.month - 1].clientesActivos.add(v.clientId);
    if (recurringClientIds.has(v.clientId)) acc[v.month - 1].recurrentesActivos.add(v.clientId);
  });
  return acc.map((m) => ({
    month: m.month,
    tasaRecurrencia: m.clientesActivos.size
      ? Number(((m.recurrentesActivos.size / m.clientesActivos.size) * 100).toFixed(1))
      : 0
  }));
})();

// ============================================================
// 10. SIMULADOR
// ============================================================
export const simulatorDefaults = {
  experienceId: 'senderismo',
  segmentId: 'amigos',
  conversion: 15
};
export const simulatorInsights = {
  title: 'Una pequeña conversión puede representar una nueva fuente de ingresos.',
  description: 'El simulador permite explorar escenarios comerciales usando clientes que ya muestran afinidad con determinadas experiencias.',
  disclaimer: 'Los resultados representan escenarios hipotéticos construidos para fines demostrativos y no constituyen una proyección financiera real.'
};

// ============================================================
// EXPORT GENERAL
// ============================================================
export const RAW_RESERVATIONS = RESERVATIONS;
