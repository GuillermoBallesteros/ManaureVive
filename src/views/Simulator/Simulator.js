import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import '../../styles/view-shell.css';
import './Simulator.css';
import { EXPERIENCES, CUSTOMER_TYPES, RESERVATIONS, MONTHS, simulatorDefaults } from '../../data/dashboardData';

const COP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Math.round(n || 0));
const compact = (n) => (n >= 1000000 ? `$${(n / 1000000).toFixed(1)} M` : `$${Math.round((n || 0) / 1000)} mil`);

const EXPERIENCE_LABELS = {
  vivemanaure: 'Tour Manaure',
  senderismo: 'Senderismo',
  rio: 'Paseo al río',
  gastronomica: 'Gastronomía',
  aves: 'Vista aves'
};
const labelFor = (experience) => EXPERIENCE_LABELS[experience.id] || experience.name;

const SEGMENT_COLORS = {
  familia: { start: '#D9A441', end: '#F2C66D' },
  parejas: { start: '#286477', end: '#3E9CB5' },
  amigos: { start: '#0B5D3B', end: '#6FAF8F' },
  otros: { start: '#507A73', end: '#A8CDB8' }
};
const getSegmentColor = (id) => SEGMENT_COLORS[id] || SEGMENT_COLORS.otros;

function Simulator() {
  const defaultExperience = EXPERIENCES.find((e) => e.id === simulatorDefaults.experienceId) || EXPERIENCES[0];
  const [experienceId, setExperienceId] = useState(defaultExperience.id);
  const [segmentId, setSegmentId] = useState(simulatorDefaults.segmentId || CUSTOMER_TYPES[0]?.id);
  const [price, setPrice] = useState(defaultExperience.price);
  const [conversion, setConversion] = useState(simulatorDefaults.conversion || 15);
  const [affinityMetric, setAffinityMetric] = useState('rate');

  const selectedExperience = useMemo(() => EXPERIENCES.find((x) => x.id === experienceId) || EXPERIENCES[0], [experienceId]);
  const selectedSegment = useMemo(() => CUSTOMER_TYPES.find((x) => x.id === segmentId) || CUSTOMER_TYPES[0], [segmentId]);

  const profileStats = useMemo(() => CUSTOMER_TYPES.map((type) => {
    const segmentReservations = RESERVATIONS.filter((v) => v.customerType === type.id);
    const experienceReservations = segmentReservations.filter((v) => v.experiences.includes(selectedExperience.id));
    const clients = new Set(segmentReservations.map((v) => v.clientId)).size;
    const experienceClients = new Set(experienceReservations.map((v) => v.clientId)).size;
    const affinity = clients ? experienceClients / clients : 0;
    return { ...type, clients, experienceClients, affinity };
  }), [selectedExperience]);

  const targetProfile = profileStats.find((x) => x.id === selectedSegment.id) || profileStats[0];
  const bestExperienceProfile = [...profileStats].sort((a, b) => b.affinity - a.affinity)[0] || profileStats[0];

  const potentialClients = Math.max(0, targetProfile?.experienceClients || 0);
  const estimatedReservations = Math.round((potentialClients * conversion) / 100);
  const scenarioRevenue = estimatedReservations * price;

  const monthlySegmentRevenue = useMemo(() => CUSTOMER_TYPES.map((type) => {
    const values = MONTHS.map((_, index) => {
      const monthReservations = RESERVATIONS.filter((v) => v.month === index + 1 && v.customerType === type.id);
      const monthClients = new Set(monthReservations.map((v) => v.clientId)).size;
      const experienceClients = new Set(monthReservations.filter((v) => v.experiences.includes(selectedExperience.id)).map((v) => v.clientId)).size;
      const affinity = monthClients ? experienceClients / monthClients : 0;
      return Math.round(monthClients * affinity * (conversion / 100) * price);
    });
    return { ...type, values };
  }), [selectedExperience, conversion, price]);

  const trendOption = useMemo(() => ({
    grid: { left: 52, right: 15, top: 26, bottom: 22 },
    legend: { top: 0, type: 'scroll', textStyle: { color: '#53635a', fontSize: 9 } },
    tooltip: { trigger: 'axis', valueFormatter: (v) => COP(v) },
    xAxis: { type: 'category', data: MONTHS, axisLabel: { fontSize: 9.5 } },
    yAxis: { type: 'value', axisLabel: { formatter: (v) => compact(v), fontSize: 9.5 }, splitLine: { lineStyle: { color: '#eef1ee' } } },
    series: monthlySegmentRevenue.map((type) => ({
      name: type.name, type: 'line', smooth: 0.25, symbol: 'circle', symbolSize: 4, data: type.values,
      lineStyle: {
        width: type.id === selectedSegment.id ? 3.5 : 1.5,
        opacity: type.id === selectedSegment.id ? 1 : 0.58,
        color: (() => {
          const palette = getSegmentColor(type.id);
          return {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [{ offset: 0, color: palette.start }, { offset: 1, color: palette.end }]
          };
        })()
      },
      itemStyle: { color: (() => {
        const palette = getSegmentColor(type.id);
        return {
          type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [{ offset: 0, color: palette.start }, { offset: 1, color: palette.end }]
        };
      })() },
      emphasis: { focus: 'series' }
    }))
  }), [monthlySegmentRevenue, selectedSegment.id]);

  const affinityValues = profileStats.slice().reverse();
  const affinityOption = useMemo(() => ({
    grid: { left: 100, right: 45, top: 6, bottom: 20 },
    tooltip: {
      trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const p = params[0];
        const item = affinityValues.find((x) => x.name === p.name);
        if (!item) return '';
        return `<strong>${item.name}</strong><br/>${labelFor(selectedExperience)}<br/><strong>${Math.round(item.affinity * 100)}%</strong> de sus clientes consumieron esta experiencia<br/>${item.experienceClients.toLocaleString('es-CO')} clientes`;
      }
    },
    xAxis: affinityMetric === 'rate'
      ? { type: 'value', min: 0, max: 1, axisLabel: { formatter: (v) => `${Math.round(v * 100)}%`, fontSize: 9.5 }, splitLine: { lineStyle: { color: '#eef1ee' } } }
      : { type: 'value', min: 0, axisLabel: { formatter: (v) => v.toLocaleString('es-CO'), fontSize: 9.5 }, splitLine: { lineStyle: { color: '#eef1ee' } } },
    yAxis: { type: 'category', data: affinityValues.map((x) => x.name), axisLabel: { fontSize: 10 } },
    series: [{
      name: affinityMetric === 'rate' ? 'Afinidad' : 'Clientes con afinidad', type: 'bar',
      data: affinityValues.map((x) => ({
        value: affinityMetric === 'rate' ? x.affinity : x.experienceClients,
        itemStyle: (() => {
          const palette = getSegmentColor(x.id);
          return {
            color: {
              type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [{ offset: 0, color: palette.start }, { offset: 1, color: palette.end }]
            },
            borderRadius: [0, 6, 6, 0]
          };
        })()
      })), barMaxWidth: 18,
      label: { show: true, position: 'right', formatter: (p) => (affinityMetric === 'rate' ? `${Math.round(p.value * 100)}%` : p.value.toLocaleString('es-CO')), color: '#183027', fontSize: 9.5 }
    }]
  }), [affinityValues, affinityMetric, selectedExperience]);

  const handleExperienceChange = (id) => {
    const exp = EXPERIENCES.find((e) => e.id === id) || EXPERIENCES[0];
    setExperienceId(exp.id);
    setPrice(exp.price);
  };

  const reset = () => {
    setExperienceId(defaultExperience.id);
    setSegmentId(simulatorDefaults.segmentId || CUSTOMER_TYPES[0]?.id);
    setPrice(defaultExperience.price);
    setConversion(simulatorDefaults.conversion || 15);
    setAffinityMetric('rate');
  };

  return (
    <main className="view">
      <header className="view-header">
        <div>
          <span className="view-tag">Simulador</span>
          <h1>Prueba la <em>combinación</em> con mayor potencial</h1>
        </div>
      </header>

      <div className="view-grid simulator-grid">
        <article className="view-card simulator-config">
          <div className="config-header"><h2 style={{ margin: 0, fontSize: 14, color: '#1f3d2e' }}>Construir escenario</h2><span>EXPERIENCIA + PÚBLICO</span></div>

          <label className="config-field">
            <span>Experiencia a impulsar</span>
            <select value={experienceId} onChange={(e) => handleExperienceChange(e.target.value)}>
              {EXPERIENCES.map((e) => <option key={e.id} value={e.id}>{labelFor(e)}</option>)}
            </select>
          </label>

          <label className="config-field">
            <span>Público objetivo</span>
            <select value={segmentId} onChange={(e) => setSegmentId(e.target.value)}>
              {CUSTOMER_TYPES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>

          <label className="config-field">
            <span>Tarifa: <strong>{COP(price)}</strong></span>
            <input
              type="range"
              min={Math.round(selectedExperience.price * 0.6)}
              max={Math.round(selectedExperience.price * 1.6)}
              step={5000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </label>

          <label className="config-field">
            <span>Conversión estimada: <strong>{conversion}%</strong></span>
            <input type="range" min={1} max={40} step={1} value={conversion} onChange={(e) => setConversion(Number(e.target.value))} />
          </label>

          <button type="button" className="reset-button" onClick={reset}>REINICIAR ESCENARIO</button>
        </article>

        <div className="simulator-results">
          <div className="result-card">
            <span>Experiencia</span>
            <strong>{labelFor(selectedExperience)}</strong>
            <small>Tarifa actual: {COP(price)}</small>
          </div>
          <div className="result-card">
            <span>Público objetivo</span>
            <strong>{targetProfile?.name || '—'}</strong>
            <small>{Math.round((targetProfile?.affinity || 0) * 100)}% consumió esta experiencia</small>
          </div>
          <div className="result-card highlight">
            <span>Ingreso potencial</span>
            <strong>{compact(scenarioRevenue)}</strong>
            <small>{estimatedReservations.toLocaleString('es-CO')} reservas estimadas</small>
          </div>
        </div>

        <article className="simulation-chart-card trend">
          <div className="simulation-card-header">
            <div><h2>Ingreso potencial por público</h2></div>
          </div>
          <div className="view-chart"><ReactECharts option={trendOption} style={{ height: '100%', width: '100%' }} /></div>
        </article>

        <article className="simulation-chart-card affinity">
          <div className="simulation-card-header">
            <div><h2>Afinidad con {labelFor(selectedExperience)}</h2></div>
            <div className="affinity-options" role="group" aria-label="Forma de medir la afinidad">
              <button type="button" className={affinityMetric === 'rate' ? 'active' : ''} onClick={() => setAffinityMetric('rate')}>% público</button>
              <button type="button" className={affinityMetric === 'clients' ? 'active' : ''} onClick={() => setAffinityMetric('clients')}>Clientes</button>
            </div>
          </div>
          <div className="view-chart"><ReactECharts option={affinityOption} style={{ height: '100%', width: '100%' }} /></div>
          <div className="affinity-highlight">
            <strong>Mayor afinidad:</strong> {bestExperienceProfile?.name} · {Math.round((bestExperienceProfile?.affinity || 0) * 100)}%
          </div>
        </article>
      </div>
      <section className="insight-banner">
        <div className="insight-content">
          <span>Lectura del escenario</span>
          <h2>{labelFor(selectedExperience)} para {targetProfile?.name || 'el público seleccionado'} proyecta {compact(scenarioRevenue)} con una conversión del {conversion}%.</h2>
        </div>
        <div className="insight-stats">
          <div><small>Ingreso potencial</small><strong>{compact(scenarioRevenue)}</strong><span>{estimatedReservations.toLocaleString('es-CO')} reservas</span></div>
          <div><small>Mayor afinidad</small><strong>{bestExperienceProfile?.name || '—'}</strong><span>{Math.round((bestExperienceProfile?.affinity || 0) * 100)}%</span></div>
          <div><small>Tarifa simulada</small><strong>{COP(price)}</strong><span>Conversión {conversion}%</span></div>
        </div>
      </section>
    </main>
  );
}

export default Simulator;
