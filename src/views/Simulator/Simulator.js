import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import './Simulator.css';
import { PACKAGES, EXPERIENCES, CUSTOMER_TYPES, VISITS, simulatorInsights } from '../../data/dashboardData';

const COP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Math.round(n || 0));
const compact = (n) => (n >= 1000000 ? `$${(n / 1000000).toFixed(1)} M` : `$${Math.round((n || 0) / 1000)} mil`);
const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function Simulator() {
  const [experienceId, setExperienceId] = useState(EXPERIENCES[0]?.id || 'piscina');
  const [packageId, setPackageId] = useState(PACKAGES[0]?.id || 'romantico');
  const [price, setPrice] = useState(PACKAGES[0]?.defaultPrice || 250000);
  const [conversion, setConversion] = useState(PACKAGES[0]?.defaultConversion || 12);
  const [affinityMetric, setAffinityMetric] = useState('rate');

  const selectedExperience = useMemo(() => EXPERIENCES.find((x) => x.id === experienceId) || EXPERIENCES[0], [experienceId]);
  const selectedPackage = useMemo(() => PACKAGES.find((x) => x.id === packageId) || PACKAGES[0], [packageId]);

  const profileStats = useMemo(() => CUSTOMER_TYPES.map((type) => {
    const segmentVisits = VISITS.filter((v) => v.customerType === type.id);
    const experienceVisits = segmentVisits.filter((v) => v.experiences.includes(selectedExperience.id));
    const clients = new Set(segmentVisits.map((v) => v.clientId)).size;
    const experienceClients = new Set(experienceVisits.map((v) => v.clientId)).size;
    const affinity = clients ? experienceClients / clients : 0;
    return { ...type, clients, experienceClients, affinity };
  }), [selectedExperience]);

  const planProfile = profileStats.find((x) => x.id === selectedPackage.segment) || profileStats[0];
  const bestExperienceProfile = [...profileStats].sort((a, b) => b.affinity - a.affinity)[0] || profileStats[0];

  const potentialClients = Math.max(0, planProfile?.experienceClients || 0);
  const estimatedReservations = Math.round((potentialClients * conversion) / 100);
  const scenarioRevenue = estimatedReservations * price;
  const experiencePrice = selectedExperience?.price || 0;

  const monthlyPlanRevenue = useMemo(() => PACKAGES.map((pkg) => {
    const values = MONTHS.map((_, index) => {
      const monthVisits = VISITS.filter((v) => v.month === index + 1 && v.customerType === pkg.segment);
      const monthClients = new Set(monthVisits.map((v) => v.clientId)).size;
      const experienceClients = new Set(monthVisits.filter((v) => v.experiences.includes(selectedExperience.id)).map((v) => v.clientId)).size;
      const affinity = monthClients ? experienceClients / monthClients : 0;
      return Math.round(monthClients * affinity * (conversion / 100) * price);
    });
    return { ...pkg, values };
  }), [selectedExperience, conversion, price]);

  const trendOption = useMemo(() => ({
    grid: { left: 58, right: 25, top: 48, bottom: 35 },
    legend: { top: 0, type: 'scroll', textStyle: { color: '#53635a', fontSize: 10 } },
    tooltip: { trigger: 'axis', valueFormatter: (v) => COP(v) },
    xAxis: { type: 'category', data: MONTHS },
    yAxis: { type: 'value', axisLabel: { formatter: (v) => compact(v) }, splitLine: { lineStyle: { color: '#e7eee9' } } },
    series: monthlyPlanRevenue.map((pkg, index) => ({
      name: pkg.name,
      type: 'line', smooth: 0.25, symbol: 'circle', symbolSize: 5, data: pkg.values,
      lineStyle: { width: pkg.id === selectedPackage.id ? 4 : 2, opacity: pkg.id === selectedPackage.id ? 1 : .5 },
      itemStyle: { color: ['#286b45','#719b83','#173b29','#526158','#9ab9a8'][index % 5] },
      emphasis: { focus: 'series' }
    }))
  }), [monthlyPlanRevenue, selectedPackage.id]);

  const affinityValues = profileStats.slice().reverse();
  const affinityOption = useMemo(() => ({
    grid: { left: 105, right: 55, top: 18, bottom: 35 },
    tooltip: {
      trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const p = params[0];
        const item = affinityValues.find((x) => x.name === p.name);
        if (!item) return '';
        return `<strong>${item.name}</strong><br/>${selectedExperience.name}<br/><strong>${Math.round(item.affinity * 100)}%</strong> de sus clientes consumieron esta experiencia<br/>${item.experienceClients.toLocaleString('es-CO')} clientes`;
      }
    },
    xAxis: affinityMetric === 'rate'
      ? { type: 'value', min: 0, max: 1, axisLabel: { formatter: (v) => `${Math.round(v * 100)}%` }, splitLine: { lineStyle: { color: '#e7eee9' } } }
      : { type: 'value', min: 0, axisLabel: { formatter: (v) => v.toLocaleString('es-CO') }, splitLine: { lineStyle: { color: '#e7eee9' } } },
    yAxis: { type: 'category', data: affinityValues.map((x) => x.name) },
    series: [{
      name: affinityMetric === 'rate' ? 'Afinidad' : 'Clientes con afinidad', type: 'bar',
      data: affinityValues.map((x) => affinityMetric === 'rate' ? x.affinity : x.experienceClients), barMaxWidth: 24,
      itemStyle: { color: '#286b45', borderRadius: [0, 7, 7, 0] },
      label: { show: true, position: 'right', formatter: (p) => affinityMetric === 'rate' ? `${Math.round(p.value * 100)}%` : p.value.toLocaleString('es-CO'), color: '#31463a' }
    }]
  }), [affinityValues, affinityMetric, selectedExperience]);

  const handlePackageChange = (id) => {
    const pkg = PACKAGES.find((p) => p.id === id) || PACKAGES[0];
    setPackageId(pkg.id); setPrice(pkg.defaultPrice); setConversion(pkg.defaultConversion);
  };

  const reset = () => {
    const pkg = PACKAGES[0];
    setExperienceId(EXPERIENCES[0]?.id || 'piscina'); setPackageId(pkg.id); setPrice(pkg.defaultPrice); setConversion(pkg.defaultConversion); setAffinityMetric('rate');
  };

  return (
    <section className="simulator-view">
      <header className="simulator-header">
        <span className="simulator-tag">06 · SIMULADOR</span>
        <h1>Prueba qué combinación de experiencia y plan tiene mayor potencial.</h1>
        <p>Selecciona una experiencia, un plan y una conversión. El simulador usa el comportamiento observado para estimar cuántas reservas y cuánto ingreso podría representar ese escenario.</p>
      </header>

      <div className="simulator-container">
        <article className="simulator-config">
          <div className="config-header"><h2>Construir escenario</h2><span>EXPERIENCIA + PLAN</span></div>
          <label className="config-field"><span>Experiencia a impulsar</span>
            <select value={experienceId} onChange={(e) => setExperienceId(e.target.value)}>{EXPERIENCES.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
          </label>
          <label className="config-field"><span>Plan comercial</span>
            <select value={packageId} onChange={(e) => handlePackageChange(e.target.value)}>{PACKAGES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
          </label>
          <p className="package-description">{selectedPackage.description}</p>
          <div className="scenario-rule"><strong>Cómo se calcula</strong><span>Clientes del público objetivo que ya consumieron la experiencia × conversión simulada × precio del plan.</span></div>
          <label className="config-field"><span>Precio del plan: <strong>{COP(price)}</strong></span>
            <input type="range" min={selectedPackage.minPrice} max={selectedPackage.maxPrice} step={5000} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </label>
          <label className="config-field"><span>Conversión estimada: <strong>{conversion}%</strong></span>
            <input type="range" min={1} max={40} step={1} value={conversion} onChange={(e) => setConversion(Number(e.target.value))} />
          </label>
          <button type="button" className="reset-button" onClick={reset}>REINICIAR ESCENARIO</button>
        </article>

        <article className="simulator-results">
          <div className="result-card"><span>EXPERIENCIA</span><strong>{selectedExperience.name}</strong><small>Tarifa actual: {COP(experiencePrice)}</small></div>
          <div className="result-card"><span>PÚBLICO OBJETIVO DEL PLAN</span><strong>{planProfile?.name || '—'}</strong><small>{Math.round((planProfile?.affinity || 0) * 100)}% de sus clientes consumieron esta experiencia</small></div>
          <div className="result-card highlight"><span>INGRESO POTENCIAL</span><strong>{compact(scenarioRevenue)}</strong><small>{estimatedReservations.toLocaleString('es-CO')} reservas estimadas</small></div>
        </article>

        <article className="simulation-chart-card">
          <div className="simulation-card-header"><div><h2>Cómo cambia el ingreso potencial según el plan</h2><span>Cada línea representa un plan para {selectedExperience.name}.</span></div></div>
          <ReactECharts option={trendOption} style={{ height: 350 }} />
        </article>

        <article className="simulation-chart-card affinity-simulation-card">
          <div className="simulation-card-header">
            <div><h2>¿Qué público tiene afinidad con {selectedExperience.name}?</h2><span>La relación siempre se lee respecto a la experiencia seleccionada.</span></div>
            <div className="affinity-options" role="group" aria-label="Forma de medir la afinidad">
              <button type="button" className={affinityMetric === 'rate' ? 'active' : ''} onClick={() => setAffinityMetric('rate')}>% del público</button>
              <button type="button" className={affinityMetric === 'clients' ? 'active' : ''} onClick={() => setAffinityMetric('clients')}>Clientes</button>
            </div>
          </div>
          <div className="affinity-definition">{affinityMetric === 'rate' ? 'Ejemplo: 35% significa que 35 de cada 100 clientes de ese público consumieron esta experiencia.' : 'Muestra cuántos clientes únicos de cada público ya consumieron esta experiencia.'}</div>
          <ReactECharts option={affinityOption} style={{ height: 330 }} />
          <div className="affinity-highlight"><strong>Mayor afinidad:</strong> {bestExperienceProfile?.name} · {Math.round((bestExperienceProfile?.affinity || 0) * 100)}% de sus clientes consumieron {selectedExperience.name}.</div>
        </article>

        <article className="simulation-conclusion">
          <div><span>LECTURA DEL ESCENARIO</span>
            <p>Estás simulando <strong>{selectedPackage.name}</strong> para <strong>{planProfile?.name}</strong>, aprovechando una experiencia con una afinidad observada del <strong>{Math.round((planProfile?.affinity || 0) * 100)}%</strong>. Sobre <strong>{potentialClients.toLocaleString('es-CO')} clientes</strong> de ese público que ya consumieron <strong>{selectedExperience.name}</strong>, una conversión del <strong>{conversion}%</strong> produciría aproximadamente <strong>{estimatedReservations.toLocaleString('es-CO')} reservas</strong>. A un precio de <strong>{COP(price)}</strong> por plan, el ingreso potencial sería de <strong>{compact(scenarioRevenue)}</strong>.</p>
          </div>
          <div className="conclusion-value"><span>MEJOR AFINIDAD DE LA EXPERIENCIA</span><strong>{bestExperienceProfile?.name}</strong><small>{Math.round((bestExperienceProfile?.affinity || 0) * 100)}% del público</small></div>
        </article>

        <p className="simulator-disclaimer">{simulatorInsights.disclaimer} El ingreso mostrado es un escenario hipotético y no una venta garantizada.</p>
      </div>
    </section>
  );
}

export default Simulator;
