import ReactECharts from 'echarts-for-react';
import '../../styles/view-shell.css';
import './Behavior.css';
import { newVsRecurringMonthly, customerTypeDistribution, customerTypeByDayType, CUSTOMER_TYPES, recurringEvolution } from '../../data/dashboardData';

function Behavior() {
  const totalNuevos = newVsRecurringMonthly.reduce((s, m) => s + m.nuevos, 0);
  const totalRecurrentes = newVsRecurringMonthly.reduce((s, m) => s + m.recurrentes, 0);
  const tasa = ((totalRecurrentes / (totalNuevos + totalRecurrentes)) * 100).toFixed(1);
  const recurrentByMonth = recurringEvolution.map((x) => ({ month: x.month, value: x.tasaRecurrencia }));
  const best = [...recurrentByMonth].sort((a, b) => b.value - a.value)[0];
  const worst = [...recurrentByMonth].sort((a, b) => a.value - b.value)[0];
  const topType = customerTypeDistribution[0]?.name || 'Familias';
  const topDayType = [...customerTypeByDayType]
    .map((d) => ({ dayType: d.dayType, total: CUSTOMER_TYPES.reduce((s, ct) => s + (d[ct.id] || 0), 0) }))
    .sort((a, b) => b.total - a.total)[0];

  const stacked = {
    grid: { left: 45, right: 15, top: 30, bottom: 24 },
    legend: { top: 0, data: ['Nuevos', 'Recurrentes'], textStyle: { fontSize: 10.5 }, itemWidth: 10, itemHeight: 10 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: newVsRecurringMonthly.map((m) => m.month), axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 }, splitLine: { lineStyle: { color: '#eef1ee' } } },
    series: [
      {
        name: 'Nuevos', type: 'bar', stack: 'total',
        data: newVsRecurringMonthly.map((m) => m.nuevos),
        itemStyle: { color: {
          type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [{ offset: 0, color: '#D9A441' }, { offset: 1, color: '#F2C66D' }]
        } }
      },
      {
        name: 'Recurrentes', type: 'bar', stack: 'total',
        data: newVsRecurringMonthly.map((m) => m.recurrentes),
        itemStyle: { color: {
          type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [{ offset: 0, color: '#0B5D3B' }, { offset: 1, color: '#A8CDB8' }]
        } }
      }
    ]
  };

  const type = {
    tooltip: { trigger: 'item', formatter: '{b}<br/>{c} visitas · {d}%' },
    legend: { bottom: 0, textStyle: { fontSize: 9.5 }, itemWidth: 9, itemHeight: 9 },
    series: [{
      type: 'pie',
      radius: ['48%', '72%'],
      center: ['50%', '46%'],
      label: { formatter: '{b}\n{d}%', fontSize: 10 },
      itemStyle: { borderColor: '#fff', borderWidth: 3 },
      data: customerTypeDistribution.map((x, i) => ({
        name: x.name, value: x.value,
        itemStyle: [
          { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{offset: 0, color: '#063B25'}, {offset: 1, color: '#218C5A'}] },
          { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{offset: 0, color: '#D9A441'}, {offset: 1, color: '#F2C66D'}] },
          { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{offset: 0, color: '#286477'}, {offset: 1, color: '#3E9CB5'}] },
          { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{offset: 0, color: '#507A73'}, {offset: 1, color: '#8DB8A7'}] }
        ][i]
      }))
    }]
  };

  const day = {
    tooltip: { trigger: 'item', formatter: (p) => `${p.name}<br/>${p.value.toLocaleString('es-CO')} visitas · ${p.percent}%` },
    legend: { bottom: 0, textStyle: { fontSize: 9.5 }, itemWidth: 9, itemHeight: 9 },
    series: [{
      type: 'pie',
      radius: ['50%', '74%'],
      center: ['50%', '45%'],
      label: { formatter: '{b}\n{d}%', fontSize: 10 },
      itemStyle: { borderColor: '#fff', borderWidth: 3 },
      data: customerTypeByDayType.map((d, i) => ({
        name: d.dayType,
        value: CUSTOMER_TYPES.reduce((s, ct) => s + (d[ct.id] || 0), 0),
        itemStyle: [
          { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{offset: 0, color: '#0B5D3B'}, {offset: 1, color: '#8ab49a'}] },
          { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{offset: 0, color: '#D9A441'}, {offset: 1, color: '#F2C66D'}] },
          { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{offset: 0, color: '#286477'}, {offset: 1, color: '#3E9CB5'}] }
        ][i]
      }))
    }]
  };

  const recurrence = {
    grid: { left: 42, right: 15, top: 12, bottom: 24 },
    tooltip: { trigger: 'axis', valueFormatter: (v) => `${v}%` },
    xAxis: { type: 'category', data: recurrentByMonth.map((x) => x.month), axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%', fontSize: 10 }, splitLine: { lineStyle: { color: '#eef1ee' } } },
    series: [{
      type: 'line', data: recurrentByMonth.map((x) => x.value), smooth: 0.3,
      symbol: 'circle', symbolSize: 6, lineStyle: { width: 3, color: '#0B5D3B' },
      itemStyle: { color: '#218C5A' },
      areaStyle: { color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [{ offset: 0, color: 'rgba(11,93,59,.20)' }, { offset: 1, color: 'rgba(11,93,59,.01)' }]
      }}
    }]
  };

  return (
    <main className="view">
      <header className="view-header">
        <div>
          <span className="view-tag">Comportamiento</span>
          <h1>¿Cómo se comportan <em>nuestros clientes?</em></h1>
        </div>
      </header>

      <div className="view-kpis">
        <article className="kpi">
          <span>Clientes nuevos</span>
          <strong>{totalNuevos.toLocaleString('es-CO')}</strong>
          <small>Primera reserva en 2025</small>
        </article>
        <article className="kpi">
          <span>Visitas recurrentes</span>
          <strong>{totalRecurrentes.toLocaleString('es-CO')}</strong>
          <small>Visitas posteriores</small>
        </article>
        <article className="kpi featured">
          <span>Recurrencia</span>
          <strong>{tasa}%</strong>
          <small>Sobre el total de visitas</small>
        </article>
        <article className="kpi">
          <span>Segmento principal</span>
          <strong>{topType}</strong>
          <small>Mayor volumen de demanda</small>
        </article>
      </div>

      <div className="view-grid behavior-grid">
        <article className="view-card">
          <div className="view-card-head">
            <div><span>Captación · fidelización</span><h2>Nuevos vs. recurrentes</h2></div>
          </div>
          <div className="view-chart"><ReactECharts option={stacked} style={{ height: '100%', width: '100%' }} /></div>
        </article>

        <article className="view-card">
          <div className="view-card-head">
            <div><span>Perfil de cliente</span><h2>¿Quién representa la mayor demanda?</h2></div>
          </div>
          <div className="view-chart"><ReactECharts option={type} style={{ height: '100%', width: '100%' }} /></div>
        </article>

        <article className="view-card">
          <div className="view-card-head">
            <div><span>Día de operación</span><h2>¿Qué tipo de día mueve cada segmento?</h2></div>
          </div>
          <div className="view-chart"><ReactECharts option={day} style={{ height: '100%', width: '100%' }} /></div>
        </article>

        <article className="view-card">
          <div className="view-card-head">
            <div><span>Recurrencia mensual</span><h2>¿En qué meses regresan más?</h2></div>
          </div>
          <div className="view-chart"><ReactECharts option={recurrence} style={{ height: '100%', width: '100%' }} /></div>
        </article>
      </div>
      <section className="insight-banner">
        <div className="insight-content">
          <span>Lectura de clientes</span>
          <h2>{topType} concentra la mayor demanda y la recurrencia llega al {tasa}% del total de visitas.</h2>
        </div>
        <div className="insight-stats">
          <div><small>Segmento principal</small><strong>{topType}</strong><span>Mayor volumen</span></div>
          <div><small>Mejor recurrencia</small><strong>{best.month}</strong><span>{best.value}%</span></div>
          <div><small>Día de mayor actividad</small><strong>{topDayType?.dayType || '—'}</strong><span>{(topDayType?.total || 0).toLocaleString('es-CO')} visitas</span></div>
        </div>
      </section>
    </main>
  );
}

export default Behavior;
