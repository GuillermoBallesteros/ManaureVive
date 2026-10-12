import './DashboardNav.css';

const NAV_ITEMS = [
  {
    id: 'overview',
    code: '01',
    label: 'General'
  },
  {
    id: 'convenios',
    code: '02',
    label: 'Convenios'
  },
  {
    id: 'experiences',
    code: '03',
    label: 'Experiencias'
  },
  {
    id: 'behavior',
    code: '04',
    label: 'Comportamiento'
  },
  {
    id: 'simulator',
    code: '05',
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