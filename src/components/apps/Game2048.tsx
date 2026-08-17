'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Trophy } from 'lucide-react';

type Tile = {
  id: number;
  value: number;
  isNew?: boolean;
  isMerged?: boolean;
};

// Colors based on value
const getTileColors = (value: number, isLight: boolean) => {
  switch (value) {
    case 2: return 'bg-[#eee4da] text-[#776e65]';
    case 4: return 'bg-[#ede0c8] text-[#776e65]';
    case 8: return 'bg-[#f2b179] text-[#f9f6f2]';
    case 16: return 'bg-[#f59563] text-[#f9f6f2]';
    case 32: return 'bg-[#f67c5f] text-[#f9f6f2]';
    case 64: return 'bg-[#f65e3b] text-[#f9f6f2]';
    case 128: return 'bg-[#edcf72] text-[#f9f6f2] shadow-[0_0_10px_#edcf72,inset_0_0_10px_white]';
    case 256: return 'bg-[#edcc61] text-[#f9f6f2] shadow-[0_0_15px_#edcc61,inset_0_0_10px_white]';
    case 512: return 'bg-[#edc850] text-[#f9f6f2] shadow-[0_0_20px_#edc850,inset_0_0_15px_white]';
    case 1024: return 'bg-[#edc53f] text-[#f9f6f2] shadow-[0_0_25px_#edc53f,inset_0_0_15px_white] text-4xl';
    case 2048: return 'bg-[#edc22e] text-[#f9f6f2] shadow-[0_0_30px_#edc22e,inset_0_0_20px_white] text-4xl';
    default: 
      if (value > 2048) return 'bg-[#3c3a32] text-[#f9f6f2] text-4xl';
      return isLight ? 'bg-[#cdc1b4]/30 text-transparent' : 'bg-[#3d3a33]/30 text-transparent'; // empty
  }
};

let idCounter = 0;

export default function Game2048() {
  const { themeMode } = useSettingsStore();
  const isLight = themeMode === 'light';

  const [grid, setGrid] = useState<(Tile | null)[][]>(() => getEmptyGrid());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [hasContinued, setHasContinued] = useState(false);

  useEffect(() => {
    const savedBest = localStorage.getItem('2048-best');
    if (savedBest) setBestScore(parseInt(savedBest, 10));
    initGame();
  }, []);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('2048-best', score.toString());
    }
  }, [score, bestScore]);

  function getEmptyGrid(): (Tile | null)[][] {
    return Array(4).fill(null).map(() => Array(4).fill(null));
  }

  const addRandomTile = (currentGrid: (Tile | null)[][]) => {
    const emptyCells: {r: number, c: number}[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!currentGrid[r][c]) emptyCells.push({r, c});
      }
    }
    if (emptyCells.length === 0) return currentGrid;

    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = [...currentGrid.map(row => [...row])];
    newGrid[r][c] = {
      id: idCounter++,
      value: Math.random() < 0.9 ? 2 : 4,
      isNew: true
    };
    return newGrid;
  };

  const initGame = () => {
    let newGrid = getEmptyGrid();
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setHasContinued(false);
  };

  const checkGameOver = (currentGrid: (Tile | null)[][]) => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!currentGrid[r][c]) return false;
        if (c < 3 && currentGrid[r][c]?.value === currentGrid[r][c+1]?.value) return false;
        if (r < 3 && currentGrid[r][c]?.value === currentGrid[r+1][c]?.value) return false;
      }
    }
    return true;
  };

  const slideRow = (row: (Tile | null)[]) => {
    let arr = row.filter(val => val !== null) as Tile[];
    let scoreDelta = 0;
    
    // reset merged flags
    arr = arr.map(t => ({...t, isMerged: false, isNew: false}));

    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i].value === arr[i + 1].value) {
        arr[i] = {
          id: idCounter++,
          value: arr[i].value * 2,
          isMerged: true
        };
        scoreDelta += arr[i].value;
        if (arr[i].value === 2048 && !hasContinued) {
          setGameWon(true);
        }
        arr.splice(i + 1, 1);
      }
    }
    
    while (arr.length < 4) {
      arr.push(null as any);
    }
    return { newRow: arr, scoreDelta };
  };

  const handleMove = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver || (gameWon && !hasContinued)) return;

    setGrid(prevGrid => {
      let newGrid = prevGrid.map(row => [...row]);
      let totalScoreDelta = 0;
      let moved = false;

      if (direction === 'left' || direction === 'right') {
        for (let r = 0; r < 4; r++) {
          let row = newGrid[r];
          if (direction === 'right') row.reverse();
          const { newRow, scoreDelta } = slideRow(row);
          if (direction === 'right') newRow.reverse();
          
          for (let c = 0; c < 4; c++) {
            if (newGrid[r][c]?.id !== newRow[c]?.id) moved = true;
          }
          newGrid[r] = newRow;
          totalScoreDelta += scoreDelta;
        }
      } else {
        for (let c = 0; c < 4; c++) {
          let col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
          if (direction === 'down') col.reverse();
          const { newRow, scoreDelta } = slideRow(col);
          if (direction === 'down') newRow.reverse();
          
          for (let r = 0; r < 4; r++) {
            if (newGrid[r][c]?.id !== newRow[r]?.id) moved = true;
            newGrid[r][c] = newRow[r];
          }
          totalScoreDelta += scoreDelta;
        }
      }

      if (moved) {
        newGrid = addRandomTile(newGrid);
        setScore(s => s + totalScoreDelta);
        if (checkGameOver(newGrid)) {
          setGameOver(true);
        }
        return newGrid;
      }
      return prevGrid;
    });
  }, [gameOver, gameWon, hasContinued]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const dirMap: Record<string, 'up'|'down'|'left'|'right'> = {
          'ArrowUp': 'up',
          'ArrowDown': 'down',
          'ArrowLeft': 'left',
          'ArrowRight': 'right'
        };
        handleMove(dirMap[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

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
    
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) handleMove(dx > 0 ? 'right' : 'left');
    } else {
      if (Math.abs(dy) > 30) handleMove(dy > 0 ? 'down' : 'up');
    }
    setTouchStart(null);
  };

  return (
    <div className={`flex flex-col items-center justify-center h-full w-full select-none ${isLight ? 'bg-[#faf8ef] text-[#776e65]' : 'bg-[#1e1e1e] text-[#faf8ef]'}`}>
      <div className="w-full max-w-[500px] p-6">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <h1 className="text-6xl font-extrabold" style={{ color: isLight ? '#776e65' : '#e4e4e4' }}>2048</h1>
          <div className="flex gap-2">
            <div className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-md ${isLight ? 'bg-[#bbada0] text-white' : 'bg-[#3d3a33] text-white'}`}>
              <span className={`text-[10px] font-bold uppercase ${isLight ? 'text-[#eee4da]' : 'text-gray-400'}`}>Score</span>
              <span className="font-bold text-xl leading-none">{score}</span>
            </div>
            <div className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-md ${isLight ? 'bg-[#bbada0] text-white' : 'bg-[#3d3a33] text-white'}`}>
              <span className={`text-[10px] font-bold uppercase ${isLight ? 'text-[#eee4da]' : 'text-gray-400'}`}>Best</span>
              <span className="font-bold text-xl leading-none">{bestScore}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <p className="font-medium text-lg leading-tight">
            Join the numbers and get to the <strong className="font-extrabold">2048 tile!</strong>
          </p>
          <button 
            onClick={initGame}
            className="flex items-center gap-2 px-5 py-3 rounded-md bg-[#8f7a66] hover:bg-[#9f8b77] text-[#f9f6f2] font-bold transition-colors shadow-sm whitespace-nowrap"
          >
            <RotateCcw size={18} /> New Game
          </button>
        </div>

        {/* Game Board */}
        <div 
          className={`relative p-3 rounded-xl touch-none ${isLight ? 'bg-[#bbada0]' : 'bg-[#2d2a24]'}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Overlay for Game Over / Win */}
          <AnimatePresence>
            {(gameOver || (gameWon && !hasContinued)) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 rounded-xl flex flex-col items-center justify-center bg-[#eee4da]/70 backdrop-blur-sm"
              >
                <h2 className="text-5xl font-extrabold text-[#776e65] mb-6 drop-shadow-md">
                  {gameWon && !hasContinued ? 'You Win!' : 'Game Over!'}
                </h2>
                <div className="flex gap-4">
                  <button 
                    onClick={initGame}
                    className="px-6 py-3 rounded-md bg-[#8f7a66] hover:bg-[#9f8b77] text-[#f9f6f2] font-bold text-lg transition-colors shadow-lg"
                  >
                    Try again
                  </button>
                  {gameWon && !hasContinued && (
                    <button 
                      onClick={() => setHasContinued(true)}
                      className="px-6 py-3 rounded-md bg-[#edc22e] hover:bg-[#f3d15b] text-[#f9f6f2] font-bold text-lg transition-colors shadow-lg"
                    >
                      Keep going
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-4 gap-3 relative">
            {/* Background Cells */}
            {Array(16).fill(0).map((_, i) => (
              <div key={i} className={`aspect-square rounded-md ${isLight ? 'bg-[#cdc1b4]' : 'bg-[#3d3a33]'}`}></div>
            ))}

            {/* Active Tiles */}
            {grid.map((row, r) => (
              row.map((tile, c) => {
                if (!tile) return null;
                return (
                  <motion.div
                    key={tile.id}
                    layoutId={`tile-${tile.id}`}
                    initial={tile.isNew ? { scale: 0, opacity: 0 } : false}
                    animate={{ 
                      scale: tile.isMerged ? [1, 1.15, 1] : 1,
                      opacity: 1
                    }}
                    transition={{ 
                      default: { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 },
                      scale: tile.isMerged ? { duration: 0.2, times: [0, 0.5, 1] } : { type: 'spring', stiffness: 400, damping: 30 }
                    }}
                    className={`absolute rounded-md flex items-center justify-center font-bold text-3xl shadow-sm ${getTileColors(tile.value, isLight)}`}
                    style={{
                      width: 'calc(25% - 9px)',
                      height: 'calc(25% - 9px)',
                      top: `calc(${r * 25}% + ${r * 3}px)`,
                      left: `calc(${c * 25}% + ${c * 3}px)`,
                    }}
                  >
                    {tile.value}
                  </motion.div>
                );
              })
            ))}
          </div>
        </div>
        
        <p className={`mt-6 text-sm text-center ${isLight ? 'text-[#776e65]/70' : 'text-gray-500'}`}>
          <strong>HOW TO PLAY:</strong> Use your <strong className="text-current">arrow keys</strong> or <strong className="text-current">swipe</strong> to move the tiles. Tiles with the same number merge into one when they touch. Add them up to reach <strong>2048!</strong>
        </p>
      </div>
    </div>
  );
}
