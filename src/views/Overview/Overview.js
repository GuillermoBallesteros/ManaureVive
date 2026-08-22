import ReactECharts from 'echarts-for-react';
import './Overview.css';
import { MONTHS, overviewKPIs, monthlySales, salesBySource, overviewInsight, VISITS } from '../../data/dashboardData';

const COP = (n) => new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(n);

function Overview(){
  const best = [...monthlySales].sort((a,b)=>b.sales-a.sales)[0];
  const weakest = [...monthlySales].sort((a,b)=>a.sales-b.sales)[0];
  const monthVisits = Object.fromEntries(MONTHS.map((m,i)=>[m,VISITS.filter(v=>v.month===i+1)]));
  const bestReason = best.month === 'Sep' ? 'Amor y Amistad fortalece la presencia de parejas y eleva el consumo de experiencias y restaurante.' : 'La combinación de mayor tráfico y mayor consumo por visita explica su liderazgo.';
  const weakReason = weakest.month === 'Feb' ? 'febrero no tiene un festivo relevante y concentra menos visitas de los segmentos de mayor gasto.' : 'presenta menos días de operación y menor intensidad de demanda.';
  const trend = { grid:{left:55,right:25,top:28,bottom:35}, tooltip:{trigger:'axis',valueFormatter:v=>COP(v)}, xAxis:{type:'category',data:MONTHS}, yAxis:{type:'value',axisLabel:{formatter:v=>`${Math.round(v/1000000)} M`}}, series:[{type:'line',data:monthlySales.map(m=>m.sales),smooth:.28,symbol:'circle',symbolSize:7,lineStyle:{width:3},areaStyle:{opacity:.09}}] };
  const source = { grid:{left:135,right:30,top:15,bottom:25}, tooltip:{trigger:'axis',valueFormatter:v=>COP(v)}, xAxis:{type:'value',axisLabel:{formatter:v=>`${Math.round(v/1000000)} M`}}, yAxis:{type:'category',data:salesBySource.slice(0,7).map(x=>x.name).reverse()}, series:[{type:'bar',data:salesBySource.slice(0,7).map(x=>x.value).reverse(),barMaxWidth:24,itemStyle:{borderRadius:[0,7,7,0]}}] };
  return <main className="overview-view">
    <header className="overview-header"><span className="overview-tag">01 · RESUMEN EJECUTIVO</span><h1>¿Cómo está funcionando<br/><em>Villa Adelaida?</em></h1><p>Una lectura ejecutiva de ventas, clientes, recurrencia y estacionalidad para entender qué está moviendo el negocio.</p></header>
    <div className="overview-kpis">
      <article className="overview-kpi featured"><span>VENTAS TOTALES</span><strong>{COP(overviewKPIs.sales)}</strong><small>Ingresos generados durante 2026</small></article>
      <article className="overview-kpi"><span>CLIENTES</span><strong>{overviewKPIs.clients.toLocaleString('es-CO')}</strong><small>Clientes identificados</small></article>
      <article className="overview-kpi"><span>RECURRENCIA</span><strong>{overviewKPIs.recurringRate}%</strong><small>Clientes que regresan</small></article>
      <article className="overview-kpi"><span>TICKET PROMEDIO</span><strong>{COP(overviewKPIs.avgTicket)}</strong><small>Por visita</small></article>
    </div>
    <div className="overview-grid">
      <article className="overview-card large"><div className="card-heading"><div><span>ESTACIONALIDAD</span><h2>¿Cuándo genera más el negocio?</h2></div><p>El comportamiento mensual permite identificar temporadas que merecen acciones comerciales distintas.</p></div><ReactECharts option={trend} style={{height:380}}/></article>
      <article className="overview-card"><div className="card-heading"><div><span>ORIGEN DE LOS INGRESOS</span><h2>¿Qué está pagando el cliente?</h2></div></div><ReactECharts option={source} style={{height:380}}/></article>
    </div>
    <section className="overview-business-story">
      <div className="story-main"><span>LECTURA DEL NEGOCIO</span><h2>Junio es el mes con mayor recurrencia; febrero es uno de los meses más débiles.</h2><p>{overviewInsight}</p></div>
      <div className="story-columns"><div><strong>{best.month} · {COP(best.sales)}</strong><span>{bestReason}</span></div><div><strong>{weakest.month} · {COP(weakest.sales)}</strong><span>{weakReason}</span></div></div>
    </section>
  </main>
}
export default Overview;
