import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CheckSquare, CalendarDays, BrainCircuit, LogOut, HeartPulse, Building2, Target, Grid3X3, MessageSquareText, ShieldCheck, Sparkles, Globe, Camera, Mic, Waves } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Login, Register } from './Auth';
import Dashboard from './Dashboard';
import Survey from './Survey';
import MoodCalendar from './MoodCalendar';
import Recommendations from './Recommendations';
import MoodCapture from './MoodCapture';
import VoiceJournal from './VoiceJournal';
import OneSwipeCheckIn from './OneSwipeCheckIn';
import ResonanceGrid from './ResonanceGrid';

// Pro / Enterprise Expansion Components
import TherapistDashboard from './TherapistDashboard';
import DailyQuests from './DailyQuests';
import ConsistencyMatrix from './ConsistencyMatrix';
import AICompanionChat from './AICompanionChat';
import PrivacyHub from './PrivacyHub';
import EntityDashboard from './EntityDashboard';
import { AnimatedBackground } from './AnimatedBackground';

// Premium Side Navigation Layout - Aurora Glass Theme
const NavLink = ({ to, icon, label, isActive, colorClass = "text-gray-400 hover:text-white" }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium relative overflow-hidden group ${isActive
      ? 'bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-md'
      : `${colorClass} border border-transparent hover:bg-white/5`
      }`}
  >
    {isActive && <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent"></div>}
    <span className="relative z-10">{icon}</span>
    <span className="tracking-wide relative z-10">{label}</span>
    {/* Enterprise Badge */}
    {label === "Pro Clinic" && <span className="ml-auto bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-widest relative z-10">B2B</span>}
  </Link>
);

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };
  return (
    <div className="flex items-center gap-2 bg-gray-900/50 border border-white/10 rounded-xl px-2 py-1.5 shadow-inner">
      <Globe size={14} className="text-gray-400" />
      <select
        onChange={changeLanguage}
        value={i18n.language || 'en'}
        className="bg-transparent text-white text-xs focus:outline-none cursor-pointer w-full tracking-wider font-bold uppercase appearance-none"
      >
        <option value="en" className="bg-gray-900 text-white">English</option>
        <option value="hi" className="bg-gray-900 text-white">Hindi (हिंदी)</option>
        <option value="gu" className="bg-gray-900 text-white">Gujarati (ગુજરાતી)</option>
        <option value="mr" className="bg-gray-900 text-white">Marathi (मराठी)</option>
      </select>
    </div>
  );
};

const Layout = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useTranslation();

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white selection:bg-purple-500/30 selection:text-white relative overflow-hidden">
      <AnimatedBackground />
      {/* Aurora Ambient Background */}
      <div className="fixed top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-purple-900/40 rounded-full blur-3xl pointer-events-none mix-blend-screen opacity-60"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-900/40 rounded-full blur-3xl pointer-events-none mix-blend-screen opacity-50"></div>
      <div className="fixed top-[40%] left-[30%] w-[50vw] h-[50vw] bg-blue-900/30 rounded-full blur-3xl pointer-events-none mix-blend-screen opacity-40"></div>

      {/* Glass Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-gradient-to-b from-slate-800/60 to-slate-900/60 backdrop-blur-2xl border-r border-white/10 z-20">
        <div className="p-8 flex flex-col gap-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500/20 to-cyan-500/20 p-2 rounded-2xl text-white border border-white/20 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <Sparkles size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{t('app.title')}</h1>
          </div>
          <LanguageSelector />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden relative">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3 px-4 mt-2">Space</div>
          <NavLink to="/dashboard" icon={<LayoutDashboard size={20} strokeWidth={1.5} />} label={t('nav.dashboard')} isActive={currentPath === '/dashboard'} />
          <NavLink to="/survey" icon={<CheckSquare size={20} strokeWidth={1.5} />} label={t('nav.survey')} isActive={currentPath === '/survey'} />
          <NavLink to="/capture" icon={<Camera size={20} strokeWidth={1.5} />} label="Quick Capture" isActive={currentPath === '/capture'} colorClass="text-cyan-400 hover:text-cyan-300" />
          <NavLink to="/voice" icon={<Mic size={20} strokeWidth={1.5} />} label="Voice Journal" isActive={currentPath === '/voice'} colorClass="text-purple-400 hover:text-purple-300" />
          <NavLink to="/swipe" icon={<Waves size={20} strokeWidth={1.5} />} label="Swipe Check" isActive={currentPath === '/swipe'} colorClass="text-pink-400 hover:text-pink-300" />
          <NavLink to="/resonance" icon={<Sparkles size={20} strokeWidth={1.5} />} label="Resonance" isActive={currentPath === '/resonance'} colorClass="text-purple-400 hover:text-purple-300" />
          <NavLink to="/calendar" icon={<CalendarDays size={20} strokeWidth={1.5} />} label={t('nav.calendar')} isActive={currentPath === '/calendar'} />

          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3 mt-8 px-4">Cultivate</div>
          <NavLink to="/quests" icon={<Target size={20} strokeWidth={1.5} />} label={t('nav.habits')} isActive={currentPath === '/quests'} />
          <NavLink to="/matrix" icon={<Grid3X3 size={20} strokeWidth={1.5} />} label="Consistency" isActive={currentPath === '/matrix'} />
          <NavLink to="/chat" icon={<MessageSquareText size={20} strokeWidth={1.5} />} label={t('nav.ai_chat')} isActive={currentPath === '/chat'} />
          <NavLink to="/recommendations" icon={<BrainCircuit size={20} strokeWidth={1.5} />} label="Intelligence" isActive={currentPath === '/recommendations'} />

          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3 mt-8 px-4">Network</div>
          <NavLink to="/entity" icon={<Building2 size={20} strokeWidth={1.5} />} label="Entity Portal" isActive={currentPath === '/entity'} />
          <NavLink to="/clinic" icon={<Building2 size={20} strokeWidth={1.5} />} label="Pro Clinic" isActive={currentPath === '/clinic'} />
          <NavLink to="/privacy" icon={<ShieldCheck size={20} strokeWidth={1.5} />} label={t('nav.privacy')} isActive={currentPath === '/privacy'} />
        </nav>

        <div className="p-6 border-t border-white/10 flex-shrink-0">
          <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all font-medium border border-transparent">
            <LogOut size={20} strokeWidth={1.5} />
            <span className="text-sm font-medium">Disconnect</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full relative z-10">
        {/* Mobile Top Nav */}
        <div className="md:hidden bg-gray-900/60 backdrop-blur-xl border-b border-white/10 p-4 flex justify-between items-center sticky top-0 z-50 shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="text-purple-400" size={24} />
            <span className="font-bold text-lg text-white">{t('app.title')}</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Link to="/login"><LogOut className="text-red-400" size={20} /></Link>
          </div>
        </div>

        <div className="p-4 sm:p-8 lg:p-12 lg:pl-16 min-h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPath}
              initial={{ opacity: 0, y: 15, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -15, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes Wrapper */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/survey" element={<Layout><Survey /></Layout>} />
        <Route path="/capture" element={<Layout><MoodCapture /></Layout>} />
        <Route path="/voice" element={<Layout><VoiceJournal /></Layout>} />
        <Route path="/swipe" element={<Layout><OneSwipeCheckIn /></Layout>} />
        <Route path="/resonance" element={<ResonanceGrid />} />
        <Route path="/calendar" element={<Layout><MoodCalendar /></Layout>} />
        <Route path="/recommendations" element={<Layout><Recommendations /></Layout>} />

        {/* Pro / Enterprise Expansion Routes */}
        <Route path="/clinic" element={<Layout><TherapistDashboard /></Layout>} />
        <Route path="/entity" element={<Layout><EntityDashboard /></Layout>} />
        <Route path="/quests" element={<Layout><DailyQuests /></Layout>} />
        <Route path="/matrix" element={<Layout><ConsistencyMatrix /></Layout>} />
        <Route path="/chat" element={<Layout><AICompanionChat /></Layout>} />
        <Route path="/privacy" element={<Layout><PrivacyHub /></Layout>} />

      </Routes>
    </Router>
  );
}

export default App;
