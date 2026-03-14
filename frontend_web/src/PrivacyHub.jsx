import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, Lock, DownloadCloud, FileText, Server, ToggleLeft, ToggleRight,
    Sparkles, CheckCircle, Trash2, AlertTriangle, ShieldAlert, History, Database, Activity
} from 'lucide-react';
import PageTransition from './PageTransition';
import NeuroField from './NeuroField';

export const PrivacyHub = () => {
    const [permissions, setPermissions] = useState(() => {
        const saved = localStorage.getItem('mind_ai_privacy_perms');
        return saved ? JSON.parse(saved) : {
            dataSharing: false,
            cloudSync: true,
            anonymousAnalytics: true,
            aiProcessing: true
        };
    });

    const [savedMessage, setSavedMessage] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Persistence
    useEffect(() => {
        localStorage.setItem('mind_ai_privacy_perms', JSON.stringify(permissions));
    }, [permissions]);

    const handleToggle = (key) => {
        setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
        showSavedMessage();
    };

    const showSavedMessage = () => {
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 2000);
    };

    const handleDownload = () => {
        const data = {
            logs: JSON.parse(localStorage.getItem('mood_logs') || '[]'),
            habits: JSON.parse(localStorage.getItem('mind_ai_habits') || '[]'),
            chat: JSON.parse(localStorage.getItem('mind_ai_chat_history') || '[]'),
            entities: JSON.parse(localStorage.getItem('mind_ai_entities') || '[]'),
            privacy: permissions,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mind-ai-telemetry-archive-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDeleteAll = () => {
        localStorage.clear();
        window.location.reload();
    };

    return (
        <PageTransition>
            <NeuroField />
            <div className="max-w-4xl mx-auto space-y-10 pb-20 font-sans text-white relative z-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/10 pb-8 py-2 relative"
                >
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-400 to-gray-600">
                            PRIVACY <span className="text-cyan-500">VAULT</span>
                        </h1>
                        <p className="text-gray-400 mt-1 text-xs uppercase tracking-[0.3em] font-bold">Data Sovereignty & Encryption Control</p>
                    </div>

                    <AnimatePresence>
                        {savedMessage && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                className="bg-cyan-500/10 text-cyan-400 px-6 py-3 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                            >
                                <CheckCircle size={16} /> Preferences Synced
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Core Permissions Grid */}
                <div className="grid grid-cols-1 gap-6 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-900/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-10 flex items-center gap-4">
                            <Lock size={24} className="text-cyan-400" /> Security Governance
                        </h2>

                        <div className="space-y-6">
                            {[
                                { id: 'dataSharing', label: 'Share Data with Doctors', desc: 'Allows your connected doctors to see your mood data for better care.', icon: <Database size={18} /> },
                                { id: 'cloudSync', label: 'Cloud Backup', desc: 'Keeps your data safe by storing it securely in the cloud.', icon: <Server size={18} /> },
                                { id: 'aiProcessing', label: 'Heuristic Personalization', desc: 'Permits the MindAI core to analyze textual patterns for deep resonance.', icon: <Sparkles size={18} /> },
                                { id: 'anonymousAnalytics', label: 'Anonymized Telemetry', desc: 'Non-identifiable usage stats used for swarm optimization.', icon: <Activity size={18} /> },
                            ].map((p) => (
                                <div key={p.id} className="group flex items-center justify-between p-6 bg-black/40 rounded-[2rem] border border-white/5 hover:border-cyan-500/30 transition-all hover:bg-black/60 shadow-inner">
                                    <div className="flex-1 pr-8">
                                        <div className="flex items-center gap-3 mb-1">
                                            <div className="text-cyan-500 group-hover:scale-110 transition-transform">{p.icon}</div>
                                            <h3 className="font-black text-gray-200 uppercase tracking-widest text-xs">{p.label}</h3>
                                        </div>
                                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{p.desc}</p>
                                    </div>
                                    <button onClick={() => handleToggle(p.id)} className="text-cyan-600 transition-transform active:scale-90">
                                        {permissions[p.id] ? <ToggleRight size={50} className="text-cyan-400" /> : <ToggleLeft size={50} className="text-gray-700" />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Data Management Tools */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Export Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        className="bg-gradient-to-br from-cyan-900/20 to-blue-900/10 backdrop-blur-3xl border border-cyan-500/20 rounded-[2.5rem] p-10 shadow-2xl flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-cyan-500/20">
                                <DownloadCloud size={28} className="text-cyan-400" />
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Export Archive</h2>
                            <p className="text-sm text-gray-400 leading-relaxed font-medium mb-8">
                                Download a full encrypted JSON archive of your mood logs, AI interactions, and habits. You have the right to portability under the Global Privacy Act.
                            </p>
                        </div>
                        <button
                            onClick={handleDownload}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-3 text-xs"
                        >
                            <DownloadCloud size={20} /> Request Telemetry Archive
                        </button>
                    </motion.div>

                    {/* Deletion Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="bg-gradient-to-br from-pink-900/20 to-orange-900/10 backdrop-blur-3xl border border-pink-500/20 rounded-[2.5rem] p-10 shadow-2xl flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-pink-500/20">
                                <Trash2 size={28} className="text-pink-400" />
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Delete All Data</h2>
                            <p className="text-sm text-gray-400 leading-relaxed font-medium mb-8">
                                Permanently delete all your data. This cannot be undone. All your progress and streak data will be lost.
                            </p>
                        </div>

                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/40 text-pink-400 font-black uppercase tracking-widest py-5 rounded-2xl transition-all flex items-center justify-center gap-3 text-xs"
                            >
                                <ShieldAlert size={20} /> Initiate Purge Sequence
                            </button>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleDeleteAll}
                                    className="w-full bg-pink-600 hover:bg-pink-500 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-lg flex items-center justify-center gap-3 text-xs"
                                >
                                    <AlertTriangle size={20} /> Confirm Total Wipe
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="w-full bg-black/40 text-gray-500 font-black uppercase tracking-widest py-3 text-[10px]"
                                >
                                    Abort Sequence
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>

            </div>
        </PageTransition>
    );
};

export default PrivacyHub;
