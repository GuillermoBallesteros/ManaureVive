import { useState } from 'react';
import './App.css';
import { MAIN_LOGO } from './data/partnerLogos';

import DashboardSidebar from './components/DashboardSidebar/DashboardSidebar';

import Overview from './views/Overview/Overview';
import Convenios from './views/Convenios/Convenios';
import Experiences from './views/Experiences/Experiences';
import Behavior from './views/Behavior/Behavior';
import Simulator from './views/Simulator/Simulator';

const VIEWS = {
  overview: Overview,
  convenios: Convenios,
  experiences: Experiences,
  behavior: Behavior,
  simulator: Simulator
};

function App() {
  const [activeView, setActiveView] = useState('overview');
  const ActiveComponent = VIEWS[activeView];

  return (
    <div className="app">
      <DashboardSidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="app-main" style={{ '--main-logo': `url("${MAIN_LOGO}")` }}>
        <div className="app-main-content">
          <ActiveComponent />
        </div>
      </main>
    </div>
  );
}

export default App;
