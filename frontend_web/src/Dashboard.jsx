import React from 'react';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Filler,
} from 'chart.js';
import { Activity, Moon, Flame, ArrowRight, BrainCircuit, Sparkles, Coffee } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

// --- Mock Data ---
const lineData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Trend',
      data: [65, 59, 80, 81, 56, 95, 85],
      fill: true,
      backgroundColor: 'rgba(139, 92, 246, 0.15)', // purple-500 with opacity
      borderColor: '#8B5CF6', // purple-500
      borderWidth: 2,
      pointBackgroundColor: '#0B0F19', // gray-900 absolute bg
      pointBorderColor: '#06B6D4', // cyan-500
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.4,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.9)', // gray-900 with opacity
      titleColor: '#F3F4F6', // gray-100
      bodyColor: '#9CA3AF', // gray-400
      bodyFont: { size: 14, weight: '500', family: 'Inter' },
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      padding: 12,
      displayColors: false,
    }
  },
  scales: {
    y: {
      min: 0,
      max: 100,
      grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
      ticks: { color: '#6B7280', stepSize: 20, font: { family: 'Inter' } },
    },
    x: {
      grid: { display: false, drawBorder: false },
      ticks: { color: '#6B7280', font: { family: 'Inter' } },
    }
  },
  interaction: { mode: 'index', intersect: false },
};

const insights = [
  { id: 1, icon: <BrainCircuit size={18} className="text-purple-400" />, text: "You sleep better on days when you drink enough water.", color: "bg-purple-500/10 border-purple-500/20", iconBox: "text-purple-400" },
  { id: 2, icon: <Sparkles size={18} className="text-cyan-400" />, text: "Your mood is trending upwards this week!", color: "bg-cyan-500/10 border-cyan-500/20", iconBox: "text-cyan-400" },
  { id: 3, icon: <Coffee size={18} className="text-pink-400" />, text: "Taking short breaks improves your afternoon energy.", color: "bg-pink-500/10 border-pink-500/20", iconBox: "text-pink-400" },
];

export const Dashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 font-sans relative z-10">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -5 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('dashboard.greeting')}</h1>
          <p className="text-gray-400 mt-1 text-md bg-clip-text text-transparent bg-gradient-to-r from-gray-300 to-gray-500">Here is your progress and mood history.</p>
        </div>
      </motion.div>
      
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: t('dashboard.mood_score'), value: "85", subtitle: "Good", icon: <Activity size={24}/>, trend: "Feeling great today", theme: "cyan-400", textDark: "cyan-400", bgLight: "cyan-500/10", border: "cyan-500/20" },
          { title: "Sleep Tracker", value: "7.5", subtitle: "hrs", icon: <Moon size={24}/>, trend: "Good amount of rest", theme: "purple-400", textDark: "purple-400", bgLight: "purple-500/10", border: "purple-500/20" },
          { title: t('dashboard.streak'), value: "14", subtitle: "Days", icon: <Flame size={24}/>, trend: "Keep going!", theme: "pink-400", textDark: "pink-400", bgLight: "pink-500/10", border: "pink-500/20" }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
            className={`bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 flex flex-col justify-between group shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:bg-white/10 hover:border-${stat.theme}/30 transition-all`}
          >
           <div className="flex justify-between items-start mb-6">
              <h3 className="text-gray-400 font-semibold text-sm xl:text-md tracking-wide uppercase">{stat.title}</h3>
              <div className={`p-3 rounded-2xl bg-${stat.bgLight} text-${stat.textDark} border border-${stat.border} shadow-inner`}>
                  {React.cloneElement(stat.icon, { strokeWidth: 1.5 })}
              </div>
           </div>
           <div>
             <div className="flex items-baseline gap-2">
               <span className="text-4xl font-bold text-white tracking-tight">{stat.value}</span>
               <span className={`text-lg text-gray-500 font-medium`}>{stat.subtitle}</span>
             </div>
             <p className={`text-sm font-medium text-${stat.textDark} mt-3 flex items-center gap-1 opacity-90`}>
               {stat.trend}
             </p>
           </div>
          </motion.div>
        ))}
      </div>

      {/* 2-Column Grid: Chart & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Line Chart */}
        <motion.div 
           initial={{ opacity: 0, y: 15 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
           className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 lg:col-span-2 flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.3)]"
        >
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-semibold text-xl text-white">{t('dashboard.chart_title')}</h3>
              <select className="bg-gray-900/50 backdrop-blur-md border border-white/10 text-white text-xs font-medium rounded-lg py-2 px-3 focus:outline-none focus:border-purple-500 cursor-pointer shadow-inner">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="flex-1 w-full min-h-[300px]">
                <Line data={lineData} options={chartOptions} />
            </div>
        </motion.div>

        {/* Right Column: AI Insights */}
        <motion.div 
           initial={{ opacity: 0, y: 15 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
           className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.3)]"
        >
            <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
              <Sparkles className="text-purple-400" size={24} strokeWidth={1.5} />
              <h3 className="font-semibold text-xl text-white">Daily Tips</h3>
            </div>
            
            <div className="flex-1 space-y-4">
              {insights.map((insight, idx) => (
                <motion.div 
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + (idx * 0.1) }}
                  className="flex gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 cursor-pointer group backdrop-blur-sm"
                >
                  <div className={`mt-1 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border shadow-inner ${insight.color}`}>
                    {React.cloneElement(insight.icon, { strokeWidth: 1.5, className: insight.iconBox })}
                  </div>
                  <div>
                    <p className="text-sm text-gray-200 leading-relaxed font-medium">{insight.text}</p>
                    <p className="text-xs text-purple-400 mt-2 flex items-center gap-1 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Read more <ArrowRight size={14} strokeWidth={2} />
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <button className="mt-6 w-full py-3.5 rounded-xl bg-gray-900/50 backdrop-blur-md text-white font-semibold text-sm hover:border-purple-500 transition-all border border-white/10 shadow-inner group flex justify-center items-center gap-2">
              See All Tips <ArrowRight size={16} className="text-purple-500 group-hover:translate-x-1 transition-transform" />
            </button>
        </motion.div>

      </div>
    </div>
  );
};
