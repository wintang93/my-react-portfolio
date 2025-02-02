import { useState, useRef, useEffect } from 'react';

function Timer() {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false); // Track if timer is active
  const intervalRef = useRef();

  // Start the timer
  const handleStart = () => {
    if (!isRunning) {
      intervalRef.current = setInterval(() => {
        setCount((prev) => prev + 1); // Increment count every second
      }, 1000);
      setIsRunning(true); // Mark as running
    }
  };

  // Stop/Pause the timer
  const handleStop = () => {
    if (isRunning) {
      clearInterval(intervalRef.current); // Clear the interval
      setIsRunning(false); // Mark as stopped
    }
  };

  // Reset the timer to 0 and stop it
  const handleReset = () => {
    clearInterval(intervalRef.current); // Clear interval (if running)
    setCount(0); // Reset count
    setIsRunning(false); // Ensure timer is marked as stopped
  };

  // Cleanup: Clear interval on unmount
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div>
      <div>Timer: {count} seconds</div>
      <button onClick={handleStart} disabled={isRunning}>
        Start
      </button>
      <button onClick={handleStop} disabled={!isRunning}>
        Stop
      </button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
}

export default Timer;