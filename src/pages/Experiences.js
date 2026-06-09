import React from 'react';
import Section from '../components/Section';
import Journey from '../assets/Journey.jpg';
import Me from '../assets/Me.jpg';
import OCBCBankLogo from '../assets/OCBC-Bank-Logo.jpg';
import '../css/App.css';
import '../css/Experiences.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareCheck, faDownload } from '@fortawesome/free-solid-svg-icons';

const TECHNICAL_SKILLS = [
  'Python', 'Java', 'JavaScript / React.js', 'HTML / CSS',
  'LLMs & Generative AI', 'RAG / LangChain', 'Hugging Face Transformers',
  'PyTorch / TensorFlow', 'Pinecone / Vector DBs', 'Kafka',
  'Kubernetes / OpenShift', 'AWS (S3)', 'CI/CD (SonarQube, BlackDuck)',
  'Oracle / PostgreSQL', 'Spring Boot', 'Streamlit', 'UNIX', 'Control-M',
];

export default function Experiences() {
  return (
    <div className="App">
      <Section id="section1" bgImage={Journey}>
        <h2 className='title1'>Professional Experience</h2>
      </Section>

      <Section id="section2">
        <div className='two-col-layout'>

          {/* Left: profile + skills */}
          <div className='left-col'>
            <div className='profile-card'>
              <img className='Me' src={Me} alt='Sherwin Tang' />
              <div className='profile-bio'>
                <h3>Sherwin Tang</h3>
                <p>Full-Stack Software Engineer &amp; Tech Lead with experience in trade finance systems, digital transformation, and AI/ML engineering.</p>
                <a className='cv-download-btn' href="/Sherwin_Tang_Software_Developer.pdf" download="Sherwin_CV.pdf">
                  <FontAwesomeIcon icon={faDownload} /> Download CV
                </a>
              </div>
            </div>

            <div className='key-skills'>
              <h6 className='title3'>Technical Skills</h6>
              <ul className='skill-badges'>
                {TECHNICAL_SKILLS.map(skill => (
                  <li key={skill} className='skill-badge'>{skill}</li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right: work history */}
          <div className='right-col'>
            <h2 className='title2'>Work Experiences</h2>

            <div className='timeline'>

              {/* OCBC */}
              <div className='timeline-block'>
                <div className='timeline-card'>
                  <div className='timeline-card-header'>
                    <div className='timeline-card-title'>
                      <img className='ocbc' src={OCBCBankLogo} alt='OCBC' />
                      <div>
                        <p className='para2'>OCBC Bank</p>
                        <p className='para3'>
                          Software Engineer (Trade Finance Squad) — Team Lead
                          <span className='date-badge'>Oct 2021 – Present</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <ul className='no-bullets'>
                    <li><FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: '8px' }} />Led the migration from a monolithic architecture to microservices, improving system efficiency by ~50% and reducing operational costs by ~20%.</li>
                    <li><FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: '8px' }} />Managed a cross-border development team (Singapore &amp; China) across 20+ microservices using Agile, increasing project delivery throughput.</li>
                    <li><FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: '8px' }} />Partnered with Product Owners, UX Designers, and Business Analysts to translate new business and regulatory requirements into delivered solutions with a 100% compliance record.</li>
                    <li><FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: '8px' }} />Spearheaded the launch of Trade Finance services in Vietnam, enabling online applications and increasing transaction volume by ~20%.</li>
                    <li><FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: '8px' }} />Led development and deployment of the Export Documentary Collection product, introducing a fully online application channel and substantially increasing adoption.</li>
                    <li><FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: '8px' }} />Maintained and optimised Trade Finance microservices through unit testing, legacy-issue resolution, and production deployments, improving system reliability.</li>
                    <li><FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: '8px' }} />Executed technical upgrades for system resiliency, including Kafka broker upgrades, data-migration exercises, and disaster-recovery (DR) simulations.</li>
                    <li><FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: '8px' }} />Delivered key enhancements: redesigned web interfaces and APIs for simpler document resubmission; improved transaction-status workflows and notifications; regionalized products across APAC; integrated third-party SSO for a smoother authentication flow.</li>
                    <li><FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: '8px' }} />Worked across databases, data processing, and data analysis, with CI/CD tooling (SonarQube, BlackDuck), Kafka, Kubernetes, and Control-M.</li>
                  </ul>
                </div>
              </div>

              {/* SMRT */}
              <div className='timeline-block'>
                <div className='timeline-card'>
                  <div className='timeline-card-header'>
                    <div className='timeline-card-title'>
                      <div>
                        <p className='para2'>SMRT Trains Ltd</p>
                        <p className='para3'>
                          Senior Executive — Strategic Planning &amp; Digital Transformation
                          <span className='date-badge'>Jul 2018 – Jul 2021</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <ul className='no-bullets'>
                    <li><FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: '8px' }} />Led development and UAT of a Kaizen engagement portal, significantly increasing employee-driven process-improvement initiatives.</li>
                    <li><FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: '8px' }} />Built a Power BI dashboard giving senior management real-time visibility into employee feedback and initiatives.</li>
                    <li><FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: '8px' }} />Directed digitalisation of maintenance approval workflows, reducing approval time from 6 days to 1 day and cutting paper usage by ~75%.</li>
                    <li><FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: '8px' }} />Ensured KPI accuracy in regulatory reports and created data-driven dashboards for management insight.</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>

        </div>
      </Section>
    </div>
  );
}
