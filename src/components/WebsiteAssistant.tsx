'use client';

import { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaUser, FaPlane, FaDiscord, FaQuestionCircle, FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  staffName?: string;
}

export default function WebsiteAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Welcome to Air Canada PTFS! I'm your virtual flight assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let id = localStorage.getItem('ac_assistance_id');
    if (!id) {
      id = 'chat_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('ac_assistance_id', id);
    }
    setChatId(id);
    
    // Initial fetch
    if (id) fetchMessages(id);
    
    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      if (id) fetchMessages(id);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async (id: string) => {
    try {
      const res = await fetch(`/api/assistance?chatId=${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(prev => {
            const existingIds = prev.map(m => m.id);
            const newMessages = data.messages
              .filter((m: any) => !existingIds.includes(m.id))
              .map((m: any) => ({
                ...m,
                timestamp: new Date(m.timestamp)
              }));
            
            if (newMessages.length === 0) return prev;
            return [...prev, ...newMessages];
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (customValue?: string) => {
    const text = customValue || inputValue;
    if (!text.trim() || !chatId) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // 1. Send to our Assistance API (which bridges to Discord)
      const res = await fetch('/api/assistance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          message: text,
          sender: 'user',
          username: localStorage.getItem('ac_staff_username') || 'Guest'
        })
      });

      if (!res.ok) throw new Error('API Error');

      // 2. Immediate Local Bot Response for common queries
      const input = text.toLowerCase();
      let botResponse = "";

      if (input.includes('flight') || input.includes('book') || input.includes('schedule') || input.includes('active')) {
        botResponse = "I've checked the live roster for you. You can find all active flights on the home page. Our staff have also been notified if you need more help!";
      } else if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
        botResponse = "Hello Captain! Ready for departure? I've notified our staff that you're here. How can I assist you today?";
      } else if (input.includes('who') || input.includes('owner')) {
        botResponse = "Air Canada PTFS was founded by GAMO and Tattered. We now have over 7,000 members! I've pinged the staff for you.";
      } else if (input.includes('discord')) {
        botResponse = "Our community is mainly on Discord! You can join us here: https://discord.gg/acptfs. Staff can also answer your questions there!";
      }

      if (botResponse) {
        setTimeout(() => {
          const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: botResponse,
            sender: 'bot',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMsg]);
          setIsTyping(false);
        }, 1500);
      } else {
        // If no auto-reponse, staff will reply soon
        setTimeout(() => setIsTyping(false), 2000);
      }

    } catch (err) {
      console.error("Send error:", err);
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className="assistant-container">
        {/* Floating Trigger Button */}
        <motion.button 
          className={`assistant-trigger ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          aria-label="Toggle Assistant"
        >
          {isOpen ? <FaChevronDown size={20} /> : <FaRobot size={24} />}
          {!isOpen && <span className="notification-dot"></span>}
        </motion.button>

        {/* Assistant Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className="assistant-window"
              initial={{ opacity: 0, scale: 0.9, y: 40, x: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40, x: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="assistant-header">
                <div className="header-info">
                  <div className="bot-avatar">
                    <FaRobot />
                    <div className="online-indicator"></div>
                  </div>
                  <div>
                    <h3>AC Assistance</h3>
                    <p className="status-online">● Staff typically reply in minutes</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="close-btn"><FaTimes /></button>
              </div>

              <div className="assistant-messages" ref={scrollRef}>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id} 
                    className={`message-wrapper ${msg.sender}`}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="message-bubble">
                      {msg.text}
                      {msg.sender === 'bot' && msg.staffName && (
                        <div className="staff-signature">— {msg.staffName} (Staff)</div>
                      )}
                    </div>
                    <span className="message-time">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div 
                    className="message-wrapper bot"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="message-bubble typing">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="assistant-input-area">
                <div className="quick-replies">
                  <button onClick={() => handleSend('Tell me about active flights')}>🚀 Active Flights</button>
                  <button onClick={() => handleSend('How do I join the Discord?')}>💬 Join Discord</button>
                  <button onClick={() => handleSend('Who are the owners?')}>👑 Leadership</button>
                </div>
                <div className="input-row">
                  <input 
                    type="text" 
                    placeholder="Type a message to staff..." 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <button className="send-btn" onClick={() => handleSend()} disabled={!inputValue.trim()}>
                    <FaPaperPlane />
                  </button>
                </div>
                <p className="input-disclaimer">Staff will see your message in Discord and reply here.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .assistant-container {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 9999;
        }

        .assistant-trigger {
          width: 60px;
          height: 60px;
          border-radius: 18px;
          background: var(--ac-red);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(228, 27, 35, 0.4);
          cursor: pointer;
          border: none;
          position: relative;
        }

        .assistant-trigger.active {
          background: var(--surface-alt);
          color: var(--text);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
        }

        .notification-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 14px;
          height: 14px;
          background: #4caf50;
          border: 3px solid var(--bg);
          border-radius: 50%;
        }

        .assistant-window {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 380px;
          height: 600px;
          max-height: calc(100vh - 120px);
          background: var(--surface);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid var(--border);
          border-radius: 24px;
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform-origin: bottom right;
        }

        .assistant-header {
          padding: 24px;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .bot-avatar {
          width: 42px;
          height: 42px;
          background: var(--ac-red);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          position: relative;
          font-size: 1.2rem;
        }

        .online-indicator {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 10px;
          height: 10px;
          background: #4caf50;
          border: 2px solid var(--surface);
          border-radius: 50%;
        }

        .assistant-header h3 {
          font-size: 1.05rem;
          font-weight: 700;
          margin: 0;
          color: var(--text);
        }

        .status-online {
          font-size: 0.75rem;
          color: #4caf50 !important;
          margin: 2px 0 0 0;
          font-weight: 500;
        }

        .close-btn {
          color: var(--text-tertiary);
          cursor: pointer;
          font-size: 1.1rem;
          padding: 8px;
          transition: color 0.2s;
        }
        .close-btn:hover { color: var(--text); }

        .assistant-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }

        .message-wrapper {
          max-width: 85%;
          display: flex;
          flex-direction: column;
        }

        .message-wrapper.bot { align-self: flex-start; }
        .message-wrapper.user { align-self: flex-end; align-items: flex-end; }

        .message-bubble {
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 0.92rem;
          line-height: 1.5;
          position: relative;
        }

        .bot .message-bubble {
          background: var(--surface-alt);
          color: var(--text);
          border-bottom-left-radius: 4px;
          border: 1px solid var(--border);
        }

        .user .message-bubble {
          background: var(--ac-red);
          color: white;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 12px rgba(228, 27, 35, 0.2);
        }

        .staff-signature {
          font-size: 0.7rem;
          opacity: 0.7;
          margin-top: 8px;
          font-style: italic;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 6px;
        }

        .message-time {
          font-size: 0.65rem;
          color: var(--text-tertiary);
          margin-top: 6px;
          font-weight: 500;
        }

        .assistant-input-area {
          padding: 20px;
          border-top: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.05);
        }

        .quick-replies {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          overflow-x: auto;
          padding-bottom: 8px;
          scrollbar-width: none;
        }
        .quick-replies::-webkit-scrollbar { display: none; }

        .quick-replies button {
          white-space: nowrap;
          padding: 6px 14px;
          background: var(--surface-alt);
          border: 1px solid var(--border);
          border-radius: 100px;
          font-size: 0.75rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }

        .quick-replies button:hover {
          border-color: var(--ac-red);
          color: var(--text);
          background: rgba(228, 27, 35, 0.05);
        }

        .input-row {
          display: flex;
          gap: 10px;
          background: var(--surface-alt);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 6px 6px 6px 16px;
          align-items: center;
          transition: border-color 0.2s;
        }
        .input-row:focus-within {
          border-color: var(--text-tertiary);
        }

        .input-row input {
          flex: 1;
          font-size: 0.92rem;
          background: none;
          border: none;
          color: var(--text);
          padding: 8px 0;
        }

        .send-btn {
          width: 38px;
          height: 38px;
          background: var(--ac-red);
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .send-btn:disabled { opacity: 0.4; cursor: default; filter: grayscale(1); }
        .send-btn:not(:disabled):hover { transform: scale(1.05); background: var(--ac-red-hover); }

        .input-disclaimer {
          font-size: 0.65rem;
          color: var(--text-tertiary);
          text-align: center;
          margin: 10px 0 0 0;
          font-weight: 500;
        }

        .typing .dot {
          display: inline-block;
          width: 5px;
          height: 5px;
          background: var(--text-tertiary);
          border-radius: 50%;
          margin-right: 4px;
          animation: dotPulse 1.4s infinite;
        }
        .typing .dot:nth-child(2) { animation-delay: 0.2s; }
        .typing .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dotPulse {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
          30% { transform: translateY(-5px); opacity: 1; }
        }

        @media (max-width: 480px) {
          .assistant-window {
            width: calc(100vw - 40px);
            right: -10px;
            bottom: 75px;
          }
          .assistant-container {
            bottom: 20px;
            right: 20px;
          }
        }
      `}</style>
    </>
  );
}
