import ReactECharts from 'echarts-for-react';
import './Opportunities.css';
import { segmentPackageAffinity, opportunityInsights, PACKAGES, CUSTOMER_TYPES } from '../../data/dashboardData';

function Opportunities() {
  const palette = ['#286b45', '#719b83', '#173b29', '#9ab9a8', '#526158'];

  const affinityRows = segmentPackageAffinity.map((row) => {
    const values = CUSTOMER_TYPES.map((ct) => ({ name: ct.name, value: Number(row[ct.id]) || 0 }));
    const total = values.reduce((s, x) => s + x.value, 0) || 1;
    return {
      package: row.package,
      values: values.map((x) => ({ ...x, share: x.value / total })).sort((a, b) => b.share - a.share)
    };
  });

  const bestByPackage = affinityRows.map((r) => ({ package: r.package, best: r.values[0], second: r.values[1] }));
  const averageByAudience = CUSTOMER_TYPES.map((ct) => ({
    name: ct.name,
    value: Math.round(affinityRows.reduce((s, r) => s + (r.values.find((x) => x.name === ct.name)?.share || 0), 0) / affinityRows.length * 100)
  })).sort((a, b) => b.value - a.value);

  // Una sola métrica clara: dentro de cada plan, qué proporción de su encaje relativo corresponde a cada público.
  const packageIndex = Object.fromEntries(PACKAGES.map((p, i) => [p.name, i]));
  const audienceIndex = Object.fromEntries(CUSTOMER_TYPES.map((ct, i) => [ct.name, i]));
  const stackedSeries = CUSTOMER_TYPES.map((ct, audienceIndexValue) => ({
    name: ct.name,
    type: 'bar',
    stack: 'total',
    barWidth: 28,
    data: PACKAGES.map((pkg) => {
      const row = affinityRows.find((r) => r.package === pkg.name);
      return Math.round(((row?.values.find((x) => x.name === ct.name)?.share || 0) * 100) * 10) / 10;
    }),
    itemStyle: { color: palette[audienceIndexValue % palette.length] },
    label: {
      show: true,
      position: 'inside',
      formatter: (p) => p.value >= 12 ? `${p.value}%` : '',
      color: '#fff',
      fontSize: 10,
      fontWeight: 700
    }
  }));

  const compositionOption = {
    grid: { left: 150, right: 25, top: 52, bottom: 35 },
    legend: { top: 5, type: 'scroll', textStyle: { color: '#526158', fontSize: 10 } },
    tooltip: {
      trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const lines = [`<strong>${params[0]?.axisValue}</strong>`];
        params.filter((p) => p.value > 0).forEach((p) => lines.push(`${p.marker} ${p.seriesName}: <strong>${p.value}%</strong>`));
        return lines.join('<br/>');
      }
    },
    xAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' }, splitLine: { lineStyle: { color: '#e7eee9' } } },
    yAxis: { type: 'category', data: PACKAGES.map((p) => p.name).reverse(), axisLine: { show: false }, axisTick: { show: false } },
    series: stackedSeries.map((s) => ({ ...s, data: s.data.slice().reverse() }))
  };

  const bestOption = {
    grid: { left: 150, right: 45, top: 20, bottom: 25 },
    tooltip: {
      trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const p = params[0];
        const row = bestByPackage.find((x) => x.package === p.name);
        return `<strong>${p.name}</strong><br/>Público recomendado: <strong>${row.best.name}</strong><br/>Participación del encaje: <strong>${Math.round(row.best.share * 100)}%</strong>`;
      }
    },
    xAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' }, splitLine: { lineStyle: { color: '#e7eee9' } } },
    yAxis: { type: 'category', data: bestByPackage.map((x) => x.package).reverse(), axisLine: { show: false }, axisTick: { show: false } },
    series: [{
      name: 'Público principal', type: 'bar', barWidth: 22,
      data: bestByPackage.map((x) => ({ value: Math.round(x.best.share * 100), itemStyle: { color: CUSTOMER_TYPES.find((ct) => ct.name === x.best.name)?.color || '#286b45' } })).reverse(),
      label: { show: true, position: 'right', formatter: (p) => {
        const row = bestByPackage.find((x) => x.package === p.name);
        return `${row.best.name} · ${p.value}%`;
      }, color: '#31463a' },
      itemStyle: { borderRadius: [0, 7, 7, 0] }
    }]
  };

  const topPackage = bestByPackage.reduce((best, current) => current.best.share > best.best.share ? current : best, bestByPackage[0]);

  return (
    <section className="opportunity-view">
      <header className="opportunity-header">
        <span className="opportunity-tag">05 · OPORTUNIDADES</span>
        <h1>¿Qué público deberíamos buscar para cada plan?</h1>
        <p>La vista convierte el comportamiento observado en una regla comercial sencilla: cada plan debe comunicarse primero al público con mayor encaje.</p>
      </header>

      <div className="opportunity-kpis">
        <article className="opportunity-kpi main-opportunity"><span>MEJOR ENCAJE ACTUAL</span><strong>{topPackage.package}</strong><small>{topPackage.best.name} · {Math.round(topPackage.best.share * 100)}% del encaje relativo</small></article>
        <article className="opportunity-kpi"><span>PÚBLICO MÁS PRESENTE</span><strong>{averageByAudience[0].name}</strong><small>{averageByAudience[0].value}% de participación media en los planes</small></article>
        <article className="opportunity-kpi"><span>PLANES ANALIZADOS</span><strong>{PACKAGES.length}</strong><small>propuestas comerciales</small></article>
        <article className="opportunity-kpi"><span>PÚBLICOS ANALIZADOS</span><strong>{CUSTOMER_TYPES.length}</strong><small>segmentos de clientes</small></article>
      </div>

      <div className="opportunity-grid">
        <article className="opportunity-card affinity-card">
          <div className="opportunity-card-header"><h2>Cómo se reparte el encaje de cada plan</h2></div>
          <span className="opportunity-question">Cada barra suma 100%. Así puedes ver, dentro de cada plan, qué público pesa más y comparar sin porcentajes que superen el 100%.</span>
          <ReactECharts option={compositionOption} style={{ height: 390 }} />
        </article>

        <article className="opportunity-card ranking-card">
          <div className="opportunity-card-header"><h2>¿A quién dirigir primero cada plan?</h2></div>
          <span className="opportunity-question">La barra muestra el público principal y su participación dentro del encaje relativo del plan.</span>
          <ReactECharts option={bestOption} style={{ height: 390 }} />
        </article>
      </div>

      <section className="opportunity-conclusion">
        <div className="conclusion-content">
          <span>LECTURA DE NEGOCIO</span>
          <h2>La oportunidad no es venderle todo a todos.</h2>
          <p>{opportunityInsights.segment} La recomendación comercial es usar el público principal de cada plan como primer objetivo de comunicación y después ampliar la propuesta hacia los segmentos secundarios.</p>
        </div>
        <div className="conclusion-action">
          <span>PRIMER PLAN A IMPULSAR</span>
          <strong>{topPackage.package}</strong>
          <small>Principalmente {topPackage.best.name} · {Math.round(topPackage.best.share * 100)}%</small>
        </div>
      </section>
    </section>
  );
}

export default Opportunities;
