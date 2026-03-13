import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Heart, Users, Moon, CheckCircle, BrainCircuit, Sparkles } from 'lucide-react';

const RECOMMENDATIONS = [
  {
    id: 1,
    category: 'Optimization',
    icon: <BrainCircuit size={24} className="text-cyan-400" />,
    title: '5-Min Grounding Protocol',
    description: 'Execute box breathing syntax (inhale 4s, hold 4s, exhale 4s, hold 4s) to restore neural homeostasis and lower system tension.',
    color: 'border-cyan-500/30',
    textColor: 'text-cyan-400'
  },
  {
    id: 2,
    category: 'Kinetic',
    icon: <Zap size={24} className="text-purple-400" />,
    title: 'Steady-State Movement',
    description: 'System sluggish? A 15-minute ambulation subroutine can naturally elevate mood vectors and trigger endorphin synthesis.',
    color: 'border-purple-500/30',
    textColor: 'text-purple-400'
  },
  {
    id: 3,
    category: 'Network',
    icon: <Users size={24} className="text-pink-400" />,
    title: 'Establish Connection',
    description: 'Node isolation risks cognitive decay. Transmit a brief acknowledgment packet to a trusted contact.',
    color: 'border-pink-500/30',
    textColor: 'text-pink-400'
  },
  {
    id: 4,
    category: 'Hibernate',
    icon: <Moon size={24} className="text-blue-400" />,
    title: 'Visual Intake Cease',
    description: 'Short-wavelength photic input delays restorative loops. Terminate all active displays 60 minutes prior to sleep.',
    color: 'border-blue-500/30',
    textColor: 'text-blue-400'
  },
  {
    id: 5,
    category: 'Maintenance',
    icon: <Heart size={24} className="text-cyan-400" />,
    title: 'Coolant Levels Low',
    description: 'H2O saturation is suboptimal. Ingest fluids immediately. Hydration deficiency mirrors anxiety patterns physiologically.',
    color: 'border-cyan-500/30',
    textColor: 'text-cyan-400'
  }
];

export const Recommendations = () => {
  const [completedInterventions, setCompletedInterventions] = useState(new Set());

  const toggleComplete = (id) => {
    setCompletedInterventions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const completedCount = completedInterventions.size;
  const totalCount = RECOMMENDATIONS.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 font-sans text-white relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 py-4 border-b border-white/10 pb-8"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
             <Sparkles className="text-purple-400" size={28} strokeWidth={1.5}/> 
             Active Interventions
          </h1>
          <p className="text-gray-400 mt-2 text-sm uppercase tracking-[0.1em]">AI-generated directives for system stability.</p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center gap-6 min-w-[250px] relative overflow-hidden">
           {/* Glow decoration */}
           <div className="absolute top-[-50%] right-[-10%] w-[100px] h-[100px] bg-purple-500/30 blur-2xl"></div>

           <div className="relative z-10">
             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Queue Status</p>
             <p className="text-2xl font-black leading-none text-white">{completedCount} <span className="text-sm font-semibold text-gray-600">/ {totalCount}</span></p>
           </div>
           <div className="flex-1 h-2.5 bg-gray-900 border border-white/5 overflow-hidden relative rounded-full shadow-inner z-10">
             <motion.div 
               className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
               initial={{ width: 0 }}
               animate={{ width: `${progressPercentage}%` }}
               transition={{ duration: 0.5, ease: "easeOut" }}
             />
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
        <AnimatePresence>
          {RECOMMENDATIONS.map((intervention, index) => {
            const isDone = completedInterventions.has(intervention.id);

            return (
              <motion.div
                key={intervention.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                layout
                className={`group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-3xl p-8 border hover:shadow-[0_0_20px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col justify-between min-h-[280px] shadow-[0_0_20px_rgba(0,0,0,0.2)] ${isDone ? 'border-white/5 opacity-50' : `border-white/10 hover:border-white/30`}`}
              >
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 rounded-2xl border transition-colors shadow-inner ${isDone ? 'bg-black/50 border-white/5' : 'bg-gray-900/50 border-white/10'}`}>
                      {isDone ? <CheckCircle size={24} className="text-gray-500" /> : intervention.icon}
                    </div>
                    <span className={`font-bold text-[10px] tracking-[0.2em] relative top-px uppercase ${isDone ? 'text-gray-600' : intervention.textColor}`}>
                      {intervention.category}
                    </span>
                  </div>

                  <h3 className={`text-xl font-bold mb-3 tracking-tight ${isDone ? 'text-gray-600 line-through decoration-white/20 decoration-2' : 'text-white'}`}>
                    {intervention.title}
                  </h3>
                  
                  <p className={`leading-relaxed text-sm ${isDone ? 'text-gray-600' : 'text-gray-400'}`}>
                    {intervention.description}
                  </p>
                </div>

                <div className="mt-8 relative z-10">
                  <button
                    onClick={() => toggleComplete(intervention.id)}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all duration-300 flex items-center justify-center gap-2 ${
                      isDone 
                        ? 'bg-transparent text-gray-500 border border-white/10 hover:bg-white/5 hover:text-white' 
                        : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 shadow-inner'
                    }`}
                  >
                    <AnimatePresence mode="wait">
                        {isDone ? (
                            <motion.span 
                                key="done"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="flex items-center gap-2"
                            >
                                <CheckCircle size={14} strokeWidth={2}/> Acknowledged
                            </motion.span>
                        ) : (
                            <motion.span
                                key="mark"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                Execute Protocol
                            </motion.span>
                        )}
                    </AnimatePresence>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
