import React, { useState, useEffect } from 'react';
import { useWellness } from '../context/WellnessContext';
import { api } from '../services/api';
import { Gamepad2, CheckCircle2, Heart, Sun, Flame, Zap, Compass, Star, Moon, Shield } from 'lucide-react';

export const GamesView: React.FC = () => {
  const { profile, refreshUserData } = useWellness();
  const [activeGame, setActiveGame] = useState<'breathing' | 'focus' | 'memory' | 'reaction'>('breathing');
  const [gameScore, setGameScore] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [pointsEarned, setPointsEarned] = useState<number>(0);

  // 1. Breathing Game State
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathCycles, setBreathCycles] = useState<number>(0);

  // 2. Focus Game State
  const [focusGrid, setFocusGrid] = useState<number[]>(Array(16).fill(0));
  const [activeTileIndex, setActiveTileIndex] = useState<number | null>(null);
  const [focusTimer, setFocusTimer] = useState<number>(20);
  const [focusActive, setFocusActive] = useState<boolean>(false);

  // 3. Memory Game State
  const memoryIcons = [Heart, Sun, Flame, Zap, Compass, Star];
  const [memoryCards, setMemoryCards] = useState<{ id: number; iconIndex: number; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);

  // 4. Reaction Game State
  const [reactionState, setReactionState] = useState<'idle' | 'waiting' | 'ready' | 'finished'>('idle');
  const [reactionStartTime, setReactionStartTime] = useState<number>(0);
  const [reactionResult, setReactionResult] = useState<number | null>(null);

  useEffect(() => {
    resetCurrentGame();
  }, [activeGame]);

  const resetCurrentGame = () => {
    setGameScore(0);
    setGameCompleted(false);
    setPointsEarned(0);

    if (activeGame === 'breathing') {
      setBreathCycles(0);
      setBreathPhase('Inhale');
    } else if (activeGame === 'focus') {
      setFocusActive(false);
      setFocusTimer(20);
      setActiveTileIndex(null);
    } else if (activeGame === 'memory') {
      const indices = [0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5];
      const cards = indices
        .sort(() => Math.random() - 0.5)
        .map((iconIndex, id) => ({ id, iconIndex, flipped: false, matched: false }));
      setMemoryCards(cards);
      setFlippedIndices([]);
    } else if (activeGame === 'reaction') {
      setReactionState('idle');
      setReactionResult(null);
    }
  };

  const handleGameFinish = async (finalScore: number, pts: number) => {
    if (!profile) return;
    setGameScore(finalScore);
    setPointsEarned(pts);
    setGameCompleted(true);
    try {
      await api.saveGameSession(profile.id, activeGame, finalScore, pts);
      await refreshUserData();
    } catch (e) {
      console.error('Error recording game session:', e);
    }
  };

  // BREATHING GAME ENGINE
  useEffect(() => {
    if (activeGame !== 'breathing') return;
    const interval = setInterval(() => {
      setBreathPhase(prev => {
        if (prev === 'Inhale') return 'Hold';
        if (prev === 'Hold') return 'Exhale';
        setBreathCycles(c => {
          const next = c + 1;
          if (next >= 5 && !gameCompleted) {
            handleGameFinish(next, 25);
          }
          return next;
        });
        return 'Inhale';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [activeGame, gameCompleted]);

  // FOCUS GAME ENGINE
  useEffect(() => {
    if (activeGame !== 'focus' || !focusActive) return;
    const timer = setInterval(() => {
      setFocusTimer(t => {
        if (t <= 1) {
          setFocusActive(false);
          handleGameFinish(gameScore, Math.min(50, gameScore * 5));
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeGame, focusActive, gameScore]);

  const startFocusGame = () => {
    setGameScore(0);
    setFocusTimer(20);
    setFocusActive(true);
    setGameCompleted(false);
    spawnRandomTile();
  };

  const spawnRandomTile = () => {
    const rand = Math.floor(Math.random() * 16);
    setActiveTileIndex(rand);
  };

  const handleTileClick = (idx: number) => {
    if (!focusActive || idx !== activeTileIndex) return;
    setGameScore(s => s + 1);
    spawnRandomTile();
  };

  // MEMORY GAME ENGINE
  const handleCardClick = (idx: number) => {
    if (flippedIndices.length === 2 || memoryCards[idx].flipped || memoryCards[idx].matched) return;

    const updated = [...memoryCards];
    updated[idx].flipped = true;
    setMemoryCards(updated);

    const nextFlipped = [...flippedIndices, idx];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      const [first, second] = nextFlipped;
      if (updated[first].iconIndex === updated[second].iconIndex) {
        updated[first].matched = true;
        updated[second].matched = true;
        setMemoryCards(updated);
        setFlippedIndices([]);
        setGameScore(s => s + 10);

        if (updated.every(c => c.matched)) {
          handleGameFinish(100, 35);
        }
      } else {
        setTimeout(() => {
          updated[first].flipped = false;
          updated[second].flipped = false;
          setMemoryCards([...updated]);
          setFlippedIndices([]);
        }, 800);
      }
    }
  };

  // REACTION GAME ENGINE
  const startReactionGame = () => {
    setReactionState('waiting');
    setReactionResult(null);
    const delay = 2000 + Math.random() * 3000;
    setTimeout(() => {
      setReactionState('ready');
      setReactionStartTime(Date.now());
    }, delay);
  };

  const handleReactionClick = () => {
    if (reactionState === 'waiting') {
      setReactionState('idle');
      alert('Too early! Take a breath and wait for the green box.');
    } else if (reactionState === 'ready') {
      const elapsed = Date.now() - reactionStartTime;
      setReactionResult(elapsed);
      setReactionState('finished');
      handleGameFinish(elapsed, 30);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="theme-hero-card rounded-3xl p-6 sm:p-8 text-white shadow-2xl border flex items-center justify-between">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-white/10 theme-text-accent border theme-border-accent backdrop-blur-md">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Mindful Mini-Games</h1>
          </div>
          <p className="text-slate-200 text-sm">
            Gentle, non-stressful cognitive games to sharpen focus, reduce mental fatigue, and earn points for your plant.
          </p>
        </div>
      </div>

      {/* Game Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'breathing', label: 'Breathing Rhythm' },
          { id: 'focus', label: 'Focus Tiles' },
          { id: 'memory', label: 'Mindful Match' },
          { id: 'reaction', label: 'Calm Reaction' }
        ].map(g => (
          <button
            key={g.id}
            onClick={() => setActiveGame(g.id as any)}
            className={`p-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition border ${
              activeGame === g.id
                ? 'theme-gradient-btn text-white shadow-lg scale-105'
                : 'glass-card border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <span>{g.label}</span>
          </button>
        ))}
      </div>

      {/* Completion Banner */}
      {gameCompleted && (
        <div className="glass-card border theme-border-accent p-4 rounded-2xl text-emerald-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 theme-text-accent" />
            <span>Mini-Game Complete! Score: {gameScore} • Earned +{pointsEarned} Points!</span>
          </div>
          <button
            onClick={resetCurrentGame}
            className="px-4 py-1.5 theme-gradient-btn text-white text-xs font-bold rounded-xl transition"
          >
            Play Again
          </button>
        </div>
      )}

      {/* ACTIVE GAME CONTAINER */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl min-h-[420px] flex flex-col items-center justify-center text-white">
        {/* GAME 1: BREATHING RHYTHM */}
        {activeGame === 'breathing' && (
          <div className="flex flex-col items-center text-center space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
              Breathing Game • Completed Cycles: {breathCycles}
            </span>

            <div
              className={`w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex flex-col items-center justify-center shadow-2xl transition-all duration-[4000ms] ${
                breathPhase === 'Inhale' ? 'scale-110 sm:scale-125' : breathPhase === 'Hold' ? 'scale-110 sm:scale-125 opacity-90' : 'scale-90'
              }`}
            >
              <span className="text-xl sm:text-2xl font-bold">{breathPhase}</span>
              <span className="text-[10px] sm:text-xs text-purple-200 mt-1 font-medium">Focus on soft breath</span>
            </div>

            <p className="text-xs text-slate-400 max-w-sm">
              Follow the expanding circle with deep breaths. Complete 5 soft breathing cycles to earn points.
            </p>
          </div>
        )}

        {/* GAME 2: FOCUS TILES */}
        {activeGame === 'focus' && (
          <div className="flex flex-col items-center space-y-6 w-full max-w-md">
            <div className="flex justify-between w-full text-sm font-bold text-slate-200">
              <span>Time Left: {focusTimer}s</span>
              <span className="text-purple-400">Score: {gameScore}</span>
            </div>

            {!focusActive && focusTimer === 20 ? (
              <button
                onClick={startFocusGame}
                className="px-8 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl shadow-lg transition text-sm"
              >
                Start Focus Challenge
              </button>
            ) : (
              <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full">
                {focusGrid.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTileClick(idx)}
                    className={`h-14 sm:h-20 rounded-2xl border-2 transition-all duration-150 ${
                      idx === activeTileIndex
                        ? 'bg-purple-600 border-purple-400 scale-105 shadow-lg shadow-purple-500/30'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* GAME 3: MINDFUL MATCH MEMORY */}
        {activeGame === 'memory' && (
          <div className="space-y-6 w-full max-w-md">
            <div className="flex justify-between text-sm font-bold text-slate-200">
              <span>Mindful Card Match</span>
              <span className="text-purple-400">Matches Score: {gameScore}</span>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {memoryCards.map((card, idx) => {
                const IconComp = memoryIcons[card.iconIndex];
                const isOpen = card.flipped || card.matched;
                return (
                  <div
                    key={idx}
                    style={{ perspective: '600px' }}
                    onClick={() => handleCardClick(idx)}
                    className="h-16 sm:h-24 cursor-pointer"
                  >
                    <div
                      className="w-full h-full relative transition-transform duration-500 rounded-2xl"
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: isOpen ? 'rotateY(180deg)' : 'rotateY(0deg)'
                      }}
                    >
                      {/* Back Side */}
                      <div
                        className="absolute inset-0 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center hover:border-slate-700 shadow-md"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <Compass className="w-5 h-5 text-slate-700" />
                      </div>

                      {/* Front Side */}
                      <div
                        className="absolute inset-0 bg-gradient-to-tr from-purple-950 to-indigo-900 border-2 border-purple-500 text-purple-300 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)'
                        }}
                      >
                        <IconComp className="w-8 h-8 text-purple-300" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* GAME 4: CALM REACTION */}
        {activeGame === 'reaction' && (
          <div className="flex flex-col items-center space-y-6 text-center">
            <h3 className="font-bold text-white text-lg">Mindful Reaction Test</h3>
            <p className="text-xs text-slate-400">Wait until the box turns green, then tap immediately!</p>

            {reactionState === 'idle' && (
              <button
                onClick={startReactionGame}
                className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg transition"
              >
                Start Reaction Test
              </button>
            )}

            {reactionState === 'waiting' && (
              <div
                onClick={handleReactionClick}
                className="w-64 h-48 rounded-3xl bg-amber-600/90 text-white font-extrabold text-xl flex items-center justify-center cursor-pointer shadow-2xl animate-pulse"
              >
                Wait for green...
              </div>
            )}

            {reactionState === 'ready' && (
              <div
                onClick={handleReactionClick}
                className="w-64 h-48 rounded-3xl bg-emerald-500 text-slate-950 font-extrabold text-2xl flex items-center justify-center cursor-pointer shadow-2xl scale-105"
              >
                TAP NOW!
              </div>
            )}

            {reactionState === 'finished' && reactionResult && (
              <div className="space-y-3">
                <p className="text-2xl font-extrabold text-white">{reactionResult} ms</p>
                <button
                  onClick={startReactionGame}
                  className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-2xl text-xs"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
