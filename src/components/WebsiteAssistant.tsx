'use client';

import { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaUser, FaPlane, FaDiscord, FaQuestionCircle } from 'react-icons/fa';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // AI Simulation / Rule-based Logic
    setTimeout(() => {
      let botResponse = "";
      const input = inputValue.toLowerCase();

      if (input.includes('flight') || input.includes('book') || input.includes('schedule')) {
        botResponse = "You can view all active boarding flights on our homepage or the Tracker page. Would you like me to take you there?";
      } else if (input.includes('discord') || input.includes('join') || input.includes('group')) {
        botResponse = "Our Discord community is the heart of our operations! You can join here: discord.gg/aircanada";
      } else if (input.includes('staff') || input.includes('portal') || input.includes('admin')) {
        botResponse = "The Staff Portal is Restricted Area. If you are a pilot, please use the login link in the sidebar.";
      } else if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
        botResponse = "Hello! Captain! Ready for departure? How can I assist your flight today?";
      } else {
        botResponse = "I'm not sure about that, but our staff in Discord can definitely help! Use the 'Join Discord' button in the menu.";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button 
        className={`assistant-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Assistant"
      >
        {isOpen ? <FaTimes size={24} /> : <FaRobot size={24} />}
        {!isOpen && <span className="notification-dot"></span>}
      </button>

      {/* Assistant Window */}
      <div className={`assistant-window ${isOpen ? 'open' : ''}`}>
        <div className="assistant-header">
          <div className="header-info">
            <div className="bot-avatar">
              <FaRobot />
              <div className="online-indicator"></div>
            </div>
            <div>
              <h3>AC Assistant</h3>
              <p>Flight Ops Support</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="close-btn"><FaTimes /></button>
        </div>

        <div className="assistant-messages" ref={scrollRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
              <div className="message-bubble">
                {msg.text}
              </div>
              <span className="message-time">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {isTyping && (
            <div className="message-wrapper bot">
              <div className="message-bubble typing">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
        </div>

        <div className="assistant-input-area">
          <div className="quick-replies">
            <button onClick={() => {setInputValue('Active Flights'); handleSend();}}>🚀 Active Flights</button>
            <button onClick={() => {setInputValue('Join Discord'); handleSend();}}>💬 Discord</button>
          </div>
          <div className="input-row">
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="send-btn" onClick={handleSend} disabled={!inputValue.trim()}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .assistant-trigger {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--ac-red);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(228, 27, 35, 0.4);
          cursor: pointer;
          z-index: 9999;
          transition: all 0.4s var(--bounce);
          border: none;
        }

        .assistant-trigger:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 12px 40px rgba(228, 27, 35, 0.6);
        }

        .assistant-trigger.active {
          background: var(--bg);
          color: var(--text);
          border: 1px solid var(--border);
        }

        .notification-dot {
          position: absolute;
          top: 0;
          right: 0;
          width: 14px;
          height: 14px;
          background: #4caf50;
          border: 3px solid var(--bg);
          border-radius: 50%;
        }

        .assistant-window {
          position: fixed;
          bottom: 110px;
          right: 30px;
          width: 380px;
          height: 600px;
          max-height: calc(100vh - 150px);
          background: var(--surface);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid var(--border);
          border-radius: 24px;
          box-shadow: var(--shadow-lg);
          z-index: 9998;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px) scale(0.95);
          transition: all 0.4s var(--ease);
        }

        .assistant-window.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
        }

        .assistant-header {
          padding: 24px;
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .bot-avatar {
          width: 44px;
          height: 44px;
          background: var(--ac-red);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          position: relative;
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
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
        }

        .assistant-header p {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .close-btn {
          color: var(--text-tertiary);
          cursor: pointer;
          font-size: 1.2rem;
          padding: 8px;
        }

        .assistant-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }

        .message-wrapper {
          max-width: 80%;
          display: flex;
          flex-direction: column;
        }

        .message-wrapper.bot { align-self: flex-start; }
        .message-wrapper.user { align-self: flex-end; align-items: flex-end; }

        .message-bubble {
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 0.95rem;
          line-height: 1.5;
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
        }

        .message-time {
          font-size: 0.7rem;
          color: var(--text-tertiary);
          margin-top: 6px;
        }

        .assistant-input-area {
          padding: 20px;
          border-top: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.1);
        }

        .quick-replies {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .quick-replies button {
          white-space: nowrap;
          padding: 6px 12px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 100px;
          font-size: 0.8rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .quick-replies button:hover {
          border-color: var(--ac-red);
          color: var(--text);
        }

        .input-row {
          display: flex;
          gap: 12px;
          background: var(--surface-alt);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 8px 8px 8px 16px;
          align-items: center;
        }

        .input-row input {
          flex: 1;
          font-size: 0.95rem;
          background: none;
          border: none;
          color: var(--text);
        }

        .send-btn {
          width: 36px;
          height: 36px;
          background: var(--ac-red);
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .send-btn:disabled { opacity: 0.5; cursor: default; }
        .send-btn:not(:disabled):hover { transform: scale(1.05); }

        .typing .dot {
          display: inline-block;
          width: 4px;
          height: 4px;
          background: var(--text-tertiary);
          border-radius: 50%;
          margin-right: 3px;
          animation: dotPulse 1.4s infinite;
        }
        .typing .dot:nth-child(2) { animation-delay: 0.2s; }
        .typing .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dotPulse {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }

        @media (max-width: 480px) {
          .assistant-window {
            width: calc(100vw - 40px);
            right: 20px;
            bottom: 100px;
          }
          .assistant-trigger {
            bottom: 20px;
            right: 20px;
          }
        }
      `}</style>
    </>
  );
}
