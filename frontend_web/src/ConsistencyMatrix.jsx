import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useMood } from './MoodContext';
import { 
    Calendar, Flame, Zap, Award, Info, 
    ChevronRight, ChevronLeft, Map, Activity, Trophy
} from 'lucide-react';

const GRID_WEEKS = 12; // 84 days
const GRID_DAYS = 7;

export const ConsistencyMatrix = () => {
    const { logs, getStatusForScore } = useMood();

    // --- Generate 84 Day Log Map ---
    const matrixData = useMemo(() => {
        const today = new Date();
        const data = [];
        
        // Map logs to a YYYY-MM-DD string key
        const logMap = logs.reduce((acc, log) => {
            if (log.date) {
                const dateStr = new Date(log.date).toDateString();
                acc[dateStr] = log.score;
            }
            return acc;
        }, {});

        // Traverse backwards from today to build 84 days
        for (let i = GRID_WEEKS * GRID_DAYS - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateStr = date.toDateString();
            
            data.push({
                date: date,
                score: logMap[dateStr] || null,
                label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            });
        }
        return data;
    }, [logs]);

    const getCellColor = (score) => {
        if (score === null || score === undefined) return 'bg-white/5 border-white/5';
        if (score > 80) return 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)] border-cyan-400';
        if (score > 60) return 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.4)] border-white';
        if (score > 40) return 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] border-purple-400';
        return 'bg-pink-500 shadow-[0_0_10px_rgba(244,114,182,0.6)] border-pink-400';
    };

    const latestScore = logs.length > 0 ? logs[0].score : 0;
    const status = getStatusForScore(latestScore);

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 font-sans text-white relative z-10">
            
            {/* Header / Intro */}
            <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-4 border-b border-white/10"
            >
                <div>
                   <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-400 to-gray-600">
                      CONSISTENCY <span className="text-purple-500">MATRIX</span>
                   </h1>
                   <p className="text-gray-400 mt-1 text-xs uppercase tracking-[0.3em] font-bold">Resilience Continuity Visualization</p>
                </div>

                <div className="flex gap-4 bg-gray-900/40 p-3 rounded-2xl border border-white/10 shadow-inner">
                    <div className="flex flex-col items-center px-4 border-r border-white/5">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Coverage</span>
                        <span className="text-xl font-black text-white">{logs.length} <small className="text-[10px] text-gray-600">SESSIONS</small></span>
                    </div>
                    <div className="flex flex-col items-center px-4">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Current State</span>
                        <span className={`text-xl font-black uppercase tracking-tighter ${latestScore > 60 ? 'text-cyan-400' : 'text-pink-400'}`}>{status}</span>
                    </div>
                </div>
            </motion.div>

            {/* Matrix Card */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-[0_0_60px_rgba(0,0,0,0.6)] relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
                
                <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-600/20 rounded-2xl border border-purple-500/30">
                            <Activity size={24} className="text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">84-Day Telemetry Grid</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Showing resonance across 12 cycles</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-cyan-500"></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Optimal</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-white"></div>
                            <span className="text-[100px] font-black text-gray-400 uppercase tracking-widest opacity-0">.</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest -ml-[95px]">Stable</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-pink-500"></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Low</span>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-x-auto pb-4 scrollbar-hide">
                    <div className="grid grid-flow-col grid-rows-7 gap-3 min-w-max p-2">
                        {matrixData.map((day, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: idx * 0.005 }}
                                className={`w-8 h-8 rounded-lg border-2 transition-all cursor-crosshair relative group shadow-inner ${getCellColor(day.score)}`}
                            >
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-black/90 backdrop-blur-md border border-white/20 px-3 py-2 rounded-xl text-[10px] font-black text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all z-50 pointer-events-none shadow-2xl">
                                    <div className="text-gray-400 mb-1">{day.label}</div>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${day.score ? 'bg-cyan-400' : 'bg-gray-600'}`}></div>
                                        {day.score ? `Resonance: ${day.score}%` : 'No Telemetry'}
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45 -mt-1 border-r border-b border-white/20"></div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
                
                <div className="mt-10 flex justify-between items-center text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] border-t border-white/5 pt-8">
                    <span>-84 DAYS</span>
                    <span className="text-gray-400">CURRENT CYCLE</span>
                </div>
            </motion.div>

            {/* Achievement / Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-xl">
                    <div className="p-4 bg-yellow-500/10 rounded-2xl text-yellow-500 border border-yellow-500/20">
                        <Trophy size={28} />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Highest State</h4>
                        <p className="text-2xl font-black text-white">98% <small className="text-[10px] text-cyan-400 uppercase ml-1">Peak</small></p>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-xl">
                    <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-500 border border-cyan-500/20">
                        <Flame size={28} />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Consistency</h4>
                        <p className="text-2xl font-black text-white">{Math.round((logs.length / 84) * 100)}% <small className="text-[10px] text-gray-600 uppercase ml-1">Density</small></p>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-xl">
                    <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-500 border border-purple-500/20">
                        <Map size={28} />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Logs</h4>
                        <p className="text-2xl font-black text-white">{logs.length} <small className="text-[10px] text-gray-600 uppercase ml-1">Points</small></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsistencyMatrix;
