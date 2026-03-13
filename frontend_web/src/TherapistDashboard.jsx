import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, Users, Search, Download, Filter, MoreVertical, Sparkles } from 'lucide-react';

// Mock Patient Data
const initialPatients = [
  { id: '1001', name: 'Eleanor Vance', phq9: 4, trend: 'stable', risk: 'Nominal', lastActive: '2 days ago' },
  { id: '1002', name: 'Theodore Laurence', phq9: 14, trend: 'worsening', risk: 'Elevated', lastActive: '1 day ago' },
  { id: '1003', name: 'Amy March', phq9: 8, trend: 'improving', risk: 'Monitored', lastActive: '4 days ago' },
  { id: '1004', name: 'John Brooke', phq9: 2, trend: 'stable', risk: 'Nominal', lastActive: 'Active' },
  { id: '1005', name: 'Margaret Hale', phq9: 18, trend: 'worsening', risk: 'Critical', lastActive: '3 days ago' },
];

const riskColors = {
  'Nominal': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]',
  'Monitored': 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]',
  'Elevated': 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]',
  'Critical': 'bg-pink-500/20 text-pink-400 border-pink-500/50 shadow-[0_0_15px_rgba(244,114,182,0.3)]',
};

const trendIcons = {
  'stable': <span className="text-gray-500 font-bold">—</span>,
  'improving': <span className="text-cyan-400 font-bold">↘</span>,
  'worsening': <span className="text-pink-400 font-bold">↗</span>,
};

export const TherapistDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('All');

  const filteredPatients = initialPatients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm);
    const matchesRisk = filterRisk === 'All' ? true : p.risk === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 font-sans text-white relative z-10">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -5 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-8 py-2"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
             <Sparkles className="text-cyan-400" size={32} strokeWidth={1.5} /> 
             Clinical Overseer
          </h1>
          <p className="text-gray-400 mt-2 text-xs uppercase tracking-[0.2em] font-bold">Dr. Jenkins • Mindful Care Partners</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/30 rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-300 transition-all flex items-center gap-2 shadow-inner">
            <Filter size={18}/> Filters
          </button>
          <button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white border border-transparent rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center gap-2">
            Initialize Node
          </button>
        </div>
      </motion.div>
      
      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Active Nodes", value: "142", icon: <Users size={24}/>, trend: "Consistent syncing", theme: "cyan-400", bg: "cyan-500/10", border: 'cyan-500/30' },
          { title: "Network Stability", value: "71%", icon: <Activity size={24}/>, trend: "Trending slightly upwards", theme: "purple-400", bg: "purple-500/10", border: 'purple-500/30' },
          { title: "Critical Alerts", value: "3", icon: <AlertTriangle size={24}/>, trend: "Awaiting intervention", theme: "pink-400", bg: "pink-500/10", border: 'pink-500/30' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
            className={`bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 flex flex-col justify-between group hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:border-${stat.theme}/50 transition-all`}
          >
           <div className="flex justify-between items-start mb-6">
              <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">{stat.title}</h3>
              <div className={`p-3 rounded-2xl bg-${stat.bg} text-${stat.theme} transition-transform border border-${stat.border} shadow-inner`}>
                 {React.cloneElement(stat.icon, { strokeWidth: 1.5 })}
              </div>
           </div>
           <div>
             <span className="text-4xl font-black tracking-tight">{stat.value}</span>
             <p className={`text-[10px] font-bold uppercase tracking-wider mt-3 ${i === 2 && stat.value !== "0" ? 'text-pink-400' : 'text-gray-500'}`}>
               {stat.trend}
             </p>
           </div>
          </motion.div>
        ))}
      </div>

      {/* Patient Data Table */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] pt-2"
      >
        <div className="p-6 sm:p-8 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-transparent">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search data streams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-white/10 rounded-xl text-sm font-medium text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
            />
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <select 
              value={filterRisk} 
              onChange={(e) => setFilterRisk(e.target.value)}
              className="w-full sm:w-auto bg-gray-900/50 border border-white/10 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl py-3 px-5 focus:outline-none focus:border-cyan-400 cursor-pointer shadow-inner"
            >
              <option value="All">All Anomalies</option>
              <option value="Nominal">Nominal Status</option>
              <option value="Monitored">Monitored</option>
              <option value="Elevated">Elevated</option>
              <option value="Critical">System Critical</option>
            </select>
            <button className="bg-white/5 border border-white/10 rounded-xl p-3 text-gray-400 hover:text-cyan-400 hover:bg-white/10 transition-colors shadow-inner" title="Export Securely">
              <Download size={20} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-black/20 border-b border-white/10 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">
                <th className="px-8 py-5">Node ID</th>
                <th className="px-8 py-5">Designation</th>
                <th className="px-8 py-5">Telemetry</th>
                <th className="px-8 py-5">Trajectory</th>
                <th className="px-8 py-5">Risk Level</th>
                <th className="px-8 py-5">Last Sync</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-8 py-12 text-center text-gray-500 font-medium">
                    No matching streams acquired.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-white/5 transition-colors group cursor-pointer backdrop-blur-sm">
                    <td className="px-8 py-5 text-sm text-gray-500 font-bold tracking-widest">#{patient.id}</td>
                    <td className="px-8 py-5 font-bold text-gray-200">{patient.name}</td>
                    <td className="px-8 py-5 font-medium">
                      <span className="font-black text-white">{patient.phq9}</span>
                      <span className="text-[10px] font-bold text-gray-500 ml-1 tracking-wider">/ 27</span>
                    </td>
                    <td className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
                        {trendIcons[patient.trend]} <span className="text-gray-400">{patient.trend}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${riskColors[patient.risk]}`}>
                        {patient.risk}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-500">{patient.lastActive}</td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-gray-500 hover:text-cyan-400 transition-colors p-2 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 shadow-inner border border-transparent hover:border-white/20">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 border-t border-white/10 flex justify-between items-center text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 bg-transparent">
           <span>Displaying 1 to {filteredPatients.length} of {filteredPatients.length} streams</span>
           <div className="flex gap-3">
             <button className="px-5 py-2.5 border border-white/10 rounded-xl hover:bg-white/5 bg-transparent disabled:opacity-30 shadow-inner text-white transition-colors" disabled>Rewind</button>
             <button className="px-5 py-2.5 border border-white/10 rounded-xl hover:bg-white/5 bg-transparent disabled:opacity-30 shadow-inner text-white transition-colors" disabled>Advance</button>
           </div>
        </div>

      </motion.div>
    </div>
  );
};
