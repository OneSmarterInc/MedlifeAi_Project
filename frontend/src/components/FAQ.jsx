import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Can medlife.ai replace a doctor?",
      answer: "No, medlife.ai gives helpful medical insights and information, but it is not a substitute for professional diagnosis or treatment. For emergencies or serious concerns, please contact a doctor or local emergency services."
    },
    {
      question: "Is my health information private?",
      answer: "Yes, we use advanced encryption to ensure your health information and conversations are strictly private and secure."
    },
    {
      question: "Can I save my conversations?",
      answer: "Yes, you can easily download your chat history for your personal records or to share with your healthcare provider."
    },
    {
      question: "Do I need any technical knowledge?",
      answer: "Not at all. medlife.ai is designed to be intuitive and user-friendly for people of all ages."
    }
  ];

  return (
    <main className="max-w-[900px] mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-32 relative z-10 flex flex-col items-center">
      
      <div className="border border-red-500/20 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-500 text-[10px] font-bold tracking-[0.15em] px-3 py-1 rounded-full uppercase mb-6 transition-colors">
        Good to know
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-12 tracking-tight text-center transition-colors">Frequently asked questions</h1>

      {/* Accordion Container */}
      <div className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-[0_0_30px_rgba(0,0,0,0.2)] transition-colors">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-100 dark:border-gray-800/80 last:border-b-0 transition-colors">
            <button
              className="w-full text-left py-6 px-8 flex justify-between items-center focus:outline-none hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
              onClick={() => toggleFAQ(index)}
            >
              <span className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp size={18} className="text-red-600 shrink-0 ml-4" />
              ) : (
                <ChevronDown size={18} className="text-red-600 shrink-0 ml-4" />
              )}
            </button>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-8 pb-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed pr-8 md:pr-16 transition-colors">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}