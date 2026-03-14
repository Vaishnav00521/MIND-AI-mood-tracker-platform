import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Square, Play, Pause, Send, Sparkles, XCircle, CheckCircle, Loader2 } from 'lucide-react';
import PageTransition from './PageTransition';
import { useMood } from './MoodContext';

const RECORDING_DURATION = 10; // seconds

export const VoiceJournal = () => {
    const { submitSurvey } = useMood();
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const mediaRecorderRef = useRef(null);
    const audioRef = useRef(null);
    const timerRef = useRef(null);
    const chunksRef = useRef([]);

    const startRecording = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= RECORDING_DURATION - 1) {
                        stopRecording();
                        return RECORDING_DURATION;
                    }
                    return prev + 1;
                });
            }, 1000);
        } catch (err) {
            console.error('Microphone error:', err);
            setError('Microphone access denied. Please enable microphone permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const togglePlayback = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const analyzeVoice = async () => {
        if (!audioBlob) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            // Create form data to send audio to backend
            const formData = new FormData();
            formData.append('audio', audioBlob, 'voice.webm');

            // For now, simulate analysis since we don't have backend endpoint
            // In production, this would call your backend API
            // const response = await fetch('/api/mood/analyze-voice/', {
            //   method: 'POST',
            //   body: formData,
            // });

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Simulated result - in production this comes from backend
            // Using voice tone analysis to estimate mood
            const mockResults = [
                { emotion: 'happy', confidence: 0.78, score: 88, transcript: 'Feeling great today!' },
                { emotion: 'neutral', confidence: 0.65, score: 60, transcript: 'Just an average day.' },
                { emotion: 'sad', confidence: 0.72, score: 35, transcript: 'A bit down today.' },
                { emotion: 'anxious', confidence: 0.68, score: 40, transcript: 'Feeling a bit stressed.' },
                { emotion: 'energetic', confidence: 0.75, score: 85, transcript: 'Lots of energy today!' },
            ];

            // Pick a random result for demo
            const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];

            setResult({
                ...randomResult,
                timestamp: new Date().toISOString(),
            });
        } catch (err) {
            console.error('Analysis error:', err);
            setError('Failed to analyze voice. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const saveMood = () => {
        if (!result) return;

        // Convert score to survey-like answers
        const normalizedScore = Math.max(1, Math.min(5, Math.round(result.score / 20)));
        const answers = Array(20).fill(normalizedScore);

        submitSurvey(answers, `Voice journal: ${result.transcript}`);

        setTimeout(() => {
            setResult(null);
            setAudioBlob(null);
            setAudioUrl(null);
        }, 2000);
    };

    const resetRecording = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        setResult(null);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    return (
        <PageTransition>
            <div className="max-w-2xl mx-auto pt-8 pb-16 px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-white/20 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                    >
                        <Mic className="text-white" size={28} strokeWidth={1.5} />
                    </motion.div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Voice Journal</h1>
                    <p className="text-gray-400 mt-2 text-sm uppercase tracking-wider">10-second voice check-in</p>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3"
                        >
                            <XCircle className="text-red-400 flex-shrink-0" size={20} />
                            <p className="text-red-300 text-sm">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Result Display */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="mb-8 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-white/20 rounded-[2rem] p-8 text-center backdrop-blur-xl"
                        >
                            <div className="text-6xl mb-4">
                                {result.emotion === 'happy' ? '😊' :
                                    result.emotion === 'sad' ? '😢' :
                                        result.emotion === 'anxious' ? '😰' :
                                            result.emotion === 'energetic' ? '⚡' : '😐'}
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2 capitalize">{result.emotion}</h2>
                            <p className="text-gray-400 text-sm mb-2">
                                Confidence: {Math.round(result.confidence * 100)}%
                            </p>
                            <p className="text-cyan-400 font-bold text-2xl mb-2">Mood Score: {result.score}/100</p>
                            <p className="text-gray-500 text-sm italic mb-6">"{result.transcript}"</p>

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={resetRecording}
                                    className="px-6 py-3 border border-white/20 rounded-xl text-gray-300 hover:bg-white/5 transition-all font-medium"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={saveMood}
                                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center gap-2"
                                >
                                    <CheckCircle size={20} />
                                    Save Mood
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Recording Interface */}
                {!result && (
                    <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        {/* Waveform Visualization Placeholder */}
                        <div className="h-32 bg-gray-900/50 flex items-center justify-center overflow-hidden">
                            {isRecording ? (
                                <div className="flex items-center gap-1 h-16">
                                    {[...Array(20)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="w-2 bg-gradient-to-t from-purple-500 to-cyan-400 rounded-full"
                                            animate={{
                                                height: [8, Math.random() * 48 + 8, 8],
                                            }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 0.5,
                                                delay: i * 0.05,
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <Mic className="text-gray-600" size={48} />
                            )}
                        </div>

                        {/* Timer */}
                        <div className="text-center py-6">
                            <div className="text-5xl font-black text-white mb-2">
                                {isRecording ? RECORDING_DURATION - recordingTime : '10'}
                            </div>
                            <p className="text-gray-500 text-sm uppercase tracking-wider">
                                {isRecording ? 'seconds remaining' : 'seconds to record'}
                            </p>
                        </div>

                        {/* Audio Player (shown after recording) */}
                        {audioUrl && !isRecording && !result && (
                            <div className="px-8 pb-4">
                                <div className="bg-gray-900/50 rounded-2xl p-4 flex items-center gap-4">
                                    <button
                                        onClick={togglePlayback}
                                        className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white"
                                    >
                                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                    </button>
                                    <div className="flex-1">
                                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-purple-500 to-cyan-400"
                                                initial={{ width: 0 }}
                                                animate={{ width: '100%' }}
                                                transition={{ duration: 10 }}
                                            />
                                        </div>
                                    </div>
                                    <audio
                                        ref={audioRef}
                                        src={audioUrl}
                                        onEnded={() => setIsPlaying(false)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Controls */}
                        <div className="p-8 flex flex-col items-center gap-4">
                            {error && (
                                <p className="text-gray-400 text-sm text-center">{error}</p>
                            )}

                            {!audioUrl ? (
                                <>
                                    <p className="text-gray-400 text-sm text-center mb-2">
                                        Hold the button and talk about your day
                                    </p>
                                    <button
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`w-24 h-24 rounded-full transition-all flex items-center justify-center ${isRecording
                                                ? 'bg-red-600 animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.5)]'
                                                : 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 shadow-[0_0_30px_rgba(139,92,246,0.5)]'
                                            }`}
                                    >
                                        {isRecording ? (
                                            <Square className="text-white" size={32} />
                                        ) : (
                                            <Mic className="text-white" size={36} />
                                        )}
                                    </button>
                                    <p className="text-gray-500 text-xs mt-2">
                                        {isRecording ? 'Tap to stop' : 'Tap to start recording'}
                                    </p>
                                </>
                            ) : (
                                <div className="flex gap-4">
                                    <button
                                        onClick={resetRecording}
                                        className="px-6 py-3 border border-white/20 rounded-xl text-gray-300 hover:bg-white/5 transition-all font-medium"
                                    >
                                        Retake
                                    </button>
                                    <button
                                        onClick={analyzeVoice}
                                        disabled={isAnalyzing}
                                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={20} />
                                                Analyze Voice
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Alternative Options */}
                <div className="mt-8 flex justify-center gap-4">
                    <a
                        href="/capture"
                        className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-medium"
                    >
                        📷 Quick Capture
                    </a>
                    <a
                        href="/swipe"
                        className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
                    >
                        👆 One-Swipe Check-in
                    </a>
                </div>
            </div>
        </PageTransition>
    );
};

export default VoiceJournal;
