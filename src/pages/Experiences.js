import React from 'react';
import Section from '../components/Section';
import Journey from '../assets/Journey.jpg';
import Me from '../assets/Me.jpg';
import OCBCBankLogo from '../assets/OCBC-Bank-Logo.jpg';
import '../css/App.css';
import '../css/Experiences.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSquareCheck} from '@fortawesome/free-solid-svg-icons';


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
          <p className='para2'> <img className='ocbc' src={OCBCBankLogo} alt='/' /> OCBC Bank</p>
          <p className='para3'>
            Software Engineer (Tech Lead)       
            <span>Oct 2021 – Current</span>
          </p>
          <ul className='no-bullets'>
           <li>
            <FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: "8px"}}/>
            Spearheaded the successful decommission of monolith framework to micro-services. Fully transitioned Trade Finance module from vendor managed to in-house.
           </li>
           <li>
            <FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: "8px"}}/>
            Led team of 5 developers from Singapore and China and managed over 20 different micro-services through Agile development methodology. Resulted in an increase in project deliveries by more than 50%.
           </li>
           <li>
            <FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: "8px"}}/>
            Collaborated with cross-functional teams to align new business and regulatory requirements. The team managed to deliver all regulatory mandated projects within given timeframe while maintaining code quality and security.
           </li>
           <li>
            <FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: "8px"}}/>
            Implemented Trade Finance services to Vietnam market. Allowing existing Vietnamese customers to apply for Trade Finance products online instead of over the counter, contributing to a 20% increase in Trade Finance sales in Vietnam. Future expansion includes Thailand and Indonesia.
           </li>
           <li>
            <FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: "8px"}}/>
            Maintained Trade Finance micro-services codes and ensured code quality and low bug counts. The team had successfully fix and deployed over 100 legacy system issues and bugs raised by product owner and customers.
           </li>
           <li>
            <FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: "8px"}}/>
            Executed various technical upgrades and exercises to ensure the resiliency of technical systems such as Kafka broker upgrade, data migration exercise, disaster recovery system exercise.
           </li>
           <li>
            <FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: "8px"}}/>
            Utilized and proficient with various technical software crucial to software development such as Databases, CI/CD tools (Sonarqube and Blackduck), Kafka, Kubenetes and control-m.
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
        <div className='key-skills'>
         <h6 className='title3'>Upskilling</h6>
         <ul className='tick-bullets'>
           <li>
            Python
           </li>
           <li>
            Data Analyst
           </li>
           <li>
            Machine Learning
           </li>
          </ul>
        </div>
      </Section>
      <Section id="section3">
      <div className='past-experiences'>
        <h2>Past Experiences</h2>
        <p className='para4'>SMRT Trains Ltd</p>
        <p className='para5'>
          Senior Executive – Strategic Planning                    
          <span>2018 – 2021</span>
        </p>
        <ul className='no-bullets'>
           <li>
            <FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: "8px"}}/>
            Spearheaded the development and UAT of Kaizen engagement portal to collect employees’ initiatives to improve company’s processes through liaising with various business units.
           </li>
           <li>
            <FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: "8px"}}/>
            Developed PowerBI dashboard for senior management to monitor feedbacks collected through the portal. The number of new initiatives raised by employees increased by 120%.
           </li>
           <li>
            <FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: "8px"}}/>
            Directed the development and UAT of several digitalisation projects of maintenance approval forms through discussions with maintenance teams to understand the project requirements and workflows.
           </li>
           <li>
            <FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: "8px"}}/>
            Successfully improved the efficiency of maintenance approval process from 6 days to 1 day and reduced the reliance of hardcopy forms through the adoption of electronic forms.
           </li>
           <li>
            <FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: "8px"}}/>
            Ensured the accuracy and integrity of KPI data in reports for submission to higher authorities.
           </li>
           <li>
            <FontAwesomeIcon icon={faSquareCheck} style={{ marginRight: "8px"}}/>
            Developed dashboard using PowerBI to illustrate the KPIs status for higher management review.
           </li>
        </ul>
      </div>
      <div className='past-experiences'>
        <h2>Education</h2>
        <p className='para4'>National University of Singapore</p>
        <p className='para5'>
          B.E Hons in Material Science and Engineering                    
          <span>2014 – 2018</span>
        </p>
      </div>
      </Section>
    </div>
  );
  }