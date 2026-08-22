import './DashboardNav.css';

const NAV_ITEMS = [
  {
    id: 'overview',
    code: '01',
    label: 'Resumen'
  },
  {
    id: 'behavior',
    code: '02',
    label: 'Comportamiento'
  },
  {
    id: 'experiences',
    code: '03',
    label: 'Experiencias'
  },
  {
    id: 'gastronomy',
    code: '04',
    label: 'Gastronomía'
  },
  {
    id: 'opportunities',
    code: '05',
    label: 'Oportunidades'
  },
  {
    id: 'simulator',
    code: '06',
    label: 'Simulador'
  }
];

function DashboardNav({ activeView, onNavigate }) {
  return (
    <nav className="dashboard-nav">

      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`nav-item ${
            activeView === item.id ? 'active' : ''
          }`}
          onClick={() => onNavigate(item.id)}
        >
          <span className="nav-code">
            {item.code}
          </span>

          <span className="nav-label">
            {item.label}
          </span>
        </button>
      ))}

    </nav>
  );
}

export default DashboardNav;