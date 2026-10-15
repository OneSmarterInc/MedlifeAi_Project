import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ShieldCheck, Users, ArrowRight, MessageSquare, Activity } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col justify-center max-w-7xl mx-auto px-6 py-12 w-full font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Hero Text & Call to Action */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center space-x-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-3.5 py-1.5 rounded-full text-[#e11d48] text-xs font-semibold tracking-wide">
            <Sparkles size={14} />
            <span>AI-POWERED HEALTH COMPANION</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1]">
            Your Medical Companion, <span className="text-[#e11d48]">Anytime,</span> <span className="text-[#e11d48]">Anywhere.</span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl leading-relaxed">
            Revolutionizing healthcare through cutting-edge AI, tailored to provide you with accurate medical insights.
          </p>

          <div className="pt-2">
            <button 
              onClick={() => navigate('/login')}
              className="inline-flex items-center space-x-3 bg-[#e11d48] hover:bg-rose-700 text-white font-bold px-8 py-4 rounded-2xl shadow-[0_8px_25px_rgba(225,29,72,0.35)] transition transform hover:-translate-y-0.5 text-sm"
            >
              <span>Choose Your Plan & Empower Your Health Journey</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Feature Badges / Trust indicators */}
          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-medium text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <span className="text-[#e11d48] font-bold">✓</span>
              <span>Free trial available</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck size={16} className="text-amber-500" />
              <span>Encrypted data</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#e11d48] font-bold">✓</span>
              <span>For all age groups</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Chat Preview Card */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl blur-xl opacity-20 dark:opacity-30"></div>
          
          <div className="relative w-full max-w-md bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-3xl p-6 shadow-2xl space-y-6">
            
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#222] pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-[#e11d48] flex items-center justify-center font-bold">
                  <Activity size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
                    <span>medlife.ai</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  </div>
                  <div className="text-[10px] text-gray-400">Online now</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] px-2.5 py-1 rounded-full text-[10px] font-medium text-gray-600 dark:text-gray-300">
                <span>🔒 Encrypted & private</span>
              </div>
            </div>

            {/* Chat Messages Preview */}
            <div className="space-y-4">
              <div className="flex justify-end">
                <div className="bg-[#e11d48] text-white text-xs px-4 py-3 rounded-2xl rounded-br-none max-w-[80%] shadow-md">
                  I've had a mild headache since morning. What can I do?
                </div>
              </div>

              <div className="flex justify-start">
                <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#262626] text-gray-800 dark:text-gray-200 text-xs px-4 py-3.5 rounded-2xl rounded-bl-none max-w-[90%] space-y-3 shadow-sm">
                  <p>Sorry to hear that. Staying hydrated, resting in a quiet room and checking for common triggers can help. Let me ask a few quick questions to guide you better.</p>
                  <div className="pt-2 border-t border-gray-200 dark:border-[#2a2a2a] flex justify-center">
                    <div className="w-full h-8 bg-rose-50 dark:bg-rose-950/30 rounded-lg flex items-center justify-center text-[#e11d48]">
                      <div className="flex items-center space-x-1">
                        <span className="w-1.5 h-3 bg-[#e11d48] animate-bounce"></span>
                        <span className="w-1.5 h-5 bg-[#e11d48] animate-bounce delay-100"></span>
                        <span className="w-1.5 h-2 bg-[#e11d48] animate-bounce delay-200"></span>
                        <span className="w-1.5 h-6 bg-[#e11d48] animate-bounce delay-300"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Input Bar */}
            <div className="relative pt-2">
              <input 
                type="text" 
                placeholder="Type your health question..." 
                disabled
                className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#262626] rounded-xl px-4 py-3 text-xs text-gray-400 focus:outline-none"
              />
              <button disabled className="absolute right-2.5 top-4 w-7 h-7 bg-[#e11d48] text-white rounded-lg flex items-center justify-center shadow-md">
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}