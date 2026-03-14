import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Sparkles, BrainCircuit, Zap, Users, Moon, Heart, Plus, X,
  Trash2, Info, Compass, ShieldCheck, Music
} from 'lucide-react';
import SpotifyConnect from './SpotifyConnect';

const API_URL = 'http://localhost:8000/api';

const INITIAL_RECOMMENDATIONS = [
  {
    id: 'rec1',
    category: 'Relaxation',
    iconName: 'brain',
    title: '5-Minute Deep Breathing',
    description: 'Breathe in for 4 seconds, hold for 4, exhale for 4. This simple exercise quickly lowers stress and calms your nervous system.',
    color: 'border-cyan-500/30',
    textColor: 'text-cyan-400'
  },
  {
    id: 'rec2',
    category: 'Movement',
    iconName: 'zap',
    title: 'Quick Walk',
    description: 'Feeling sluggish or anxious? A short 15-minute walk outside can naturally boost your mood and release feel-good chemicals.',
    color: 'border-purple-500/30',
    textColor: 'text-purple-400'
  },
  {
    id: 'rec3',
    category: 'Social',
    iconName: 'users',
    title: 'Reach Out to a Friend',
    description: 'Isolation can make things feel worse. Send a quick text or call someone you trust just to say hello.',
    color: 'border-pink-500/30',
    textColor: 'text-pink-400'
  },
  {
    id: 'rec4',
    category: 'Rest',
    iconName: 'moon',
    title: 'Screen-Free Wind Down',
    description: 'Blue light from phones makes it hard to fall asleep. Try putting your devices away an hour before bed.',
    color: 'border-blue-500/30',
    textColor: 'text-blue-400'
  }
];

const ICONS = {
  brain: <BrainCircuit size={24} className="text-cyan-400" />,
  zap: <Zap size={24} className="text-purple-400" />,
  users: <Users size={24} className="text-pink-400" />,
  moon: <Moon size={24} className="text-blue-400" />,
  heart: <Heart size={24} className="text-cyan-400" />,
};

const THEMES = [
  { color: 'border-cyan-500/30', textColor: 'text-cyan-400' },
  { color: 'border-purple-500/30', textColor: 'text-purple-400' },
  { color: 'border-pink-500/30', textColor: 'text-pink-400' },
  { color: 'border-blue-500/30', textColor: 'text-blue-400' },
];

export const Recommendations = () => {
  const [recommendations, setRecommendations] = useState(() => {
    const saved = localStorage.getItem('mind_ai_recommendations');
    return saved ? JSON.parse(saved) : INITIAL_RECOMMENDATIONS;
  });

  const [completedInterventions, setCompletedInterventions] = useState(() => {
    const saved = localStorage.getItem('mind_ai_completed_recs');
    const today = new Date().toDateString();
    if (saved) {
      const { date, ids } = JSON.parse(saved);
      if (date === today) return new Set(ids);
    }
    return new Set();
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [playlists, setPlaylists] = useState(null);
  const [activeMood, setActiveMood] = useState('happy');
  const [showSpotifyPlayer, setShowSpotifyPlayer] = useState(false);

  // Fetch Spotify playlists (no auth required)
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await fetch(`${API_URL}/spotify/playlists/`);
        if (response.ok) {
          const data = await response.json();
          setPlaylists(data);
        }
      } catch (err) {
        console.error('Failed to fetch playlists:', err);
      }
    };
    fetchPlaylists();
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem('mind_ai_recommendations', JSON.stringify(recommendations));
  }, [recommendations]);

  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem('mind_ai_completed_recs', JSON.stringify({
      date: today,
      ids: Array.from(completedInterventions)
    }));
  }, [completedInterventions]);

  const toggleComplete = (id) => {
    setCompletedInterventions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteRec = (id) => {
    setRecommendations(prev => prev.filter(r => r.id !== id));
    setCompletedInterventions(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleAddIntervention = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
    const newRec = {
      id: Date.now().toString(),
      category: 'Custom',
      iconName: 'heart',
      title: newTitle,
      description: newDesc,
      ...randomTheme
    };

    setRecommendations(prev => [...prev, newRec]);
    setNewTitle('');
    setNewDesc('');
    setShowAddForm(false);
  };

  const progressPercentage = recommendations.length > 0 ? (completedInterventions.size / recommendations.length) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 font-sans text-white relative z-10">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-4 border-b border-white/10"
      >
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-400 to-gray-600">
            INTELLIGENCE <span className="text-cyan-500">ENGINE</span>
          </h1>
          <p className="text-gray-400 mt-1 text-xs uppercase tracking-[0.3em] font-bold">Heuristic Behavioral Interventions</p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex-1 md:flex-none bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <Plus size={16} /> Deploy Custom
          </button>

          <div className="flex-1 md:flex-none bg-gray-900/40 p-3 rounded-xl border border-white/10 flex items-center gap-6 shadow-inner min-w-[180px]">
            <div className="flex-1">
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Batch Progress</p>
              <p className="text-xl font-black text-white">{completedInterventions.size} <span className="text-[10px] text-gray-600">/ {recommendations.length}</span></p>
            </div>
            <div className="w-16 h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className="h-full bg-cyan-500 shadow-[0_0_8px_cyan]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Add Custom Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-900/60 backdrop-blur-3xl border border-cyan-500/20 p-8 rounded-[2.5rem] shadow-[0_0_40px_rgba(0,0,0,0.5)] mb-8 relative">
              <button onClick={() => setShowAddForm(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">New Behavioral Protocol</h3>
              <form onSubmit={handleAddIntervention} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text" required placeholder="Protocol Name"
                  value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="text" required placeholder="Execution Steps..."
                  value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                  className="flex-[2] bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest px-8 py-4 rounded-2xl shadow-lg transition-all"
                >
                  Commit
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {recommendations.map((rec, index) => {
            const isDone = completedInterventions.has(rec.id);
            const Icon = ICONS[rec.iconName] || <Heart size={24} className={rec.textColor} />;

            return (
              <motion.div
                key={rec.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`group p-8 rounded-[2.5rem] border transition-all cursor-pointer relative flex flex-col justify-between min-h-[250px] ${isDone
                  ? 'bg-white/5 border-white/10 opacity-60 scale-[0.98]'
                  : `bg-gray-900/40 ${rec.color} hover:-translate-y-1 shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:shadow-cyan-500/10`
                  }`}
                onClick={() => toggleComplete(rec.id)}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-2xl bg-black/40 border transition-all ${isDone ? 'border-white/5 text-gray-600' : 'border-white/10'}`}>
                      {Icon}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteRec(rec.id); }}
                        className="p-2 text-gray-700 hover:text-pink-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${isDone ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'border-white/10 bg-black/40'
                        }`}>
                        {isDone && <Check size={20} className="text-gray-900" strokeWidth={3} />}
                      </div>
                    </div>
                  </div>

                  <h3 className={`text-xl font-black mb-3 leading-tight ${isDone ? 'text-gray-500 line-through decoration-white/20' : 'text-white'}`}>
                    {rec.title}
                  </h3>
                  <p className={`text-sm leading-relaxed font-medium ${isDone ? 'text-gray-600' : 'text-gray-400'}`}>
                    {rec.description}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                    {rec.category}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDone ? 'text-cyan-500' : 'text-gray-600 group-hover:text-white transition-colors'}`}>
                    {isDone ? 'Telemetry Verified' : 'Engage'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Spotify Music Player Section */}
      {playlists && (
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <Music className="text-green-400" size={24} />
            <h2 className="text-2xl font-black text-white">Mood Music</h2>
            <span className="text-xs text-gray-500 uppercase tracking-widest">Powered by Spotify</span>
          </div>

          {/* Mood Selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.keys(playlists).map((mood) => (
              <button
                key={mood}
                onClick={() => setActiveMood(mood)}
                className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${activeMood === mood
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {mood}
              </button>
            ))}
          </div>

          {/* Spotify Player with Web Playback SDK */}
          <SpotifyConnect
            playlistId={playlists[activeMood]?.spotify_playlist}
            mood={activeMood}
            showEmbedFallback={true}
          />
        </div>
      )}
    </div>
  );
};

export default Recommendations;
