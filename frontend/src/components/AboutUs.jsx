import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutUs() {
  return (
    <div className="min-h-screen py-16 px-4 font-sans">
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#121212] border border-red-200 dark:border-[#e11d48]/30 rounded-2xl p-8 md:p-12 shadow-sm dark:shadow-none">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">About Us</h1>
        
        <div className="space-y-6 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          <div>
            <h2 className="text-[#e11d48] font-bold text-lg mb-2">Our purpose</h2>
            <p>Our aim is to help people discover clear, approachable wellness information and encourage informed conversations about health.</p>
          </div>
          <div>
            <h2 className="text-[#e11d48] font-bold text-lg mb-2">How we approach information</h2>
            <p>Health needs are personal. Information on this website is intended for general educational purposes and should be considered alongside advice from qualified healthcare professionals.</p>
          </div>
          <div>
            <h2 className="text-[#e11d48] font-bold text-lg mb-2">What this website is not</h2>
            <p>Unless a specific service clearly states otherwise, medlife.ai is not an emergency service and does not replace a consultation, diagnosis, or treatment plan from a qualified healthcare professional.</p>
          </div>
          <div>
            <h2 className="text-[#e11d48] font-bold text-lg mb-2">Contact us</h2>
            <p>For questions, feedback, or partnership enquiries, add your official contact email or contact-page link here.</p>
          </div>
        </div>

        <div className="mt-8 bg-red-50 dark:bg-[#e11d48]/10 p-4 rounded-lg border border-red-100 dark:border-[#e11d48]/20 text-xs text-gray-700 dark:text-gray-300">
          <span className="font-semibold text-gray-900 dark:text-white">Customisation note:</span> Replace this sample description with your actual organisation details, team information, mission, and verified contact details.
        </div>
        
        <p className="mt-6 text-xs text-gray-500 italic">Last updated: October 10, 2026</p>
      </div>
    </div>
  );
}