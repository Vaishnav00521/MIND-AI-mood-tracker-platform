import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Cpu, Terminal, Trash2 } from 'lucide-react';
import { useMood } from './MoodContext';

const INITIAL_MESSAGE = {
  id: 'init',
  role: 'ai',
  content: "Hello! I'm MindAI, your wellness companion. I'll help you understand your mood and feelings better.",
  timestamp: new Date().toLocaleTimeString(),
  topic: 'system'
};

export const AICompanionChat = () => {
  const { logs, streak, currentScore } = useMood();

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('mind_ai_chat_history');
    return saved ? JSON.parse(saved) : [INITIAL_MESSAGE];
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const socketRef = useRef(null);
  const currentStreamingMsgId = useRef(null);

  // Persistence and Auto-scroll
  useEffect(() => {
    localStorage.setItem('mind_ai_chat_history', JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // WebSocket Connection
  useEffect(() => {
    let mounted = true;
    let reconnectTimeout = null;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const socketUrl = `${protocol}://localhost:8000/ws/ai/`;

    const connect = () => {
      if (!mounted) return;
      console.log("Attempting neural link synchronization...");
      socketRef.current = new WebSocket(socketUrl);

      socketRef.current.onopen = () => {
        if (!mounted) return;
        console.log("Connected to AI chat.");
      };

      socketRef.current.onmessage = (e) => {
        if (!mounted) return;
        const data = JSON.parse(e.data);

        if (data.type === 'connection_status') {
          console.log("AI Status:", data.text);
          return;
        }

        if (data.type === 'message' || data.type === 'CRISIS_PROTOCOL') {
          const aiMsg = {
            id: Date.now().toString() + Math.random(),
            role: 'ai',
            content: data.text,
            timestamp: new Date().toLocaleTimeString(),
            isCrisis: data.type === 'CRISIS_PROTOCOL'
          };
          setMessages(prev => [...prev, aiMsg]);
          setIsTyping(false);
        }

        if (data.type === 'stream_start') {
          setIsTyping(true);
          const id = Date.now().toString();
          currentStreamingMsgId.current = id;
          setMessages(prev => [...prev, {
            id,
            role: 'ai',
            content: '',
            timestamp: new Date().toLocaleTimeString()
          }]);
        }

        if (data.type === 'stream_chunk') {
          setMessages(prev => prev.map(msg =>
            msg.id === currentStreamingMsgId.current
              ? { ...msg, content: msg.content + data.chunk }
              : msg
          ));
        }

        if (data.type === 'stream_end') {
          setIsTyping(false);
          currentStreamingMsgId.current = null;
        }

        if (data.type === 'error') {
          console.error("Chat error:", data.text);
          setIsTyping(false);
          // Show error to user as an AI message
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'ai',
            content: `⚠️ ${data.text}`,
            timestamp: new Date().toLocaleTimeString()
          }]);
        }
      };

      socketRef.current.onclose = () => {
        if (mounted) {
          console.warn("Reconnecting to chat in 5 seconds...");
          reconnectTimeout = setTimeout(connect, 5000);
        }
      };

      socketRef.current.onerror = (err) => {
        console.error("WebSocket error:", err);
      };
    };

    connect();

    return () => {
      mounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close();
      }
    };
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    // Check WebSocket state
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: "⚠️ Cannot connect to AI. Please make sure the server is running and try again.",
        timestamp: new Date().toLocaleTimeString()
      }]);
      return;
    }

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);

    socketRef.current.send(JSON.stringify({ text: input }));
    setInput('');
    setIsTyping(true);
  };

  const clearHistory = () => {
    if (window.confirm("Delete all chat history?")) {
      setMessages([INITIAL_MESSAGE]);
      localStorage.removeItem('mind_ai_chat_history');
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[80vh] flex flex-col font-sans text-white relative z-10 pb-8 px-4 sm:px-0">

      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-600/10 rounded-2xl border border-cyan-500/20">
            <Cpu size={22} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">Neural <span className="text-cyan-500">Interface</span></h1>
            <div className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              Node Linked // Stable
            </div>
          </div>
        </div>
        <button onClick={clearHistory} className="p-3 text-gray-600 hover:text-pink-500 transition-colors bg-white/5 rounded-xl border border-white/5">
          <Trash2 size={18} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg flex flex-col relative">

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-hide">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${msg.role === 'ai'
                  ? 'bg-cyan-600/10 border-cyan-500/20 text-cyan-400'
                  : 'bg-purple-600/10 border-purple-500/20 text-purple-400'
                  }`}>
                  {msg.role === 'ai' ? <Bot size={18} /> : <User size={18} />}
                </div>

                <div className={`space-y-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed border ${msg.role === 'ai'
                    ? 'bg-white/5 border-white/5 text-gray-200 rounded-tl-none'
                    : 'bg-gradient-to-br from-purple-600 to-blue-700 border-purple-500/10 text-white rounded-tr-none'
                    }`}>
                    {msg.content}
                  </div>
                  <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest px-2 opacity-50">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 items-center pl-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              <span className="text-[10px] font-black text-cyan-500/60 uppercase tracking-widest animate-pulse">Processing...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-5 border-t border-white/10 bg-black/20">
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Input natural language telemetry..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 font-medium"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-12 h-12 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg transition-all disabled:opacity-50 hover:opacity-90"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="mt-3 flex gap-6 px-1">
            {['/tips', '/streak', '/mood'].map(cmd => (
              <button
                key={cmd}
                onClick={() => setInput(cmd)}
                className="text-[10px] font-black text-gray-500 hover:text-cyan-400 uppercase tracking-widest transition-colors flex items-center gap-1.5"
              >
                <Terminal size={10} className="text-gray-700" /> {cmd}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICompanionChat;
