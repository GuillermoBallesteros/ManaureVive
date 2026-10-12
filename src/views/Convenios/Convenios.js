import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import '../../styles/view-shell.css';
import './Convenios.css';
import { MONTHS, PARTNERS_DATA } from '../../data/dashboardData';

const COP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Math.round(n || 0));
const compact = (n) => (n >= 1000000 ? `$${(n / 1000000).toFixed(1)} M` : `$${Math.round((n || 0) / 1000)} mil`);

const RANGES = [
  { id: 'anio', label: 'Todo el año', months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  { id: 't1', label: 'Trimestre 1 (Ene-Mar)', months: [0, 1, 2] },
  { id: 't2', label: 'Trimestre 2 (Abr-Jun)', months: [3, 4, 5] },
  { id: 't3', label: 'Trimestre 3 (Jul-Sep)', months: [6, 7, 8] },
  { id: 't4', label: 'Trimestre 4 (Oct-Dic)', months: [9, 10, 11] }
];

function Convenios() {
  const sortedByRank = useMemo(() => [...PARTNERS_DATA].sort((a, b) => a.rank - b.rank), []);
  const sortedAlphabetically = useMemo(() => [...PARTNERS_DATA].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })), []);
  const [partnerId, setPartnerId] = useState(sortedAlphabetically[0].id);
  const [rangeId, setRangeId] = useState('anio');

  const partner = PARTNERS_DATA.find((p) => p.id === partnerId) || PARTNERS_DATA[0];
  const range = RANGES.find((r) => r.id === rangeId) || RANGES[0];

  const rangeIncome = range.months.reduce((s, i) => s + partner.monthly[i], 0);
  const consortiumRangeIncome = range.months.reduce(
    (s, i) => s + PARTNERS_DATA.reduce((sum, p) => sum + p.monthly[i], 0), 0
  );
  const share = consortiumRangeIncome ? (rangeIncome / consortiumRangeIncome) * 100 : 0;
  const bestMonthIndex = range.months.reduce(
    (best, i) => (partner.monthly[i] > partner.monthly[best] ? i : best), range.months[0]
  );

  const trendOption = {
    grid: { left: 55, right: 20, top: 18, bottom: 28 },
    tooltip: { trigger: 'axis', valueFormatter: (v) => COP(v) },
    xAxis: { type: 'category', data: range.months.map((i) => MONTHS[i]), axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { formatter: (v) => `${Math.round(v / 1000000)} M`, fontSize: 10 }, splitLine: { lineStyle: { color: '#eef1ee' } } },
    series: [{
      type: 'line', data: range.months.map((i) => partner.monthly[i]), smooth: 0.28,
      symbol: 'circle', symbolSize: 6, lineStyle: { width: 3, color: '#0B5D3B' },
      itemStyle: { color: '#218C5A' },
      areaStyle: { color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [{ offset: 0, color: 'rgba(11,93,59,.20)' }, { offset: 1, color: 'rgba(11,93,59,.01)' }]
      }}
    }]
  };

  const rankingOption = {
    grid: { left: 155, right: 55, top: 6, bottom: 20 },
    tooltip: { trigger: 'axis', valueFormatter: (v) => COP(v) },
    xAxis: { type: 'value', axisLabel: { formatter: (v) => `${Math.round(v / 1000000)} M`, fontSize: 10 }, splitLine: { lineStyle: { color: '#eef1ee' } } },
    yAxis: { type: 'category', data: [...sortedByRank].reverse().map((p) => p.name), axisLabel: { fontSize: 10.5 }, axisLine: { show: false }, axisTick: { show: false } },
    series: [{
      type: 'bar', data: [...sortedByRank].reverse().map((p) => ({
        value: p.annualRevenue,
        itemStyle: { color: p.id === partner.id ? {
          type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [{ offset: 0, color: '#D9A441' }, { offset: 1, color: '#F2C66D' }]
        } : {
          type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [{ offset: 0, color: '#0B5D3B' }, { offset: 1, color: '#6FAF8F' }]
        }, borderRadius: [0, 6, 6, 0] }
      })),
      barMaxWidth: 20,
      label: { show: true, position: 'right', fontSize: 10, color: '#183027', formatter: (p) => `${Math.round(p.value / 1000000)} M` }
    }]
  };

  return (
    <main className="view convenios-view">
      <header className="view-header">
        <div>
          <span className="view-tag">Convenios</span>
          <h1>¿Cómo le va a <em>cada socio?</em></h1>
        </div>
      </header>

      <div className="convenios-filters">
        <label className="convenios-field">
          <span>Socio</span>
          <select value={partnerId} onChange={(e) => setPartnerId(e.target.value)}>
            {sortedAlphabetically.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
        <label className="convenios-field">
          <span>Rango de meses</span>
          <select value={rangeId} onChange={(e) => setRangeId(e.target.value)}>
            {RANGES.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="view-kpis">
        <article className="kpi featured">
          <span>Ingreso del socio</span>
          <strong>{compact(rangeIncome)}</strong>
          <small>{range.label}</small>
        </article>
        <article className="kpi">
          <span>Participación en el convenio</span>
          <strong>{share.toFixed(1)}%</strong>
          <small>Sobre el ingreso total del rango</small>
        </article>
        <article className="kpi">
          <span>Mejor mes del socio</span>
          <strong>{MONTHS[bestMonthIndex]}</strong>
          <small>{COP(partner.monthly[bestMonthIndex])}</small>
        </article>
        <article className="kpi">
          <span>Posición en el ranking</span>
          <strong>#{partner.rank} de {PARTNERS_DATA.length}</strong>
          <small>Por ingreso anual 2025</small>
        </article>
      </div>

      <div className="view-grid convenios-grid">
        <article className="view-card">
          <div className="view-card-head">
            <div><span>Evolución del socio</span><h2>{partner.name} · ingreso mensual</h2></div>
          </div>
          <div className="view-chart"><ReactECharts option={trendOption} style={{ height: '100%', width: '100%' }} /></div>
        </article>

        <article className="view-card">
          <div className="view-card-head">
            <div><span>Ranking del convenio</span><h2>¿Dónde se ubica {partner.name}?</h2></div>
          </div>
          <div className="view-chart"><ReactECharts option={rankingOption} style={{ height: '100%', width: '100%' }} /></div>
        </article>
      </div>
      <section className="insight-banner">
        <div className="insight-content">
          <span>Lectura del socio</span>
          <h2>{partner.name} representa el {share.toFixed(1)}% del ingreso del convenio en {range.label.toLowerCase()} y alcanza su mejor resultado en {MONTHS[bestMonthIndex]}.</h2>
        </div>
        <div className="insight-stats">
          <div><small>Ingreso seleccionado</small><strong>{compact(rangeIncome)}</strong><span>{range.label}</span></div>
          <div><small>Mejor mes</small><strong>{MONTHS[bestMonthIndex]}</strong><span>{COP(partner.monthly[bestMonthIndex])}</span></div>
          <div><small>Ranking anual</small><strong>#{partner.rank}</strong><span>de {PARTNERS_DATA.length} socios</span></div>
        </div>
      </section>
    </main>
  );
}

export default Convenios;
