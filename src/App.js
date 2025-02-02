import { Routes, Route } from 'react-router-dom';
import Navibar from './components/Navibar';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Snake from './pages/Snake';
import Timer from './pages/Timer'
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <>
      <Navibar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/snake" element={<Snake />} />
        <Route path="/Timer" element={<Timer />} />
      </Routes>
    </>
  );
}

export default App;