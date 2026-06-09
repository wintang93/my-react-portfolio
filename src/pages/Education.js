import React from 'react';
import Section from '../components/Section';
import '../css/App.css';
import '../css/Education.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareCheck, faGraduationCap, faCertificate } from '@fortawesome/free-solid-svg-icons';

export default function Education() {
  return (
    <div className="App">
      <Section id="edu-hero">
        <h2 className='edu-hero-title'>Education &amp; Certifications</h2>
      </Section>

      <Section id="edu-main">
        <h2 className='title2'>Academic Background</h2>

        <div className='edu-grid'>

          {/* MTech */}
          <div className='edu-card'>
            <div className='edu-card-icon'>
              <FontAwesomeIcon icon={faGraduationCap} />
            </div>
            <div className='edu-card-body'>
              <p className='edu-institution'>National University of Singapore</p>
              <p className='edu-degree'>Master of Technology in Artificial Intelligence Systems <span className='edu-mode'>(Part-time)</span></p>
              <p className='edu-date'>Jul 2025 – Present</p>
              <ul className='no-bullets'>
                <li><FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: '8px' }} />Core modules: Intelligent Reasoning Systems, Pattern Recognition Systems.</li>
                <li><FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: '8px' }} />Hands-on experience with ML algorithms, neural networks, computer vision, and NLP through applied projects.</li>
              </ul>
            </div>
          </div>

          {/* BEng */}
          <div className='edu-card'>
            <div className='edu-card-icon'>
              <FontAwesomeIcon icon={faGraduationCap} />
            </div>
            <div className='edu-card-body'>
              <p className='edu-institution'>National University of Singapore</p>
              <p className='edu-degree'>B.Eng. (Hons) in Materials Science &amp; Engineering</p>
              <p className='edu-date'>Aug 2014 – May 2018</p>
            </div>
          </div>

        </div>

        <h2 className='title2' style={{ marginTop: '2.5rem' }}>Certifications</h2>

        <div className='cert-grid'>
          {[
            { name: 'Cognitive Systems', date: 'Apr 2026', url: 'https://credentials.nus.edu.sg/9fa38213-7f48-4465-8342-dc2321202985#acc.DwNRJqVb' },
            { name: 'Reasoning Systems', date: 'Apr 2026', url: 'https://credentials.nus.edu.sg/0214e2f4-3548-4ae9-bfc2-1d972864bf11#acc.gaWzCpjO' },
            { name: 'Machine Reasoning', date: 'Mar 2026', url: 'https://credentials.nus.edu.sg/4f861fe8-b174-4349-b5fc-11402683f5f7#acc.m2wpTNIO' },
            { name: 'Intelligent Sensing and Sense Making', date: 'Nov 2025', url: 'https://credentials.nus.edu.sg/44c6bc27-a724-4071-be01-c26c18fdcb82' },
            { name: 'Pattern Recognition and Machine Learning Systems', date: 'Nov 2025', url: 'https://credentials.nus.edu.sg/5367bb7d-7d33-45e3-a427-bf5525a6a243' },
            { name: 'Problem Solving using Pattern Recognition', date: 'Sep 2025', url: 'https://credentials.nus.edu.sg/3975138b-f4a6-4969-82fd-ed6e2b99cda4' },
          ].map(cert => (
            <a key={cert.name} className='cert-card' href={cert.url} target='_blank' rel='noreferrer'>
              <div className='cert-icon'>
                <FontAwesomeIcon icon={faCertificate} />
              </div>
              <div className='cert-body'>
                <p className='cert-name'>{cert.name}</p>
                <p className='cert-meta'>National University of Singapore &middot; {cert.date}</p>
              </div>
            </a>
          ))}
        </div>
      </Section>
    </div>
  );
}
