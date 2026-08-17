'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, Trophy } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };

type Point = { x: number, y: number };

export default function Snake() {
  const { themeMode, accentColor } = useSettingsStore();
  const isLight = themeMode === 'light';

  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const directionRef = useRef(direction);
  
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    const savedBest = localStorage.getItem('snake-best');
    if (savedBest) setBestScore(parseInt(savedBest, 10));
    generateFood(INITIAL_SNAKE);
  }, []);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('snake-best', score.toString());
    }
  }, [score, bestScore]);

  const generateFood = (currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // Make sure food is not on snake
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    setFood(newFood);
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    generateFood(INITIAL_SNAKE);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: head.x + directionRef.current.x,
        y: head.y + directionRef.current.y
      };

      // Check wall collision
      if (
        newHead.x < 0 || 
        newHead.x >= GRID_SIZE || 
        newHead.y < 0 || 
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        generateFood(newSnake);
      } else {
        newSnake.pop(); // Remove tail if no food eaten
      }

      return newSnake;
    });
  }, [food, gameOver, isPaused]);

  // Game Loop
  useEffect(() => {
    const speed = Math.max(50, 150 - Math.floor(score / 50) * 10); // speeds up slightly as you score
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [moveSnake, score]);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        
        const currentDir = directionRef.current;
        
        switch (e.key) {
          case 'ArrowUp':
            if (currentDir.y !== 1) setDirection({ x: 0, y: -1 });
            break;
          case 'ArrowDown':
            if (currentDir.y !== -1) setDirection({ x: 0, y: 1 });
            break;
          case 'ArrowLeft':
            if (currentDir.x !== 1) setDirection({ x: -1, y: 0 });
            break;
          case 'ArrowRight':
            if (currentDir.x !== -1) setDirection({ x: 1, y: 0 });
            break;
        }
      }
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(p => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Touch handlers for swipe
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    
    const currentDir = directionRef.current;

    if (Math.abs(dx) > Math.abs(dy)) { // Horizontal swipe
      if (Math.abs(dx) > 30) {
        if (dx > 0 && currentDir.x !== -1) setDirection({ x: 1, y: 0 }); // Right
        else if (dx < 0 && currentDir.x !== 1) setDirection({ x: -1, y: 0 }); // Left
      }
    } else { // Vertical swipe
      if (Math.abs(dy) > 30) {
        if (dy > 0 && currentDir.y !== -1) setDirection({ x: 0, y: 1 }); // Down
        else if (dy < 0 && currentDir.y !== 1) setDirection({ x: 0, y: -1 }); // Up
      }
    }
    setTouchStart(null);
  };

  return (
    <div className={`flex flex-col items-center justify-center h-full w-full select-none ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-900 text-white'}`}>
      <div className="w-full max-w-[500px] p-6 flex-1 flex flex-col justify-center">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Snake</h1>
            <p className={`text-sm font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Arcade Classic</p>
          </div>
          
          <div className="flex gap-3">
            <div className={`flex flex-col items-center px-4 py-1.5 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
              <span className="text-[10px] font-bold uppercase text-slate-500">Score</span>
              <span className="font-bold text-lg leading-none">{score}</span>
            </div>
            <div className={`flex flex-col items-center px-4 py-1.5 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
              <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1"><Trophy size={10} className="text-yellow-500"/> Best</span>
              <span className="font-bold text-lg leading-none">{bestScore}</span>
            </div>
          </div>
        </div>

        {/* Game Board Container */}
        <div 
          className="relative aspect-square w-full rounded-xl overflow-hidden shadow-inner border border-white/10"
          style={{ backgroundColor: isLight ? '#e2e8f0' : '#0f172a' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Game Grid Background (optional styling) */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{ 
              backgroundImage: `linear-gradient(${isLight ? '#cbd5e1' : '#1e293b'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? '#cbd5e1' : '#1e293b'} 1px, transparent 1px)`,
              backgroundSize: `${100/GRID_SIZE}% ${100/GRID_SIZE}%`
            }}
          />

          {/* Food */}
          <div 
            className="absolute rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
            style={{
              width: `${100/GRID_SIZE}%`,
              height: `${100/GRID_SIZE}%`,
              left: `${(food.x / GRID_SIZE) * 100}%`,
              top: `${(food.y / GRID_SIZE) * 100}%`,
              transform: 'scale(0.8)'
            }}
          />

          {/* Snake */}
          {snake.map((segment, idx) => {
            const isHead = idx === 0;
            return (
              <div 
                key={`${segment.x}-${segment.y}-${idx}`}
                className={`absolute rounded-sm ${isHead ? `bg-gradient-to-br z-10 ${accentColor}` : 'bg-[var(--theme-accent,currentColor)] opacity-80'}`}
                style={{
                  width: `${100/GRID_SIZE}%`,
                  height: `${100/GRID_SIZE}%`,
                  left: `${(segment.x / GRID_SIZE) * 100}%`,
                  top: `${(segment.y / GRID_SIZE) * 100}%`,
                  transform: isHead ? 'scale(1.05)' : 'scale(0.9)',
                  transition: 'left 0.1s linear, top 0.1s linear' // smooth movement
                }}
              />
            );
          })}

          {/* Overlays */}
          <AnimatePresence>
            {gameOver && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
              >
                <h2 className="text-4xl font-extrabold text-white mb-6 drop-shadow-lg">Game Over!</h2>
                <button 
                  onClick={resetGame}
                  className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2
                    ${isLight ? 'bg-white text-slate-900' : 'bg-slate-800 text-white border border-white/20'}`}
                >
                  <RotateCcw size={20} /> Play Again
                </button>
              </motion.div>
            )}

            {isPaused && !gameOver && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
              >
                <h2 className="text-3xl font-bold text-white tracking-widest uppercase">Paused</h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Instructions */}
        <p className={`mt-6 text-xs text-center font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Use <strong className={isLight ? 'text-slate-700' : 'text-slate-200'}>Arrow Keys</strong> or <strong className={isLight ? 'text-slate-700' : 'text-slate-200'}>Swipe</strong> to move. Press <strong className={isLight ? 'text-slate-700' : 'text-slate-200'}>Space</strong> to pause.
        </p>

      </div>
    </div>
  );
}
