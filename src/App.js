import { Routes, Route } from 'react-router-dom';
import Navibar from './components/Navibar';
import Home from './pages/Home';
import Experiences from './pages/Experiences';
import Contact from './pages/Contact';
import Snake from './pages/Snake';
import Timer from './pages/Timer';
import Projects from './pages/Projects';
import Education from './pages/Education';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <>
      <Navibar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/experiences" element={<Experiences />} />
        <Route path="/education" element={<Education />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/snake" element={<Snake />} />
        <Route path="/Timer" element={<Timer />} />
      </Routes>
    </>
  );
}

export default App;