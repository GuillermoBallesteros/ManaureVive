import './DashboardSidebar.css';
import { MAIN_LOGO } from '../../data/partnerLogos';

const NAV_ITEMS = [
  {
    id: 'overview',
    label: 'General',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
      </svg>
    )
  },
  {
    id: 'convenios',
    label: 'Convenios',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="8.5" cy="8.5" r="4" />
        <circle cx="16" cy="15" r="4" />
        <path d="M11 11l2.5 1" />
      </svg>
    )
  },
  {
    id: 'experiences',
    label: 'Experiencias',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8.3" />
        <path d="M14.6 9.4 12.9 13l-3.6 1.6 1.7-3.6 3.6-1.6Z" />
      </svg>
    )
  },
  {
    id: 'behavior',
    label: 'Comportamiento',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="8.5" cy="8" r="3" />
        <circle cx="16" cy="9.5" r="2.3" />
        <path d="M3 20c.6-3.4 3-5.4 5.5-5.4S13.4 16.6 14 20" />
        <path d="M14.8 14.9c2 .2 3.7 1.9 4.2 5.1" />
      </svg>
    )
  },
  {
    id: 'experienceAnalysis',
    label: 'Análisis de experiencias',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19V5M4 19h16" /><path d="m7 15 4-5 3 2 5-7" />
      </svg>
    )
  },
  {
    id: 'clients',
    label: 'Clientes',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.4 2.5-5.6 6-5.6s6 2.2 6 5.6" /><path d="M16 5.5a3 3 0 0 1 0 5.8M17 14.5c2.4.5 4 2.4 4 5" />
      </svg>
    )
  },
  {
    id: 'simulator',
    label: 'Simulador',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 6h16M4 12h16M4 18h16" />
        <circle cx="9" cy="6" r="1.8" fill="currentColor" stroke="none" />
        <circle cx="16" cy="12" r="1.8" fill="currentColor" stroke="none" />
        <circle cx="10" cy="18" r="1.8" fill="currentColor" stroke="none" />
      </svg>
    )
  }
];

function DashboardSidebar({ activeView, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <img src={MAIN_LOGO} alt="Manaure Vive" />
        </div>
        <div>
          <strong>MANAURE VIVE</strong>
          <span>Inteligencia comercial</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span className="sidebar-item-text">
              <span className="sidebar-item-label">{item.label}</span>
            </span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-period">
          <span>Periodo</span>
          <strong>2025</strong>
        </div>
        <p>
          {activeView === 'overview' && 'Vista general'}
          {activeView === 'convenios' && 'Rendimiento de convenios'}
          {activeView === 'experiences' && 'Desempeño de experiencias'}
          {activeView === 'behavior' && 'Perfil de clientes'}
          {activeView === 'experienceAnalysis' && 'Relaciones entre experiencias'}
          {activeView === 'clients' && 'Valor y fidelización'}
          {activeView === 'simulator' && 'Escenarios comerciales'}
        </p>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
