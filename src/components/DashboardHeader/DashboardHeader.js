import './DashboardHeader.css';
import { MAIN_LOGO } from '../../data/partnerLogos';

function DashboardHeader() {
  return (
    <header className="dashboard-header">

      <div className="dashboard-header-inner">

        <div className="dashboard-brand">

          <div className="dashboard-logo">
            <img
              src={MAIN_LOGO}
              alt="Manaure Vive"
            />
          </div>

          <div>
            <strong>MANAURE VIVE</strong>
            <span>Inteligencia comercial</span>
          </div>

        </div>

        <div className="dashboard-period">
          <span>Periodo</span>
          <strong>2025</strong>
        </div>

      </div>

    </header>
  );
}

export default DashboardHeader;