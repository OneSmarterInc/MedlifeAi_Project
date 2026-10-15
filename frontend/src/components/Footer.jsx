import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-transparent dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-[#222] pt-12 pb-6 px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-white font-sans relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between mb-8">
          
          {/* Logo & Tagline */}
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-2 mb-2">
              <div className="bg-[#e11d48] text-white p-1.5 rounded-lg font-bold text-sm">m</div>
              <span className="text-xl font-bold tracking-wide">medlife<span className="text-[#e11d48]">.ai</span></span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Converse for Wellness</p>
            
            {/* Social Links (Using safe raw SVGs to prevent import crashes) */}
            <div className="flex space-x-4">
              <a href="#" className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-gray-400 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-gray-400 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-gray-400 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-gray-400 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div className="flex flex-col space-y-3">
              <Link to="/privacy-policy" className="text-gray-600 dark:text-gray-400 hover:text-[#e11d48] dark:hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-use" className="text-gray-600 dark:text-gray-400 hover:text-[#e11d48] dark:hover:text-white transition-colors">Terms of Use</Link>
            </div>
            <div className="flex flex-col space-y-3">
              <Link to="/about-us" className="text-gray-600 dark:text-gray-400 hover:text-[#e11d48] dark:hover:text-white transition-colors">About Us</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Disclaimer (Text color updated to text-gray-500) */}
        <div className="border-t border-gray-200 dark:border-[#222] pt-6 flex flex-col md:flex-row justify-between items-start md:items-center text-[10px] text-gray-500 dark:text-gray-400">
          <p>© 2026 medlife.ai. All rights reserved.</p>
          <p className="mt-2 md:mt-0 max-w-xl text-right">
            medlife.ai provides general health information and is not a substitute for professional medical advice, diagnosis or treatment.
          </p>
        </div>
      </div>
    </footer>
  );
}