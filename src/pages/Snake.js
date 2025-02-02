import React, { useState, useEffect, useRef, useCallback } from 'react';

const SnakeGame = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(false);
  
  // Game state refs (better for frequently changing values)
  const gameState = useRef({
    snake: [],
    food: {},
    dx: 20,
    dy: 0,
    gridSize: 20,
    tileCount: 20,
    context: null,
    gameInterval: null,
    gameSpeed: 100,
    score: 0
  });

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    gameState.current.context = canvas.getContext('2d');
    gameState.current.tileCount = canvas.width / gameState.current.gridSize;
    startGame();
  }, []);

  const startGame = () => {
    const { gridSize, tileCount, context } = gameState.current;
    gameState.current.snake = [
      { x: 5 * gridSize, y: 5 * gridSize },
      { x: 4 * gridSize, y: 5 * gridSize },
      { x: 3 * gridSize, y: 5 * gridSize }
    ];
    gameState.current.dx = gridSize;
    gameState.current.dy = 0;
    gameState.current.score = 0;
    setScore(0);
    generateFood();
    
    if (gameState.current.gameInterval) {
      clearInterval(gameState.current.gameInterval);
    }
    setGameRunning(true);
    gameState.current.gameInterval = setInterval(gameStep, gameState.current.gameSpeed);
  };

  const generateFood = () => {
    const { gridSize, tileCount, snake } = gameState.current;
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * tileCount) * gridSize,
        y: Math.floor(Math.random() * tileCount) * gridSize
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    gameState.current.food = newFood;
  };

  const gameStep = useCallback(() => {
    const { snake, dx, dy, gridSize, tileCount, context, food } = gameState.current;
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Collision detection
    if (head.x < 0 || head.x >= tileCount * gridSize || 
        head.y < 0 || head.y >= tileCount * gridSize ||
        snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      gameOver();
      return;
    }

    const newSnake = [head, ...snake];
    if (head.x === food.x && head.y === food.y) {
    gameState.current.score += 10;
      setScore(gameState.current.score);
      generateFood();
    } else {
      newSnake.pop();
    }

    gameState.current.snake = newSnake;
    draw();
  }, []);

  const draw = () => {
    const { context, snake, food, gridSize } = gameState.current;
    const canvas = canvasRef.current;
    
    // Clear canvas
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    snake.forEach((segment, index) => {
      context.fillStyle = index === 0 ? 'darkgreen' : 'green';
      context.fillRect(segment.x, segment.y, gridSize - 2, gridSize - 2);
    });

    // Draw food
    context.fillStyle = 'red';
    context.fillRect(food.x, food.y, gridSize - 2, gridSize - 2);
  };

  const gameOver = () => {
    clearInterval(gameState.current.gameInterval);
    setGameRunning(false);
    alert(`Game Over! Loser! Score: ${gameState.current.score}`);
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const { dx, dy, gridSize } = gameState.current;
      switch(e.key) {
        case 'ArrowUp':
          if (dy === 0) {
            gameState.current.dx = 0;
            gameState.current.dy = -gridSize;
          }
          break;
        case 'ArrowDown':
          if (dy === 0) {
            gameState.current.dx = 0;
            gameState.current.dy = gridSize;
          }
          break;
        case 'ArrowLeft':
          if (dx === 0) {
            gameState.current.dx = -gridSize;
            gameState.current.dy = 0;
          }
          break;
        case 'ArrowRight':
          if (dx === 0) {
            gameState.current.dx = gridSize;
            gameState.current.dy = 0;
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      padding: '20px'
    },
    score: {
      fontSize: '24px',
      margin: '10px'
    },
    startBtn: {
      padding: '10px 20px',
      fontSize: '18px',
      margin: '10px',
      cursor: 'pointer'
    },
    canvas: {
      border: '2px solid black'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.score}>Score: {score}</div>
      <canvas
        ref={canvasRef}
        id="gameCanvas"
        width="400"
        height="400"
        style={styles.canvas}
      />
      <button 
        style={styles.startBtn} 
        onClick={startGame}
        disabled={gameRunning}
      >
        {gameRunning ? 'Game Running...' : 'Start Game'}
      </button>
    </div>
  );
};

export default SnakeGame;