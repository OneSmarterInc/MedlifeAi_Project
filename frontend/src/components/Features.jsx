import React from 'react';
import { MessageSquare, Cpu, Smile, ShieldCheck, Download } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: <MessageSquare size={24} className="text-[#e11d48]" />,
      title: "Instant Feedback",
      description: "Don't wait for appointments. Get your queries addressed immediately."
    },
    {
      icon: <Cpu size={24} className="text-[#e11d48]" />,
      title: "Powered by AI engines",
      description: "We leverage one of the most sophisticated AI platforms to deliver precise and reliable responses."
    },
    {
      icon: <Smile size={24} className="text-[#e11d48]" />,
      title: "User-Friendly Interface",
      description: "No tech expertise required! A straightforward and efficient user experience for all age groups."
    },
    {
      icon: <ShieldCheck size={24} className="text-[#e11d48]" />,
      title: "Data Security",
      description: "Your health information is safe with us. We prioritize data privacy and ensure its encrypted storage and transfer."
    },
    {
      icon: <Download size={24} className="text-[#e11d48]" />,
      title: "Download & Share",
      description: "A unique feature allowing you to save and share your health insights with your primary doctor."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      
      {/* Top Badge */}
      <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 text-[#e11d48] dark:text-[#ff1a3c] text-xs font-bold tracking-wider mb-6 border border-red-100 dark:border-red-900/30">
        WHY MEDLIFE.AI
      </div>

      {/* Headings */}
      <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
        Features Highlights
      </h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-16 text-[15px]">
        Everything you need for quick, reliable and private health guidance, in one simple place.
      </p>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="bg-white dark:bg-[#13161f] p-8 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[rgba(255,255,255,0.05)] hover:-translate-y-1 transition-transform duration-300"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-[rgba(255,26,60,0.1)] border border-red-100 dark:border-[rgba(255,26,60,0.15)] flex items-center justify-center mb-6">
              {feature.icon}
            </div>
            <h3 className="text-[17px] font-bold text-gray-900 dark:text-white mb-3">
              {feature.title}
            </h3>
            <p className="text-[14px] leading-relaxed text-gray-500 dark:text-[#94a3b8]">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}