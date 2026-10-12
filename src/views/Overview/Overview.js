import ReactECharts from 'echarts-for-react';
import '../../styles/view-shell.css';
import './Overview.css';
import { MONTHS, generalKPIs, consortiumMonthlyRevenue, top5Partners } from '../../data/dashboardData';

const COP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
const compact = (n) => (n >= 1000000 ? `$${(n / 1000000).toFixed(1)} M` : `$${Math.round(n / 1000)} mil`);

function Overview() {
  const { totalIncome, lastMonthIncome, lastMonthName, bestMonth, weakestMonth, topPartner } = generalKPIs;

  const trend = {
    grid: { left: 55, right: 20, top: 18, bottom: 28 },
    tooltip: { trigger: 'axis', valueFormatter: (v) => COP(v) },
    xAxis: { type: 'category', data: MONTHS, axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { formatter: (v) => `${Math.round(v / 1000000)} M`, fontSize: 10 }, splitLine: { lineStyle: { color: '#eef1ee' } } },
    series: [{
      type: 'line', data: consortiumMonthlyRevenue.map((m) => m.ingresos), smooth: 0.28,
      symbol: 'circle', symbolSize: 6, lineStyle: { width: 3, color: '#0B5D3B' },
      itemStyle: { color: '#218C5A' },
      areaStyle: { color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [{ offset: 0, color: 'rgba(11,93,59,.22)' }, { offset: 1, color: 'rgba(11,93,59,.01)' }]
      }}
    }]
  };

  const partners = {
    grid: { left: 125, right: 55, top: 6, bottom: 32 },
    tooltip: { trigger: 'axis', valueFormatter: (v) => COP(v) },
    xAxis: {
      type: 'value',
      min: 0,
      max: 500000000,
      interval: 200000000,
      axisLabel: {
        formatter: (v) => `${Math.round(v / 1000000)} M`,
        fontSize: 9,
        margin: 9,
        hideOverlap: true
      },
      splitLine: { lineStyle: { color: '#eef1ee' } }
    },
    yAxis: { type: 'category', data: top5Partners.map((x) => x.name).reverse(), axisLabel: { fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
    series: [{
      type: 'bar', data: top5Partners.map((x) => x.annualRevenue).reverse(),
      barMaxWidth: 22, itemStyle: { color: {
        type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
        colorStops: [{ offset: 0, color: '#0B5D3B' }, { offset: 1, color: '#8ab49a' }]
      }, borderRadius: [0, 6, 6, 0] },
      label: { show: true, position: 'right', fontSize: 10, color: '#294235', formatter: (p) => `${Math.round(p.value / 1000000)} M` }
    }]
  };

  return (
    <main className="view">
      <header className="view-header">
        <div>
          <span className="view-tag">General</span>
          <h1>¿Cómo va el convenio <em>Manaure Vive?</em></h1>
        </div>
      </header>

      <div className="view-kpis">
        <article className="kpi featured">
          <span>Ingreso total 2025</span>
          <strong>{compact(totalIncome)}</strong>
          <small>Suma de los 10 socios</small>
        </article>
        <article className="kpi">
          <span>Ingreso {lastMonthName}</span>
          <strong>{compact(lastMonthIncome)}</strong>
          <small>Último mes registrado</small>
        </article>
        <article className="kpi">
          <span>Mejor mes del año</span>
          <strong>{bestMonth.month}</strong>
          <small>{COP(bestMonth.ingresos)}</small>
        </article>
        <article className="kpi">
          <span>Socio top del año</span>
          <strong>{topPartner.name}</strong>
          <small>{COP(topPartner.annualRevenue)}</small>
        </article>
      </div>

      <div className="view-grid overview-grid">
        <article className="view-card">
          <div className="view-card-head">
            <div>
              <span>Ingreso mensual del convenio</span>
              <h2>Evolución 2025</h2>
            </div>
          </div>
          <div className="view-chart">
            <ReactECharts option={trend} style={{ height: '100%', width: '100%' }} />
          </div>
        </article>

        <article className="view-card">
          <div className="view-card-head">
            <div>
              <span>Top 5 socios · ingreso anual</span>
              <h2>¿Quién genera más ingresos?</h2>
            </div>
          </div>
          <div className="view-chart">
            <ReactECharts option={partners} style={{ height: '100%', width: '100%' }} />
          </div>
        </article>
      </div>
      <section className="insight-banner">
        <div className="insight-content">
          <span>Lectura general</span>
          <h2>{bestMonth.month} concentra el mayor ingreso del convenio; {weakestMonth.month} marca el punto más bajo.</h2>
        </div>
        <div className="insight-stats">
          <div><small>Mes más fuerte</small><strong>{bestMonth.month}</strong><span>{COP(bestMonth.ingresos)}</span></div>
          <div><small>Mes más débil</small><strong>{weakestMonth.month}</strong><span>{COP(weakestMonth.ingresos)}</span></div>
          <div><small>Socio principal</small><strong>{topPartner.name}</strong><span>{COP(topPartner.annualRevenue)}</span></div>
        </div>
      </section>
    </main>
  );
}

export default Overview;
