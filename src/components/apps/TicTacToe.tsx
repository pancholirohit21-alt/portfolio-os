'use client';

import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, User, Bot } from 'lucide-react';

type Player = 'X' | 'O' | null;

const checkWinner = (board: Player[]): Player | 'draw' => {
  const winLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  for (let i = 0; i < winLines.length; i++) {
    const [a, b, c] = winLines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (!board.includes(null)) return 'draw';
  return null;
};

// Minimax Algorithm for unbeatable AI
const minimax = (board: Player[], depth: number, isMaximizing: boolean): number => {
  const result = checkWinner(board);
  if (result === 'O') return 10 - depth;
  if (result === 'X') return depth - 10;
  if (result === 'draw') return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        let score = minimax(board, depth + 1, false);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        let score = minimax(board, depth + 1, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
};

export default function TicTacToe() {
  const { themeMode, accentColor } = useSettingsStore();
  const isLight = themeMode === 'light';

  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [score, setScore] = useState({ player: 0, ai: 0, draws: 0 });

  // AI Turn
  useEffect(() => {
    if (!isXNext && !winner) {
      // Simulate thinking delay
      const timeout = setTimeout(() => {
        let bestScore = -Infinity;
        let move = -1;
        const tempBoard = [...board];
        
        // If it's the very first move of the game, pick a random corner/center for variety
        if (board.filter(cell => cell === null).length === 9) {
          const openers = [0, 2, 4, 6, 8];
          move = openers[Math.floor(Math.random() * openers.length)];
        } else {
          for (let i = 0; i < 9; i++) {
            if (tempBoard[i] === null) {
              tempBoard[i] = 'O';
              let score = minimax(tempBoard, 0, false);
              tempBoard[i] = null;
              if (score > bestScore) {
                bestScore = score;
                move = i;
              }
            }
          }
        }

        if (move !== -1) {
          handlePlay(move);
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isXNext, board, winner]);

  const handlePlay = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const newWinner = checkWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
      if (newWinner === 'X') setScore(s => ({ ...s, player: s.player + 1 }));
      else if (newWinner === 'O') setScore(s => ({ ...s, ai: s.ai + 1 }));
      else setScore(s => ({ ...s, draws: s.draws + 1 }));
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  const renderCell = (index: number) => {
    const val = board[index];
    return (
      <button
        key={index}
        className={`w-full aspect-square rounded-2xl text-6xl font-extrabold flex items-center justify-center transition-all duration-300
          ${isLight ? 'bg-white shadow-sm hover:shadow-md border border-slate-200' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
        onClick={() => isXNext && handlePlay(index)}
        disabled={!isXNext || !!winner || !!val}
      >
        <AnimatePresence>
          {val && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={val === 'X' ? `bg-gradient-to-br ${accentColor} text-transparent bg-clip-text drop-shadow-md` : 'text-slate-400 dark:text-slate-500'}
            >
              {val}
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    );
  };

  return (
    <div className={`flex flex-col items-center h-full w-full select-none ${isLight ? 'bg-slate-50/90 text-slate-900' : 'bg-slate-900/90 text-white'}`}>
      <div className="w-full max-w-[450px] p-8 flex-1 flex flex-col justify-center relative">
        
        {/* Header & Score */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold tracking-tight">Tic Tac Toe</h1>
            <p className={`text-sm font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>vs Minimax AI</p>
          </div>
          
          <div className="flex gap-4">
            <div className={`flex flex-col items-center px-4 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-center gap-1 text-xs font-bold uppercase text-slate-500 mb-1"><User size={12}/> You</div>
              <span className="text-xl font-bold">{score.player}</span>
            </div>
            <div className={`flex flex-col items-center px-4 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-center gap-1 text-xs font-bold uppercase text-slate-500 mb-1"><Bot size={12}/> AI</div>
              <span className="text-xl font-bold">{score.ai}</span>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="relative">
          <div className="grid grid-cols-3 gap-3">
            {board.map((_, idx) => renderCell(idx))}
          </div>

          {/* Winner Overlay */}
          <AnimatePresence>
            {winner && (
              <motion.div 
                initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 rounded-2xl flex flex-col items-center justify-center bg-white/50 dark:bg-black/50"
              >
                <motion.h2 
                  initial={{ scale: 0.8, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className={`text-5xl font-extrabold mb-6 drop-shadow-lg ${winner === 'X' ? `bg-gradient-to-br ${accentColor} text-transparent bg-clip-text` : 'text-slate-700 dark:text-white'}`}
                >
                  {winner === 'draw' ? "It's a Draw!" : winner === 'X' ? 'You Win!' : 'AI Wins!'}
                </motion.h2>
                <button 
                  onClick={resetGame}
                  className={`px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2
                    ${isLight ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
                >
                  <RotateCcw size={20} /> Play Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Status */}
        <div className="mt-10 flex justify-center h-10">
          {!winner && (
            <AnimatePresence mode="wait">
              <motion.div
                key={isXNext ? 'player' : 'ai'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm border shadow-sm
                  ${isXNext 
                    ? (isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-white/10 border-white/20 text-white') 
                    : (isLight ? 'bg-slate-100 border-transparent text-slate-500' : 'bg-black/50 border-transparent text-slate-400')}`}
              >
                {isXNext ? <><User size={16} className={`text-[var(--theme-accent,currentColor)]`} /> Your Turn (X)</> : <><Bot size={16} /> AI is thinking...</>}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
