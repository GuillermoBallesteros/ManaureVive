import ReactECharts from 'echarts-for-react';
import './Gastronomy.css';
import { dishRanking, dishBySegment, monthlyGastronomy, gastronomyKPIs, CUSTOMER_TYPES } from '../../data/dashboardData';

const COP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
const compact = (n) => (n >= 1000000 ? `$${(n / 1000000).toFixed(1)} M` : `$${Math.round(n / 1000)} mil`);

function Gastronomy() {
  const top = [...dishRanking].sort((a, b) => b.ingresos - a.ingresos);
  const topQuantity = [...dishRanking].sort((a, b) => b.vendidos - a.vendidos)[0];
  const bestRevenue = top[0];
  const maxMonth = [...monthlyGastronomy].sort((a, b) => b.ingresos - a.ingresos)[0];

  const rankingOption = {
    grid: { left: 155, right: 55, top: 12, bottom: 20 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v) => COP(v) },
    xAxis: { type: 'value', axisLabel: { formatter: (v) => compact(v) }, splitLine: { lineStyle: { color: '#e7eee9' } } },
    yAxis: { type: 'category', data: top.slice().reverse().map((d) => d.name), axisLine: { show: false }, axisTick: { show: false } },
    series: [{
      name: 'Ingresos', type: 'bar', data: top.slice().reverse().map((d) => d.ingresos), barWidth: 18,
      itemStyle: { color: '#286b45', borderRadius: [0, 7, 7, 0] },
      label: { show: true, position: 'right', formatter: (p) => compact(p.value), color: '#294235', fontSize: 11 }
    }]
  };

  const segmentOption = {
    grid: { left: 125, right: 30, top: 28, bottom: 25 },
    legend: { top: 0, textStyle: { color: '#53635a', fontSize: 11 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'value', splitLine: { lineStyle: { color: '#e7eee9' } } },
    yAxis: { type: 'category', data: dishBySegment.map((d) => d.name), axisLine: { show: false }, axisTick: { show: false } },
    series: CUSTOMER_TYPES.map((ct, i) => ({
      name: ct.name, type: 'bar', stack: 'consumo', barMaxWidth: 25,
      data: dishBySegment.map((d) => d[ct.id]),
      itemStyle: { color: ['#173b29', '#286b45', '#4f8668', '#719b83', '#a9c4b3'][i] }
    }))
  };

  const evolutionOption = {
    grid: { left: 55, right: 25, top: 25, bottom: 35 },
    tooltip: { trigger: 'axis', valueFormatter: (v) => COP(v) },
    xAxis: { type: 'category', data: monthlyGastronomy.map((m) => m.month) },
    yAxis: { type: 'value', axisLabel: { formatter: (v) => compact(v) }, splitLine: { lineStyle: { color: '#e7eee9' } } },
    series: [{
      name: 'Ingresos gastronómicos', type: 'line', data: monthlyGastronomy.map((m) => m.ingresos), smooth: 0.28,
      symbol: 'circle', symbolSize: 7, lineStyle: { width: 3, color: '#4f8668' },
      itemStyle: { color: '#286b45' }, areaStyle: { color: 'rgba(79,134,104,.12)' }
    }]
  };

  return (
    <section className="gastronomy-view">
      <header className="gastronomy-header">
        <span className="gastronomy-tag">04 · GASTRONOMÍA</span>
        <h1>¿Qué está comiendo la gente y cuánto representa para el negocio?</h1>
        <p>El restaurante funciona por consumo: aquí vemos qué vende, quién consume y cuándo aporta más ingresos.</p>
      </header>

      <div className="gastronomy-kpis">
        <article className="gastronomy-kpi featured"><span>PLATO MÁS VENDIDO</span><strong>{gastronomyKPIs.topDish}</strong><small>{topQuantity?.vendidos?.toLocaleString('es-CO')} unidades</small></article>
        <article className="gastronomy-kpi"><span>PLATOS VENDIDOS</span><strong>{gastronomyKPIs.totalDishesSold.toLocaleString('es-CO')}</strong><small>unidades en el período</small></article>
        <article className="gastronomy-kpi"><span>INGRESO GASTRONÓMICO</span><strong>{compact(gastronomyKPIs.gastronomyRevenue)}</strong><small>ventas de restaurante</small></article>
        <article className="gastronomy-kpi"><span>TICKET PROMEDIO</span><strong>{COP(gastronomyKPIs.avgTicket)}</strong><small>por visita con consumo</small></article>
      </div>

      <div className="gastronomy-grid">
        <article className="gastronomy-card large-card">
          <h2>Ingreso por plato</h2>
          <span className="gastronomy-question">¿Qué platos están aportando más dinero al restaurante?</span>
          <ReactECharts option={rankingOption} style={{ height: 360 }} />
        </article>

        <article className="gastronomy-card">
          <h2>Consumo por segmento</h2>
          <span className="gastronomy-question">¿Qué públicos sostienen el consumo gastronómico?</span>
          <ReactECharts option={segmentOption} style={{ height: 360 }} />
        </article>

        <article className="gastronomy-card">
          <h2>Evolución mensual</h2>
          <span className="gastronomy-question">¿En qué momentos el restaurante genera más ingresos?</span>
          <ReactECharts option={evolutionOption} style={{ height: 340 }} />
        </article>

        <article className="gastronomy-business-card">
          <span>LECTURA DE NEGOCIO</span>
          <h2>{bestRevenue.name} lidera el aporte económico.</h2>
          <p>
            El plato con mayor ingreso es <strong>{bestRevenue.name}</strong>, mientras que <strong>{topQuantity.name}</strong> lidera en volumen.
            Esta diferencia permite separar dos decisiones: mantener los productos de alta rotación y, al mismo tiempo, impulsar aquellos que aportan más valor por venta.
          </p>
          <div className="business-mini-grid">
            <div><small>MEJOR INGRESO</small><strong>{compact(bestRevenue.ingresos)}</strong></div>
            <div><small>MEJOR VOLUMEN</small><strong>{topQuantity.vendidos.toLocaleString('es-CO')}</strong></div>
            <div><small>MES MÁS FUERTE</small><strong>{maxMonth.month}</strong></div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default Gastronomy;
