import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, DownloadCloud, FileText, Server, ArrowRight, ToggleLeft, ToggleRight, Network, Sparkles } from 'lucide-react';

export const PrivacyHub = () => {
    const [allowResearch, setAllowResearch] = useState(false);

    const logEntries = [
        { id: 1, action: "Authentication Verified", date: "Today, 08:32 AM", device: "Browser Node", ip: "192.168.1.44" },
        { id: 2, action: "Data Packet Synced", date: "Yesterday, 09:15 PM", device: "Mobile Node", ip: "10.0.0.122" },
        { id: 3, action: "Archive Extraction", date: "Oct 12, 10:45 AM", device: "Browser Node", ip: "192.168.1.44" },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-16 font-sans text-white relative z-10">
            {/* Minimalist Trust Header */}
            <motion.div 
               initial={{ opacity: 0, y: -20 }} 
               animate={{ opacity: 1, y: 0 }} 
               className="text-center pt-8 pb-4"
            >
                <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/20 rounded-[2rem] shadow-[0_0_30px_rgba(6,182,212,0.3)] mb-6 relative backdrop-blur-sm">
                    <ShieldCheck size={48} className="text-cyan-400 relative z-10" strokeWidth={1.5} />
                    <div className="absolute inset-0 border border-cyan-400/50 rounded-[2rem] animate-pulse opacity-50"></div>
                </div>
                <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 leading-tight">Security Cortex</h1>
                <p className="text-gray-400 mt-4 max-w-2xl mx-auto font-medium leading-relaxed text-sm">
                   Your biometric and cognitive datasets are cryptographically isolated. The system operates on an absolute zero-trust framework.
                </p>
            </motion.div>

            {/* Core Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Status Card 1 */}
                <motion.div 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, ease: "easeOut" }}
                    className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)] group hover:border-cyan-500/50 transition-all overflow-hidden relative"
                >
                    <div className="absolute top-[-20%] left-[-20%] w-[150px] h-[150px] bg-cyan-500/20 blur-3xl rounded-full"></div>
                    <div className="flex items-center gap-5 mb-6 pb-6 border-b border-white/10 relative z-10">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-cyan-400 shadow-inner group-hover:scale-105 transition-transform">
                            <Lock size={28} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg tracking-tight text-white">Quantum Encryption</h3>
                            <span className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)] px-3 py-1.5 rounded-lg mt-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span> Network Secure
                            </span>
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-8 relative z-10 font-medium">
                        All local node entries are scrambled. Root servers lack the decryption matrix. Your thoughts stay local.
                    </p>
                    <a href="#" className="flex items-center gap-2 text-cyan-400 font-bold text-[10px] uppercase tracking-wider hover:text-cyan-300 transition group/link relative z-10">
                       Access Transparency Log <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                    </a>
                </motion.div>

                {/* Status Card 2 */}
                <motion.div 
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, ease: "easeOut" }}
                    className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)] flex flex-col justify-between group hover:border-purple-500/50 transition-all overflow-hidden relative"
                >
                    <div className="absolute bottom-[-20%] right-[-20%] w-[150px] h-[150px] bg-purple-500/20 blur-3xl rounded-full"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-white/10">
                            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-purple-400 shadow-inner group-hover:scale-105 transition-transform">
                                <Server size={28} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg tracking-tight text-white">Framework Compliance</h3>
                                <p className="text-purple-400 text-[10px] mt-1 font-bold tracking-[0.2em] uppercase">HIPAA & GDPR ALIGNED</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center text-left gap-4 justify-between bt-2 bg-gray-900/50 p-5 rounded-2xl border border-white/10 shadow-inner">
                             <div className="flex-1">
                                 <h4 className="font-bold text-sm text-gray-200">Neural Analytics</h4>
                                 <p className="text-[11px] text-gray-500 mt-1.5 leading-snug font-medium">Contribute scrubbed datasets to globally refine AI predictive architecture.</p>
                             </div>
                             <button onClick={() => setAllowResearch(!allowResearch)} className="transition-transform active:scale-95 focus:outline-none flex-shrink-0">
                                 {allowResearch ? (
                                    <ToggleRight size={44} className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" strokeWidth={1.5} />
                                 ) : (
                                    <ToggleLeft size={44} className="text-gray-600" strokeWidth={1.5} />
                                 )}
                             </button>
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* Data Export Command Center */}
            <motion.div 
               initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
               className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 sm:p-12 relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.4)]"
            >
                <div className="absolute top-0 right-0 w-[400px] h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>
                <div className="absolute top-0 right-[-5%] p-8 opacity-[0.05] pointer-events-none z-0">
                    <DownloadCloud size={240} className="text-cyan-400"/>
                </div>
                
                <div className="relative z-10 max-w-xl">
                    <div className="bg-white/10 border border-white/20 w-fit p-4 rounded-2xl mb-6 shadow-inner backdrop-blur-md">
                        <FileText size={28} className="text-cyan-400" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight mb-4 text-white">Extract User Archive</h2>
                    <p className="text-gray-400 text-sm mb-8 font-medium leading-relaxed">
                        Execute a bulk download of your telemetry history, neural mappings, and configurations. You maintain absolute sovereignty over this data.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30 flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                            <DownloadCloud size={20} strokeWidth={2} /> Compile Repository (.JSON)
                        </button>
                        <button className="bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all shadow-inner">
                            <FileText size={20} /> Matrix Summary (.PDF)
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Access Activity Log */}
            <motion.div 
               initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
               className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-[0_0_30px_rgba(0,0,0,0.3)] overflow-hidden"
            >
                <div className="p-8 border-b border-white/10 flex items-center gap-4 bg-transparent relative">
                    <div className="bg-purple-500/20 p-2 rounded-xl text-purple-400 border border-purple-500/30">
                       <Network size={20} strokeWidth={1.5} />
                    </div>
                    <h3 className="font-bold text-xl tracking-tight text-white">Network Audit Trail</h3>
                </div>
                <div className="divide-y divide-white/5">
                    {logEntries.map((log) => (
                        <div key={log.id} className="p-6 sm:px-8 hover:bg-white/5 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
                            <div>
                                <p className="font-bold text-sm text-gray-200 group-hover:text-cyan-400 transition-colors tracking-wide">{log.action}</p>
                                <p className="text-[11px] text-gray-500 mt-1.5 font-bold uppercase tracking-wider">{log.date} • IP: {log.ip}</p>
                            </div>
                            <div className="bg-gray-900/50 border border-white/10 text-gray-400 px-4 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest shadow-inner">
                                {log.device}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 bg-transparent text-center border-t border-white/10">
                    <button className="text-gray-500 hover:text-purple-400 font-bold uppercase tracking-widest text-[10px] transition-colors py-2">Parse Full Access Log</button>
                </div>
            </motion.div>

        </div>
    );
};
