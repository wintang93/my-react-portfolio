import React, { useState } from 'react';
import '../css/Projects.css';

const PROJECTS = [
  {
    id: 'wellnessbot',
    title: 'WellnessBot — Rehabilitation Decision Support System',
    year: '2026',
    course: 'NUS MTech in AI Systems · Intelligent Reasoning Systems',
    description:
      'A home-based, explainable clinical decision-support assistant for post-arthroscopic knee rehabilitation. Built on a neuro-symbolic architecture (knowledge graph + rule-based reasoning) with a constrained RAG/LLM layer, so all clinical decisions remain deterministic, transparent, and auditable.',
    stack: 'Python · OpenAI API · RAG · Knowledge Graph · Rule-based Reasoning · Streamlit',
    embedUrl: null, // replace with your Streamlit Cloud URL, e.g. 'https://your-app.streamlit.app/?embed=true'
    githubUrl: null, // replace with your GitHub repo URL
  },
  {
    id: 'rag-qa',
    title: 'Retrieval-Augmented Generation (RAG) Q&A System',
    year: '2025',
    course: 'NUS MTech in AI Systems · RAG Workshop',
    description:
      'An end-to-end RAG pipeline built with LangChain that answers document- and FAQ-grounded user queries from a custom knowledge base, grounding every response in retrieved source content to reduce hallucination.',
    stack: 'Python · LangChain · Hugging Face Transformers · Pinecone · OpenAI API',
    embedUrl: null,
    githubUrl: null,
  },
];

export default function Projects() {
  const [activeEmbed, setActiveEmbed] = useState(null);

  return (
    <div className='projects-page'>
      <h1 className='projects-heading'>AI / Machine Learning Projects</h1>
      <div className='projects-grid'>
        {PROJECTS.map((project) => (
          <div key={project.id} className='project-card'>
            <div className='project-card-header'>
              <div>
                <h3 className='project-title'>{project.title}</h3>
                <p className='project-course'>{project.course}</p>
              </div>
              <span className='project-year'>{project.year}</span>
            </div>
            <p className='project-description'>{project.description}</p>
            <p className='project-stack'><strong>Stack:</strong> {project.stack}</p>
            <div className='project-actions'>
              {project.embedUrl ? (
                <button
                  className='btn-demo'
                  onClick={() => setActiveEmbed(activeEmbed === project.id ? null : project.id)}
                >
                  {activeEmbed === project.id ? 'Close Demo' : 'Live Demo'}
                </button>
              ) : (
                <span className='btn-demo btn-demo--disabled' title='Deploy to Streamlit Cloud to enable live demo'>
                  Live Demo (coming soon)
                </span>
              )}
              {project.githubUrl && (
                <a
                  className='btn-github'
                  href={project.githubUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  GitHub
                </a>
              )}
            </div>
            {activeEmbed === project.id && project.embedUrl && (
              <div className='project-embed'>
                <iframe
                  src={project.embedUrl}
                  title={project.title}
                  width='100%'
                  height='700px'
                  frameBorder='0'
                  allow='clipboard-write'
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
