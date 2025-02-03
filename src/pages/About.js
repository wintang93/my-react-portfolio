import React from 'react';
import Section from '../components/Section';
import Journey from '../assets/Journey.jpg'
import '../css/App.css';

export default function About() {
  return (
    <div className="App">
      <Section id="section1" bgImage={Journey} className>
      <h2 
      style={{ 
        backgroundColor: "rgba(0, 0, 0, 0.5)", 
        color: "white", 
        padding: "20px", 
        marginBottom: 0
      }}
      >Professional Experiences</h2>
      <p 
        style={{ 
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        color: "white", 
        padding: "20px", 
        margin: "0px 0px"
      }}
      >My Journey</p>
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