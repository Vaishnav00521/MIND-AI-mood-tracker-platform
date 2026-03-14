import React, { createContext, useContext, useState, useCallback } from 'react';

// Schema for a single survey log entry
// { date: 'YYYY-MM-DD', answers: [1-5 * 20], score: 0-100, status: 'Optimal|Nominal|Fatigued|Critical' }

const STORAGE_KEY = 'mindai_mood_logs';

const loadLogs = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const saveLogs = (logs) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
};

// Compute a single mood score from an answers array  
// Each answer is 1 (bad) | 3 (neutral) | 5 (good). Max = 5*20 = 100
const computeScore = (answers) => {
    const filled = answers.filter(a => a !== null);
    if (filled.length === 0) return null;
    const total = filled.reduce((sum, a) => sum + a, 0);
    const max = filled.length * 5;
    return Math.round((total / max) * 100);
};

const getStatusForScore = (score) => {
    if (score === null) return null;
    if (score >= 75) return 'Optimal';
    if (score >= 50) return 'Nominal';
    if (score >= 25) return 'Fatigued';
    return 'Critical';
};

const MoodContext = createContext(null);

export const MoodProvider = ({ children }) => {
    const [logs, setLogs] = useState(() => loadLogs());

    const submitSurvey = useCallback((answers, journalText = '') => {
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const score = computeScore(answers);
        const status = getStatusForScore(score);

        const entry = { date, answers, score, status, journal: journalText };

        setLogs(prev => {
            // Replace today's entry if one already exists, else prepend
            const filtered = prev.filter(l => l.date !== date);
            const updated = [entry, ...filtered];
            saveLogs(updated);
            return updated;
        });

        return entry;
    }, []);

    // Get the most recent log (today's if available)
    const latestLog = logs[0] || null;

    // Compute 7-day trend data for line chart
    const weekTrend = (() => {
        const today = new Date();
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - (6 - i));
            const key = d.toISOString().split('T')[0];
            const log = logs.find(l => l.date === key);
            return { label: d.toLocaleDateString('en', { weekday: 'short' }), score: log ? log.score : null };
        });
    })();

    // Build a streak count (consecutive days from today backwards with a log)
    const streak = (() => {
        let count = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            if (logs.find(l => l.date === key)) {
                count++;
            } else {
                break; // Streak broken
            }
        }
        return count;
    })();

    return (
        <MoodContext.Provider value={{ logs, latestLog, weekTrend, streak, submitSurvey, getStatusForScore }}>
            {children}
        </MoodContext.Provider>
    );
};

export const useMood = () => {
    const ctx = useContext(MoodContext);
    if (!ctx) throw new Error('useMood must be used inside <MoodProvider>');
    return ctx;
};
