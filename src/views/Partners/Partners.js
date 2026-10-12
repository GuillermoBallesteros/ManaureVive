import React, { useState } from 'react';
import { dashboardData } from '../../data/dashboardData';
import './Partners.css';

const Partners = () => {
  const [selectedPartner, setSelectedPartner] = useState(dashboardData.partnersList[0]);
  const [selectedRange, setSelectedRange] = useState('full');

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  const partnerData = {
    name: selectedPartner,
    totalIncome: 85000000,
    servicesProvided: 420,
    averageTicket: 202380,
    monthlyPerformance: [
      { month: 'Ene', value: 5500000 },
      { month: 'Feb', value: 4800000 },
      { month: 'Mar', value: 6200000 },
      { month: 'Abr', value: 7000000 },
      { month: 'May', value: 6500000 },
      { month: 'Jun', value: 7800000 },
      { month: 'Jul', value: 8200000 },
      { month: 'Ago', value: 7100000 },
      { month: 'Sep', value: 6900000 },
      { month: 'Oct', value: 7500000 },
      { month: 'Nov', value: 8000000 },
      { month: 'Dic', value: 9500000 }
    ]
  };

  return (
    <div className="partners-view">
      <div className="filters-container">
        <div className="filter-group">
          <label htmlFor="partner-select">Seleccionar Socio / Convenio:</label>
          <select 
            id="partner-select" 
            value={selectedPartner} 
            onChange={(e) => setSelectedPartner(e.target.value)}
          >
            {dashboardData.partnersList.map((partner, idx) => (
              <option key={idx} value={partner}>{partner}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="range-select">Rango de Meses:</label>
          <select 
            id="range-select" 
            value={selectedRange} 
            onChange={(e) => setSelectedRange(e.target.value)}
          >
            <option value="full">Todo el año (2025)</option>
            <option value="q1">Trimestre 1 (Ene - Mar)</option>
            <option value="q2">Trimestre 2 (Abr - Jun)</option>
            <option value="q3">Trimestre 3 (Jul - Sep)</option>
            <option value="q4">Trimestre 4 (Oct - Dic)</option>
          </select>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>Ingresos del Socio</h3>
          <p className="kpi-value">{formatCurrency(partnerData.totalIncome)}</p>
          <span className="kpi-subtext">{selectedPartner}</span>
        </div>
        <div className="kpi-card">
          <h3>Servicios / Experiencias Prestadas</h3>
          <p className="kpi-value">{partnerData.servicesProvided}</p>
          <span className="kpi-subtext">Total unidades</span>
        </div>
        <div className="kpi-card">
          <h3>Ticket Promedio</h3>
          <p className="kpi-value">{formatCurrency(partnerData.averageTicket)}</p>
          <span className="kpi-subtext">Por servicio</span>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Desempeño Específico de {selectedPartner}</h2>
        <div className="chart-container">
          <div className="bar-chart">
            {partnerData.monthlyPerformance.map((item, index) => (
              <div key={index} className="bar-column">
                <span className="bar-value">{formatCurrency(item.value)}</span>
                <div 
                  className="bar partner-bar" 
                  style={{ height: `${(item.value / 10000000) * 100}%` }}
                ></div>
                <span className="bar-label">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partners;
