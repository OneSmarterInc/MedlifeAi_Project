import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen py-16 px-4 font-sans">
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#121212] border border-red-200 dark:border-[#e11d48]/30 rounded-2xl p-8 md:p-12 shadow-sm dark:shadow-none">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Terms of Use</h1>
        <p className="text-xs text-gray-500 italic mb-8">Last updated: October 10, 2026</p>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-8">
          By accessing or using medlife.ai, you agree to use the website responsibly and in accordance with applicable laws. Replace this starter text with terms reviewed for your actual service and jurisdiction.
        </p>

        <div className="space-y-6 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          <div>
            <h2 className="text-[#e11d48] font-bold text-lg mb-2">1. Informational purpose</h2>
            <p>Website content is provided for general informational and educational purposes. It is not medical advice and does not establish a doctor-patient relationship.</p>
          </div>
          <div>
            <h2 className="text-[#e11d48] font-bold text-lg mb-2">2. No emergency guidance</h2>
            <p>Do not rely on this website for emergencies. If you believe you may be experiencing a medical emergency, contact your local emergency service or seek urgent professional care.</p>
          </div>
          <div>
            <h2 className="text-[#e11d48] font-bold text-lg mb-2">3. Responsible use</h2>
            <p>Do not misuse the website, attempt unauthorised access, interfere with its operation, or submit unlawful, harmful, or misleading material.</p>
          </div>
          <div>
            <h2 className="text-[#e11d48] font-bold text-lg mb-2">4. Content and availability</h2>
            <p>We aim to keep the website useful, but content may change and availability is not guaranteed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}