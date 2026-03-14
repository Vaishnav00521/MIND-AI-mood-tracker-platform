import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Activity, UserPlus, FileText, X, AlertTriangle, TrendingUp, TrendingDown, Minus, Heart, ClipboardList } from 'lucide-react';
import PageTransition from './PageTransition';
import TableSkeleton from './TableSkeleton';

const INITIAL_PATIENTS = [
  { id: '1042', name: 'Alex Johnson', phq9: 14, gad7: 12, trend: 'worsening', risk: 'High', lastActive: '2 hours ago', notes: 'Discussing recent sleep changes.' },
  { id: '1089', name: 'Sarah Smith', phq9: 5, gad7: 4, trend: 'improving', risk: 'Low', lastActive: '1 day ago', notes: 'Doing well with new breathing exercises.' },
  { id: '1102', name: 'Michael Chen', phq9: 9, gad7: 10, trend: 'stable', risk: 'Medium', lastActive: '5 hours ago', notes: 'Continue monitoring work stress.' },
];

const riskColors = {
  'Low': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  'Medium': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'High': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'Severe': 'bg-pink-500/20 text-pink-400 border-pink-500/50',
};

const trendIcons = {
  'stable': <Minus size={16} className="text-gray-500" />,
  'improving': <TrendingDown size={16} className="text-cyan-400" />,
  'worsening': <TrendingUp size={16} className="text-pink-400" />,
};

export const TherapistDashboard = () => {
    const [patients, setPatients] = useState(() => {
        const saved = localStorage.getItem('mind_ai_patients');
        return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const [newName, setNewName] = useState('');
    const [newNotes, setNewNotes] = useState('');

    useEffect(() => {
        // Simulate premium data synchronization
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        localStorage.setItem('mind_ai_patients', JSON.stringify(patients));
    }, [patients]);

    const filteredPatients = patients.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.id.includes(searchTerm)
    );

    const handleAddPatient = (e) => {
        e.preventDefault();
        if (!newName.trim()) return;

        const newPatient = {
            id: Math.floor(1000 + Math.random() * 9000).toString(),
            name: newName,
            phq9: 0,
            gad7: 0,
            trend: 'stable',
            risk: 'Low',
            lastActive: 'Just added',
            notes: 'Initial consultation pending.'
        };

        setPatients([newPatient, ...patients]);
        setNewName('');
        setShowAddModal(false);
    };

    const handleSaveNotes = () => {
        if (!selectedPatient) return;
        setPatients(prev => prev.map(p => 
            p.id === selectedPatient.id ? { ...p, notes: newNotes } : p
        ));
        setSelectedPatient(null);
    };

    const openPatientDetails = (patient) => {
        setSelectedPatient(patient);
        setNewNotes(patient.notes);
    };

    return (
        <PageTransition>
            <div className="max-w-7xl mx-auto space-y-10 pb-20 font-sans text-white relative z-10">
                {/* Header */}
                <motion.div 
                   initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} 
                   className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8 py-2"
                >
                    <div>
                       <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-400 to-gray-600 italic">
                          PRO <span className="text-blue-500 uppercase">CLINIC</span>
                       </h1>
                       <p className="text-gray-400 mt-1 text-xs uppercase tracking-[0.3em] font-black">Clinical Case Management Node</p>
                    </div>
                    
                    <button 
                       onClick={() => setShowAddModal(true)}
                       className="w-full md:w-auto bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 px-8 py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs"
                    >
                        <UserPlus size={18} /> Register Patient
                    </button>
                </motion.div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 flex items-center gap-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
                        <div className="bg-blue-500/10 text-blue-400 p-5 rounded-2xl border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform">
                            <Users size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Caseload</p>
                            <p className="text-3xl font-black text-white">{patients.length}</p>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-900/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 flex items-center gap-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl"></div>
                        <div className="bg-pink-500/10 text-pink-400 p-5 rounded-2xl border border-pink-500/20 shadow-inner group-hover:scale-110 transition-transform">
                            <AlertTriangle size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">High Risk Drift</p>
                            <p className="text-3xl font-black text-white">{patients.filter(p => p.risk === 'High' || p.risk === 'Severe').length}</p>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-900/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 flex items-center gap-6 shadow-xl relative overflow-hidden group sm:col-span-2 lg:col-span-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl"></div>
                        <div className="bg-cyan-500/10 text-cyan-400 p-5 rounded-2xl border border-cyan-500/20 shadow-inner group-hover:scale-110 transition-transform">
                            <Activity size={28} strokeWidth={3} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Active Synchronization</p>
                            <p className="text-3xl font-black text-white">{patients.length > 0 ? '88%' : '0%'}</p>
                        </div>
                    </motion.div>
                </div>

                {/* Patient Table Card */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl relative"
                >
                    <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 bg-black/20">
                        <div className="relative w-full md:w-96">
                            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" />
                            <input 
                                type="text" 
                                placeholder="Identify patient by name or ID..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:outline-none focus:border-blue-500/30 shadow-inner"
                            />
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            <ClipboardList size={16} /> Filtered Views: All Active
                        </div>
                    </div>

                    <div className="overflow-x-auto p-4 md:p-8">
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <TableSkeleton />
                                </motion.div>
                            ) : (
                                <motion.table key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black">
                                            <th className="px-6 py-6 font-black">Patient Identifier</th>
                                            <th className="px-6 py-6 text-center font-black">Neural Scores (Dep/Anx)</th>
                                            <th className="px-6 py-6 font-black">Resonance Trend</th>
                                            <th className="px-6 py-6 font-black">Vulnerability</th>
                                            <th className="px-6 py-6 text-right font-black">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredPatients.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-20 text-center text-gray-600 font-black uppercase tracking-widest text-xs">
                                                    No clinical records found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredPatients.map((patient) => (
                                                <tr key={patient.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => openPatientDetails(patient)}>
                                                    <td className="px-6 py-8">
                                                        <p className="font-black text-gray-200 uppercase tracking-tighter italic">{patient.name}</p>
                                                        <p className="text-[10px] font-mono text-gray-600 mt-1 uppercase tracking-widest">Node ID: #{patient.id}</p>
                                                    </td>
                                                    <td className="px-6 py-8">
                                                        <div className="flex justify-center gap-4 text-center">
                                                            <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 flex flex-col items-center min-w-[50px]">
                                                                <span className="text-xs font-black text-white">{patient.phq9}</span>
                                                                <span className="text-[8px] font-black text-gray-700">PHQ9</span>
                                                            </div>
                                                            <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 flex flex-col items-center min-w-[50px]">
                                                                <span className="text-xs font-black text-white">{patient.gad7}</span>
                                                                <span className="text-[8px] font-black text-gray-700">GAD7</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-8">
                                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em]">
                                                            {trendIcons[patient.trend]}
                                                            <span className={patient.trend === 'worsening' ? 'text-pink-400' : (patient.trend === 'improving' ? 'text-cyan-400' : 'text-gray-500')}>
                                                                {patient.trend}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-8">
                                                        <span className={`inline-flex items-center px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest ${riskColors[patient.risk] || 'border-white/10 text-gray-500'}`}>
                                                            {patient.risk} Risk
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-8 text-right">
                                                        <button className="text-blue-400 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-end gap-2 ml-auto transition-all italic underline underline-offset-4">
                                                            <FileText size={16} /> Open Case
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </motion.table>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Modals */}
                <AnimatePresence>
                    {showAddModal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-gray-900 border border-white/10 p-10 rounded-[3rem] w-full max-w-md shadow-2xl relative">
                                <button onClick={() => setShowAddModal(false)} className="absolute top-10 right-10 text-gray-500 hover:text-white transition-colors">
                                    <X size={28} />
                                </button>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-8 italic">New Case Intake</h2>
                                <form onSubmit={handleAddPatient} className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Patient Full Identity</label>
                                        <input 
                                            type="text" required value={newName} onChange={e => setNewName(e.target.value)}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all shadow-inner font-medium"
                                            placeholder="Full Legal Name"
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-lg transition-all mt-4 text-xs font-bold">
                                        Finalize Intake
                                    </button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {selectedPatient && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }} className="bg-gray-900 border border-white/10 p-10 rounded-[3rem] w-full max-w-2xl shadow-2xl relative">
                                <button onClick={() => setSelectedPatient(null)} className="absolute top-10 right-10 text-gray-500 hover:text-white transition-colors">
                                    <X size={28} />
                                </button>
                                
                                <div className="mb-10 pb-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-start gap-8">
                                    <div>
                                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic">{selectedPatient.name}</h2>
                                        <p className="text-xs font-mono text-gray-600 mt-2 tracking-[0.2em] font-black">NODE_INDEX: #{selectedPatient.id}</p>
                                    </div>
                                    
                                    <div className="flex gap-4">
                                        <div className="bg-black/40 px-6 py-4 rounded-[1.5rem] border border-white/5 flex flex-col items-center">
                                            <p className="text-[9px] text-gray-600 uppercase tracking-widest font-black mb-1 leading-none">Vulnerability</p>
                                            <p className={`text-sm font-black uppercase tracking-widest ${selectedPatient.risk === 'High' || selectedPatient.risk === 'Severe' ? 'text-pink-400' : 'text-cyan-400'}`}>{selectedPatient.risk}</p>
                                        </div>
                                        <div className="bg-black/40 px-6 py-4 rounded-[1.5rem] border border-white/5 flex flex-col items-center">
                                            <p className="text-[9px] text-gray-600 uppercase tracking-widest font-black mb-1 leading-none">Resonance Trend</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {trendIcons[selectedPatient.trend]}
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white">{selectedPatient.trend}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-3">
                                            <FileText size={16} className="text-blue-400" /> Case Management Observations
                                        </label>
                                        <textarea 
                                            rows={6}
                                            value={newNotes}
                                            onChange={e => setNewNotes(e.target.value)}
                                            className="w-full bg-black/40 border border-white/5 rounded-[2rem] p-8 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-all font-medium leading-relaxed resize-none"
                                            placeholder="Enter clinical metadata and thematic observations..."
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => setSelectedPatient(null)} className="flex-1 px-8 py-5 rounded-2xl border border-white/10 text-gray-500 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                                            Standby
                                        </button>
                                        <button onClick={handleSaveNotes} className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-lg transition-all text-[10px]">
                                            Commit Case Observations
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </PageTransition>
    );
};

export default TherapistDashboard;
