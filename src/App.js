import { useState } from 'react';
import './App.css';
import DashboardHeader from './components/DashboardHeader/DashboardHeader';
import DashboardNav from './components/DashboardNav/DashboardNav';
import DashboardFooter from './components/DashboardFooter/DashboardFooter';
import Overview from './views/Overview/Overview';
import Behavior from './views/Behavior/Behavior';
import Experiences from './views/Experiences/Experiences';
import Gastronomy from './views/Gastronomy/Gastronomy';
import Opportunities from './views/Opportunities/Opportunities';
import Simulator from './views/Simulator/Simulator';

const VIEWS = {
  overview: Overview,
  behavior: Behavior,
  experiences: Experiences,
  gastronomy: Gastronomy,
  opportunities: Opportunities,
  simulator: Simulator
};

function App() {
  const [activeView, setActiveView] = useState('overview');
  const ActiveComponent = VIEWS[activeView];

  return (
    <div className="app">
      <DashboardHeader />
      <DashboardNav activeView={activeView} onNavigate={setActiveView} />
      <main className="app-main">
        <ActiveComponent />
      </main>
      <DashboardFooter />
    </div>
  );
}

export default App;
