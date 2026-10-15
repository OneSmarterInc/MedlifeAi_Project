import React, { useState } from 'react';
import axios from 'axios';
import { Send, User, HeartPulse } from 'lucide-react';

export default function Chat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am medlife.ai. How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      
      const response = await axios.post(
        'http://127.0.0.1:8000/api/chat/',
        { message: userText },
        { headers: { Authorization: `Bearer ${token}` } } 
      );

      setMessages(prev => [...prev, { role: 'ai', text: response.data.response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Error connecting to the server. Please ensure you are signed in." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 bg-white dark:bg-[#13161f] rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-[rgba(255,255,255,0.08)] h-[75vh] flex flex-col transition-colors relative z-10">
      
      <div className="border-b border-gray-100 dark:border-[rgba(255,255,255,0.08)] pb-4 mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-[#f8fafc]">Health Assistant</h2>
        <p className="text-sm text-gray-500 dark:text-[#94a3b8]">Ask anything about your wellness.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-100 dark:bg-[#1c202d]' : 'bg-[#e11d48] dark:bg-[#ff1a3c]'}`}>
              {msg.role === 'user' ? <User size={16} className="text-gray-600 dark:text-[#94a3b8]" /> : <HeartPulse size={16} className="text-white" />}
            </div>
            <div className={`max-w-[75%] p-4 rounded-[16px] text-[14.5px] leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-gray-100 dark:bg-[#1c202d] text-gray-900 dark:text-[#f8fafc]' 
                : 'bg-red-50/50 dark:bg-[rgba(255,26,60,0.08)] text-gray-900 dark:text-[#f8fafc] border border-red-100 dark:border-[rgba(255,26,60,0.15)]'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#e11d48] dark:bg-[#ff1a3c] flex items-center justify-center">
              <HeartPulse size={16} className="text-white animate-pulse" />
            </div>
            <div className="p-4 rounded-[16px] bg-red-50/50 dark:bg-[rgba(255,26,60,0.08)] border border-red-100 dark:border-[rgba(255,26,60,0.15)] text-gray-500 text-sm">Typing...</div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="mt-4 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your symptoms or questions..."
          className="w-full bg-gray-50 dark:bg-[#0d0f14] border border-gray-200 dark:border-[rgba(255,255,255,0.05)] text-[14px] text-gray-900 dark:text-[#f8fafc] rounded-[14px] py-4 pl-6 pr-16 focus:outline-none focus:border-[#e11d48] dark:focus:border-[#ff1a3c] focus:ring-1 focus:ring-[#e11d48] transition-colors"
        />
        <button 
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-2 top-2 bottom-2 bg-[#e11d48] dark:bg-[#ff1a3c] hover:bg-[#be123c] dark:hover:bg-[#e11d48] text-white rounded-[10px] px-4 flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}