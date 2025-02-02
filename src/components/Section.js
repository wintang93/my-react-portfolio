import React, { useEffect, useRef, useState } from 'react';
import '../css/Styles.css';

const Section = ({ children, id }) => {
  const [isActive, setIsActive] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsActive(true);
        //   observer.unobserve(entry.target); // Stop observing after animation
        }
      },
      { threshold: 0.5 } // Trigger when 50% visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section 
      ref={sectionRef} 
      id={id}
      className={`section ${isActive ? 'active' : ''}`}
    >
      {children}
    </section>
  );
};

export default Section;