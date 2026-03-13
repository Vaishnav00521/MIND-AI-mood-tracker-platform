import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Sparkles, Activity } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Generate mock data for a specific month and year
const generateMockMonthData = (year, month) => {
  const date = new Date(year, month, 1);
  const startDayOffset = date.getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const days = [];
  
  // Fill empty slots for days before the 1st
  for (let i = 0; i < startDayOffset; i++) {
     days.push(null);
  }
  
  // Current date for limiting future mock data
  const now = new Date();
  
  for (let i = 1; i <= daysInMonth; i++) {
    const loopDate = new Date(year, month, i);
    let status = null, score = null, journal = '';
    
    // Only generate data for past/current days
    if (loopDate <= now) {
        // Deterministic pseudo-random based on date so data doesn't flash randomly on navigation
        const seed = Math.sin(year * 1000 + month * 100 + i) * 10000;
        const rand = seed - Math.floor(seed);
        
        if (rand > 0.8) { 
            status = 'Optimal'; 
            score = Math.floor(rand * 20) + 80; 
            journal = 'Neural pathways firing flawlessly. Maximum efficiency detected during deep work cycles.'; 
        } else if (rand > 0.4) { 
            status = 'Nominal'; 
            score = Math.floor(rand * 20) + 60; 
            journal = 'Standard operational capacity. No anomalies. Completed all routine system checks.'; 
        } else if (rand > 0.15) { 
            status = 'Fatigued'; 
            score = Math.floor(rand * 20) + 35; 
            journal = 'System slow down detected. Recommend a defrag cycle soon. Sleep metrics suboptimal.'; 
        } else { 
            status = 'Critical'; 
            score = Math.floor(rand * 20) + 10; 
            journal = 'High priority alert: cortisol levels breached parameters. Immediate grounding required.'; 
        }
    }

    days.push(status ? { day: i, status, score, journal, date: loopDate } : { day: i, status: null, date: loopDate });
  }
  return days;
};

// Aurora Glass coloring
const getStatusColor = (status) => {
  switch (status) {
    case 'Optimal': return 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]';
    case 'Nominal': return 'bg-white/10 border-white/20 text-gray-300 hover:border-white/40 shadow-inner';
    case 'Fatigued': return 'bg-purple-500/20 border-purple-500/40 text-purple-400 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]';
    case 'Critical': return 'bg-pink-500/20 border-pink-500/40 text-pink-400 hover:border-pink-400 shadow-[0_0_15px_rgba(244,114,182,0.2)]';
    default: return 'bg-transparent border-transparent text-gray-600 hover:border-white/10 transition-colors';
  }
};

export const MoodCalendar = () => {
    // Current viewed month/year state
    const [currentDate, setCurrentDate] = useState(new Date());

    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    // Re-calculate the grid whenever the month changes
    const calendarDays = useMemo(() => {
        return generateMockMonthData(currentDate.getFullYear(), currentDate.getMonth());
    }, [currentDate.getFullYear(), currentDate.getMonth()]);

    // Extract data for live charts within the currently viewed month
    const validDays = calendarDays.filter(d => d && d.status);
    
    // Line Chart Data (Trend)
    const trendData = {
        labels: validDays.map(d => `Day ${d.day}`),
        datasets: [{
            label: 'Cognitive Score',
            data: validDays.map(d => d.score),
            fill: true,
            backgroundColor: 'rgba(168, 85, 247, 0.1)', // purple-500 alpha
            borderColor: '#A855F7',
            tension: 0.4,
            pointBackgroundColor: '#0B0F19',
            pointBorderColor: '#A855F7',
            borderWidth: 2,
            pointRadius: 0,
            pointHitRadius: 10,
        }]
    };

    const trendOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                titleColor: '#F3F4F6',
                bodyColor: '#A855F7',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
            }
        },
        scales: {
            y: { display: false, min: 0, max: 100 },
            x: { display: false }
        }
    };

    // Doughnut Chart Data (Distribution)
    const statusCounts = validDays.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {});

    const doughnutData = {
        labels: ['Optimal', 'Nominal', 'Fatigued', 'Critical'],
        datasets: [{
            data: [
                statusCounts['Optimal'] || 0,
                statusCounts['Nominal'] || 0,
                statusCounts['Fatigued'] || 0,
                statusCounts['Critical'] || 0,
            ],
            backgroundColor: [
                'rgba(6, 182, 212, 0.8)',   // cyan-500
                'rgba(156, 163, 175, 0.8)', // gray-400
                'rgba(168, 85, 247, 0.8)',  // purple-500
                'rgba(244, 114, 182, 0.8)'  // pink-400
            ],
            borderColor: '#0B0F19', // Matches app bg to create padding
            borderWidth: 2,
        }]
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                titleColor: '#F3F4F6',
                bodyColor: '#9CA3AF',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
            }
        }
    };

    // Calculate a trailing velocity percentage (Mock logic: compare first half vs second half of month)
    const velocity = useMemo(() => {
        if (validDays.length < 2) return "+0%";
        const half = Math.floor(validDays.length / 2);
        const firstHalf = validDays.slice(0, half).reduce((sum, d) => sum + d.score, 0) / half;
        const secondHalf = validDays.slice(half).reduce((sum, d) => sum + d.score, 0) / (validDays.length - half);
        const diff = ((secondHalf - firstHalf) / firstHalf) * 100;
        return `${diff > 0 ? '+' : ''}${Math.round(diff)}%`;
    }, [validDays]);


    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-12 font-sans text-white relative z-10 p-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              <Calendar className="text-purple-400" strokeWidth={1.5} size={32}/>
              Temporal Log
            </h1>
            <p className="text-gray-400 mt-2 text-xs uppercase tracking-[0.2em] font-bold">Analyzed historical topography</p>
          </div>
          
          <div className="flex items-center gap-4 bg-gray-900/50 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-inner font-semibold text-sm">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-cyan-400"><ChevronLeft size={20}/></button>
            <span className="text-gray-200 min-w-[140px] text-center tracking-widest uppercase text-xs font-bold">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button 
                onClick={handleNextMonth} 
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-cyan-400 disabled:opacity-30 disabled:hover:bg-transparent"
                disabled={currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()} // Cannot traverse into pure future
            >
                <ChevronRight size={20}/>
            </button>
          </div>
        </motion.div>

        {/* Main Grid: Calendar + Live Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Calendar Section */}
            <motion.div 
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-[0_0_30px_rgba(0,0,0,0.4)] border border-white/10 relative overflow-hidden"
            >
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="text-center text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentDate.toString()}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="col-span-7 grid grid-cols-7 gap-1 sm:gap-2"
                   >
                    {calendarDays.map((dateObj, index) => {
                      if (!dateObj) {
                        return <div key={`empty-${index}`} className="aspect-square rounded-lg bg-transparent" />;
                      }

                      const { day, status, score, journal, date } = dateObj;
                      const hasData = status !== null;
                      
                      const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

                      return (
                         <motion.div 
                          key={index}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.005, ease: "easeOut" }}
                          className={`relative group aspect-square rounded-lg sm:rounded-xl border ${getStatusColor(status)} flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm ${hasData ? 'hover:scale-[1.05] hover:z-20' : ''} ${isToday ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-gray-900' : ''}`}
                        >
                          <span className={`text-xs sm:text-sm font-bold ${hasData ? '' : 'text-gray-600'}`}>
                            {day}
                          </span>

                          {/* Aurora Tooltip Component */}
                          {hasData && (
                            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 sm:w-64 bg-gray-900/95 backdrop-blur-xl border border-white/20 text-white text-xs rounded-2xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none transform group-hover:-translate-y-2">
                              
                              <div className="flex justify-between items-start mb-3 pb-3 border-b border-white/10">
                                <div>
                                    <span className={`font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 ${status === 'Critical' ? 'text-pink-400' : status === 'Optimal' ? 'text-cyan-400' : status === 'Fatigued' ? 'text-purple-400' : 'text-gray-300'}`}>
                                       {status === 'Optimal' && <Sparkles size={10}/>} {status}
                                    </span>
                                    <span className="text-[9px] text-gray-500 font-bold block mt-1 uppercase tracking-wider">{MONTHS[date.getMonth()]} {day}, {date.getFullYear()}</span>
                                </div>
                                <span className="bg-white/10 px-2 py-1 rounded text-[9px] font-black text-white tracking-[0.2em] uppercase border border-white/5 shadow-inner">Score: {score}</span>
                              </div>
                              <p className="text-gray-400 leading-relaxed text-[11px] font-medium italic break-words whitespace-normal relative z-10 block w-full">"{journal}"</p>
                              
                              {/* Glowing bottom edge indicator */}
                              <div className={`absolute bottom-0 left-0 w-full h-1 rounded-b-2xl opacity-50 ${status === 'Critical' ? 'bg-pink-500' : status === 'Optimal' ? 'bg-cyan-500' : status === 'Fatigued' ? 'bg-purple-500' : 'bg-gray-500'}`}></div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Live Charts Section */}
            <div className="space-y-6 flex flex-col">
                
                {/* Distribution Chart */}
                <motion.div 
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_0_30px_rgba(0,0,0,0.4)] border border-white/10 relative overflow-hidden flex-1 flex flex-col"
                >
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                       <Activity size={14} className="text-cyan-400" /> State Distribution
                    </h3>
                    
                    <div className="relative h-40 flex-1 flex items-center justify-center">
                        {validDays.length > 0 ? (
                            <Doughnut data={doughnutData} options={doughnutOptions} />
                        ) : (
                            <div className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Awaiting Telemetry</div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                            <span className="text-2xl font-black text-white">{validDays.length}</span>
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Logs</span>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-between gap-2 text-[9px] font-bold tracking-[0.1em] uppercase text-gray-400 border-t border-white/10 pt-4">
                        {['Optimal', 'Nominal', 'Fatigued', 'Critical'].map(s => (
                        <div key={s} className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full border ${getStatusColor(s).split(' ')[0]} ${getStatusColor(s).split(' ')[1]}`}></div>
                            <span>{s.substring(0,3)}</span>
                        </div>
                        ))}
                    </div>
                </motion.div>

                {/* Trailing Trend Line Chart */}
                <motion.div 
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-purple-900/10 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_0_30px_rgba(0,0,0,0.4)] border border-purple-500/20 relative overflow-hidden h-40 flex flex-col justify-between"
                >
                    <div className="flex justify-between items-center mb-2 relative z-10">
                        <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em]">Trailing Velocity</h3>
                        <span className={`text-[9px] font-black px-2 py-1 rounded border ${velocity.includes('-') ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' : 'bg-purple-500/20 text-white border-purple-500/30'}`}>
                            {velocity}
                        </span>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 w-full h-24">
                        {validDays.length > 0 ? (
                           <Line data={trendData} options={trendOptions} />
                        ) : (
                           <div className="h-full flex items-center justify-center border-t border-purple-500/10">
                              <span className="text-purple-400/50 text-[9px] uppercase tracking-widest font-bold">No Data</span>
                           </div>
                        )}
                    </div>
                </motion.div>

            </div>

        </div>
      </div>
    );
};
