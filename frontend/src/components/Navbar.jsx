import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Moon, Sun, Activity } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const navLinks = [
    { name: 'Features', path: '/features' },
    { name: 'How it works', path: '/how-it-works' },
    { name: 'Plans', path: '/plans' },
    { name: 'FAQ', path: '/faq' },
  ];

  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full font-sans">
      {/* Logo linking directly back to the root landing page */}
      <Link to="/" className="flex items-center space-x-2 group">
        <div className="bg-[#e11d48] text-white p-1.5 rounded-lg font-bold shadow-[0_2px_10px_rgba(225,29,72,0.3)] transition group-hover:scale-105">
          <Activity size={18} strokeWidth={2.5} />
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">
          medlife<span className="text-[#e11d48]">.ai</span>
        </span>
      </Link>

      {/* Navigation Links - Pill Container */}
      <div className="hidden md:flex items-center bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#262626] rounded-full p-1 shadow-sm">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                isActive
                  ? 'bg-[#e11d48] text-white shadow-[0_4px_12px_rgba(225,29,72,0.4)]'
                  : 'text-gray-600 dark:text-gray-300 hover:text-[#e11d48] dark:hover:text-[#e11d48] hover:bg-[#e11d48]/10 hover:shadow-[0_0_10px_rgba(225,29,72,0.15)]'
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Right Section: Sign In & Theme Toggle */}
      <div className="flex items-center space-x-3">
        <Link
          to="/login"
          className="flex items-center space-x-2 px-4 py-2 rounded-full border border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 hover:border-[#e11d48] hover:text-[#e11d48] dark:hover:border-[#e11d48] dark:hover:text-[#e11d48] hover:bg-[#e11d48]/5 text-sm font-medium"
        >
          <User size={16} />
          <span>Sign In</span>
        </Link>
        
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-[#e11d48] dark:hover:text-[#e11d48] hover:bg-[#e11d48]/10"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </nav>
  );
}