// ============================================================
// VILLA ADELAIDA — DATASET SINTÉTICO 2026
// ============================================================
// Este archivo genera UN SOLO dataset coherente de visitas/reservas
// para todo 2026 (solo sábados, domingos y festivos, que es cuando
// opera el club) y de él se derivan TODOS los KPIs y gráficos de
// las 6 vistas del dashboard. Así, cuando alguien "filtra" septiembre
// + domingo + parejas + restaurante, todas las vistas cuentan la
// misma historia, porque todas parten de la misma fuente.
// ============================================================

// ------------------------------------------------------------
// 0. RNG determinista (para que el dataset sea siempre el mismo
//    entre recargas, en vez de aleatorio en cada render)
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
const rng = mulberry32(20260101);
const rand = () => rng();
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

function weightedPick(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

// ------------------------------------------------------------
// 1. FESTIVOS COLOMBIA 2026 (calendario oficial, incluye el
//    festivo del 9 de julio -Virgen de Chiquinquirá- trasladado
//    al lunes 13 de julio de 2026 por la Ley Emiliani)
// ------------------------------------------------------------
export const HOLIDAYS_2026 = [
  { date: '2026-01-01', name: 'Año Nuevo' },
  { date: '2026-01-12', name: 'Día de los Reyes Magos' },
  { date: '2026-03-23', name: 'Día de San José' },
  { date: '2026-04-02', name: 'Jueves Santo' },
  { date: '2026-04-03', name: 'Viernes Santo' },
  { date: '2026-05-01', name: 'Día del Trabajo' },
  { date: '2026-05-18', name: 'Ascensión del Señor' },
  { date: '2026-06-08', name: 'Corpus Christi' },
  { date: '2026-06-15', name: 'Sagrado Corazón de Jesús' },
  { date: '2026-06-29', name: 'San Pedro y San Pablo' },
  { date: '2026-07-13', name: 'Nuestra Señora del Rosario de Chiquinquirá' },
  { date: '2026-07-20', name: 'Día de la Independencia' },
  { date: '2026-08-07', name: 'Batalla de Boyacá' },
  { date: '2026-08-17', name: 'Asunción de la Virgen' },
  { date: '2026-10-12', name: 'Día de la Raza' },
  { date: '2026-11-02', name: 'Día de Todos los Santos' },
  { date: '2026-11-16', name: 'Independencia de Cartagena' },
  { date: '2026-12-08', name: 'Día de la Inmaculada Concepción' },
  { date: '2026-12-25', name: 'Navidad' }
];
const HOLIDAY_SET = new Set(HOLIDAYS_2026.map(h => h.date));

// Fechas especiales que usamos para "picos" narrativos
export const SPECIAL_DATES = {
  diaDeLaMadre: '2026-05-10',      // domingo
  amorYAmistad: '2026-09-19',      // sábado (Colombia lo celebra en septiembre)
  semanaSanta: ['2026-04-02', '2026-04-03', '2026-04-05']
};

const MONTH_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function pad(n) { return n < 10 ? '0' + n : '' + n; }
function fmt(y, m, d) { return `${y}-${pad(m)}-${pad(d)}`; }
function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }

// ------------------------------------------------------------
// 2. DÍAS DE OPERACIÓN 2026 (solo sábado=6, domingo=0, o festivo)
// ------------------------------------------------------------
export const OPERATING_DAYS = (() => {
  const days = [];
  for (let m = 1; m <= 12; m++) {
    const total = daysInMonth(2026, m);
    for (let d = 1; d <= total; d++) {
      const dateStr = fmt(2026, m, d);
      const dow = new Date(2026, m - 1, d).getDay(); // 0=Dom,6=Sáb
      const isHoliday = HOLIDAY_SET.has(dateStr);
      if (dow === 6 || dow === 0 || isHoliday) {
        let dayType = isHoliday ? 'Festivo' : dow === 6 ? 'Sábado' : 'Domingo';
        days.push({ date: dateStr, month: m, monthName: MONTH_NAMES[m - 1], dayType, isHoliday });
      }
    }
  }
  return days;
})();

// ------------------------------------------------------------
// 3. EXPERIENCIAS ACTUALES (orden de consumo FIJO, validado)
// ------------------------------------------------------------
export const EXPERIENCES = [
  { id: 'piscina',  rank: 1, name: 'Piscina y río natural', price: 10000, weight: 28 },
  { id: 'camping',  rank: 2, name: 'Camping',                price: 30000, weight: 18 },
  { id: 'hotel',    rank: 3, name: 'Servicio de hotel',      price: 50000, weight: 16 },
  { id: 'salon',    rank: 4, name: 'Salón de eventos',       price: 250000, weight: 14 },
  { id: 'kiosko',   rank: 5, name: 'Reserva de kiosko',      price: 30000, weight: 8  },
  { id: 'sendero',  rank: 6, name: 'Senderismo',             price: 15000, weight: 7  },
  { id: 'hamaca',   rank: 7, name: 'Hamacario',              price: 10000, weight: 5  }
];

// Afinidad de cada experiencia con cada tipo de cliente (multiplica el peso base).
// Los valores están calibrados para que el ranking agregado de consumo respete
// siempre el orden validado: Piscina > Camping > Hotel > Salón > Kiosko > Senderismo > Hamacario.
const EXPERIENCE_AFFINITY = {
  familias:     { piscina: 1.5, camping: 1.0, hotel: 0.7, salon: 0.35, kiosko: 0.8, sendero: 1.1, hamaca: 1.3 },
  parejas:      { piscina: 1.2, camping: 0.5, hotel: 1.1, salon: 0.35, kiosko: 1.3, sendero: 0.8, hamaca: 1.4 },
  amigos:       { piscina: 1.4, camping: 1.7, hotel: 0.6, salon: 0.25, kiosko: 0.9, sendero: 1.3, hamaca: 0.8 },
  empresarial:  { piscina: 0.5, camping: 0.2, hotel: 1.3, salon: 2.2,  kiosko: 0.3, sendero: 0.3, hamaca: 0.3 },
  otros:        { piscina: 1.0, camping: 1.0, hotel: 1.0, salon: 1.0,  kiosko: 1.0, sendero: 1.0, hamaca: 1.0 }
};

// ------------------------------------------------------------
// 4. GASTRONOMÍA — 10 platos (orden de consumo FIJO)
// ------------------------------------------------------------
export const DISHES = [
  { id: 'chivo',    rank: 3,  name: 'Chivo guisado',          price: 32000, weight: 20 },
  { id: 'mojarra',  rank: 1,  name: 'Mojarra frita',          price: 28000, weight: 16 },
  { id: 'asada',    rank: 5,  name: 'Carne asada',            price: 25000, weight: 13 },
  { id: 'guisada',  rank: 4,  name: 'Carne guisada',          price: 26000, weight: 12 },
  { id: 'albondig', rank: 8,  name: 'Albóndigas',             price: 25000, weight: 10 },
  { id: 'molida',   rank: 9,  name: 'Carne molida',           price: 25000, weight: 9  },
  { id: 'gallina',  rank: 10,  name: 'Gallina guisada',        price: 29000, weight: 8  },
  { id: 'pechuga',  rank: 2,  name: 'Pechuga a la plancha',   price: 26000, weight: 6  },
  { id: 'pollo',    rank: 6,  name: 'Pollo guisado',          price: 25000, weight: 4  },
  { id: 'delDia',   rank: 7, name: 'Plato del día',          price: 27000, weight: 2  }
];

// ------------------------------------------------------------
// 5. TIPOS DE CLIENTE
// ------------------------------------------------------------
export const CUSTOMER_TYPES = [
  { id: 'familias',    name: 'Familias',    color: '#286b45', description: 'Principalmente domingos y festivos.' },
  { id: 'parejas',     name: 'Parejas',     color: '#d28b27', description: 'Mayor presencia los sábados; también otros días.' },
  { id: 'amigos',      name: 'Amigos',      color: '#719b83', description: 'Picos en enero, junio, julio y diciembre (vacaciones).' },
  { id: 'empresarial', name: 'Empresarial', color: '#526158', description: 'Mayor presencia en junio y diciembre (primas y vacaciones corporativas).' },
  { id: 'otros',       name: 'Otros',       color: '#9b8f7a', description: 'Visitantes que no encajan en los cuatro segmentos anteriores.' }
];

export const CLIENT_RECURRENCE_DEFINITION =
  'Cliente recurrente = cliente identificado que realiza al menos dos visitas/reservas confirmadas durante 2026, en fechas diferentes. No se considera recurrente a alguien que solo reservó para varias personas en una misma visita.';

// ------------------------------------------------------------
// 6. PAQUETES (oportunidad comercial, NO son datos actuales)
// ------------------------------------------------------------
export const PACKAGES = [
  {
    id: 'romantico',
    name: 'Pasadía Romántica',
    segment: 'parejas',
    description: 'Una experiencia especial para parejas que combina gastronomía, ambiente y momentos privados.',
    includes: ['Reserva de kiosko', 'Restaurante', 'Piscina/Río', 'Decoración', 'Experiencia especial'],
    defaultPrice: 280000, minPrice: 180000, maxPrice: 450000, defaultConversion: 12,
    color: '#d28b27'
  },
  {
    id: 'familiar',
    name: 'Pasadía Familiar',
    segment: 'familias',
    description: 'Una experiencia diseñada para familias que buscan disfrutar del restaurante y las atracciones del club.',
    includes: ['Restaurante', 'Piscina/Río', 'Kiosko', 'Actividad recreativa', 'Espacio familiar'],
    defaultPrice: 220000, minPrice: 150000, maxPrice: 350000, defaultConversion: 10,
    color: '#286b45'
  },
  {
    id: 'eventos',
    name: 'Eventos',
    segment: 'otros',
    description: 'Una propuesta alrededor de conciertos, celebraciones y experiencias especiales.',
    includes: ['Salón de eventos', 'Restaurante', 'Piscina/Río', 'Servicios complementarios'],
    defaultPrice: 320000, minPrice: 200000, maxPrice: 500000, defaultConversion: 11,
    color: '#719b83'
  },
  {
    id: 'amigos',
    name: 'Plan Amigos',
    segment: 'amigos',
    description: 'Pensado para grupos de amigos que buscan piscina/río, camping y restaurante en un solo plan.',
    includes: ['Piscina/Río', 'Camping', 'Restaurante', 'Actividades'],
    defaultPrice: 190000, minPrice: 120000, maxPrice: 300000, defaultConversion: 13,
    color: '#8a9b6e'
  },
  {
    id: 'empresarial',
    name: 'Plan Empresarial',
    segment: 'empresarial',
    description: 'Una propuesta para empresas que buscan espacios diferentes para reuniones, integración y eventos.',
    includes: ['Salón de eventos', 'Restaurante', 'Servicio de hotel (si aplica)', 'Actividades', 'Espacio reservado'],
    defaultPrice: 480000, minPrice: 300000, maxPrice: 750000, defaultConversion: 15,
    color: '#526158'
  }
];

// ------------------------------------------------------------
// 7. ESTACIONALIDAD — pesos por mes y por segmento
//    (multiplican el peso base del segmento ese mes)
// ------------------------------------------------------------
const MONTH_SEGMENT_MULTIPLIER = {
  1:  { familias: 1.0, parejas: 1.0, amigos: 1.55, empresarial: 0.7, otros: 1.0 }, // Enero: amigos (vacaciones)
  2:  { familias: 1.0, parejas: 1.0, amigos: 1.0,  empresarial: 1.0, otros: 1.0 }, // Febrero: normal
  3:  { familias: 1.0, parejas: 1.0, amigos: 1.0,  empresarial: 1.0, otros: 1.0 }, // Marzo: normal
  4:  { familias: 1.3, parejas: 1.0, amigos: 1.25, empresarial: 0.8, otros: 1.0 }, // Abril: Semana Santa
  5:  { familias: 1.55,parejas: 1.0, amigos: 0.9,  empresarial: 0.9, otros: 1.0 }, // Mayo: Día de la Madre
  6:  { familias: 1.0, parejas: 1.0, amigos: 1.35, empresarial: 1.65, otros: 1.0 },// Junio: prima/vacaciones
  7:  { familias: 1.0, parejas: 0.95,amigos: 1.7,  empresarial: 1.0, otros: 1.0 }, // Julio: vacaciones
  8:  { familias: 1.2, parejas: 1.0, amigos: 1.05, empresarial: 0.9, otros: 1.15 },// Agosto: festivos
  9:  { familias: 0.95,parejas: 1.85,amigos: 0.95, empresarial: 0.9, otros: 1.0 }, // Septiembre: Amor y Amistad
  10: { familias: 1.15,parejas: 1.05,amigos: 1.0,  empresarial: 0.9, otros: 1.15 },// Octubre: social/familiar
  11: { familias: 1.05,parejas: 1.0, amigos: 1.05, empresarial: 1.0, otros: 1.05 },// Noviembre: mixto
  12: { familias: 1.35,parejas: 1.0, amigos: 1.45, empresarial: 1.55, otros: 1.0 } // Diciembre: primas/vacaciones
};

const DAYTYPE_SEGMENT_MULTIPLIER = {
  Sábado:  { familias: 0.85, parejas: 1.45, amigos: 1.1, empresarial: 0.9, otros: 1.0 },
  Domingo: { familias: 1.5,  parejas: 0.8,  amigos: 0.85, empresarial: 0.5, otros: 1.05 },
  Festivo: { familias: 1.1,  parejas: 1.05, amigos: 1.15, empresarial: 1.05, otros: 1.05 }
};

const BASE_SEGMENT_WEIGHT = { familias: 30, parejas: 26, amigos: 20, empresarial: 12, otros: 12 };

function segmentWeightsFor(dateInfo) {
  const mm = MONTH_SEGMENT_MULTIPLIER[dateInfo.month];
  const dm = DAYTYPE_SEGMENT_MULTIPLIER[dateInfo.dayType];
  const out = {};
  for (const seg of Object.keys(BASE_SEGMENT_WEIGHT)) {
    out[seg] = BASE_SEGMENT_WEIGHT[seg] * mm[seg] * dm[seg];
  }
  return out;
}

// Volumen total de visitas del día (crece un poco a lo largo del año + estacionalidad)
function volumeForDay(dateInfo, dayIndexInYear) {
  const baseByType = { Sábado: 62, Domingo: 72, Festivo: 85 };
  let base = baseByType[dateInfo.dayType];
  const growth = 1 + (dayIndexInYear / OPERATING_DAYS.length) * 0.22; // crecimiento razonable
  const mm = MONTH_SEGMENT_MULTIPLIER[dateInfo.month];
  const monthAvg = (mm.familias + mm.parejas + mm.amigos + mm.empresarial + mm.otros) / 5;
  let volume = base * growth * monthAvg;

  // boosts puntuales por fechas especiales
  if (dateInfo.date === SPECIAL_DATES.amorYAmistad) volume *= 1.55;
  if (dateInfo.date === SPECIAL_DATES.diaDeLaMadre) volume *= 1.4;
  if (SPECIAL_DATES.semanaSanta.includes(dateInfo.date)) volume *= 1.25;

  // meses/días "menos favorables" para que no todo parezca perfecto
  if (dateInfo.month === 2) volume *= 0.9;
  if (dateInfo.month === 11) volume *= 0.93;

  return Math.round(volume * (0.9 + rand() * 0.2)); // ruido natural
}

// ------------------------------------------------------------
// 8. HORAS DE OPERACIÓN (franjas 9am-6pm, distribución por tipo de día)
// ------------------------------------------------------------
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];
const HOUR_WEIGHTS = {
  Sábado:  [4, 6, 8, 12, 14, 16, 16, 14, 10],  // pico en la tarde (cena/atardecer romántico)
  Domingo: [8, 12, 16, 18, 16, 12, 9, 6, 3],   // pico al mediodía (almuerzo familiar)
  Festivo: [6, 9, 12, 15, 15, 14, 12, 10, 7]   // distribución más pareja
};

// ------------------------------------------------------------
// 9. GENERACIÓN DEL DATASET DE VISITAS
// ------------------------------------------------------------
const clientPoolByType = { familias: [], parejas: [], amigos: [], empresarial: [], otros: [] };
let clientCounter = 1;
const clientFirstVisit = {}; // clientId -> primera fecha
const clientVisitDates = {}; // clientId -> Set de fechas distintas

function pickClient(type) {
  const pool = clientPoolByType[type];
  const reuseProbability = 0.42; // probabilidad de que sea alguien que ya visitó antes
  if (pool.length > 5 && rand() < reuseProbability) {
    return pool[randInt(0, pool.length - 1)];
  }
  const id = `${type.slice(0, 3).toUpperCase()}-${String(clientCounter++).padStart(5, '0')}`;
  pool.push(id);
  return id;
}

export const VISITS = (() => {
  const visits = [];
  OPERATING_DAYS.forEach((dateInfo, dayIndex) => {
    const weights = segmentWeightsFor(dateInfo);
    const segIds = Object.keys(weights);
    const segW = segIds.map(s => weights[s]);
    const totalVisitsToday = volumeForDay(dateInfo, dayIndex);
    const hourW = HOUR_WEIGHTS[dateInfo.dayType];

    for (let i = 0; i < totalVisitsToday; i++) {
      const customerType = weightedPick(segIds, segW);
      const clientId = pickClient(customerType);

      if (!clientFirstVisit[clientId]) clientFirstVisit[clientId] = dateInfo.date;
      if (!clientVisitDates[clientId]) clientVisitDates[clientId] = new Set();
      clientVisitDates[clientId].add(dateInfo.date);

      const hour = weightedPick(HOURS, hourW);

      // --- Experiencias consumidas (1 a 2 por visita) ---
      const affinity = EXPERIENCE_AFFINITY[customerType];
      const expWeights = EXPERIENCES.map(e => e.weight * affinity[e.id]);
      const nExp = rand() < 0.62 ? 1 : 2;
      const chosenExp = new Set();
      for (let k = 0; k < nExp; k++) {
        const pick = weightedPick(EXPERIENCES.map(e => e.id), expWeights);
        chosenExp.add(pick);
      }
      const experiences = [...chosenExp];
      const experienceRevenue = experiences.reduce(
        (sum, id) => sum + EXPERIENCES.find(e => e.id === id).price, 0
      );

      // --- Consumo gastronómico (¿usa restaurante?) ---
      const usesRestaurant = rand() < 0.68;
      let dishes = [];
      let dishRevenue = 0;
      if (usesRestaurant) {
        const nDish = rand() < 0.55 ? 1 : 2;
        const dishW = DISHES.map(d => d.weight);
        const chosenDish = new Set();
        for (let k = 0; k < nDish; k++) {
          chosenDish.add(weightedPick(DISHES.map(d => d.id), dishW));
        }
        dishes = [...chosenDish];
        dishRevenue = dishes.reduce((sum, id) => sum + DISHES.find(d => d.id === id).price, 0);
      }

      visits.push({
        date: dateInfo.date,
        month: dateInfo.month,
        monthName: dateInfo.monthName,
        dayType: dateInfo.dayType,
        hour,
        customerType,
        clientId,
        experiences,
        dishes,
        experienceRevenue,
        dishRevenue,
        totalSpend: experienceRevenue + dishRevenue
      });
    }
  });
  return visits;
})();

const recurringClientIds = new Set(
  Object.entries(clientVisitDates).filter(([, dates]) => dates.size >= 2).map(([id]) => id)
);

// ============================================================
// 10. AGREGADOS DERIVADOS — VISTA 01 · OVERVIEW
// ============================================================
export const overviewKPIs = (() => {
  const totalSales = VISITS.reduce((s, v) => s + v.totalSpend, 0);
  const clientIds = new Set(VISITS.map(v => v.clientId));
  const totalClients = clientIds.size;
  const recurringRate = (recurringClientIds.size / totalClients) * 100;
  const avgTicket = totalSales / VISITS.length;
  return {
    sales: Math.round(totalSales),
    clients: totalClients,
    recurringClients: recurringClientIds.size,
    recurringRate: Number(recurringRate.toFixed(1)),
    avgTicket: Math.round(avgTicket)
  };
})();

export const monthlySales = (() => {
  const acc = Array.from({ length: 12 }, (_, i) => ({ month: MONTH_NAMES[i], sales: 0, visits: 0 }));
  VISITS.forEach(v => {
    acc[v.month - 1].sales += v.totalSpend;
    acc[v.month - 1].visits += 1;
  });
  return acc.map(m => ({ ...m, sales: Math.round(m.sales) }));
})();

export const salesBySource = (() => {
  const src = {};
  EXPERIENCES.forEach(e => (src[e.name] = 0));
  src['Restaurante'] = 0;
  VISITS.forEach(v => {
    v.experiences.forEach(id => {
      const e = EXPERIENCES.find(x => x.id === id);
      src[e.name] += e.price;
    });
    src['Restaurante'] += v.dishRevenue;
  });
  return Object.entries(src)
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);
})();

export const overviewInsight =
  'El comportamiento del año muestra una clara estacionalidad: septiembre concentra a las parejas por Amor y Amistad, mayo se activa por el Día de la Madre, y junio/diciembre elevan la demanda empresarial y de grupos de amigos por las vacaciones y las primas. Los domingos y festivos siguen siendo el motor familiar del negocio.';

// ============================================================
// 11. AGREGADOS — VISTA 02 · BEHAVIOR
// ============================================================
export const newVsRecurringMonthly = (() => {
  const acc = Array.from({ length: 12 }, (_, i) => ({ month: MONTH_NAMES[i], nuevos: 0, recurrentes: 0 }));
  const seenBefore = new Set();
  // recorremos visitas en orden cronológico (ya lo están, por construcción)
  VISITS.forEach(v => {
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

export const customerTypeDistribution = CUSTOMER_TYPES.map(ct => ({
  id: ct.id,
  name: ct.name,
  value: VISITS.filter(v => v.customerType === ct.id).length
})).sort((a, b) => b.value - a.value);

export const dayTypeDistribution = ['Sábado', 'Domingo', 'Festivo'].map(dt => ({
  dayType: dt,
  value: VISITS.filter(v => v.dayType === dt).length
}));

export const customerTypeByDayType = ['Sábado', 'Domingo', 'Festivo'].map(dt => {
  const row = { dayType: dt };
  CUSTOMER_TYPES.forEach(ct => {
    row[ct.id] = VISITS.filter(v => v.dayType === dt && v.customerType === ct.id).length;
  });
  return row;
});

export const hourActivityHeatmap = (() => {
  const data = [];
  ['Sábado', 'Domingo', 'Festivo'].forEach((dt, dRow) => {
    HOURS.forEach((h, hCol) => {
      const count = VISITS.filter(v => v.dayType === dt && v.hour === h).length;
      data.push([hCol, dRow, count]);
    });
  });
  return { hours: HOURS, dayTypes: ['Sábado', 'Domingo', 'Festivo'], data };
})();

export const recurringEvolution = (() => {
  const acc = Array.from({ length: 12 }, (_, i) => ({ month: MONTH_NAMES[i], clientesActivos: new Set(), recurrentesActivos: new Set() }));
  VISITS.forEach(v => {
    acc[v.month - 1].clientesActivos.add(v.clientId);
    if (recurringClientIds.has(v.clientId)) acc[v.month - 1].recurrentesActivos.add(v.clientId);
  });
  return acc.map(m => ({
    month: m.month,
    tasaRecurrencia: m.clientesActivos.size
      ? Number(((m.recurrentesActivos.size / m.clientesActivos.size) * 100).toFixed(1))
      : 0
  }));
})();

// ============================================================
// 12. AGREGADOS — VISTA 03 · EXPERIENCES
// ============================================================
export const experienceRanking = EXPERIENCES.map(e => {
  const count = VISITS.filter(v => v.experiences.includes(e.id)).length;
  return { ...e, consumo: count, ingresos: count * e.price };
}).sort((a, b) => b.consumo - a.consumo);

export const experienceBySegment = EXPERIENCES.map(e => {
  const row = { id: e.id, name: e.name };
  CUSTOMER_TYPES.forEach(ct => {
    row[ct.id] = VISITS.filter(v => v.customerType === ct.id && v.experiences.includes(e.id)).length;
  });
  return row;
});

export const experiencesKPIs = (() => {
  const top = experienceRanking[0];
  const totalExpRevenue = experienceRanking.reduce((s, e) => s + e.ingresos, 0);
  const totalExpCount = experienceRanking.reduce((s, e) => s + e.consumo, 0);
  const avgPrice = EXPERIENCES.reduce((s, e) => s + e.price, 0) / EXPERIENCES.length;
  // "mayor crecimiento": comparamos primer trimestre vs último trimestre
  const q1 = VISITS.filter(v => v.month <= 3);
  const q4 = VISITS.filter(v => v.month >= 10);
  const growth = EXPERIENCES.map(e => {
    const c1 = q1.filter(v => v.experiences.includes(e.id)).length || 1;
    const c4 = q4.filter(v => v.experiences.includes(e.id)).length;
    return { name: e.name, growth: ((c4 - c1) / c1) * 100 };
  }).sort((a, b) => b.growth - a.growth)[0];
  return {
    topExperience: top.name,
    avgPrice: Math.round(avgPrice),
    totalRevenue: Math.round(totalExpRevenue),
    totalConsumption: totalExpCount,
    fastestGrowing: growth.name
  };
})();

// ============================================================
// 13. AGREGADOS — VISTA 04 · GASTRONOMY
// ============================================================
export const dishRanking = DISHES.map(d => {
  const count = VISITS.filter(v => v.dishes.includes(d.id)).length;
  return { ...d, vendidos: count, ingresos: count * d.price };
}).sort((a, b) => b.vendidos - a.vendidos);

export const dishBySegment = DISHES.map(d => {
  const row = { id: d.id, name: d.name };
  CUSTOMER_TYPES.forEach(ct => {
    row[ct.id] = VISITS.filter(v => v.customerType === ct.id && v.dishes.includes(d.id)).length;
  });
  return row;
});

export const monthlyGastronomy = (() => {
  const acc = Array.from({ length: 12 }, (_, i) => ({ month: MONTH_NAMES[i], ingresos: 0, platos: 0 }));
  VISITS.forEach(v => {
    acc[v.month - 1].ingresos += v.dishRevenue;
    acc[v.month - 1].platos += v.dishes.length;
  });
  return acc.map(m => ({ ...m, ingresos: Math.round(m.ingresos) }));
})();

export const gastronomyKPIs = (() => {
  const totalPlatos = dishRanking.reduce((s, d) => s + d.vendidos, 0);
  const totalIngresos = dishRanking.reduce((s, d) => s + d.ingresos, 0);
  const visitasConRestaurante = VISITS.filter(v => v.dishes.length > 0).length;
  return {
    topDish: dishRanking[0].name,
    totalDishesSold: totalPlatos,
    gastronomyRevenue: Math.round(totalIngresos),
    avgTicket: Math.round(totalIngresos / (visitasConRestaurante || 1))
  };
})();

// ============================================================
// 14. AGREGADOS — VISTA 05 · OPPORTUNITIES
// ============================================================
export const opportunityMatrix = PACKAGES.map(p => {
  const segVisits = VISITS.filter(v => v.customerType === p.segment);
  const demand = segVisits.length;
  const value = segVisits.length ? segVisits.reduce((s, v) => s + v.totalSpend, 0) / segVisits.length : 0;
  return { id: p.id, name: p.name, demand, value: Math.round(value), color: p.color };
});

export const opportunityCalendar = (() => {
  const data = [];
  PACKAGES.forEach((p, pRow) => {
    for (let m = 1; m <= 12; m++) {
      const count = VISITS.filter(v => v.month === m && v.customerType === p.segment).length;
      data.push([m - 1, pRow, count]);
    }
  });
  return { months: MONTH_NAMES, packages: PACKAGES.map(p => p.name), data };
})();

export const segmentPackageAffinity = PACKAGES.map(p => {
  const row = { package: p.name };
  CUSTOMER_TYPES.forEach(ct => {
    row[ct.id] = VISITS.filter(v => v.customerType === ct.id && v.customerType === p.segment).length
      + (ct.id !== p.segment ? Math.round(VISITS.filter(v => v.customerType === ct.id).length * 0.08) : 0);
  });
  return row;
});

export const opportunityInsights = {
  matrix: 'La Pasadía Romántica combina una demanda significativa con el valor promedio de visita más alto, lo que la convierte en la oportunidad comercial más sólida.',
  calendar: 'Cada paquete tiene una estacionalidad propia: lo romántico se dispara en septiembre, lo familiar en mayo y vacaciones, y lo empresarial y de amigos en junio y diciembre.',
  segment: 'La afinidad cambia según el perfil del visitante: las parejas concentran la oportunidad romántica, las familias la propuesta familiar y los clientes empresariales el plan corporativo.',
  conclusion: 'La información sugiere que el club no necesita crear una oferta completamente nueva desde cero. Puede empaquetar experiencias y platos que ya generan interés y convertirlos en productos de mayor valor, como las 5 propuestas de paquete.'
};

// ============================================================
// 15. VISTA 06 · SIMULATOR
// ============================================================
export const simulatorPackages = PACKAGES.map(p => {
  const segVisits = VISITS.filter(v => v.customerType === p.segment);
  const potentialClients = new Set(segVisits.map(v => v.clientId)).size;
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    includes: p.includes,
    clients: potentialClients,
    defaultPrice: p.defaultPrice,
    minPrice: p.minPrice,
    maxPrice: p.maxPrice,
    defaultConversion: p.defaultConversion,
    color: p.color,
    currentAvgSpend: Math.round(
      segVisits.length ? segVisits.reduce((s, v) => s + v.totalSpend, 0) / segVisits.length : 0
    )
  };
});

export const simulatorDefaults = {
  packageId: 'romantico',
  price: 280000,
  conversion: 12
};

export const simulatorInsights = {
  title: 'Una pequeña conversión puede representar una nueva fuente de ingresos.',
  description: 'El simulador permite explorar diferentes escenarios comerciales utilizando clientes que ya muestran afinidad con determinadas experiencias.',
  disclaimer: 'Los resultados representan escenarios hipotéticos construidos para fines demostrativos y no constituyen una proyección financiera real.'
};

// ============================================================
// EXPORT GENERAL (útil si alguna vista quiere el dataset crudo)
// ============================================================
export const RAW_VISITS = VISITS;
export const MONTHS = MONTH_NAMES;
