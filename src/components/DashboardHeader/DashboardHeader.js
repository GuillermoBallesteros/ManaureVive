import './DashboardHeader.css';
import logo from './Logo.png';

function DashboardHeader() {
  return (
    <header className="dashboard-header">

      <div className="dashboard-header-inner">

        <div className="dashboard-brand">

          <div className="dashboard-logo">
            <img
              src={logo}
              alt="Villa Adelaida"
            />
          </div>

          <div>
            <strong>VILLA ADELAIDA</strong>
            <span>Inteligencia comercial</span>
          </div>

        </div>

        <div className="dashboard-period">
          <span>Periodo</span>
          <strong>2026</strong>
        </div>

      </div>

    </header>
  );
}

export default DashboardHeader;