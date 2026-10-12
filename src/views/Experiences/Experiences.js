import ReactECharts from 'echarts-for-react';
import '../../styles/view-shell.css';
import './Experiences.css';
import { experienceRanking, experienceBySegment, experiencesKPIs, CUSTOMER_TYPES } from '../../data/dashboardData';

const COP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
const compact = (n) => (n >= 1000000 ? `$${(n / 1000000).toFixed(1)} M` : `$${Math.round(n / 1000)} mil`);

const EXPERIENCE_LABELS = {
  vivemanaure: 'Tour Manaure',
  senderismo: 'Senderismo',
  rio: 'Paseo al río',
  gastronomica: 'Gastronomía',
  aves: 'Vista aves'
};

const labelFor = (experience) => EXPERIENCE_LABELS[experience.id] || experience.name;

function Experiences() {
  const revenueRanking = [...experienceRanking].sort((a, b) => b.ingresos - a.ingresos).slice(0, 5);
  const topConsumptionList = [...experienceRanking].slice(0, 5);
  const topRevenue = revenueRanking[0];
  const topConsumption = experienceRanking[0];
  const segmentTop = topConsumptionList.map((e) => experienceBySegment.find((s) => s.id === e.id)).filter(Boolean);

  const consumptionOption = {
    tooltip: {
      trigger: 'item',
      formatter: (p) => `<strong>${p.name}</strong><br/>${p.value.toLocaleString('es-CO')} consumos · ${p.percent}%`
    },
    legend: {
      orient: 'vertical', right: 8, top: 'middle',
      textStyle: { fontSize: 10, color: '#53635a' }
    },
    series: [{
      type: 'pie',
      radius: ['52%', '76%'],
      center: ['38%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderColor: '#fff', borderWidth: 3 },
      label: { show: true, formatter: '{b}\n{d}%', fontSize: 10 },
      data: topConsumptionList.map((e, i) => ({
        name: labelFor(e), value: e.consumo,
        itemStyle: {
          color: [
            { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{offset: 0, color: '#063B25'}, {offset: 1, color: '#218C5A'}] },
            { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{offset: 0, color: '#D9A441'}, {offset: 1, color: '#F2C66D'}] },
            { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{offset: 0, color: '#6FAF8F'}, {offset: 1, color: '#A8CDB8'}] },
            { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{offset: 0, color: '#286477'}, {offset: 1, color: '#3E9CB5'}] },
            { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{offset: 0, color: '#507A73'}, {offset: 1, color: '#8DB8A7'}] }
          ][i]
        }
      }))
    }]
  };

  const revenueOption = {
    grid: { left: 125, right: 55, top: 6, bottom: 32 },
    tooltip: { trigger: 'axis', valueFormatter: (v) => COP(v) },
    xAxis: {
      type: 'value',
      min: 0,
      max: 400000000,
      interval: 100000000,
      axisLabel: {
        formatter: (v) => compact(v),
        fontSize: 9,
        margin: 9,
        hideOverlap: true
      }
    },
    yAxis: { type: 'category', data: revenueRanking.map((e) => labelFor(e)).reverse(), axisLabel: { fontSize: 11 } },
    series: [{
      type: 'bar', data: revenueRanking.map((e) => e.ingresos).reverse(), barMaxWidth: 22,
      itemStyle: { color: {
        type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
        colorStops: [{ offset: 0, color: '#0B5D3B' }, { offset: 1, color: '#A8CDB8' }]
      }, borderRadius: [0, 6, 6, 0] }, label: { show: true, position: 'right', formatter: (p) => compact(p.value), fontSize: 10.5 }
    }]
  };

  const topSegment = CUSTOMER_TYPES.map((ct) => ({
    ct,
    ...experienceBySegment.reduce((best, e) => (e[ct.id] > best.value ? { name: e.name, value: e[ct.id] } : best), { name: '', value: 0 })
  }));

  const segmentOption = {
    grid: { left: 150, right: 25, top: 32, bottom: 20 },
    legend: { top: 0, data: CUSTOMER_TYPES.map((c) => c.name), textStyle: { fontSize: 9.5 }, itemWidth: 9, itemHeight: 9 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    yAxis: { type: 'category', data: segmentTop.map((e) => labelFor(experienceRanking.find((x) => x.name === e.name) || { name: e.name })), axisLabel: { fontSize: 11 } },
    series: CUSTOMER_TYPES.map((ct, index) => ({
      name: ct.name, type: 'bar', stack: 'seg', data: segmentTop.map((e) => e[ct.id]),
      itemStyle: { color: [
        { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#063B25' }, { offset: 1, color: '#6da486' }] },
        { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#D9A441' }, { offset: 1, color: '#F2C66D' }] },
        { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#286477' }, { offset: 1, color: '#3E9CB5' }] },
        { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#507A73' }, { offset: 1, color: '#8DB8A7' }] }
      ][index] }
    }))
  };

  return (
    <main className="view">
      <header className="view-header">
        <div>
          <span className="view-tag">Experiencias</span>
          <h1>¿Qué experiencias <em>mueven el convenio?</em></h1>
        </div>
      </header>

      <div className="view-kpis">
        <article className="kpi">
          <span>Más consumida</span>
          <strong>{labelFor(topConsumption)}</strong>
          <small>{topConsumption.consumo.toLocaleString('es-CO')} consumos</small>
        </article>
        <article className="kpi">
          <span>Mayor ingreso</span>
          <strong>{labelFor(topRevenue)}</strong>
          <small>{compact(topRevenue.ingresos)}</small>
        </article>
        <article className="kpi featured">
          <span>Ingreso total</span>
          <strong>{compact(experiencesKPIs.totalRevenue)}</strong>
          <small>Experiencias del convenio</small>
        </article>
        <article className="kpi">
          <span>Precio promedio</span>
          <strong>{COP(experiencesKPIs.avgPrice)}</strong>
          <small>Tarifa promedio</small>
        </article>
      </div>

      <div className="view-grid experiences-grid">
        <article className="view-card">
          <div className="view-card-head"><div><span>Demanda · top 5</span><h2>¿Qué consume más la gente?</h2></div></div>
          <div className="view-chart"><ReactECharts option={consumptionOption} style={{ height: '100%', width: '100%' }} /></div>
        </article>

        <article className="view-card">
          <div className="view-card-head"><div><span>Ingreso · top 5</span><h2>¿Qué experiencia genera más dinero?</h2></div></div>
          <div className="view-chart"><ReactECharts option={revenueOption} style={{ height: '100%', width: '100%' }} /></div>
        </article>

        <article className="view-card wide">
          <div className="view-card-head"><div><span>Afinidad · top 5 experiencias</span><h2>¿Qué experiencia encaja con cada tipo de cliente?</h2></div></div>
          <div className="view-chart"><ReactECharts option={segmentOption} style={{ height: '100%', width: '100%' }} /></div>
        </article>
      </div>
      <section className="insight-banner">
        <div className="insight-content">
          <span>Lectura de experiencias</span>
          <h2>{labelFor(topConsumption)} lidera el consumo, mientras {labelFor(topRevenue)} concentra el mayor ingreso.</h2>
        </div>
        <div className="insight-stats">
          <div><small>Mayor consumo</small><strong>{labelFor(topConsumption)}</strong><span>{topConsumption.consumo.toLocaleString('es-CO')} consumos</span></div>
          <div><small>Mayor ingreso</small><strong>{labelFor(topRevenue)}</strong><span>{compact(topRevenue.ingresos)}</span></div>
          <div><small>Ingreso total</small><strong>{compact(experiencesKPIs.totalRevenue)}</strong><span>5 experiencias</span></div>
        </div>
      </section>
    </main>
  );
}

export default Experiences;
