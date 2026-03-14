import React, { useMemo, useState, useEffect } from 'react';
import { Line, Radar, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler, RadialLinearScale, ArcElement, BarElement,
} from 'chart.js';
import {
  Activity, ArrowRight, Zap, Target, BookOpen, BrainCircuit, Heart, Flame, Sparkles,
  TrendingUp, Clock, ShieldAlert, Award, CheckCircle2, RefreshCcw, Gauge, ZapOff, Camera, Mic, Waves,
  Cpu, Network, Lightbulb, Star, Trophy, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMood } from './MoodContext';
import NeuroField from './NeuroField';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler, RadialLinearScale, ArcElement, BarElement
);

const Counter = ({ value, duration = 1.2 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) { setCount(end); return; }
    let incrementTime = Math.max(10, (duration * 1000) / end);
    let timer = setInterval(() => {
      start += Math.ceil(end / 80);
      if (start >= end) { setCount(end); clearInterval(timer); }
      else { setCount(start); }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{count}</span>;
};

export const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logs, streak, weekTrend } = useMood();

  const validLogs = useMemo(() => {
    if (!logs || !Array.isArray(logs)) return [];
    return logs.filter(l => l && typeof l.score === 'number');
  }, [logs]);

  const latestLog = validLogs.length > 0 ? validLogs[0] : null;
  const currentScore = latestLog ? latestLog.score : 0;
  const previousScore = validLogs.length > 1 ? validLogs[1].score : 0;
  const scoreChange = currentScore - previousScore;

  const dynamicTips = useMemo(() => {
    const score = currentScore;
    if (score === 0) return { title: "Welcome!", text: "Complete your first check-in to get started.", icon: RefreshCcw, color: "text-gray-400" };
    if (score <= 20) return { title: "Feeling Low", text: "Take some time for yourself today. Try a short walk or talk to someone.", icon: ShieldAlert, color: "text-pink-400" };
    if (score <= 40) return { title: "Not Great", text: "Your energy is low. Consider taking a 15-minute break.", icon: ZapOff, color: "text-purple-400" };
    if (score <= 60) return { title: "Doing Okay", text: "You're doing fine. A short walk might help.", icon: Activity, color: "text-blue-400" };
    if (score <= 80) return { title: "Feeling Good", text: "You have good energy! Great time for important tasks.", icon: Zap, color: "text-cyan-400" };
    return { title: "Great Day!", text: "You're feeling amazing! Perfect time for creative work.", icon: Sparkles, color: "text-yellow-400" };
  }, [currentScore]);

  const chartData = useMemo(() => {
    const labels = weekTrend.map(t => t.label);
    const dataPoints = weekTrend.map(t => t.score);
    const displayData = dataPoints.map(d => d === null ? 0 : d);
    return {
      labels,
      datasets: [{
        label: 'My Mood',
        data: displayData,
        borderColor: '#8B5CF6',
        backgroundColor: (context) => {
          const chart = context.chart;
          if (!chart.chartArea) return null;
          const gradient = chart.ctx.createLinearGradient(0, chart.chartArea.top, 0, chart.chartArea.bottom);
          gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
          return gradient;
        },
        borderWidth: 3,
        pointBackgroundColor: displayData.map((_, i) => i === 6 ? '#06B6D4' : '#8B5CF6'),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: displayData.map((_, i) => i === 6 ? 6 : 0),
        fill: true,
        tension: 0.4,
      }]
    };
  }, [weekTrend]);

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      y: { min: 0, max: 100, ticks: { display: false }, grid: { display: false } },
      x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } } }
    }
  };

  const radarData = {
    labels: ['Focus', 'Social', 'Sleep', 'Exercise', 'Energy', 'Diet'],
    datasets: [{
      data: latestLog ? [75, 60, 85, 70, currentScore, 65] : [50, 50, 50, 50, 50, 50],
      backgroundColor: 'rgba(6, 182, 212, 0.2)',
      borderColor: 'rgba(6, 182, 212, 1)',
      borderWidth: 1, pointRadius: 0
    }]
  };

  const radarOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      r: {
        angleLines: { color: 'rgba(255,255,255,0.05)' },
        grid: { color: 'rgba(255,255,255,0.05)' },
        pointLabels: { color: 'rgba(255,255,255,0.4)', font: { size: 9 } },
        ticks: { display: false, min: 0, max: 100 }
      }
    }
  };

  const TipIcon = dynamicTips.icon;

  // Get mood color based on score
  const getMoodColor = (score) => {
    if (score >= 80) return '#00FF88';
    if (score >= 60) return '#4ECDC4';
    if (score >= 40) return '#A0A0FF';
    if (score >= 20) return '#5C7AEA';
    return '#FF4757';
  };

  return (
    <>
      <NeuroField mood={currentScore >= 60 ? 'happy' : currentScore >= 40 ? 'neutral' : 'sad'} intensity={0.3} />
      <div className="max-w-6xl mx-auto pb-20 font-sans text-white relative px-4 sm:px-0 z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-300 to-gray-600">
              NEXUS CORE <span className="text-cyan-500 font-normal tracking-widest text-base ml-2 opacity-80">v2.4.0</span>
            </h1>
            <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">
              <Clock size={12} className="text-purple-500" />
              <span>{new Date().toLocaleTimeString()} // Node: SECURE</span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/capture')}
            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl font-black tracking-tighter flex items-center gap-2 border border-purple-400/30 text-sm uppercase"
          >
            <Camera size={16} /> Quick Capture
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/voice')}
            className="px-5 py-3 bg-pink-600/20 border border-pink-500/30 rounded-2xl font-black tracking-tighter flex items-center gap-2 text-sm uppercase text-pink-400 hover:bg-pink-600/30"
          >
            <Mic size={16} /> Voice
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/swipe')}
            className="px-5 py-3 bg-blue-600/20 border border-blue-500/30 rounded-2xl font-black tracking-tighter flex items-center gap-2 text-sm uppercase text-blue-400 hover:bg-blue-600/30"
          >
            <Waves size={16} /> Swipe
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/survey')}
            className="px-5 py-3 bg-gray-800/50 border border-white/10 rounded-2xl font-black tracking-tighter flex items-center gap-2 text-sm uppercase text-gray-400 hover:text-white hover:bg-gray-800"
          >
            Full Survey
          </motion.button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {/* Score */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Gauge size={14} className="text-purple-400" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Mood Score</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white"><Counter value={currentScore} /></span>
              <span className="text-lg font-bold text-gray-600">%</span>
            </div>
            <div className={`mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${scoreChange >= 0 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-pink-500/20 text-pink-400'}`}>
              {scoreChange >= 0 ? '+' : ''}{scoreChange} variance
            </div>
          </div>

          {/* Streak */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Flame size={14} className="text-orange-400" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Persistence</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white"><Counter value={streak} /></span>
              <span className="text-xs font-bold text-gray-500 uppercase">Days</span>
            </div>
            <p className="mt-3 text-[9px] font-bold text-gray-600 uppercase tracking-widest">Streak Node Active</p>
          </div>

          {/* Tip */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <TipIcon size={14} className={dynamicTips.color} />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{dynamicTips.title}</span>
            </div>
            <p className="text-sm font-medium text-gray-300 leading-relaxed">"{dynamicTips.text}"</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Waveform */}
          <div className="md:col-span-2 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-purple-400" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Mood Trend</span>
            </div>
            <div className="h-56">
              <Line data={chartData} options={chartOptions} />
            </div>
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mt-3 text-center">Weekly Mood History</p>
          </div>

          {/* Radar */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={14} className="text-cyan-400" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Parametric</span>
            </div>
            <div className="h-48">
              <Radar data={radarData} options={radarOptions} />
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Sub-system Tethers */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit size={14} className="text-purple-400" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Tethers</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Check-in", icon: BrainCircuit, color: "text-purple-400" },
                { label: "Health", icon: Heart, color: "text-red-400", active: true },
                { label: "Milestones", icon: Award, color: "text-yellow-400", count: "12/20" }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <item.icon size={14} className={item.color} />
                    <span className="text-[10px] font-bold text-gray-400">{item.label}</span>
                  </div>
                  {item.active ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                  ) : item.count ? (
                    <span className="text-[8px] font-black text-gray-600">{item.count}</span>
                  ) : (
                    <CheckCircle2 size={12} className="text-cyan-600" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Mind Insights */}
          <div className="sm:col-span-2 bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-cyan-900/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500/30 to-cyan-500/30 rounded-xl border border-purple-400/30">
                  <BrainCircuit className="text-purple-300" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Mind Insights</h3>
                  <p className="text-xs text-purple-300/70">Your mood patterns</p>
                </div>
              </div>

              {/* Mood Distribution */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={14} className="text-cyan-400" />
                    <span className="text-xs text-gray-400">Emotional Balance</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{currentScore > 0 ? Math.round(currentScore) : '--'}%</div>
                  <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: getMoodColor(currentScore) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${currentScore}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>

                <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={14} className="text-yellow-400" />
                    <span className="text-xs text-gray-400">Energy Level</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{streak || 0} day streak</div>
                  <p className="text-xs text-gray-500 mt-1">Keep the momentum!</p>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <Lightbulb size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white">{currentScore >= 60 ? 'Your mood is trending upward! Consider sharing this positivity with others.' : 'Consider taking a short walk or practicing deep breathing.'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                  <Star size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white">Weekly insight: You've been most consistent with your morning check-ins.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="sm:col-span-2 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Target size={14} className="text-cyan-400" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Quick Navigation</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Daily Check-in", path: "/survey", icon: BookOpen, color: "text-purple-400 border-purple-500/20" },
                { label: "AI Companion", path: "/ai-chat", icon: Sparkles, color: "text-cyan-400 border-cyan-500/20" },
                { label: "Habits Engine", path: "/habits", icon: Flame, color: "text-orange-400 border-orange-500/20" },
                { label: "Calendar View", path: "/calendar", icon: Clock, color: "text-blue-400 border-blue-500/20" },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-3 p-4 bg-black/20 rounded-xl border border-white/5 hover:bg-white/5 transition-colors text-left`}
                >
                  <item.icon size={16} className={item.color.split(' ')[0]} />
                  <span className="text-xs font-bold text-gray-300">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
