import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Info, Sparkles } from 'lucide-react';

const WEEKS = 52;
const DAYS_PER_WEEK = 7;

const generateHeatmapData = () => {
    const today = new Date();
    const data = [];
    
    for (let i = 0; i < (WEEKS * DAYS_PER_WEEK); i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - ((WEEKS * DAYS_PER_WEEK) - 1 - i));
        
        let score = null;
        const density = i > 250 ? 0.8 : 0.4; 
        
        if (Math.random() < density) {
            const rand = Math.random();
            if (rand > 0.8) score = Math.floor(Math.random() * 20) + 80;
            else if (rand > 0.4) score = Math.floor(Math.random() * 20) + 60;
            else if (rand > 0.2) score = Math.floor(Math.random() * 20) + 40;
            else score = Math.floor(Math.random() * 40);
        }

        data.push({
            date: d.toLocaleDateString(),
            score: score
        });
    }

    const weeks = [];
    for (let i = 0; i < data.length; i += DAYS_PER_WEEK) {
        weeks.push(data.slice(i, i + DAYS_PER_WEEK));
    }
    return weeks;
};

// Map score to Aurora Glass scale (Cyan/Purple glow)
const getColorLevel = (score) => {
    if (score === null) return 'bg-white/5 border border-white/5 hover:border-white/20';
    if (score >= 80) return 'bg-cyan-400 border border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)] z-10';
    if (score >= 60) return 'bg-cyan-500/80 border border-transparent hover:border-cyan-400';
    if (score >= 40) return 'bg-purple-500/60 border border-transparent hover:border-purple-400';
    if (score >= 20) return 'bg-purple-500/30 border border-transparent hover:border-purple-500/50';
    return 'bg-pink-500/80 border border-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.4)] z-10'; // Critical drops
};

export const ConsistencyMatrix = () => {
    const weeksData = useMemo(() => generateHeatmapData(), []);
    const [hoveredCell, setHoveredCell] = useState(null);

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 font-sans text-white relative z-10">
            <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex items-center gap-4 border-b border-white/10 pb-6 pt-4"
            >
                <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 p-3 rounded-2xl border border-white/20 text-cyan-400 shadow-inner">
                    <Target size={28} strokeWidth={1.5} />
                </div>
                <div>
                   <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Consistency Matrix</h1>
                   <p className="text-gray-400 mt-1 text-sm uppercase tracking-[0.1em]">Neural stabilization over 365 cycles.</p>
                </div>
            </motion.div>

            <motion.div 
                 initial={{ opacity: 0, y: 15 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2, ease: "easeOut" }}
                 className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-x-auto relative"
            >
                {/* 52-Week Grid */}
                <div className="flex gap-1.5 min-w-max relative pb-6 pt-2 px-2">
                    
                    {/* Y-Axis Labels (Mon, Wed, Fri) */}
                    <div className="flex flex-col justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider mr-4 py-1.5 h-[112px]">
                        <span>Mon</span>
                        <span>Wed</span>
                        <span>Fri</span>
                    </div>

                    {/* Columns of 7 days */}
                    {weeksData.map((week, wIdx) => (
                        <div key={wIdx} className="flex flex-col gap-1.5 group/col">
                            {week.map((dayObj, dIdx) => (
                                <div
                                    key={dIdx}
                                    onMouseEnter={() => setHoveredCell({ ...dayObj, col: wIdx, row: dIdx })}
                                    onMouseLeave={() => setHoveredCell(null)}
                                    className={`w-[14px] h-[14px] sm:w-[15px] sm:h-[15px] rounded border border-transparent transition-all duration-200 cursor-pointer relative backdrop-blur-sm ${getColorLevel(dayObj.score)}`}
                                />
                            ))}
                        </div>
                    ))}

                    {/* Tooltip Wrapper (Aurora Style) */}
                    {hoveredCell && (
                         <div 
                           className="absolute pointer-events-none z-50 transition-all duration-100 ease-out"
                           style={{
                               left: `calc(40px + ${hoveredCell.col * 21.5}px)`, 
                               top: `calc(${hoveredCell.row * 21.5}px - 50px)`,
                               transform: 'translateX(-50%)'
                           }}
                         >
                            <motion.div 
                               initial={{ opacity: 0, scale: 0.95, y: 5 }}
                               animate={{ opacity: 1, scale: 1, y: 0 }}
                               className="bg-gray-900/90 backdrop-blur-xl border border-white/20 text-white text-xs py-3 px-4 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] whitespace-nowrap flex flex-col items-center gap-1.5 min-w-[140px]"
                            >
                                <span className="font-bold text-[10px] text-gray-400 uppercase tracking-[0.2em]">{hoveredCell.date}</span>
                                {hoveredCell.score !== null ? (
                                    <span className={`font-black tracking-wider flex items-center gap-1 text-[13px] ${hoveredCell.score >= 80 ? 'text-cyan-400' : hoveredCell.score < 40 ? 'text-pink-400' : 'text-purple-400'}`}>
                                         {hoveredCell.score >= 80 && <Sparkles size={12}/>} Score: {hoveredCell.score}
                                    </span>
                                ) : (
                                    <span className="text-gray-500 italic text-[11px] font-medium tracking-wide">Data frame missing</span>
                                )}
                                {/* Triangle Indicator */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white/20"></div>
                            </motion.div>
                         </div>
                    )}
                </div>

                {/* Footer Legend */}
                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">
                    <div className="flex items-center gap-2 text-pink-400 bg-pink-500/10 border border-pink-500/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                        <Sparkles size={14} /> 
                        <span>System Critical</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="mr-2">Deficient</span>
                        <div className="w-3.5 h-3.5 rounded border border-white/10 bg-white/5"></div>
                        <div className="w-3.5 h-3.5 rounded bg-purple-500/30"></div>
                        <div className="w-3.5 h-3.5 rounded bg-purple-500/60"></div>
                        <div className="w-3.5 h-3.5 rounded bg-cyan-500/80"></div>
                        <div className="w-3.5 h-3.5 rounded bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                        <span className="ml-2">Optimal</span>
                    </div>
                </div>

            </motion.div>
        </div>
    );
};
