import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Sparkles, CheckCircle, XCircle, RefreshCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import PageTransition from './PageTransition';
import { useMood } from './MoodContext';
import NeuroField from './NeuroField';

// All 8 moods with direction mapping
// UP = Happy/Excited, DOWN = Sad/Depressed, LEFT = Calm/Anxious, RIGHT = Energetic/Angry
const MOOD_MAP = {
    // Up direction - Positive moods
    excited: { emoji: '🤩', label: 'Excited', score: 95, color: '#FF6B35', direction: 'up', gradient: 'from-orange-500 via-red-500 to-pink-500' },
    happy: { emoji: '😊', label: 'Happy', score: 80, color: '#FFD700', direction: 'up', gradient: 'from-yellow-400 via-orange-400 to-amber-500' },

    // Down direction - Negative/Low moods
    sad: { emoji: '😢', label: 'Sad', score: 35, color: '#5C7AEA', direction: 'down', gradient: 'from-blue-600 via-indigo-600 to-purple-600' },
    depressed: { emoji: '😔', label: 'Low', score: 20, color: '#2C3E50', direction: 'down', 'gradient': 'from-gray-700 via-slate-700 to-zinc-800' },

    // Left direction - Calm/Inner moods
    calm: { emoji: '😌', label: 'Calm', score: 70, color: '#4ECDC4', direction: 'left', gradient: 'from-teal-400 via-cyan-400 to-sky-400' },
    anxious: { emoji: '😰', label: 'Anxious', score: 45, color: '#9B59B6', direction: 'left', gradient: 'from-purple-500 via-violet-500 to-indigo-500' },

    // Right direction - High energy moods
    energetic: { emoji: '⚡', label: 'Energetic', score: 85, color: '#00FF88', direction: 'right', gradient: 'from-green-400 via-emerald-400 to-cyan-400' },
    angry: { emoji: '😠', label: 'Frustrated', score: 30, color: '#FF4757', direction: 'right', gradient: 'from-red-500 via-orange-500 to-yellow-500' },
};

// Get mood based on swipe direction and distance
const getMoodFromSwipe = (x, y, containerWidth, containerHeight) => {
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    const deltaX = x - centerX;
    const deltaY = y - centerY;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const threshold = Math.min(containerWidth, containerHeight) * 0.15;

    if (distance < threshold) {
        return null; // Not far enough
    }

    // Determine primary direction
    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

    if (isHorizontal) {
        if (deltaX > 0) {
            // Right - Energetic or Angry based on distance
            return distance > threshold * 2 ? MOOD_MAP.angry : MOOD_MAP.energetic;
        } else {
            // Left - Calm or Anxious based on distance
            return distance > threshold * 2 ? MOOD_MAP.anxious : MOOD_MAP.calm;
        }
    } else {
        if (deltaY < 0) {
            // Up - Happy or Excited based on distance
            return distance > threshold * 2 ? MOOD_MAP.excited : MOOD_MAP.happy;
        } else {
            // Down - Sad or Depressed based on distance
            return distance > threshold * 2 ? MOOD_MAP.depressed : MOOD_MAP.sad;
        }
    }
};

export const OneSwipeCheckIn = () => {
    const { submitSurvey } = useMood();
    const [isDragging, setIsDragging] = useState(false);
    const [currentMood, setCurrentMood] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [saved, setSaved] = useState(false);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

    const containerRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 400, height: 500 });

    useEffect(() => {
        if (containerRef.current) {
            setContainerSize({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight
            });
        }
    }, []);

    const handleDrag = (event, info) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = info.point.x - rect.left;
        const y = info.point.y - rect.top;

        setDragPosition({
            x: x - containerSize.width / 2,
            y: y - containerSize.height / 2
        });

        const mood = getMoodFromSwipe(x, y, containerSize.width, containerSize.height);
        if (mood) {
            setCurrentMood(mood);
        }
    };

    const handleDragEnd = (event, info) => {
        setIsDragging(false);

        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = info.point.x - rect.left;
        const y = info.point.y - rect.top;

        const mood = getMoodFromSwipe(x, y, containerSize.width, containerSize.height);

        if (mood) {
            setCurrentMood(mood);
            setShowResult(true);
        }

        setDragPosition({ x: 0, y: 0 });
    };

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const saveMood = () => {
        if (!currentMood) return;

        const normalizedScore = Math.max(1, Math.min(5, Math.round(currentMood.score / 20)));
        const answers = Array(20).fill(normalizedScore);

        submitSurvey(answers, `Swipe check-in: ${currentMood.label}`);
        setSaved(true);

        setTimeout(() => {
            setSaved(false);
            setShowResult(false);
            setCurrentMood(null);
        }, 2000);
    };

    const resetCheckIn = () => {
        setShowResult(false);
        setSaved(false);
        setCurrentMood(null);
    };

    // Dynamic background based on mood
    const getBackgroundGradient = () => {
        if (saved) {
            return 'from-green-400 via-cyan-500 to-blue-500';
        }
        if (showResult && currentMood) {
            return currentMood.gradient;
        }
        if (isDragging) {
            return 'from-purple-600 via-pink-600 to-red-600';
        }
        return 'from-slate-900 via-gray-900 to-black';
    };

    // Get direction indicator
    const getDirectionIndicator = () => {
        if (!isDragging && !currentMood) return null;

        const { x, y } = dragPosition;
        const threshold = 30;

        let direction = null;
        let mood = null;

        if (Math.abs(x) > Math.abs(y)) {
            direction = x > 0 ? 'right' : 'left';
        } else {
            direction = y < 0 ? 'up' : 'down';
        }

        return (
            <div className="absolute inset-0 pointer-events-none">
                {/* Direction arrows */}
                <motion.div
                    className="absolute top-4 left-1/2 -translate-x-1/2 text-white/30"
                    animate={{ opacity: direction === 'up' ? 1 : 0.3 }}
                >
                    <ArrowUp size={24} />
                </motion.div>
                <motion.div
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30"
                    animate={{ opacity: direction === 'down' ? 1 : 0.3 }}
                >
                    <ArrowDown size={24} />
                </motion.div>
                <motion.div
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                    animate={{ opacity: direction === 'left' ? 1 : 0.3 }}
                >
                    <ArrowLeft size={24} />
                </motion.div>
                <motion.div
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30"
                    animate={{ opacity: direction === 'right' ? 1 : 0.3 }}
                >
                    <ArrowRight size={24} />
                </motion.div>

                {/* Direction labels */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[10px] text-white/40 uppercase tracking-widest">
                    ↑ Excited
                </div>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-white/40 uppercase tracking-widest">
                    ↓ Sad
                </div>
                <div className="absolute left-8 top-1/2 -translate-y-1/2 text-[10px] text-white/40 uppercase tracking-widest -rotate-90">
                    Calm
                </div>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] text-white/40 uppercase tracking-widest rotate-90">
                    Energy
                </div>
            </div>
        );
    };

    return (
        <PageTransition>
            <NeuroField mood={currentMood?.mood} intensity={0.4} />
            <div className="max-w-2xl mx-auto pt-8 pb-16 px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-white/20 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                    >
                        <Sparkles className="text-white" size={28} strokeWidth={1.5} />
                    </motion.div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Swipe Check-In</h1>
                    <p className="text-gray-400 mt-2 text-sm uppercase tracking-wider">Swipe in any direction to set your mood</p>
                </div>

                {/* Direction Guide */}
                <div className="grid grid-cols-4 gap-2 mb-6 max-w-md mx-auto">
                    <div className="text-center p-2 bg-white/5 rounded-lg border border-white/10">
                        <ArrowUp className="mx-auto text-orange-400 mb-1" size={16} />
                        <span className="text-[10px] text-white/60">Excited</span>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-[10px] text-white/60 block mt-4">Happy</span>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-[10px] text-white/60 block mt-4">Calm</span>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg border border-white/10">
                        <ArrowRight className="mx-auto text-green-400 mb-1" size={16} />
                        <span className="text-[10px] text-white/60">Energy</span>
                    </div>
                </div>

                {/* Success Message */}
                <AnimatePresence>
                    {saved && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="mb-6 bg-green-500/20 border border-green-500/40 rounded-[2rem] p-8 text-center"
                        >
                            <CheckCircle className="mx-auto mb-4 text-green-400" size={48} />
                            <h2 className="text-2xl font-bold text-white mb-2">Mood Saved!</h2>
                            <p className="text-green-300">Your mood has been recorded.</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Swipe Container */}
                {!saved && (
                    <div
                        ref={containerRef}
                        className="relative h-[500px] bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                    >
                        {/* Background Gradient */}
                        <motion.div
                            className={`absolute inset-0 bg-gradient-to-br ${getBackgroundGradient()}`}
                            animate={{
                                opacity: showResult ? 0.9 : isDragging ? 0.7 : 0.4,
                            }}
                            transition={{ duration: 0.3 }}
                        />

                        {getDirectionIndicator()}

                        {/* Draggable Emoji Circle */}
                        <motion.div
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
                            drag
                            dragConstraints={containerRef}
                            dragElastic={0.2}
                            onDragStart={handleDragStart}
                            onDrag={handleDrag}
                            onDragEnd={handleDragEnd}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{ touchAction: 'none' }}
                        >
                            <motion.div
                                className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-xl border-4 border-white/30 flex items-center justify-center shadow-2xl"
                                animate={{
                                    boxShadow: isDragging
                                        ? `0 0 60px ${currentMood?.color || 'rgba(139, 92, 246, 0.6)'}`
                                        : '0 0 30px rgba(0, 0, 0, 0.3)',
                                    borderColor: currentMood?.color || 'rgba(255, 255, 255, 0.3)'
                                }}
                            >
                                <motion.span
                                    className="text-6xl"
                                    animate={{
                                        scale: isDragging ? 1.2 : 1,
                                    }}
                                >
                                    {showResult ? (currentMood?.emoji || '😊') : isDragging ? (currentMood?.emoji || '😊') : '👆'}
                                </motion.span>
                            </motion.div>
                        </motion.div>

                        {/* Instructions */}
                        <AnimatePresence>
                            {!showResult && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute bottom-8 left-0 right-0 text-center"
                                >
                                    <p className="text-white/70 text-sm">
                                        {isDragging ? 'Release to set mood' : 'Swipe in any direction'}
                                    </p>
                                    <p className="text-white/40 text-xs mt-2">
                                        ↑ Happy &nbsp; ↓ Sad &nbsp; ← Calm &nbsp; → Energy
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Result Actions */}
                        <AnimatePresence>
                            {showResult && !saved && currentMood && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4"
                                >
                                    <div className="text-center">
                                        <motion.span
                                            className="text-5xl block mb-2"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', delay: 0.1 }}
                                        >
                                            {currentMood.emoji}
                                        </motion.span>
                                        <h3
                                            className="text-2xl font-bold text-white"
                                            style={{ color: currentMood.color }}
                                        >
                                            {currentMood.label}
                                        </h3>
                                        <p className="text-white/70">Score: {currentMood.score}/100</p>
                                        <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">
                                            {currentMood.direction} direction
                                        </p>
                                    </div>

                                    <div className="flex gap-4 mt-4">
                                        <button
                                            onClick={resetCheckIn}
                                            className="px-6 py-3 border border-white/30 rounded-xl text-white/70 hover:bg-white/10 transition-all font-medium"
                                        >
                                            <RefreshCw size={18} className="inline mr-2" />
                                            Try Again
                                        </button>
                                        <button
                                            onClick={saveMood}
                                            className="px-8 py-3 bg-white text-gray-900 rounded-xl font-bold transition-all hover:bg-gray-100 shadow-lg flex items-center gap-2"
                                        >
                                            <CheckCircle size={18} />
                                            Save
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Alternative Options */}
                <div className="mt-8 flex justify-center gap-4 flex-wrap">
                    <a
                        href="/capture"
                        className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-medium"
                    >
                        📷 Face Capture
                    </a>
                    <a
                        href="/voice"
                        className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
                    >
                        🎤 Voice Journal
                    </a>
                    <a
                        href="/resonance"
                        className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors text-sm font-medium"
                    >
                        ✨ Resonance
                    </a>
                </div>
            </div>
        </PageTransition>
    );
};

export default OneSwipeCheckIn;
