import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faDownload, faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import Me from '../assets/Me.jpg';
import '../css/Portfolio.css';

const NAV = [
  ['home', 'Home'], ['about', 'About'], ['skills', 'Skills'],
  ['experience', 'Experience'], ['education', 'Education'],
  ['projects', 'Projects'], ['contact', 'Contact'],
];

const CV_URL = `${process.env.PUBLIC_URL}/Sherwin_Tang_Software_Developer.pdf`;

export default function Sidebar() {
  const [active, setActive] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === '/';

  useEffect(() => {
    if (!onHome) return;
    const secs = NAV.map(([id]) => document.getElementById(id)).filter(Boolean);
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    secs.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [onHome]);

  const go = useCallback((id) => (e) => {
    if (e) e.preventDefault();
    setMenuOpen(false);
    const scroll = () => {
      const el = document.getElementById(id);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 4, behavior: 'smooth' });
    };
    if (!onHome) { navigate('/'); setTimeout(scroll, 90); } else { scroll(); }
  }, [onHome, navigate]);

  return (
    <aside className={`pf-sidebar${menuOpen ? ' open' : ''}`}>
      <div className="pf-id">
        <img className="pf-avatar" src={Me} alt="Sherwin Tang" />
        <div className="pf-id-text">
          <div className="pf-name">Sherwin Tang</div>
          <div className="pf-role">AI / ML Engineer · Full-Stack SWE</div>
        </div>
        <button
          className="pf-menu-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} />
        </button>
      </div>

      <div className="pf-sidebar-body">
        <div className="pf-contacts">
          <a href="mailto:sherwintang93@gmail.com"><FontAwesomeIcon icon={faEnvelope} /> sherwintang93@gmail.com</a>
          {/* <a href="tel:+6594777959"><FontAwesomeIcon icon={faPhone} /> +65 9477 7959</a> */}
          <a href="https://www.linkedin.com/in/sherwin-tang-software-engineer" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faLinkedin} /> LinkedIn</a>
          <a href="https://github.com/wintang93" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faGithub} /> GitHub</a>
        </div>

        <div className="pf-divider" />

        <nav className="pf-nav">
          {NAV.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={go(id)}
              className={`pf-nav-link${active === id ? ' active' : ''}`}
            >
              {label}
            </a>
          ))}
        </nav>

        <a className="pf-cv" href={CV_URL} download>
          <FontAwesomeIcon icon={faDownload} /> Download Résumé
        </a>
      </div>
    </aside>
  );
}
