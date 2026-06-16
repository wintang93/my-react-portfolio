import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareCheck, faDownload } from '@fortawesome/free-solid-svg-icons';
import OCBCBankLogo from '../assets/OCBC-Bank-Logo.jpg';
import ChatWidget from '../components/ChatWidget';
import '../css/Portfolio.css';

const CV_URL = `${process.env.PUBLIC_URL}/Sherwin_Tang_Software_Developer.pdf`;
const GITHUB_URL = 'https://github.com/wintang93';
const LINKEDIN_URL = 'https://www.linkedin.com/in/sherwin-tang-software-engineer';

const SKILL_GROUPS = [
  {
    label: 'AI / Machine Learning',
    accent: true,
    items: ['LLMs & GenAI', 'RAG / LangChain', 'Hugging Face', 'PyTorch / TF', 'Pinecone / Vector DBs', 'Knowledge Graphs', 'Neuro-symbolic'],
  },
  {
    label: 'Languages & Web',
    items: ['Python', 'Java', 'JavaScript', 'React.js', 'Node.js', 'Spring Boot', 'Streamlit'],
  },
  {
    label: 'Cloud & DevOps',
    items: ['Kubernetes / OpenShift', 'Helm', 'Kafka', 'CI/CD', 'AWS (S3)', 'Control-M'],
  },
  {
    label: 'Data & Practices',
    items: ['Oracle', 'PostgreSQL', 'Microservices', 'Agile / Scrum', 'TDD & Integration Testing'],
  },
];

const EXPERIENCE = [
  {
    role: 'Software Engineer · Team Lead',
    org: 'OCBC Bank · Trade Finance Squad',
    date: 'Oct 2021 – Present',
    logo: OCBCBankLogo,
    filled: true,
    bullets: [
      'Led migration from a monolith to microservices — improving system efficiency ~50% and reducing operational cost ~20%.',
      'Managed a cross-border team (Singapore & China) across 20+ microservices using Agile, raising delivery throughput.',
      'Spearheaded the launch of Trade Finance in Vietnam, enabling online applications and lifting transaction volume ~20%.',
      'Led development of the Export Documentary Collection product — a fully online application channel.',
      'Partnered with POs, UX designers & BAs to translate business and regulatory needs into solutions with a 100% compliance record.',
      'Executed resiliency upgrades: Kafka broker upgrades, data-migration exercises and disaster-recovery simulations.',
    ],
  },
  {
    role: 'Senior Executive · Digital Transformation',
    org: 'SMRT Trains Ltd · Strategic Planning',
    date: 'Jul 2018 – Jul 2021',
    filled: false,
    bullets: [
      'Led development and UAT of a Kaizen engagement portal, growing employee-driven process-improvement initiatives.',
      'Built a Power BI dashboard giving senior management real-time visibility into employee feedback and initiatives.',
      'Directed digitalisation of maintenance-approval workflows — cutting approval time from 6 days to 1 and paper use ~75%.',
    ],
  },
];

const CERTS = [
  { name: 'Cognitive Systems', date: 'Apr 2026', url: 'https://credentials.nus.edu.sg/9fa38213-7f48-4465-8342-dc2321202985' },
  { name: 'Reasoning Systems', date: 'Apr 2026', url: 'https://credentials.nus.edu.sg/0214e2f4-3548-4ae9-bfc2-1d972864bf11' },
  { name: 'Machine Reasoning', date: 'Mar 2026', url: 'https://credentials.nus.edu.sg/4f861fe8-b174-4349-b5fc-11402683f5f7' },
  { name: 'Intelligent Sensing & Sense Making', date: 'Nov 2025', url: 'https://credentials.nus.edu.sg/44c6bc27-a724-4071-be01-c26c18fdcb82' },
  { name: 'Pattern Recognition & ML Systems', date: 'Nov 2025', url: 'https://credentials.nus.edu.sg/5367bb7d-7d33-45e3-a427-bf5525a6a243' },
  { name: 'Problem Solving using Pattern Recognition', date: 'Sep 2025', url: 'https://credentials.nus.edu.sg/3975138b-f4a6-4969-82fd-ed6e2b99cda4' },
];

const PROJECTS = [
  {
    id: 'wellnessbot',
    title: 'WellnessBot',
    year: '2026',
    course: 'NUS MTech · Intelligent Reasoning Systems',
    description:
      'An explainable clinical decision-support assistant for post-arthroscopic knee rehab. Neuro-symbolic (knowledge graph + rule-based reasoning) with a constrained RAG/LLM layer, so every clinical decision stays deterministic, transparent and auditable.',
    tech: ['Python', 'RAG', 'Knowledge Graph', 'Streamlit'],
    embedUrl: null,
    githubUrl: null,
  },
  {
    id: 'rag-qa',
    title: 'RAG Q&A System',
    year: '2025',
    course: 'NUS MTech · RAG Workshop',
    description:
      'An end-to-end RAG pipeline built with LangChain that answers document- and FAQ-grounded queries from a custom knowledge base — grounding every response in retrieved source content to reduce hallucination.',
    tech: ['LangChain', 'Hugging Face', 'Pinecone', 'OpenAI API'],
    embedUrl: null,
    githubUrl: null,
  },
];

const scrollTo = (id) => (e) => {
  if (e) e.preventDefault();
  const el = document.getElementById(id);
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 4, behavior: 'smooth' });
};

export default function Portfolio() {
  const [activeEmbed, setActiveEmbed] = useState(null);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section id="home" className="pf-hero">
        <div className="pf-eyebrow">Software Engineer · AI / ML</div>
        <h1>Hi, I'm Sherwin —<br />I build reliable,<br />explainable software.</h1>
        <p className="pf-hero-lead">
          Full-stack engineer at Financial Institue with <strong>7+ years</strong> of experience and 4+ years delivering production
          systems at scale — now expanding into applied AI, ML and Generative AI through an NUS MTech, with
          hands-on LLM / RAG and reasoning-based work.
        </p>
        <div className="pf-cta-row">
          <a href="#projects" onClick={scrollTo('projects')} className="pf-btn pf-btn--solid">View my work&nbsp;→</a>
          <a href={CV_URL} download className="pf-btn pf-btn--outline"><FontAwesomeIcon icon={faDownload} /> Résumé (PDF)</a>
        </div>
        <div className="pf-stats">
          <div><div className="pf-stat-num">7+</div><div className="pf-stat-label">years experience</div></div>
          <div><div className="pf-stat-num">20+</div><div className="pf-stat-label">microservices led</div></div>
          <div><div className="pf-stat-num">6</div><div className="pf-stat-label">NUS AI certs</div></div>
        </div>
      </section>

      {/* ---------- ABOUT ---------- */}
      <section id="about" className="pf-section pf-section--alt pf-reveal">
        <div className="pf-section-head">
          <span className="pf-section-num">01</span>
          <h2 className="pf-section-title">About</h2>
          <div className="pf-section-rule" />
        </div>
        <div className="pf-prose">
          <p>I'm a software engineer and tech lead at OCBC Bank, where I lead a cross-border team building and scaling trade-finance microservices. I like taking ideas from concept to working software — rapid POCs, MVPs and end-to-end integration that actually ships.</p>
          <p>Lately I've been going deep on applied AI through an NUS MTech in AI Systems, building LLM / RAG pipelines and neuro-symbolic reasoning systems. My main interest: <strong>explainable, reliable AI</strong> for real-world, safety-critical applications — where decisions need to be transparent and auditable, not opaque.</p>
        </div>
      </section>

      {/* ---------- SKILLS ---------- */}
      <section id="skills" className="pf-section pf-reveal">
        <div className="pf-section-head">
          <span className="pf-section-num">02</span>
          <h2 className="pf-section-title">Skills</h2>
          <div className="pf-section-rule" />
        </div>
        <div className="pf-skill-grid">
          {SKILL_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="pf-skill-group-label">{group.label}</div>
              <div className="pf-badges">
                {group.items.map((item) => (
                  <span key={item} className={`pf-badge${group.accent ? ' pf-badge--accent' : ''}`}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- EXPERIENCE ---------- */}
      <section id="experience" className="pf-section pf-section--alt pf-reveal">
        <div className="pf-section-head">
          <span className="pf-section-num">03</span>
          <h2 className="pf-section-title">Experience</h2>
          <div className="pf-section-rule" />
        </div>
        <div className="pf-timeline">
          {EXPERIENCE.map((job) => (
            <div key={job.role} className="pf-tl-item">
              <div className={`pf-tl-dot ${job.filled ? 'pf-tl-dot--filled' : 'pf-tl-dot--open'}`} />
              <div className="pf-tl-head">
                {job.logo && <img className="pf-tl-logo" src={job.logo} alt="" />}
                <span className="pf-tl-role">{job.role}</span>
                <span className="pf-tl-date">{job.date}</span>
              </div>
              <div className="pf-tl-org">{job.org}</div>
              <ul className="pf-bullets">
                {job.bullets.map((b, i) => (
                  <li key={i}><FontAwesomeIcon icon={faSquareCheck} />{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- EDUCATION ---------- */}
      <section id="education" className="pf-section pf-reveal">
        <div className="pf-section-head">
          <span className="pf-section-num">04</span>
          <h2 className="pf-section-title">Education</h2>
          <div className="pf-section-rule" />
        </div>
        <div className="pf-edu-grid">
          <div className="pf-edu-card">
            <div className="pf-edu-date">Jul 2025 – Present</div>
            <div className="pf-edu-degree">M.Tech in Artificial Intelligence Systems</div>
            <div className="pf-edu-inst">National University of Singapore · Part-time</div>
            <div className="pf-edu-note">Core: Intelligent Reasoning Systems, Pattern Recognition Systems. Applied work across ML, neural networks, computer vision and NLP.</div>
          </div>
          <div className="pf-edu-card">
            <div className="pf-edu-date">Aug 2014 – May 2018</div>
            <div className="pf-edu-degree">B.Eng. (Hons), Materials Science &amp; Engineering</div>
            <div className="pf-edu-inst">National University of Singapore</div>
          </div>
        </div>
        <div className="pf-skill-group-label" style={{ marginBottom: '12px' }}>NUS Certifications</div>
        <div className="pf-cert-grid">
          {CERTS.map((c) => (
            <a key={c.name} className="pf-cert-card" href={c.url} target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faSquareCheck} />
              <span>
                <span className="pf-cert-name">{c.name}</span>
                <div className="pf-cert-meta">{c.date}</div>
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ---------- PROJECTS ---------- */}
      <section id="projects" className="pf-section pf-section--alt pf-reveal">
        <div className="pf-section-head">
          <span className="pf-section-num">05</span>
          <h2 className="pf-section-title">AI / ML Projects</h2>
          <div className="pf-section-rule" />
        </div>
        <div className="pf-proj-grid">
          {PROJECTS.map((p) => (
            <div key={p.id} className="pf-proj-card">
              <div className="pf-proj-top">
                <div className="pf-proj-title">{p.title}</div>
                <span className="pf-proj-year">{p.year}</span>
              </div>
              <div className="pf-proj-course">{p.course}</div>
              <p className="pf-proj-desc">{p.description}</p>
              <div className="pf-proj-stack">
                {p.tech.map((t) => <span key={t} className="pf-tech">{t}</span>)}
              </div>
              <div className="pf-proj-actions">
                {p.embedUrl ? (
                  <button
                    className="pf-proj-btn pf-proj-btn--solid"
                    onClick={() => setActiveEmbed(activeEmbed === p.id ? null : p.id)}
                  >
                    {activeEmbed === p.id ? 'Close demo' : 'Live demo'}
                  </button>
                ) : (
                  <span className="pf-proj-btn pf-proj-btn--disabled">Live demo · soon</span>
                )}
                {p.githubUrl && (
                  <a className="pf-proj-btn" href={p.githubUrl} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
                )}
              </div>
              {activeEmbed === p.id && p.embedUrl && (
                <div className="pf-proj-embed">
                  <iframe src={p.embedUrl} title={p.title} allow="clipboard-write" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CONTACT ---------- */}
      <section id="contact" className="pf-section pf-reveal">
        <div className="pf-contact">
          <div className="pf-eyebrow">06 · Contact</div>
          <h2>Let's build something reliable.</h2>
          <p className="pf-contact-lead">Open to roles in software &amp; applied AI engineering. The fastest way to reach me is email or LinkedIn.</p>
          <div className="pf-cta-row">
            <a href="mailto:sherwintang93@hotmail.sg" className="pf-btn pf-btn--solid">Email me</a>
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="pf-btn pf-btn--outline">LinkedIn ↗</a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="pf-btn pf-btn--outline">GitHub ↗</a>
            <a href={CV_URL} download className="pf-btn pf-btn--outline"><FontAwesomeIcon icon={faDownload} /> Résumé</a>
          </div>
          <div className="pf-footer">© {new Date().getFullYear()} Sherwin Tang · Singapore · Built with React</div>
        </div>
      </section>

      {/* ---------- FLOATING CHATBOT (bottom-right of the home page) ---------- */}
      <ChatWidget />
    </>
  );
}
