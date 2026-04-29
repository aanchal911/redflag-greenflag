/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flag, Heart, RefreshCw, LogOut, Terminal, Zap, Flame, Skull, Ghost, Trophy } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type Scenario = {
  id: number;
  text: string;
  correct: 'red' | 'green';
  explanation: string;
  genZFeedback: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    text: "Deleting the staging DB to 'test' if the backups actually work... during peak traffic.",
    correct: 'red',
    explanation: "Testing backups is good, but doing it by deleting primary data in peak hours is reckless.",
    genZFeedback: "Down bad. Literally zero rizz in your DevOps."
  },
  {
    id: 2,
    text: "Using B-Tree indexing on a column with 10 million rows that you query constantly.",
    correct: 'green',
    explanation: "B-Trees are the gold standard for range and equality queries on large datasets.",
    genZFeedback: "Big W. You're the main character now."
  },
  {
    id: 3,
    text: "Putting your DB password in a public GitHub repo for 'easy access'.",
    correct: 'red',
    explanation: "Secrets belong in environment variables or secret managers, never in version control.",
    genZFeedback: "Cooked. Absolute skill issue."
  },
  {
    id: 4,
    text: "Normalizing to 3NF but denormalizing specific tables for performance-heavy READS.",
    correct: 'green',
    explanation: "Controlled denormalization is a valid strategy for optimizing read-intensive workloads.",
    genZFeedback: "Big brain energy. Real one."
  },
  {
    id: 5,
    text: "Writing a recursive CTE that has no termination condition. YOLO.",
    correct: 'red',
    explanation: "Infinite recursion will hang your DB server and eat all the RAM.",
    genZFeedback: "L + Ratio + Memory Leak."
  },
  {
    id: 6,
    text: "Setting up Read Replicas to scale your database horizontally.",
    correct: 'green',
    explanation: "Offloading read traffic to replicas is essential for scaling high-traffic apps.",
    genZFeedback: "Peak performance. No cap."
  },
  {
    id: 7,
    text: "Granting 'ALL PRIVILEGES' to every single application user.",
    correct: 'red',
    explanation: "Principle of Least Privilege (PoLP) is critical for database security.",
    genZFeedback: "Mid. Who allowed this?"
  },
  {
    id: 8,
    text: "Using Transactions (ACID) to ensure your money transfers don't duplicate or vanish.",
    correct: 'green',
    explanation: "Atomicity and Consistency prevent partial failures from corrupting data.",
    genZFeedback: "Gigachad logic. Bulletproof."
  }
];

const MEME_REACTIONS = {
  green: ["W", "Peak", "Based", "Real", "Glow up"],
  red: ["L", "Ratio", "Skill Issue", "Banned", "Delusional"]
};

export default function App() {
  const [user, setUser] = useState<string | null>(() => sessionStorage.getItem('playerName'));
  const [userNameInput, setUserNameInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'result'>('playing');
  const [feedback, setFeedback] = useState<{ type: 'red' | 'green' | null, text: string, reaction: string }>({ type: null, text: '', reaction: '' });
  const [roast, setRoast] = useState<string>('');
  const [isRoasting, setIsRoasting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (userNameInput.trim()) {
      sessionStorage.setItem('playerName', userNameInput.trim());
      setUser(userNameInput.trim());
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('playerName');
    setUser(null);
    resetGame();
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setGameState('playing');
    setFeedback({ type: null, text: '', reaction: '' });
    setRoast('');
  };

  const getVibeCheck = async (finalScore: number) => {
    setIsRoasting(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `The user ${user} played a DBMS Red Flag / Green Flag game. They scored ${finalScore} / ${SCENARIOS.length}.
        Write a short, HILARIOUS GenZ "vibe check" roast or praise. Use slang like "L", "W", "Aura", "Cooked", "Peak", "No Cap". 
        If they got 0-3: Total roast. If 4-6: Mid. If 7-8: You're him/her. Under 25 words.`,
      });
      setRoast(response.text || "Database engine died. No vibe check available.");
    } catch (error) {
      setRoast("Gemini was too stunned by your queries to roast you.");
    } finally {
      setIsRoasting(false);
    }
  };

  const handleChoice = useCallback((choice: 'red' | 'green') => {
    if (feedback.type !== null) return;

    const current = SCENARIOS[currentIndex];
    const isCorrect = choice === current.correct;
    const reaction = MEME_REACTIONS[isCorrect ? 'green' : 'red'][Math.floor(Math.random() * 5)];

    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      setFeedback({ type: 'green', text: current.genZFeedback, reaction });
    } else {
      setStreak(0);
      setIsShaking(true);
      setFeedback({ type: 'red', text: current.genZFeedback, reaction });
      setTimeout(() => setIsShaking(false), 500);
    }

    setTimeout(() => {
      setFeedback({ type: null, text: '', reaction: '' });
      if (currentIndex + 1 < SCENARIOS.length) {
        setCurrentIndex(i => i + 1);
      } else {
        setGameState('result');
        getVibeCheck(isCorrect ? score + 1 : score);
      }
    }, 2000);
  }, [currentIndex, feedback.type, score, user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFFF00] flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ scale: 0.9, rotate: -2 }}
          animate={{ scale: 1, rotate: 0 }}
          className="max-w-sm w-full brutal-card p-6 sm:p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4">
             <Skull className="w-8 h-8 sm:w-12 sm:h-12 rotate-12 opacity-20" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-2 uppercase italic tracking-tighter leading-none">
            DBMS <span className="bg-black text-[#FFFF00] px-2 shadow-[2px_2px_0px_white] sm:shadow-[4px_4px_0px_white]">FLAG</span> CHECK
          </h1>
          <div className="h-1 sm:h-2 bg-black w-full my-4"></div>
          <p className="text-base sm:text-lg font-bold mb-6 sm:mb-8 uppercase tracking-widest italic">
             Are you peak data or just mid?
          </p>

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            <div className="relative">
              <input
                type="text"
                value={userNameInput}
                onChange={(e) => setUserNameInput(e.target.value)}
                placeholder="Gamer Tag..."
                className="w-full bg-white border-2 sm:border-4 border-black p-3 sm:p-4 outline-none font-bold text-lg sm:text-xl placeholder:text-gray-400 focus:shadow-[4px_4px_0px_#FF0055]"
                required
              />
              <Ghost className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
            </div>
            <button className="w-full brutal-btn brutal-btn-red text-xl font-black py-4">
               HACK THE SYSTEM {"->"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0] flex flex-col items-center p-4 sm:p-8 font-sans">
      {/* Vibe Bar */}
      <div className="w-full max-w-2xl h-6 sm:h-8 bg-white border-2 sm:border-4 border-black mb-6 sm:mb-8 relative overflow-hidden shadow-[3px_3px_0_0_black] sm:shadow-[4px_4px_0_0_black]">
        <motion.div 
          className="h-full bg-[#00FF00]"
          animate={{ width: `${(currentIndex / SCENARIOS.length) * 100}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] mix-blend-difference text-white">
           Vibe Progress
        </div>
      </div>

      <header className="w-full max-w-2xl flex justify-between items-end mb-6 sm:mb-8 gap-4">
        <div className="min-w-0">
           <div className="flex items-center gap-2 mb-1">
             <Terminal className="w-3 h-3 sm:w-4 sm:h-4" />
             <span className="text-[10px] font-black uppercase tracking-widest opacity-40">User_session</span>
           </div>
           <h2 className="text-xl sm:text-3xl font-black underline decoration-4 decoration-[#FF0055] truncate">{user}</h2>
        </div>
        <div className="text-right shrink-0">
           <div className="flex items-center gap-2 justify-end mb-1">
             <Flame className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors ${streak > 2 ? 'text-orange-500 animate-bounce' : 'opacity-20'}`} />
             <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Aura_streak</span>
           </div>
           <div className="text-xl sm:text-3xl font-black">+{streak * 100}</div>
        </div>
      </header>

      <main className={`w-full max-w-2xl flex-1 flex flex-col items-center justify-center relative ${isShaking ? 'shake' : ''}`}>
        <AnimatePresence mode="wait">
          {gameState === 'playing' ? (
            <motion.div
              key="game"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotate: 10, opacity: 0 }}
              className="w-full"
            >
              <div className="relative mb-12">
                <div className="absolute -top-4 -left-4 bg-[#00D1FF] border-4 border-black px-4 py-1 font-black uppercase italic -rotate-3 z-20 shadow-[4px_4px_0_0_black]">
                  #0{currentIndex + 1}
                </div>
                
                <div className={`brutal-card p-8 sm:p-16 min-h-[250px] sm:min-h-[300px] flex flex-col justify-center items-center text-center relative overflow-hidden ${
                  feedback.type === 'green' ? 'bg-[#00FF00]' : feedback.type === 'red' ? 'bg-[#FF0055] text-white' : ''
                }`}>
                  <AnimatePresence mode="wait">
                    {feedback.type === null ? (
                      <motion.h3 
                        key="text"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="text-2xl sm:text-4xl font-black leading-tight italic"
                      >
                        "{SCENARIOS[currentIndex].text}"
                      </motion.h3>
                    ) : (
                      <motion.div
                        key="feedback"
                        initial={{ scale: 0.5, rotate: -20 }}
                        animate={{ scale: 1.2, rotate: 0 }}
                        className="flex flex-col items-center gap-2 sm:gap-4"
                      >
                        <span className="text-6xl sm:text-8xl filter drop-shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
                          {feedback.type === 'green' ? '🔥' : '🤡'}
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter">
                          {feedback.reaction}!
                        </h2>
                        <p className="font-bold text-base sm:text-lg max-w-xs">{feedback.text}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-6 h-24 sm:h-32">
                <button
                  disabled={feedback.type !== null}
                  onClick={() => handleChoice('red')}
                  className="brutal-btn brutal-btn-red text-lg sm:text-xl flex flex-col items-center justify-center gap-1 sm:gap-2 group"
                >
                  <Flag className="w-6 h-6 sm:w-8 sm:h-8 group-hover:rotate-12 transition-transform" />
                  RED FLAG
                </button>
                <button
                  disabled={feedback.type !== null}
                  onClick={() => handleChoice('green')}
                  className="brutal-btn brutal-btn-green text-lg sm:text-xl flex flex-col items-center justify-center gap-1 sm:gap-2 group"
                >
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-125 transition-transform" />
                  GREEN FLAG
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full brutal-card p-6 sm:p-12 text-center bg-[#00D1FF]"
            >
              <Trophy className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 drop-shadow-[4px_4px_0px_black]" />
              <h1 className="text-4xl sm:text-6xl font-black uppercase italic tracking-tighter mb-4">VIBE CHECK</h1>
              
              <div className="bg-white border-2 sm:border-4 border-black p-4 sm:p-6 mb-6 sm:mb-8 text-lg sm:text-xl font-bold rotate-1 shadow-[4px_4px_0_0_black] sm:shadow-[8px_8px_0_0_black]">
                {isRoasting ? (
                  <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity }}>
                    ANALAYZING YOUR AURA...
                  </motion.div>
                ) : (
                  <p>"{roast}"</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-10">
                <div className="text-left">
                  <div className="text-[10px] font-black uppercase opacity-60">Accuracy</div>
                  <div className="text-2xl sm:text-4xl font-black">{Math.round((score / SCENARIOS.length) * 100)}%</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase opacity-60">Total Score</div>
                  <div className="text-2xl sm:text-4xl font-black">{score}/{SCENARIOS.length}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={resetGame}
                  className="flex-1 brutal-btn brutal-btn-blue bg-white text-xl sm:text-2xl font-black py-4 flex items-center justify-center gap-3"
                >
                  <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
                  RUN IT BACK
                </button>
                <button
                  onClick={handleLogout}
                  className="brutal-btn bg-black text-white px-6 py-4 flex items-center justify-center"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-12 flex flex-col items-center gap-2 opacity-50 font-black italic tracking-widest text-[10px] uppercase">
         <div className="flex items-center gap-4">
           <span className="bg-black text-white px-2">AUTH_VERIFIED</span>
           <Zap className="w-3 h-3 fill-current" />
           <span className="bg-black text-white px-2">VIBE_SECURE</span>
         </div>
         <p>© 2026 DBMS_FLAG_CORP // V1.0.8</p>
      </footer>
    </div>
  );
}
