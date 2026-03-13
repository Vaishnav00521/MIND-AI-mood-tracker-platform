import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Activity, Users, Download, Search, ShieldAlert, Sparkles } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

export const EntityDashboard = () => {
    // Simulated B2B Entity State
    const [entityData, setEntityData] = useState({
        name: "NeuroCore Biotech",
        id: "NB-842-X",
        activePatients: 1420,
        averageRiskLevel: "Stable",
        totalIncidents: 4,
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    // Simulated historical dataset for the Clinic/Entity spanning 6 months
    const historicalData = {
        labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
        datasets: [
            {
                label: 'Aggregate Synchronization',
                data: [65, 59, 80, 81, 56, 75],
                fill: true,
                backgroundColor: 'rgba(6, 182, 212, 0.1)', // cyan-500 alpha
                borderColor: '#06B6D4',
                tension: 0.4,
                pointBackgroundColor: '#0B0F19',
                pointBorderColor: '#06B6D4',
                pointHoverBackgroundColor: '#06B6D4',
                pointHoverBorderColor: '#FFFFFF',
                borderWidth: 2,
            },
            {
                label: 'System Anomalies',
                data: [12, 19, 3, 5, 14, 4],
                fill: false,
                borderColor: '#F472B6', // pink-400
                borderDash: [5, 5],
                tension: 0.4,
                pointBackgroundColor: '#0B0F19',
                pointBorderColor: '#F472B6',
                borderWidth: 2,
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                position: 'top',
                labels: { color: '#9CA3AF', font: { family: 'Inter', size: 12 } } // gray-400
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                titleColor: '#F3F4F6',
                bodyColor: '#9CA3AF',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                titleFont: { family: 'Inter', weight: '600' },
                bodyFont: { family: 'Inter' },
                padding: 12,
            }
        },
        scales: {
            y: { grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false }, ticks: { color: '#6B7280' } },
            x: { grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false }, ticks: { color: '#6B7280' } }
        }
    };

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => setIsExporting(false), 2000);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans text-white relative z-10">
            
            {/* Header / Identity Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 shadow-inner border border-white/20 p-3 rounded-2xl">
                        <Building2 className="text-cyan-400 h-8 w-8" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{entityData.name}</h1>
                        <p className="text-gray-400 text-xs uppercase tracking-[0.2em] font-bold mt-1">Node ID: {entityData.id}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                       onClick={handleExport}
                       disabled={isExporting}
                       className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white border border-transparent px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:opacity-50"
                    >
                        {isExporting ? <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"/> : <Download className="h-4 w-4" />}
                        {isExporting ? "Compiling..." : "Export Node Data"}
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Active Connections", val: entityData.activePatients, icon: <Users className="text-cyan-400"/>, color: "cyan-400", bg: "cyan-500/10" },
                    { label: "Aggregate Stability", val: entityData.averageRiskLevel, icon: <Activity className="text-purple-400"/>, color: "purple-400", bg: "purple-500/10" },
                    { label: "Anomalies Detected", val: entityData.totalIncidents, icon: <ShieldAlert className="text-pink-400"/>, color: "pink-400", bg: "pink-500/10" }
                ].map((m, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, ease: 'easeOut' }}
                        className={`bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] relative overflow-hidden group hover:border-${m.color}/40 hover:bg-white/10 shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">{m.label}</h3>
                            <div className={`bg-${m.bg} p-2.5 rounded-xl border border-${m.color}/20 shadow-inner`}>{m.icon}</div>
                        </div>
                        <div className={`text-4xl font-black tracking-tight text-white`}>
                            {m.val}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* High Density Chart Area */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-[0_0_30px_rgba(0,0,0,0.3)] lg:col-span-2 relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight mb-1 text-white flex items-center gap-2">
                           <Sparkles className="text-purple-400" size={20}/> Macro Telemetry
                        </h2>
                        <p className="text-gray-400 text-xs uppercase tracking-[0.1em] font-bold">Organizational variance mapping.</p>
                    </div>
                </div>
                <div className="h-[350px] w-full">
                    <Line data={historicalData} options={chartOptions} />
                </div>
            </div>

            {/* Entity Internal Directory */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                <div className="p-6 sm:p-8 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                         <h2 className="text-xl font-bold tracking-tight text-white">Encrypted Directory</h2>
                         <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Anonymized organizational profiles.</p>
                    </div>
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Decrypt by ID..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 bg-gray-900/50 border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium text-white placeholder-gray-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans">
                        <thead>
                            <tr className="border-b border-white/10 bg-black/20">
                                <th className="p-4 px-8 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Node ID</th>
                                <th className="p-4 px-8 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Synchronization</th>
                                <th className="p-4 px-8 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Last Ping</th>
                                <th className="p-4 px-8 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] text-right">Parameter</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {[1, 2, 3, 4, 5].map((row) => (
                                <tr key={row} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer backdrop-blur-sm">
                                    <td className="p-4 px-8 font-semibold text-gray-300">ID-{Math.floor(Math.random()*9000)+1000}</td>
                                    <td className="p-4 px-8 text-gray-400">
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-2 bg-gray-900 border border-white/5 rounded-full overflow-hidden shadow-inner">
                                                <div className={`h-full ${row === 2 ? 'bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.8)] w-[30%]' : 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] w-[75%]'}`}></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-500">{row === 2 ? '30%' : '75%'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 px-8 text-gray-500 text-xs font-bold uppercase tracking-wider">2 hrs ago</td>
                                    <td className="p-4 px-8 text-right">
                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold border ${row === 2 ? 'bg-pink-500/10 text-pink-400 border-pink-500/30' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'}`}>
                                            {row === 2 ? 'Anomaly' : 'Stable'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};
