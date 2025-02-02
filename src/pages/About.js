import React from 'react';
import Section from '../components/Section';
import '../css/App.css';

export default function About() {
  return (
    <div className="App">
      <Section id="section1">
        <h2>First Section</h2>
        <p>Content for section 1</p>
      </Section>
      
      <Section id="section2">
        <h2>Second Section</h2>
        <p>Content for section 2</p>
      </Section>
      
      <Section id="section3">
        <h2>Third Section</h2>
        <p>Content for section 3</p>
      </Section>
    </div>
  );
  }