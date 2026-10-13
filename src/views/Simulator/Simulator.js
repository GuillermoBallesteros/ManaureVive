import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import '../../styles/view-shell.css';
import './Simulator.css';
import { EXPERIENCES, CUSTOMER_TYPES, RESERVATIONS, MONTHS } from '../../data/dashboardData';

const COP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Math.round(n || 0));
const compact = (n) => n >= 1000000 ? `$${(n / 1000000).toFixed(2)} M` : COP(n);
const nameFor = (e) => e?.name || 'Experiencia';

function Simulator() {
  const [experienceId, setExperienceId] = useState(EXPERIENCES[0].id);
  const [segmentId, setSegmentId] = useState(CUSTOMER_TYPES[0].id);
  const [price, setPrice] = useState(EXPERIENCES[0].price);
  const [uplift, setUplift] = useState(10);
  const [semester, setSemester] = useState(0);

  const experience = EXPERIENCES.find((e) => e.id === experienceId) || EXPERIENCES[0];
  const segment = CUSTOMER_TYPES.find((c) => c.id === segmentId) || CUSTOMER_TYPES[0];

  const historicalMonthly = useMemo(() => MONTHS.map((month, index) => {
    const monthNumber = index + 1;
    const matching = RESERVATIONS.filter((r) => r.month === monthNumber && r.customerType === segmentId && r.experiences.includes(experienceId));
    return {
      month,
      units: matching.length,
      clients: new Set(matching.map((r) => r.clientId)).size,
      revenue: matching.length * experience.price
    };
  }), [segmentId, experienceId, experience.price]);

  const projection = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const monthIndex = semester * 6 + i;
    const historical = historicalMonthly[monthIndex];
    const baseUnits = historical.units;
    const scenarioUnits = Math.round(baseUnits * (1 + uplift / 100));
    return {
      month: MONTHS[monthIndex],
      baseUnits,
      scenarioUnits,
      baseRevenue: baseUnits * experience.price,
      scenarioRevenue: scenarioUnits * price
    };
  }), [semester, historicalMonthly, uplift, experience.price, price]);

  const baseUnits = projection.reduce((sum, m) => sum + m.baseUnits, 0);
  const scenarioUnits = projection.reduce((sum, m) => sum + m.scenarioUnits, 0);
  const baseRevenue = projection.reduce((sum, m) => sum + m.baseRevenue, 0);
  const scenarioRevenue = projection.reduce((sum, m) => sum + m.scenarioRevenue, 0);
  const difference = scenarioRevenue - baseRevenue;
  const deltaPercent = baseRevenue ? (difference / baseRevenue) * 100 : 0;
  const totalHistoricalUnits = historicalMonthly.reduce((sum, m) => sum + m.units, 0);
  const totalSegmentUnits = RESERVATIONS.filter((r) => r.customerType === segmentId).length;
  const affinity = totalSegmentUnits ? totalHistoricalUnits / totalSegmentUnits : 0;

  const trendOption = {
    grid: { left: 72, right: 24, top: 42, bottom: 42, containLabel: true },
    legend: { top: 0, textStyle: { fontSize: 10 }, data: ['Base histórica', 'Escenario propuesto'] },
    tooltip: { trigger: 'axis', valueFormatter: (v) => COP(v) },
    xAxis: { type: 'category', boundaryGap: true, data: projection.map((m) => m.month), axisLabel: { fontSize: 11, interval: 0, margin: 12 } },
    yAxis: { type: 'value', axisLabel: { formatter: (v) => compact(v), fontSize: 9 }, splitLine: { lineStyle: { color: '#edf1ed' } } },
    series: [
      { name: 'Base histórica', type: 'bar', data: projection.map((m) => m.baseRevenue), itemStyle: { color: '#a8cdb8', borderRadius: [5,5,0,0] }, barMaxWidth: 28 },
      { name: 'Escenario propuesto', type: 'bar', data: projection.map((m) => m.scenarioRevenue), itemStyle: { color: '#0b5d3b', borderRadius: [5,5,0,0] }, barMaxWidth: 28 }
    ]
  };

  const reset = () => {
    setExperienceId(EXPERIENCES[0].id);
    setSegmentId(CUSTOMER_TYPES[0].id);
    setPrice(EXPERIENCES[0].price);
    setUplift(10);
    setSemester(0);
  };

  const changeExperience = (id) => {
    const next = EXPERIENCES.find((e) => e.id === id) || EXPERIENCES[0];
    setExperienceId(id);
    setPrice(next.price);
  };

  return (
    <main className="view simulator-view">
      <header className="view-header">
        <div>
          
          <h1>Evalúa escenarios con <em>la misma base de reservas</em></h1>
          
        </div>
      </header>

      <div className="view-grid simulator-grid">
        <article className="view-card simulator-config">
          <div className="config-header"><h2>Parámetros del escenario</h2><span>PERIODO 2025</span></div>
          <label className="config-field"><span>Experiencia</span>
            <select value={experienceId} onChange={(e) => changeExperience(e.target.value)}>
              {EXPERIENCES.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </label>
          <label className="config-field"><span>Segmento de clientes</span>
            <select value={segmentId} onChange={(e) => setSegmentId(e.target.value)}>
              {CUSTOMER_TYPES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="config-field"><span>Semestre de análisis</span>
            <select value={semester} onChange={(e) => setSemester(Number(e.target.value))}>
              <option value={0}>Primer semestre · Ene–Jun</option>
              <option value={1}>Segundo semestre · Jul–Dic</option>
            </select>
          </label>
          <label className="config-field"><span>Tarifa propuesta: <strong>{COP(price)}</strong></span>
            <input type="range" min={Math.round(experience.price * 0.6 / 1000) * 1000} max={Math.round(experience.price * 1.6 / 1000) * 1000} step={1000} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            <small>Tarifa base del catálogo: {COP(experience.price)}</small>
          </label>
          <label className="config-field"><span>Variación hipotética de demanda: <strong>{uplift > 0 ? '+' : ''}{uplift}%</strong></span>
            <input type="range" min={-30} max={50} step={5} value={uplift} onChange={(e) => setUplift(Number(e.target.value))} />
            
          </label>
          <button type="button" className="reset-button" onClick={reset}>RESTABLECER ESCENARIO</button>
        </article>

        <section className="simulator-main">
          <div className="simulator-results">
            <article className="result-card"><span>Ingreso base</span><strong>{compact(baseRevenue)}</strong><small>Tarifa del catálogo × reservas históricas</small></article>
            <article className="result-card highlight"><span>Ingreso propuesto</span><strong>{compact(scenarioRevenue)}</strong><small>{scenarioUnits.toLocaleString('es-CO')} consumos estimados</small></article>
            <article className="result-card"><span>Diferencia bruta</span><strong>{difference >= 0 ? '+' : '−'}{compact(Math.abs(difference))}</strong><small>{deltaPercent >= 0 ? '+' : ''}{deltaPercent.toFixed(1)}% frente a la base</small></article>
          </div>
          <article className="simulation-chart-card trend">
            <div className="simulation-card-header"><div><h2>Ingreso por mes: base vs. escenario</h2><span>{experience.name} · {segment.name}</span></div></div>
            <div className="view-chart"><ReactECharts option={trendOption} style={{ height: '100%', width: '100%' }} /></div>
          </article>
          <div className="simulator-detail-grid">
            <article className="view-card simulator-detail"><span>Consumos en la base</span><strong>{baseUnits.toLocaleString('es-CO')}</strong><small>Registros históricos del semestre</small></article>
            <article className="view-card simulator-detail"><span>Consumos del escenario</span><strong>{scenarioUnits.toLocaleString('es-CO')}</strong><small>Con la variación de demanda configurada</small></article>
            <article className="view-card simulator-detail"><span>Afinidad histórica</span><strong>{(affinity * 100).toFixed(1)}%</strong><small>Participación de consumos de esta experiencia dentro del segmento seleccionado</small></article>
          </div>
        </section>
      </div>
      <section className="insight-banner">
        <div className="insight-content"><span>Resultado del semestre</span><h2>{difference >= 0 ? 'El escenario aumenta' : 'El escenario reduce'} el ingreso bruto calculado en {compact(Math.abs(difference))} durante el semestre seleccionado.</h2></div>
        <div className="insight-stats"><div><small>Periodo</small><strong>{semester === 0 ? 'Ene–Jun' : 'Jul–Dic'}</strong><span>Patrón mensual 2025</span></div><div><small>Tarifa propuesta</small><strong>{COP(price)}</strong><span>Base: {COP(experience.price)}</span></div><div><small>Variación demanda</small><strong>{uplift > 0 ? '+' : ''}{uplift}%</strong><span>Variación aplicada</span></div></div>
      </section>
    </main>
  );
}
export default Simulator;
