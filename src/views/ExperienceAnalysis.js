import ReactECharts from 'echarts-for-react';
import '../styles/view-shell.css';
import './ExperienceAnalysis.css';
import { EXPERIENCES, RESERVATIONS, MONTHS, CUSTOMER_TYPES } from '../data/dashboardData';

const COP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Math.round(n || 0));
const short = (n) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)} M` : `$${Math.round(n / 1000)} mil`;

function ExperienceAnalysis() {
  const monthly = MONTHS.map((month, i) => {
    const rows = RESERVATIONS.filter((r) => r.month === i + 1);
    return { month, units: rows.reduce((s, r) => s + r.experiences.length, 0), revenue: rows.reduce((s, r) => s + r.revenue, 0) };
  });
  const combinations = {};
  RESERVATIONS.forEach((r) => {
    if (r.experiences.length > 1) {
      const key = r.experiences.slice().sort().join('|');
      combinations[key] = (combinations[key] || 0) + 1;
    }
  });
  const topCombo = Object.entries(combinations).sort((a,b) => b[1]-a[1]).slice(0,6).map(([key,count]) => ({
    name: key.split('|').map(id => EXPERIENCES.find(e => e.id === id)?.name || id).join(' + '), count
  }));
  const byExperience = EXPERIENCES.map((e) => {
    const rows = RESERVATIONS.filter((r) => r.experiences.includes(e.id));
    const revenue = rows.reduce((s,r) => s + e.price, 0);
    const partner = e.socio || 'Socio por validar';
    return { ...e, units: rows.length, revenue, partner, average: rows.length ? revenue / rows.length : 0 };
  }).sort((a,b) => b.average-a.average);
  const topPartner = byExperience.reduce((best, e) => e.revenue > best.revenue ? e : best, byExperience[0]);
  const trend = {
    grid: { left: 48, right: 18, top: 24, bottom: 25 },
    tooltip: { trigger: 'axis' },
    legend: { top: 0, textStyle: { fontSize: 10 }, data: ['Consumos', 'Ingreso bruto'] },
    xAxis: { type: 'category', data: monthly.map(m => m.month), axisLabel: { fontSize: 10 } },
    yAxis: [{ type: 'value', name: 'Consumos', axisLabel: { fontSize: 9 } }, { type: 'value', name: 'Ingreso', axisLabel: { formatter: short, fontSize: 9 } }],
    series: [
      { name: 'Consumos', type: 'bar', data: monthly.map(m => m.units), itemStyle: { color: '#a8cdb8', borderRadius: [4,4,0,0] } },
      { name: 'Ingreso bruto', type: 'line', yAxisIndex: 1, data: monthly.map(m => m.revenue), smooth: true, lineStyle: { width: 3, color: '#0b5d3b' }, itemStyle: { color: '#d9a441' } }
    ]
  };
  const comboOption = {
    grid: { left: 12, right: 25, top: 12, bottom: 12, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'value', axisLabel: { fontSize: 9 }, splitLine: { lineStyle: { color: '#edf1ed' } } },
    yAxis: { type: 'category', data: topCombo.map(x => x.name).reverse(), axisLabel: { fontSize: 9, width: 150, overflow: 'break', lineHeight: 13, margin: 10, formatter: (value) => { const words = value.split(/\s+/); const lines = []; let line = ''; words.forEach((word) => { const candidate = line ? `${line} ${word}` : word; if (candidate.length > 22 && line) { lines.push(line); line = word; } else { line = candidate; } }); if (line) lines.push(line); return lines.slice(0, 3).join('\n'); } } },
    series: [{ type: 'bar', data: topCombo.map(x => x.count).reverse(), barMaxWidth: 22, itemStyle: { color: '#507a73', borderRadius: [0,5,5,0] }, label: { show: true, position: 'right', fontSize: 10 } }]
  };
  return <main className="view">
    <header className="view-header"><div><span className="view-tag">Análisis de experiencias</span><h1>Descubre cómo se <em>combinan y evolucionan</em></h1><p className="view-subtitle">Compara la demanda mensual con los ingresos y detecta qué experiencias suelen reservarse juntas para diseñar paquetes y promociones más relevantes.</p></div></header>
    <div className="view-kpis">
      <article className="kpi"><span>Consumos registrados</span><strong>{byExperience.reduce((s,e)=>s+e.units,0).toLocaleString('es-CO')}</strong><small>Unidades de experiencia en reservas</small></article>
      <article className="kpi featured"><span>Ingreso bruto estimado</span><strong>{short(byExperience.reduce((s,e)=>s+e.revenue,0))}</strong><small>Tarifa de catálogo × consumos</small></article>
      <article className="kpi"><span>Experiencia con más ingreso</span><strong>Tour Vive Manaure</strong><small>{short(topPartner.revenue)} · {topPartner.partner}</small></article>
      <article className="kpi"><span>Reservas combinadas</span><strong>{Object.values(combinations).reduce((s,n)=>s+n,0).toLocaleString('es-CO')}</strong><small>Reservas con más de una experiencia</small></article>
    </div>
    <div className="view-grid experience-analysis-grid">
      <article className="view-card"><div className="view-card-head"><div><span>Estacionalidad</span><h2>Consumos e ingreso por mes</h2></div></div><div className="view-chart"><ReactECharts option={trend} style={{height:'100%',width:'100%'}} /></div></article>
      <article className="view-card"><div className="view-card-head"><div><span>Venta cruzada</span><h2>Combinaciones más frecuentes</h2></div></div><div className="view-chart"><ReactECharts option={comboOption} style={{height:'100%',width:'100%'}} /></div></article>
      <article className="view-card wide"><div className="view-card-head"><div><span>Ficha comercial</span><h2>Experiencias, operador y rendimiento</h2></div></div>
        <div className="experience-table-wrap"><table className="experience-table"><thead><tr><th>Experiencia</th><th>Categoría</th><th>Socio asociado</th><th>Consumos</th><th>Tarifa</th><th>Ingreso bruto calculado</th></tr></thead><tbody>{byExperience.map(e=><tr key={e.id}><td><strong>{e.name}</strong></td><td>{e.category}</td><td>{e.partner}</td><td>{e.units.toLocaleString('es-CO')}</td><td>{COP(e.price)}</td><td>{COP(e.revenue)}</td></tr>)}</tbody></table></div>
      </article>
    </div>
    <section className="insight-banner"><div className="insight-content"><span>Oportunidad comercial</span><h2>Las combinaciones frecuentes pueden orientar paquetes y promociones cruzadas.</h2></div><div className="insight-stats"><div><small>Combinación principal</small><strong>{topCombo[0]?.name || 'Sin combinaciones'}</strong><span>{topCombo[0]?.count || 0} reservas</span></div><div><small>Mes de más consumos</small><strong>{[...monthly].sort((a,b)=>b.units-a.units)[0]?.month}</strong><span>Unidades de experiencia</span></div><div><small>Segmentos</small><strong>{CUSTOMER_TYPES.length}</strong><span>Clasificaciones del dataset</span></div></div></section>
  </main>;
}
export default ExperienceAnalysis;
