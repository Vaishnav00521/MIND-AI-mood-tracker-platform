import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Circle, Trophy, Flame, Star, Plus, X,
  Sparkles, Trash2, Brain, Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useMood } from './MoodContext';

const DEFAULT_QUESTS = [
  { id: 'q1', text: 'Meditate for 5 minutes', category: 'Mindfulness', points: 15, iconName: 'brain' },
  { id: 'q2', text: 'Drink 8 glasses of water', category: 'Health', points: 10, iconName: 'heart' },
  { id: 'q3', text: 'Write a daily journal entry', category: 'Growth', points: 20, iconName: 'star' },
];

const ICONS = {
  brain: <Brain size={18} />,
  heart: <Heart size={18} />,
  star: <Star size={18} />,
  sparkles: <Sparkles size={18} />
};

export const DailyQuests = () => {
  const { streak } = useMood();

  const loadHabits = () => {
    const saved = localStorage.getItem('mind_ai_habits');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map(h => ({
          ...h,
          id: h.id || Math.random().toString(36).substr(2, 9),
          points: h.points || 10
        }));
      } catch (e) {
        console.error("Failed to parse habits", e);
      }
    }
    return DEFAULT_QUESTS;
  };

  const [quests, setQuests] = useState(loadHabits);
  const [completed, setCompleted] = useState(() => {
    const saved = localStorage.getItem('mind_ai_completed_today');
    const today = new Date().toDateString();
    if (saved) {
      const { date, ids } = JSON.parse(saved);
      if (date === today) return new Set(ids);
    }
    return new Set();
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitText, setNewHabitText] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('Growth');

  useEffect(() => {
    localStorage.setItem('mind_ai_habits', JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem('mind_ai_completed_today', JSON.stringify({
      date: today,
      ids: Array.from(completed)
    }));
  }, [completed]);

  const toggleQuest = (id) => {
    const isNowCompleted = !completed.has(id);

    if (isNowCompleted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06B6D4', '#8B5CF6', '#F472B6']
      });
    }

    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addHabit = (e) => {
    e.preventDefault();
    if (!newHabitText.trim()) return;

    const newQuest = {
      id: Math.random().toString(36).substr(2, 9),
      text: newHabitText,
      category: newHabitCategory,
      points: 10 + Math.floor(Math.random() * 10),
      iconName: 'sparkles'
    };

    setQuests([...quests, newQuest]);
    setNewHabitText('');
    setShowAddModal(false);
  };

  const deleteHabit = (id) => {
    setQuests(quests.filter(q => q.id !== id));
    setCompleted(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const progress = (completed.size / quests.length) * 100;
  const totalPoints = Array.from(completed).reduce((sum, id) => {
    const q = quests.find(quest => quest.id === id);
    return sum + (q ? q.points : 0);
  }, 0);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: '2rem 1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '2rem'
          }}
          className="md:flex-row md:items-center"
        >
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', margin: 0 }}>
              Daily <span style={{ color: '#22d3ee' }}>Habits</span>
            </h1>
            <p style={{ color: '#9ca3af', marginTop: '0.25rem', fontSize: '0.875rem' }}>
              Build better habits, one day at a time
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', width: '100%' }} className="md:w-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.75rem',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
              className="md:flex-none hover:bg-white/20"
            >
              <Plus size={16} /> Add Habit
            </motion.button>
            <div style={{
              flex: 1,
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(59,130,246,0.2))',
              border: '1px solid rgba(34,211,238,0.3)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem'
            }} className="md:flex-none">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Flame size={18} style={{ color: '#f97316' }} />
                <span style={{ fontSize: '1.25rem', fontWeight: '900', color: 'white' }}>{streak}</span>
              </div>
              <div style={{ width: '1px', height: '1rem', background: 'rgba(255,255,255,0.2)' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={18} style={{ color: '#eab308' }} />
                <span style={{ fontSize: '1.25rem', fontWeight: '900', color: 'white' }}>{totalPoints} XP</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'rgba(15,23,42,0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '2rem',
            borderRadius: '1.5rem',
            marginBottom: '2rem'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="md:flex-row md:justify-between md:items-center">
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white', marginBottom: '0.5rem' }}>
                Today's Progress
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                {completed.size} of {quests.length} habits completed
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#22d3ee', textTransform: 'uppercase' }}>Progress</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white' }}>{Math.round(progress)}%</span>
              </div>
              <div style={{ width: '100%', height: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: '999px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #22d3ee, #8b5cf6)',
                    borderRadius: '999px'
                  }}
                />
              </div>
            </div>

            <div style={{
              padding: '1.5rem',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '1rem',
              border: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center'
            }} className="md:w-48">
              <Trophy size={32} style={{ color: '#a78bfa', marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Bonus at 100%</p>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>+50 XP</p>
            </div>
          </div>
        </motion.div>

        {/* Habits Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          <AnimatePresence>
            {quests.map((quest, index) => {
              const isDone = completed.has(quest.id);
              return (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => toggleQuest(quest.id)}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '1.5rem',
                    border: isDone ? '1px solid #22d3ee' : '1px solid rgba(255,255,255,0.1)',
                    background: isDone ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '180px'
                  }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{
                        padding: '0.75rem',
                        borderRadius: '1rem',
                        background: 'rgba(0,0,0,0.3)',
                        border: isDone ? '1px solid #22d3ee' : '1px solid rgba(255,255,255,0.1)',
                        color: isDone ? '#22d3ee' : '#9ca3af'
                      }}>
                        {ICONS[quest.iconName] || ICONS.sparkles}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteHabit(quest.id); }}
                          style={{
                            padding: '0.5rem',
                            background: 'transparent',
                            border: 'none',
                            color: '#6b7280',
                            cursor: 'pointer',
                            opacity: 0.5,
                            transition: 'opacity 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                          onMouseOut={(e) => e.currentTarget.style.opacity = 0.5}
                        >
                          <Trash2 size={16} />
                        </button>
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '50%',
                          border: isDone ? '2px solid #22d3ee' : '2px solid rgba(255,255,255,0.2)',
                          background: isDone ? '#22d3ee' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {isDone ? <CheckCircle2 size={24} style={{ color: '#1e293b' }} /> : <Circle size={20} style={{ color: '#4b5563' }} />}
                        </div>
                      </div>
                    </div>

                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      color: isDone ? '#9ca3af' : 'white',
                      textDecoration: isDone ? 'line-through' : 'none',
                      marginBottom: '0.5rem'
                    }}>
                      {quest.text}
                    </h3>
                    <p style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: isDone ? '#22d3ee' : '#6b7280',
                      textTransform: 'uppercase'
                    }}>
                      {quest.category}
                    </p>
                  </div>

                  <div style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end'
                  }}>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Points</span>
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: '800',
                      color: isDone ? '#22d3ee' : '#9ca3af'
                    }}>+{quest.points} XP</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Add New Habit Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(4px)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                style={{
                  background: '#1e293b',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '2rem',
                  borderRadius: '1.5rem',
                  width: '100%',
                  maxWidth: '28rem',
                  position: 'relative'
                }}
              >
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer'
                  }}
                >
                  <X size={24} />
                </button>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white', marginBottom: '0.5rem' }}>
                    Add New Habit
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                    Create a new habit to track
                  </p>
                </div>

                <form onSubmit={addHabit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Habit Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newHabitText}
                      onChange={(e) => setNewHabitText(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.75rem',
                        color: 'white',
                        fontSize: '1rem'
                      }}
                      placeholder="e.g. Read for 20 minutes"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Category
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                      {['Mindfulness', 'Health', 'Growth', 'Social', 'Rest', 'Activity'].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewHabitCategory(cat)}
                          style={{
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            border: newHabitCategory === cat ? '1px solid #22d3ee' : '1px solid rgba(255,255,255,0.1)',
                            background: newHabitCategory === cat ? 'rgba(34,211,238,0.2)' : 'rgba(0,0,0,0.2)',
                            color: newHabitCategory === cat ? '#22d3ee' : '#9ca3af',
                            cursor: 'pointer'
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'linear-gradient(135deg, #0891b2, #4f46e5)',
                      color: 'white',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      borderRadius: '0.75rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Add Habit
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default DailyQuests;
