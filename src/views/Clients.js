import ReactECharts from 'echarts-for-react';
import '../styles/view-shell.css';
import './Clients.css';
import { RESERVATIONS, EXPERIENCES } from '../data/dashboardData';

const COP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Math.round(n || 0));
const short = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(1)} M` : COP(n);

function Clients() {
  const clients = {};
  RESERVATIONS.forEach((r) => {
    const item = clients[r.clientId] || { id: r.clientId, visits: 0, spend: 0, firstMonth: r.month, lastMonth: r.month, experiences: new Set() };
    item.visits += 1;
    item.spend += r.revenue;
    item.firstMonth = Math.min(item.firstMonth, r.month);
    item.lastMonth = Math.max(item.lastMonth, r.month);
    r.experiences.forEach(id => item.experiences.add(id));
    clients[r.clientId] = item;
  });
  const rows = Object.values(clients);
  const repeat = rows.filter(c => c.visits >= 2);
  const spendTotal = rows.reduce((s,c)=>s+c.spend,0);
  const avgSpend = rows.length ? spendTotal / rows.length : 0;
  const topClients = [...rows].sort((a,b)=>b.spend-a.spend).slice(0,8);
  const frequency = [
    { name: '1 visita', value: rows.filter(c=>c.visits===1).length },
    { name: '2–3 visitas', value: rows.filter(c=>c.visits>=2 && c.visits<=3).length },
    { name: '4–6 visitas', value: rows.filter(c=>c.visits>=4 && c.visits<=6).length },
    { name: '7+ visitas', value: rows.filter(c=>c.visits>=7).length }
  ];
  const freqOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} clientes ({d}%)' },
    legend: { bottom: 0, textStyle: { fontSize: 10 } },
    series: [{ type:'pie', radius:['48%','72%'], center:['50%','43%'], label:{formatter:'{d}%',fontSize:10}, data:frequency.map((x,i)=>({...x,itemStyle:{color:['#d9a441','#a8cdb8','#507a73','#0b5d3b'][i]}})) }]
  };
  const valueOption = {
    grid: { left: 65, right: 50, top: 8, bottom: 20 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: COP },
    xAxis: { type: 'value', axisLabel: { formatter: short, fontSize: 9 }, splitLine: { lineStyle: { color: '#edf1ed' } } },
    yAxis: { type: 'category', data: topClients.map(c=>`Cliente ${String([...rows].sort((a,b)=>b.spend-a.spend).findIndex(x=>x.id===c.id)+1).padStart(3,'0')}`).reverse(), axisLabel: { fontSize: 9 } },
    series: [{ type:'bar', data:topClients.map(c=>c.spend).reverse(), barMaxWidth:18, itemStyle:{color:'#0b5d3b',borderRadius:[0,5,5,0]}, label:{show:true,position:'right',formatter:p=>short(p.value),fontSize:9} }]
  };
  const repeatShare = rows.length ? repeat.length / rows.length * 100 : 0;
  const avgVisits = rows.length ? RESERVATIONS.length / rows.length : 0;
  const topExperience = EXPERIENCES.map(e=>({name:e.name,count:RESERVATIONS.filter(r=>r.experiences.includes(e.id)).length})).sort((a,b)=>b.count-a.count)[0];
  return <main className="view">
    <header className="view-header"><div><span className="view-tag">Clientes</span><h1>Valor, frecuencia y <em>fidelización</em></h1></div></header>
    <div className="view-kpis">
      <article className="kpi"><span>Clientes identificados</span><strong>{rows.length.toLocaleString('es-CO')}</strong><small>Personas registradas</small></article>
      <article className="kpi featured"><span>Clientes con 2+ visitas</span><strong>{repeat.length.toLocaleString('es-CO')}</strong><small>{repeatShare.toFixed(1)}% de los IDs</small></article>
      <article className="kpi"><span>Ingreso medio por cliente</span><strong>{COP(avgSpend)}</strong><small>Promedio acumulado por persona</small></article>
      <article className="kpi"><span>Visitas por cliente</span><strong>{avgVisits.toFixed(2)}</strong><small>Reservas por persona</small></article>
    </div>
    <div className="view-grid clients-grid">
      <article className="view-card"><div className="view-card-head"><div><span>Frecuencia individual</span><h2>¿Cuántas veces regresa cada cliente?</h2></div></div><div className="view-chart"><ReactECharts option={freqOption} style={{height:'100%',width:'100%'}} /></div></article>
      <article className="view-card"><div className="view-card-head"><div><span>Valor bruto acumulado</span><h2>Clientes con mayor gasto calculado</h2></div></div><div className="view-chart"><ReactECharts option={valueOption} style={{height:'100%',width:'100%'}} /></div></article>
      <article className="view-card wide"><div className="view-card-head"><div><span>Lectura de valor</span><h2>Cómo interpretar el gasto y la frecuencia</h2></div></div>
        <div className="client-insight-grid">
          <div><span>Experiencia con más consumos</span><strong>{topExperience.name}</strong><small>{topExperience.count.toLocaleString('es-CO')} consumos registrados</small></div>
          <div><span>Clientes de una sola visita</span><strong>{frequency[0].value.toLocaleString('es-CO')}</strong><small>Registraron una sola reserva</small></div>
          <div><span>Clientes de alta frecuencia (4+)</span><strong>{rows.filter(c=>c.visits>=4).length.toLocaleString('es-CO')}</strong><small>Segmento útil para diseñar beneficios de fidelización</small></div>
        </div>
        
      </article>
    </div>
    <section className="insight-banner"><div className="insight-content"><span>Lectura del comportamiento de clientes</span><h2>Separar las campañas de captación de las acciones para recuperar clientes de una sola visita.</h2></div><div className="insight-stats"><div><small>Recurrentes</small><strong>{repeatShare.toFixed(1)}%</strong><span>2 o más reservas</span></div><div><small>Gasto agregado</small><strong>{short(spendTotal)}</strong><span>Bruto calculado</span></div><div><small>Alta frecuencia</small><strong>{rows.filter(c=>c.visits>=4).length}</strong><span>4+ reservas</span></div></div></section>
  </main>;
}
export default Clients;
