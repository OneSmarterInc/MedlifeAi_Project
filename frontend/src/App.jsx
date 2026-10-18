import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import Features from './components/Features';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import HowItWorks from './components/HowItWorks';
import Plans from './components/Plans';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import Chat from './components/Chat';
import Dashboard from './components/Dashboard';
import TwoFactorSetup from './components/TwoFactorSetup';

// Import footer pages
import PrivacyPolicy from './components/PrivacyPolicy';
import AboutUs from './components/AboutUs';
import TermsOfUse from './components/TermsOfUse';


function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen relative">
      {/* 🌟 Faint Radial Glow Effect 🌟 */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-100/50 via-transparent to-transparent dark:from-[#e11d48]/10 dark:via-transparent dark:to-transparent pointer-events-none z-0"></div>

      <div className="z-10">
        <Navbar />
      </div>
      
      <div className="flex-grow z-10 flex flex-col">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}

// function AppRoutes() {
//   const location = useLocation();
//   const background = location.state && location.state.background;

//   return (
//     <Routes location={background || location}>
//       {/* Public Pages sharing the persistent layout (Root '/' maps to HomePage hero) */}
//       <Route element={<PublicLayout />}>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/features" element={<Features />} />
//         <Route path="/how-it-works" element={<HowItWorks />} />
//         <Route path="/plans" element={<Plans />} />
//         <Route path="/faq" element={<FAQ />} />
//         <Route path="/privacy-policy" element={<PrivacyPolicy />} />
//         <Route path="/about-us" element={<AboutUs />} />
//         <Route path="/terms-of-use" element={<TermsOfUse />} />
//       </Route>

//       {/* Standalone / Dashboard & Auth Pages */}
//       <Route path="/register" element={<Register />} />
//       <Route path="/forgot-password" element={<ForgotPassword />} />
//       <Route path="/reset-password" element={<ResetPassword />} />
//       <Route path="/chat" element={<Chat />} />
//       <Route path="/dashboard" element={<Dashboard />} /> 
//       <Route path="/2fa-setup" element={<TwoFactorSetup />} />

//       {!background && <Route path="/login" element={<Login />} />}
//     </Routes>
//   );
// }

// export default function App() {
//   return (
//     <Router>
//       <div className="font-sans overflow-x-hidden bg-white text-gray-900 bg-[linear-gradient(to_right,#ef444415_1px,transparent_1px),linear-gradient(to_bottom,#ef444415_1px,transparent_1px)] bg-[size:32px_32px] selection:bg-red-500/30 dark:bg-[#050505] dark:text-white dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]">
//         <AppRoutes />
//       </div>
//     </Router>
//   );
// }

function AppRoutes() {
  const location = useLocation();
  // Check if background state was passed from Plans or other pages
  const background = location.state && location.state.background;

  return (
    <>
      {/* 🌟 If background exists, render the background location first 🌟 */}
      <Routes location={background || location}>
        {/* Public Pages sharing the persistent layout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<Features />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
        </Route>

        {/* Standalone / Dashboard & Auth Pages */}
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/2fa-setup" element={<TwoFactorSetup />} />

        {/* Normal standalone login route if accessed directly */}
        <Route path="/login" element={<Login />} />
      </Routes>

      {/* 🌟 Intercepted Modal Login Route Overlay 🌟 */}
      {background && (
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      )}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <div className="font-sans overflow-x-hidden bg-white text-gray-900 bg-[linear-gradient(to_right,#ef444415_1px,transparent_1px),linear-gradient(to_bottom,#ef444415_1px,transparent_1px)] bg-[size:32px_32px] selection:bg-red-500/30 dark:bg-[#050505] dark:text-white dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]">
        <AppRoutes />
      </div>
    </Router>
  );
}