import ReactECharts from 'echarts-for-react';
import './Behavior.css';
import { newVsRecurringMonthly, customerTypeDistribution, customerTypeByDayType, CUSTOMER_TYPES, VISITS, recurringEvolution } from '../../data/dashboardData';

function Behavior(){
  const totalNuevos=newVsRecurringMonthly.reduce((s,m)=>s+m.nuevos,0);
  const totalRecurrentes=newVsRecurringMonthly.reduce((s,m)=>s+m.recurrentes,0);
  const tasa=((totalRecurrentes/(totalNuevos+totalRecurrentes))*100).toFixed(1);
  const recurrentByMonth=recurringEvolution.map(x=>({month:x.month,value:x.tasaRecurrencia}));
  const best=[...recurrentByMonth].sort((a,b)=>b.value-a.value)[0];
  const worst=[...recurrentByMonth].sort((a,b)=>a.value-b.value)[0];
  const stacked={grid:{left:50,right:20,top:42,bottom:30},legend:{top:0,data:['Nuevos','Recurrentes']},tooltip:{trigger:'axis'},xAxis:{type:'category',data:newVsRecurringMonthly.map(m=>m.month)},yAxis:{type:'value'},series:[{name:'Nuevos',type:'bar',stack:'total',data:newVsRecurringMonthly.map(m=>m.nuevos),itemStyle:{color:'#d28b27'}},{name:'Recurrentes',type:'bar',stack:'total',data:newVsRecurringMonthly.map(m=>m.recurrentes),itemStyle:{color:'#286b45'}}]};
  const type={grid:{left:115,right:25,top:15,bottom:20},tooltip:{trigger:'axis'},xAxis:{type:'value'},yAxis:{type:'category',data:[...customerTypeDistribution].reverse().map(x=>x.name)},series:[{type:'bar',data:[...customerTypeDistribution].reverse().map(x=>x.value),barMaxWidth:24,itemStyle:{color:'#719b83',borderRadius:[0,7,7,0]},label:{show:true,position:'right'}}]};
  const day={grid:{left:45,right:20,top:42,bottom:30},legend:{top:0,data:CUSTOMER_TYPES.map(c=>c.name)},tooltip:{trigger:'axis'},xAxis:{type:'category',data:customerTypeByDayType.map(d=>d.dayType)},yAxis:{type:'value'},series:CUSTOMER_TYPES.map(ct=>({name:ct.name,type:'bar',stack:'day',data:customerTypeByDayType.map(d=>d[ct.id]),itemStyle:{color:ct.color}}))};
  const recurrence={grid:{left:50,right:20,top:28,bottom:30},tooltip:{trigger:'axis',valueFormatter:v=>`${v}%`},xAxis:{type:'category',data:recurrentByMonth.map(x=>x.month)},yAxis:{type:'value',max:100,axisLabel:{formatter:'{value}%'}},series:[{type:'line',data:recurrentByMonth.map(x=>x.value),smooth:.3,symbol:'circle',symbolSize:7,lineStyle:{width:3,color:'#1f3d2e'},areaStyle:{color:'rgba(31,61,46,.08)'}}]};
  const topType=customerTypeDistribution[0]?.name||'Familias';
  return <main className="behavior-view">
    <header className="behavior-header"><span className="behavior-tag">02 · COMPORTAMIENTO</span><h1>¿Cómo se comportan<br/><em>nuestros clientes?</em></h1><p>La pregunta clave no es solo cuántas personas llegan, sino si Villa Adelaida logra convertirlas en clientes que regresan.</p></header>
    <div className="behavior-kpis"><article><span>CLIENTES NUEVOS</span><strong>{totalNuevos.toLocaleString('es-CO')}</strong><small>Primera visita en 2026</small></article><article><span>VISITAS RECURRENTES</span><strong>{totalRecurrentes.toLocaleString('es-CO')}</strong><small>Visitas posteriores</small></article><article><span>RECURRENCIA</span><strong>{tasa}%</strong><small>Sobre el total de visitas</small></article><article><span>SEGMENTO PRINCIPAL</span><strong>{topType}</strong><small>Mayor volumen de demanda</small></article></div>
    <div className="behavior-grid">
      <article className="behavior-card featured"><div className="behavior-card-head"><div><span>CAPTACIÓN · FIDELIZACIÓN</span><h2>Nuevos vs. recurrentes</h2></div><p>La barra muestra si el negocio está creciendo por adquisición o por regreso.</p></div><ReactECharts option={stacked} style={{height:330}}/></article>
      <article className="behavior-card"><span>PERFIL DE CLIENTE</span><h2>¿Quién representa la mayor demanda?</h2><ReactECharts option={type} style={{height:330}}/></article>
      <article className="behavior-card"><span>DÍA DE OPERACIÓN</span><h2>¿Qué tipo de día mueve cada segmento?</h2><ReactECharts option={day} style={{height:340}}/></article>
      <article className="behavior-card"><span>RECURRENCIA MENSUAL</span><h2>¿En qué meses regresan más?</h2><ReactECharts option={recurrence} style={{height:340}}/></article>
    </div>
    <section className="behavior-business-story"><span>LECTURA EMPRESARIAL</span><h2>Villa Adelaida está creciendo principalmente por clientes nuevos.</h2><p>La recurrencia global es de <strong>{tasa}%</strong>, lo que indica que hoy una parte importante de los ingresos depende de seguir siendo descubierto y atraer personas por primera vez. Esto es positivo porque demuestra capacidad de captación, pero también revela una oportunidad: convertir esa primera visita en una segunda visita puede aumentar el valor de cada cliente sin depender exclusivamente de conseguir nuevos.</p><div className="behavior-story-points"><div><strong>{best.month} · {best.value}%</strong><span>Es el mes con mayor recurrencia relativa. La lectura debe usarse para estudiar qué oferta, fecha o segmento funcionó mejor.</span></div><div><strong>{worst.month} · {worst.value}%</strong><span>Es el punto más débil. Conviene reforzar mecanismos de regreso después de la primera visita.</span></div></div></section>
  </main>
}
export default Behavior;
