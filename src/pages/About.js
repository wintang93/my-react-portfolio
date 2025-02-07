import React from 'react';
import Section from '../components/Section';
import Journey from '../assets/Journey.jpg';
import Me from '../assets/Me.jpg';
import '../css/App.css';
import '../css/About.css';


export default function About() {
  return (
    <div className="App">
      <Section id="section1" bgImage={Journey}>
      <h2 className='title1'>Professional Experience</h2>
      {/* <p className='para1'>My Journey</p> */}
      </Section>
      
      <Section id="section2">
        <h2 className='title2'>Full-stack developer</h2>
        <img className='Me' src={Me} alt='/'/>
        <p className='para2'>OCBC Bank</p>
        <p className='para3' style={{textAlign: 'left'}}>Software Engineer (Tech Lead)<br/><span>Oct 2021 – Current</span></p>
      </Section>
      
      <Section id="section3">
        <h2>Third Section</h2>
        <p>Content for section 3</p>
      </Section>
    </div>
  );
  }