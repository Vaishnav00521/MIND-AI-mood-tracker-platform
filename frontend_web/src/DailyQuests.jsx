import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, Footprints, PenLine, Wind, Dumbbell, BookOpen, Apple, Sun, Music, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const QUESTS = [
  { id: 1, title: 'Hydration Protocol', desc: 'Ingest 16oz H2O', icon: <Droplet size={28} className="text-cyan-400" />, theme: "cyan-400", bg: "cyan-500/10", border: "cyan-500/20", light: "cyan-300" },
  { id: 2, title: 'Kinetic Movement', desc: '10 min ambulation', icon: <Footprints size={28} className="text-purple-400" />, theme: "purple-400", bg: "purple-500/10", border: "purple-500/20", light: "purple-300" },
  { id: 3, title: 'Data Logging', desc: 'Syntax 3 objectives', icon: <PenLine size={28} className="text-pink-400" />, theme: "pink-400", bg: "pink-500/10", border: "pink-500/20", light: "pink-300" },
  { id: 4, title: 'O2 Regulation', desc: '4-7-8 cyclic breathing', icon: <Wind size={28} className="text-blue-400" />, theme: "blue-400", bg: "blue-500/10", border: "blue-500/20", light: "blue-300" },
  { id: 5, title: 'Flexibility', desc: 'Hold 5 static poses', icon: <Dumbbell size={28} className="text-purple-400" />, theme: "purple-400", bg: "purple-500/10", border: "purple-500/20", light: "purple-300" },
  { id: 6, title: 'Data Ingestion', desc: 'Scan 10 text pages', icon: <BookOpen size={28} className="text-cyan-400" />, theme: "cyan-400", bg: "cyan-500/10", border: "cyan-500/20", light: "cyan-300" },
  { id: 7, title: 'Fuel Optimization', desc: 'Organic nutrient load', icon: <Apple size={28} className="text-pink-400" />, theme: "pink-400", bg: "pink-500/10", border: "pink-500/20", light: "pink-300" },
  { id: 8, title: 'System Defrag', desc: '5 min sensory deprivation', icon: <Sun size={28} className="text-purple-400" />, theme: "purple-400", bg: "purple-500/10", border: "purple-500/20", light: "purple-300" },
  { id: 9, title: 'Audio Resonance', desc: 'Binaural beats engaged', icon: <Music size={28} className="text-blue-400" />, theme: "blue-400", bg: "blue-500/10", border: "blue-500/20", light: "blue-300" },
];

export const DailyQuests = () => {
  const [completedQuests, setCompletedQuests] = useState(new Set());

  const handleComplete = (id) => {
    if (completedQuests.has(id)) return;

    const newCompleted = new Set(completedQuests).add(id);
    setCompletedQuests(newCompleted);

    if (newCompleted.size === QUESTS.length) {
      triggerConfetti();
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#06B6D4', '#8B5CF6', '#F472B6', '#3B82F6'] // Aurora palette
    });
  };

  const progress = (completedQuests.size / QUESTS.length) * 100;
  const isAllDone = completedQuests.size === QUESTS.length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-sans relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)] mb-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-white">
              <Sparkles className="text-purple-400" size={32} strokeWidth={1.5} />
              Daily Directives
            </h1>
            <p className="text-gray-400 mt-2 text-sm">Optimize your neural parameters for peak efficiency.</p>
          </div>
          
          <div className="text-right">
             <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.2em] mb-1">Completion</p>
             <p className="text-4xl font-bold text-cyan-400 leading-none tracking-tight">
                 {completedQuests.size} <span className="text-xl font-semibold text-gray-600 opacity-60">/ 9</span>
             </p>
          </div>
        </div>

        <div className="w-full h-3 bg-gray-900/50 rounded-full overflow-hidden relative border border-white/5 shadow-inner">
            <motion.div 
               className={`absolute top-0 left-0 h-full ${isAllDone ? 'bg-gradient-to-r from-purple-500 to-cyan-500' : 'bg-cyan-500/80 shadow-[0_0_10px_rgba(6,182,212,0.5)]'}`}
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               transition={{ duration: 0.8, type: "spring", stiffness: 50 }}
            />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {QUESTS.map((quest) => {
          const isDone = completedQuests.has(quest.id);

          return (
            <div key={quest.id} className="perspective-1000 h-48 w-full group cursor-pointer" onClick={() => handleComplete(quest.id)}>
              <motion.div
                className="w-full h-full relative preserve-3d transition-transform duration-700 ease-in-out"
                initial={false}
                animate={{ rotateY: isDone ? 180 : 0 }}
                whileHover={!isDone ? { scale: 1.03, y: -3 } : {}}
              >
                
                {/* Front Side (Uncompleted) */}
                <div className={`absolute inset-0 backface-hidden bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.2)] rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-colors hover:bg-white/10 hover:border-${quest.light}/50`}>
                  <div className={`mb-4 flex items-center justify-center w-14 h-14 bg-${quest.bg} border border-${quest.border} rounded-2xl transition-all shadow-inner`}>
                    {quest.icon}
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-gray-200 transition-colors uppercase tracking-wide text-sm">{quest.title}</h3>
                  <p className="text-xs font-medium text-gray-400 mt-2">{quest.desc}</p>
                </div>

                {/* Back Side (Completed) */}
                <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-${quest.bg} border border-${quest.theme}/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-lg`}>
                   <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: isDone ? 1 : 0 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      className={`bg-white/10 p-3 rounded-full mb-4 shadow-inner border border-${quest.border}`}
                   >
                     <Check size={28} className={`text-${quest.theme}`} strokeWidth={3} />
                   </motion.div>
                   <h3 className={`font-semibold text-${quest.theme} uppercase tracking-wide text-sm`}>{quest.title}</h3>
                   <span className="text-xs font-medium text-gray-300 mt-2">
                      Verified
                   </span>
                </div>

              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
