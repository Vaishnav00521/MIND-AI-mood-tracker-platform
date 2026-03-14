import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Building2, Plus, ArrowRight, CheckCircle, Search, ShieldAlert, Sparkles, X, 
    MapPin, Users, Phone, ShieldCheck, Database, Zap, Lock, Activity
} from 'lucide-react';

const INITIAL_ENTITIES = [
    { id: 'ent-1', name: 'Mindful Care Partners', type: 'Clinical Practice', region: 'North America', patients: '1500+', contact: 'admin@mindfulcare.org', verified: true, date: new Date().toLocaleDateString() },
    { id: 'ent-2', name: 'Apex Cognitive', type: 'Research Lab', region: 'Europe', patients: '300+', contact: 'data@apexcog.eu', verified: true, date: new Date().toLocaleDateString() },
];

export const EntityDashboard = () => {
    const [entities, setEntities] = useState(() => {
        const saved = localStorage.getItem('mind_ai_entities');
        return saved ? JSON.parse(saved) : INITIAL_ENTITIES;
    });

    const [showForm, setShowForm] = useState(false);
    const [step, setStep] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        type: 'Clinic',
        region: '',
        contactEmail: '',
        contactPhone: '',
        patientVolume: '100 - 500',
        dataCompliance: 'GDPR',
        encryptionStandard: 'AES-256',
        primaryFocus: '',
        medicalDirector: '',
        licenseNumber: '',
        emergencyProtocol: 'Standard'
    });

    // Persistence
    useEffect(() => {
        localStorage.setItem('mind_ai_entities', JSON.stringify(entities));
    }, [entities]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = (e) => {
        e.preventDefault();
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => Math.max(1, prev - 1));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newEntity = {
            id: `ent-${Date.now()}`,
            ...formData,
            patients: formData.patientVolume,
            contact: formData.contactEmail,
            verified: false,
            date: new Date().toLocaleDateString()
        };
        setEntities([newEntity, ...entities]);
        setShowForm(false);
        setStep(1);
        setFormData({
            name: '', type: 'Clinic', region: '', contactEmail: '', contactPhone: '', patientVolume: '100 - 500', 
            dataCompliance: 'GDPR', encryptionStandard: 'AES-256', primaryFocus: '', medicalDirector: '', 
            licenseNumber: '', emergencyProtocol: 'Standard'
        });
    };

    const filteredEntities = entities.filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.region.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 font-sans text-white relative z-10">
            {/* Header */}
            <motion.div 
               initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} 
               className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/10 pb-8 py-2"
            >
                <div>
                   <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-400 to-gray-600">
                      ENTITY <span className="text-blue-500">NETWORK</span>
                   </h1>
                   <p className="text-gray-400 mt-1 text-xs uppercase tracking-[0.3em] font-bold">Federated Clinical Governance Nodes</p>
                </div>
                
                <button 
                   onClick={() => setShowForm(true)}
                   className="w-full sm:w-auto bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 px-8 py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs"
                >
                    <Plus size={18} /> Register Node
                </button>
            </motion.div>

            {/* Registration Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div 
                       initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                       className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <motion.div 
                           initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }}
                           className="bg-gray-900 border border-white/10 p-10 rounded-[3rem] w-full max-w-2xl shadow-[0_0_80px_rgba(0,0,0,1)] relative my-8"
                        >
                            <button onClick={() => setShowForm(false)} className="absolute top-10 right-10 text-gray-500 hover:text-white transition-colors">
                                <X size={28} />
                            </button>
                            
                            <div className="mb-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <Sparkles className="text-blue-400" size={24} />
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Registration Protocol</h2>
                                </div>
                                <p className="text-sm text-gray-400 font-medium">Phase {step} of 3: Calibrating regulatory metadata.</p>
                                
                                <div className="w-full h-1.5 bg-black/40 rounded-full mt-6 overflow-hidden border border-white/5">
                                    <motion.div 
                                        className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(step / 3) * 100}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>

                            <form onSubmit={step === 3 ? handleSubmit : handleNext} className="space-y-8">
                                <AnimatePresence mode="wait">
                                    {step === 1 && (
                                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">1. Legal Entity Name</label>
                                                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-400 shadow-inner" placeholder="e.g. Nexus Behavioral Health" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">2. Node Classification</label>
                                                <select name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-400">
                                                    <option value="Clinic">Clinical Hub</option>
                                                    <option value="Research">Research Laboratory</option>
                                                    <option value="Corporate">Corporate Wellness</option>
                                                    <option value="Educational">Academic Node</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">3. Geographic Sector</label>
                                                <input type="text" name="region" required value={formData.region} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-400 shadow-inner" placeholder="e.g. Tokyo, JP" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">4. Strategic Focus Area</label>
                                                <input type="text" name="primaryFocus" required value={formData.primaryFocus} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-400 shadow-inner" placeholder="e.g. Quantum Neuro-analysis" />
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">5. Strategic Contact (Email)</label>
                                                <input type="email" name="contactEmail" required value={formData.contactEmail} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-400 shadow-inner" placeholder="admin@domain.node" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">6. Telemetry Link (Phone)</label>
                                                <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-400 shadow-inner" placeholder="+81 (00) 000-0000" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">7. Medical Director / Lead</label>
                                                <input type="text" name="medicalDirector" value={formData.medicalDirector} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-400 shadow-inner" placeholder="Dr. S. Tanaka" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">8. Projected User/Patient Density</label>
                                                <select name="patientVolume" value={formData.patientVolume} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-400">
                                                    <option value="< 100">Tier 1: &lt; 100</option>
                                                    <option value="100 - 500">Tier 2: 100 - 500</option>
                                                    <option value="500 - 2000">Tier 3: 500 - 2000</option>
                                                    <option value="2000+">Tier 4: 2000+</option>
                                                </select>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 3 && (
                                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">9. Sovereign License Identifier</label>
                                                <input type="text" name="licenseNumber" required value={formData.licenseNumber} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-400 shadow-inner" placeholder="UID-NODE-XXXXX" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">10. Governance Framework</label>
                                                <select name="dataCompliance" value={formData.dataCompliance} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-400">
                                                    <option value="HIPAA">HIPAA (Sovereign US)</option>
                                                    <option value="GDPR">GDPR (Sovereign EU)</option>
                                                    <option value="Global Standard">Federated Standard</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">11. Encryption Protocol</label>
                                                <select name="encryptionStandard" value={formData.encryptionStandard} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-400">
                                                    <option value="AES-256">AES-256-GCM</option>
                                                    <option value="ChaCha20">ChaCha20-Poly1305</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">12. Crisis Escalation Logic</label>
                                                <select name="emergencyProtocol" value={formData.emergencyProtocol} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-400">
                                                    <option value="Standard">Standard Geo-Authorities</option>
                                                    <option value="Internal">Internal Rapid Response</option>
                                                    <option value="Hybrid">Hybrid Federated Model</option>
                                                </select>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="mt-12 pt-10 border-t border-white/5 flex justify-between items-center">
                                    <button 
                                        type="button" onClick={handleBack} disabled={step === 1}
                                        className="px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors disabled:opacity-0 disabled:pointer-events-none"
                                    >
                                        Reverse
                                    </button>
                                    <button 
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center gap-3"
                                    >
                                        {step === 3 ? 'Finalize Integration' : 'Proceed Phase'} <ArrowRight size={18} />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Entity Directory Card */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900/60 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.6)] relative"
            >
                <div className="p-10 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 bg-black/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                            <Database size={24} className="text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Node Directory</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Found {filteredEntities.length} Registered Governance Nodes</p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" />
                        <input 
                            type="text" 
                            placeholder="Filter by name or region..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:outline-none focus:border-blue-400 shadow-inner"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto p-4 md:p-8">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black">
                                <th className="px-6 py-6 ring-inset">Governance Node</th>
                                <th className="px-6 py-6">Sector & Type</th>
                                <th className="px-6 py-6 text-center">Density</th>
                                <th className="px-6 py-6">Encryption</th>
                                <th className="px-6 py-6 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredEntities.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-gray-600 font-black uppercase tracking-widest text-xs">
                                        No matching nodes found in directory.
                                    </td>
                                </tr>
                            ) : (
                                filteredEntities.map((entity) => (
                                    <tr key={entity.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-800 rounded-xl border border-white/5 flex items-center justify-center text-blue-400 shadow-inner group-hover:scale-110 transition-transform">
                                                    <Building2 size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-200 uppercase tracking-tighter">{entity.name}</p>
                                                    <p className="text-[9px] font-mono text-gray-500 mt-1">ID: {entity.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-8">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{entity.type}</span>
                                                <span className="text-[10px] font-bold text-gray-600 flex items-center gap-1.5"><MapPin size={10}/> {entity.region}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-8 text-center">
                                            <span className="text-[10px] font-black text-gray-300 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                                               {entity.patients || entity.patientVolume}
                                            </span>
                                        </td>
                                        <td className="px-6 py-8">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest bg-blue-500/5 w-fit px-3 py-1.5 rounded-lg border border-blue-500/10">
                                                <Lock size={12} className="text-blue-400" /> {entity.encryptionStandard || 'AES-256'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-8 text-right">
                                            {entity.verified ? (
                                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-cyan-500/20 text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400 bg-cyan-500/5 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                                                    <ShieldCheck size={14} /> Synced
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-yellow-500/20 text-[9px] font-black uppercase tracking-[0.2em] text-yellow-500 bg-yellow-500/5">
                                                    <Activity size={14} className="animate-pulse" /> Pending Review
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

        </div>
    );
};

export default EntityDashboard;
