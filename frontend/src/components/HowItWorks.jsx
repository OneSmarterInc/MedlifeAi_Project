import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      num: 1,
      title: "Create your account",
      desc: "Sign in and start with the free trial. It takes less than a minute."
    },
    {
      num: 2,
      title: "Ask anything about your health",
      desc: "Type your symptoms or questions in plain language, any time of day."
    },
    {
      num: 3,
      title: "Get clear insights",
      desc: "Receive easy-to-understand answers and download the chat for your records."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 font-sans">
      
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-block bg-red-50 dark:bg-[#e11d48]/10 text-[#e11d48] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
          Simple by design
        </span>
        <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
          How it works
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Three easy steps from question to clarity.
        </p>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {steps.map((step) => (
          <div 
            key={step.num}
            className="bg-white dark:bg-[#121212] rounded-3xl p-8 border border-gray-100 dark:border-[#222] shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col items-center text-center transition-all duration-300 hover:border-[#e11d48] hover:shadow-[0_8px_30px_rgba(225,29,72,0.15)] cursor-pointer hover:-translate-y-1"
          >
            {/* Glowing Number Circle */}
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#e11d48] text-white font-bold text-lg mb-6 shadow-[0_4px_20px_rgba(225,29,72,0.6)]">
              {step.num}
            </div>
            
            {/* Text Content */}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              {step.title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed px-2">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
      
    </div>
  );
}