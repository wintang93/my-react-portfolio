import React, { useEffect, useRef, useState, useMemo } from 'react';
import '../css/Styles.css';

const Section = ({ children, id, bgImage }) => {
  const [isActive, setIsActive] = useState(false);
  const sectionRef = useRef(null);

  console.log("Passing bgImage:", bgImage);

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

  const sectionStyles = useMemo(() => {
    console.log("Computing styles... bgImage:", bgImage);
    return bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" } : {};
  }, [bgImage]);

  return (
    <section 
      ref={sectionRef} 
      id={id}
      className={`section ${isActive ? 'active' : ''}`}
      style={{
        ...sectionStyles
      }}
    >
      {children}
    </section>
  );
};

export default Section;