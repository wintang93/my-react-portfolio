import React from 'react';
import Section from '../components/Section';
import Journey from '../assets/Journey.jpg';
import Me from '../assets/Me.jpg';
import '../css/App.css';
import '../css/About.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faList} from '@fortawesome/free-solid-svg-icons';


export default function About() {
  return (
    <div className="App">
      <Section id="section1" bgImage={Journey}>
      <h2 className='title1'>Professional Experience</h2>
      {/* <p className='para1'>My Journey</p> */}
      </Section>
      
      <Section id="section2">
        <h2 className='title2'>Full-Stack Developer</h2>
        <img className='Me' src={Me} alt='/'/>
        <div className='prof-details'>
          <p className='para2'>OCBC Bank</p>
          <p className='para3'>
            Software Engineer (Tech Lead)       
            <span>Oct 2021 – Current</span>
          </p>
          <ul className='no-bullets'>
           <li>
            <FontAwesomeIcon icon={faList} style={{ marginRight: "8px"}}/>
            Lead a team of developers from Singapore and China, managing development tasks and tech upgrade assignments.
           </li>
           <li>
            <FontAwesomeIcon icon={faList} style={{ marginRight: "8px"}}/>
            Manage and enhance OCBC trade finance facilities using Micro-frontend and Micro-services through an Agile development framework. 
           </li>
           <li>
            <FontAwesomeIcon icon={faList} style={{ marginRight: "8px"}}/>
            Deliver more than 10 projects / enhancements through close collaboration with product owners, business analysts, and technical architects.
           </li>
           <li>
            <FontAwesomeIcon icon={faList} style={{ marginRight: "8px"}}/>
            Reslove more than 1000 legacy system issues / bugs raised by users. Ensure the successful deployment of the fixes to production.
           </li>
           <li>
            <FontAwesomeIcon icon={faList} style={{ marginRight: "8px"}}/>
            Work with vendors, IT security, DevOps, and various IT departments on tech projects such as decommissioning monolith frameworks, migrating codes, upgrading Kafka brokers, data migration, and disaster recovery exercises.
           </li>
           <li>
            <FontAwesomeIcon icon={faList} style={{ marginRight: "8px"}}/>
            Ensure code quality and security through code reviews, CI/CD deployment, and improving test coverage for micro-frontend and micro-services.
           </li>
          </ul>
          <a href="/Sherwin_Tang_Software_Developer.pdf" download="Sherwin_CV.pdf">
            Download PDF
          </a>
        </div>
        <div className='key-skills'>
         <h6 className='title3'>Key Skills</h6>
         <ul className='tick-bullets'>
           <li>
            Javascript with React.js
           </li>
           <li>
            HTML / CSS
           </li>
           <li>
            Java
           </li>
           <li>
            SQL
           </li>
           <li>
            Kafka
           </li>
           <li>
            UNIX
           </li>
           <li>
            Kubernetes
           </li>
           <li>
            control-m
           </li>
           <li>
            Oracle / Postgres
           </li>
           <li>
            Blackduck / Sonarqube
           </li>
           <li>
            Leadership
           </li>
          </ul>
        </div>
      </Section>
      
      <Section id="section3">
        <h2>Past Experience</h2>
      </Section>
    </div>
  );
  }