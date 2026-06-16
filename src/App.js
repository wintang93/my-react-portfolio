import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Portfolio from './pages/Portfolio';
import Snake from './pages/Snake';
import Timer from './pages/Timer';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Portfolio.css';

function App() {
  return (
    <div className="pf-layout">
      <Sidebar />
      <main className="pf-main">
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/snake" element={<Snake />} />
          <Route path="/Timer" element={<Timer />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
