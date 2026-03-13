import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Mic, AlertOctagon, Sparkles, ShieldAlert } from 'lucide-react';

export const AICompanionChat = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: "System initialized. I am MindAI, your neural reflection node. Awaiting telemetry...", sender: 'ai', timestamp: "08:00 AM" },
    ]);
    const [inputStr, setInputStr] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = (e) => {
        if (e) e.preventDefault();
        if (!inputStr.trim()) return;

        const date = new Date();
        const timestamp = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newUserMsg = { id: Date.now(), text: inputStr, sender: 'user', timestamp };
        setMessages(prev => [...prev, newUserMsg]);
        setInputStr('');
        setIsTyping(true);

        const isCrisis = inputStr.toLowerCase().includes('panic') || inputStr.toLowerCase().includes('help');

        setTimeout(() => {
            const aiResponse = isCrisis 
                ? { id: Date.now() + 1, text: "Priority Interrupt Received. Executing grounding subroutine. Inhale deeply... Hold... Exhale. Please identify 5 physical objects in your immediate vicinity to reset spatial awareness.", sender: 'ai', isCrisis: true, timestamp }
                : { id: Date.now() + 1, text: `Input processed. You designated: "${newUserMsg.text}". Recommendation: Initiate hibernation protocol early tonight to flush cognitive buffer.`, sender: 'ai', timestamp };
            
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const triggerPanic = () => {
        setInputStr("System overload. Experiencing cognitive spike.");
        setTimeout(() => handleSend(), 100);
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col font-sans text-white relative z-10 pb-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden">
            
            {/* Header */}
            <motion.div 
               initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} 
               className="bg-white/5 backdrop-blur-xl p-4 sm:p-6 border-b border-white/10 flex justify-between items-center relative z-20"
            >
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="bg-gradient-to-br from-purple-500/20 to-cyan-500/20 text-cyan-400 p-3 rounded-2xl border border-white/20 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                            <Sparkles size={24} strokeWidth={1.5} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-cyan-400 rounded-full border border-gray-900 shadow-[0_0_10px_rgba(6,182,212,1)] animate-pulse"></div>
                    </div>
                    <div>
                        <h2 className="font-bold text-lg tracking-tight flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 transition-all">
                           Syntax Node Alpha
                        </h2>
                        <p className="text-gray-400 text-[10px] font-bold mt-0.5 uppercase tracking-[0.2em]">
                           Connection Established
                        </p>
                    </div>
                </div>

                <button 
                  onClick={triggerPanic}
                  className="bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/30 px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-2 text-[10px] shadow-[0_0_15px_rgba(244,114,182,0.2)]"
                >
                    <ShieldAlert size={18} strokeWidth={2} /> <span className="hidden sm:inline">Priority Override</span>
                </button>
            </motion.div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-900/30 backdrop-blur-md relative border-x border-white/5">
                 <div className="space-y-8">
                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div 
                               key={msg.id}
                               initial={{ opacity: 0, y: 10, scale: 0.98 }}
                               animate={{ opacity: 1, y: 0, scale: 1 }}
                               className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-4 max-w-[85%] sm:max-w-[70%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    
                                    <div className="flex-shrink-0 mt-2">
                                        {msg.sender === 'ai' ? (
                                           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center border border-white/20 text-white shadow-[0_0_15px_rgba(139,92,246,0.6)]">
                                              <Bot size={20} strokeWidth={1.5}/>
                                           </div>
                                        ) : (
                                           <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-gray-300 shadow-inner backdrop-blur-sm">
                                              <User size={20} strokeWidth={1.5}/>
                                           </div>
                                        )}
                                    </div>

                                    <div className={`p-5 rounded-[2rem] relative backdrop-blur-xl ${
                                        msg.sender === 'user' 
                                            ? 'bg-white/10 border border-white/20 text-white rounded-tr-sm shadow-inner' 
                                            : msg.isCrisis 
                                                ? 'bg-pink-500/10 border border-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.5)] text-white rounded-tl-sm'
                                                : 'bg-gray-900/60 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)] text-gray-200 rounded-tl-sm'
                                    }`}>
                                        {msg.isCrisis && (
                                            <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-pink-400 border-b border-pink-500/30 pb-2 uppercase tracking-[0.2em]">
                                                <AlertOctagon size={16} strokeWidth={2}/> Override Accepted
                                            </div>
                                        )}
                                        <p className="whitespace-pre-wrap leading-relaxed text-sm font-medium">
                                            {msg.text}
                                        </p>
                                        <div className={`text-[10px] font-bold mt-3 uppercase tracking-widest ${msg.sender === 'user' ? 'text-gray-400 text-right' : 'text-cyan-500/60 text-left'}`}>
                                            {msg.timestamp}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="flex gap-4 max-w-[80%]">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center border border-white/20 text-white shadow-[0_0_15px_rgba(139,92,246,0.6)] mt-2">
                                    <Bot size={20} strokeWidth={1.5}/>
                                </div>
                                <div className="bg-gray-900/60 backdrop-blur-md border border-cyan-500/30 px-5 py-4 rounded-[2rem] rounded-tl-sm flex items-center gap-1.5 h-14 shadow-inner">
                                    <motion.div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,1)]" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                                    <motion.div className="w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,1)]" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                                    <motion.div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,1)]" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                 </div>
            </div>

            {/* Input Area */}
            <div className="bg-white/5 backdrop-blur-xl p-4 sm:p-6 border-t border-white/10 relative z-20 flex">
                <form onSubmit={handleSend} className="relative flex items-center gap-4 w-full">
                    <button type="button" className="p-3.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-gray-400 hover:text-cyan-400 transition-colors shadow-inner">
                        <Mic size={20} strokeWidth={1.5}/>
                    </button>
                    <input 
                        type="text" 
                        value={inputStr}
                        onChange={(e) => setInputStr(e.target.value)}
                        placeholder="Input cognitive data..."
                        className="flex-1 bg-gray-900/50 backdrop-blur-md border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-4 px-5 transition-all w-full shadow-inner text-sm font-medium"
                    />
                    <button 
                        type="submit"
                        disabled={!inputStr.trim()}
                        className="p-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(139,92,246,0.5)] border border-transparent"
                    >
                        <Send size={20} className="ml-0.5" strokeWidth={2}/>
                    </button>
                </form>
            </div>

        </div>
    );
};
