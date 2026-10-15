import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-16 px-4 font-sans">
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#121212] border border-red-200 dark:border-[#e11d48]/30 rounded-2xl p-8 md:p-12 shadow-sm dark:shadow-none">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Privacy Policy</h1>
        <p className="text-xs text-gray-500 italic mb-8">Last updated: October 10, 2026</p>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-8">
          This page explains, in general terms, how medlife.ai may handle information when you use the website. Review and replace this draft with your organisation's actual practices before publishing it as a final policy.
        </p>

        <div className="space-y-6 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          <div>
            <h2 className="text-[#e11d48] font-bold text-lg mb-2">1. Information you provide</h2>
            <p>If the website offers forms, accounts, or support features, you may choose to provide details such as your name, email address, or the message you submit. Only provide information requested for a clear purpose.</p>
          </div>
          <div>
            <h2 className="text-[#e11d48] font-bold text-lg mb-2">2. How information may be used</h2>
            <p>Information may be used to operate and maintain the website, respond to requests, improve the user experience, and help protect the service from misuse. Update this section to accurately describe the data your website actually collects and uses.</p>
          </div>
          <div>
            <h2 className="text-[#e11d48] font-bold text-lg mb-2">3. Health information</h2>
            <p>Do not enter sensitive personal or medical information unless the relevant feature is specifically designed for it and the applicable privacy safeguards have been explained. General information on this website is not a substitute for professional medical advice.</p>
          </div>
          <div>
            <h2 className="text-[#e11d48] font-bold text-lg mb-2">4. Cookies and third-party services</h2>
            <p>The website or integrated services may use cookies or similar technologies. List the actual analytics, hosting, authentication, or other third-party services used by your deployment here.</p>
          </div>
          <div>
            <h2 className="text-[#e11d48] font-bold text-lg mb-2">5. Security and retention</h2>
            <p>Reasonable measures should be used to protect information, and information should be retained only as needed for the stated purpose or applicable legal requirements. Add your actual retention and security practices here.</p>
          </div>
          <div>
            <h2 className="text-[#e11d48] font-bold text-lg mb-2">6. Your choices and contact</h2>
            <p>For questions or privacy requests, contact the website operator using the contact details published on the official website. Replace this sentence with a monitored email address or other valid contact method.</p>
          </div>
        </div>

        <div className="mt-8 bg-red-50 dark:bg-[#e11d48]/10 p-4 rounded-lg border border-red-100 dark:border-[#e11d48]/20 text-xs text-gray-700 dark:text-gray-300">
          <span className="font-semibold text-gray-900 dark:text-white">Publication note:</span> This is starter copy, not legal advice. Make sure it matches your actual data practices and applicable law before publishing.
        </div>
      </div>
    </div>
  );
}