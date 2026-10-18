// import React from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { Sparkles, Crown, Building2, Check } from 'lucide-react';

// export default function Plans() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleStartPlan = () => {
//     const token = localStorage.getItem('access_token');
//     if (token) {
//       navigate('/dashboard');
//     } else {
//       navigate('/login', { state: { background: location } });
//     }
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
//       {/* Header Section with Added Badge */}
//       <div className="text-center max-w-2xl mx-auto mb-12">
//         <span className="inline-block bg-red-50 dark:bg-[#e11d48]/10 text-[#e11d48] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 border border-red-100 dark:border-[#e11d48]/20">
//           Plans
//         </span>
//         <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-3">
//           Choose the plan that fits you
//         </h2>
//         <p className="text-gray-500 dark:text-[#94a3b8] text-sm">
//           Start free and upgrade when you need more.
//         </p>
//       </div>

//       {/* Adjusted Grid width and gap for better proportions */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1000px] mx-auto">
        
//         {/* Free Trial Card */}
//         <div className="bg-white dark:bg-[#13161f] rounded-3xl p-7 border border-gray-100 dark:border-[rgba(255,255,255,0.08)] shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col transition-transform hover:-translate-y-1 hover:border-red-200 dark:hover:border-[#e11d48]/40">
//           <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-[rgba(255,26,60,0.1)] border border-red-100 dark:border-[rgba(255,26,60,0.15)] text-[#e11d48] mb-5">
//             <Sparkles size={20} />
//           </div>
//           <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1.5">Free Trial</h3>
//           <p className="text-gray-500 dark:text-[#94a3b8] text-xs mb-6">Try it at no cost</p>
          
//           <ul className="space-y-3.5 mb-8 flex-1 text-sm text-gray-600 dark:text-gray-300">
//             <li className="flex items-center gap-3"><Check size={16} className="text-[#e11d48] shrink-0" /> One User</li>
//             <li className="flex items-center gap-3"><Check size={16} className="text-[#e11d48] shrink-0" /> Limited queries</li>
//             <li className="flex items-center gap-3"><Check size={16} className="text-[#e11d48] shrink-0" /> Download Chat</li>
//           </ul>

//           <button 
//             onClick={handleStartPlan}
//             className="w-full py-2.5 rounded-xl border border-[#e11d48] text-[#e11d48] text-sm font-semibold hover:bg-red-50 dark:hover:bg-[#e11d48]/10 transition-colors cursor-pointer"
//           >
//             Start Now
//           </button>
//         </div>

//         {/* Premium Card */}
//         <div className="bg-white dark:bg-[#13161f] rounded-3xl p-7 border border-red-200 dark:border-[#e11d48]/40 shadow-[0_8px_40px_rgba(225,29,72,0.1)] flex flex-col relative transition-transform hover:-translate-y-1">
//           <div className="absolute -top-3.5 right-6 bg-[#e11d48] text-white text-[9px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-full shadow-md">
//             Most Popular
//           </div>
          
//           <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-[rgba(255,26,60,0.1)] border border-red-100 dark:border-[rgba(255,26,60,0.15)] text-[#e11d48] mb-5">
//             <Crown size={20} />
//           </div>
//           <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1.5">Premium</h3>
//           <p className="text-gray-500 dark:text-[#94a3b8] text-xs mb-6">For families and regular users</p>
          
//           <ul className="space-y-3.5 mb-8 flex-1 text-sm text-gray-600 dark:text-gray-300">
//             <li className="flex items-center gap-3"><Check size={16} className="text-[#e11d48] shrink-0" /> Up to five users</li>
//             <li className="flex items-center gap-3"><Check size={16} className="text-[#e11d48] shrink-0" /> Unlimited queries</li>
//             <li className="flex items-center gap-3"><Check size={16} className="text-[#e11d48] shrink-0" /> Download Chat</li>
//           </ul>

//           <button 
//             onClick={handleStartPlan}
//             className="w-full py-2.5 rounded-xl bg-[#e11d48]/60 text-white text-sm font-semibold cursor-not-allowed transition-colors"
//             disabled
//           >
//             Coming soon
//           </button>
//         </div>

//         {/* Enterprise Card */}
//         <div className="bg-white dark:bg-[#13161f] rounded-3xl p-7 border border-gray-100 dark:border-[rgba(255,255,255,0.08)] shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col transition-transform hover:-translate-y-1 hover:border-red-200 dark:hover:border-[#e11d48]/40">
//           <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-[rgba(255,26,60,0.1)] border border-red-100 dark:border-[rgba(255,26,60,0.15)] text-[#e11d48] mb-5">
//             <Building2 size={20} />
//           </div>
//           <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1.5">Enterprise</h3>
//           <p className="text-gray-500 dark:text-[#94a3b8] text-xs mb-6">For clinics and organisations</p>
          
//           <ul className="space-y-3.5 mb-8 flex-1 text-sm text-gray-600 dark:text-gray-300">
//             <li className="flex items-center gap-3"><Check size={16} className="text-[#e11d48] shrink-0" /> As per your requirements</li>
//             <li className="flex items-center gap-3"><Check size={16} className="text-[#e11d48] shrink-0" /> 24/7 support</li>
//             <li className="flex items-center gap-3"><Check size={16} className="text-[#e11d48] shrink-0" /> API</li>
//           </ul>

//           <button 
//             onClick={() => alert("Enterprise contact form coming soon!")}
//             className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
//           >
//             Connect
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }




import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Crown, Building2, Check } from 'lucide-react';

export default function Plans() {
     const location = useLocation();
    

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Header Section */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-block bg-red-50 dark:bg-[#e11d48]/10 text-[#e11d48] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 border border-red-100 dark:border-[#e11d48]/20">
          Plans
        </span>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-3">
          Choose the plan that fits you
        </h2>
        <p className="text-gray-500 dark:text-[#94a3b8] text-sm">
          Start free and upgrade when you need more.
        </p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1000px] mx-auto">
        
        {/* Free Trial Card */}
        <div className="bg-white dark:bg-[#13161f] rounded-3xl p-7 border border-gray-100 dark:border-[rgba(255,255,255,0.08)] shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col transition-transform hover:-translate-y-1 hover:border-red-200 dark:hover:border-[#e11d48]/40">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-[rgba(255,26,60,0.1)] border border-red-100 dark:border-[rgba(255,26,60,0.15)] text-[#e11d48] mb-5">
            <Sparkles size={20} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1.5">Free Trial</h3>
          <p className="text-gray-500 dark:text-[#94a3b8] text-xs mb-6">Try it at no cost</p>
          
          <ul className="space-y-3.5 mb-8 flex-1 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-center gap-3"><Check size={16} className="text-[#e11d48] shrink-0" /> One User</li>
            <li className="flex items-center gap-3"><Check size={16} className="text-[#e11d48] shrink-0" /> Limited queries</li>
            <li className="flex items-center gap-3"><Check size={16} className="text-[#e11d48] shrink-0" /> Download Chat</li>
          </ul>

          {/* 🌟 Using React Router Link to guarantee navigation 🌟 */}
          <Link 
            to="/login"
            state={{ background: location }}
            className="w-full py-2.5 rounded-xl border border-[#e11d48] text-[#e11d48] text-sm font-semibold hover:bg-red-50 dark:hover:bg-[#e11d48]/10 transition-colors text-center block cursor-pointer"
          >
            Start Now
          </Link>
        </div>

        {/* Premium Card */}
        <div className="bg-white dark:bg-[#13161f] rounded-3xl p-7 border border-red-200 dark:border-[#e11d48]/40 shadow-[0_8px_40px_rgba(225,29,72,0.1)] flex flex-col relative transition-transform hover:-translate-y-1">
          <div className="absolute -top-3.5 right-6 bg-[#e11d48] text-white text-[9px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-full shadow-md">
            Most Popular
          </div>
          
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-[rgba(255,26,60,0.1)] border border-red-100 dark:border-[rgba(255,26,60,0.15)] text-[#e11d48] mb-5">
            <Crown size={20} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1.5">Premium</h3>
          <p className="text-gray-500 dark:text-[#94a3b8] text-xs mb-6">For families and regular users</p>
          
          <ul className="space-y-3.5 mb-8 flex-1 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-center gap-3"><Check size={16} className="text-[#e11d48] shrink-0" /> Up to five users</li>
            <li className="flex items-center gap-3"><Check size={16} className="text-[#e11d48] shrink-0" /> Unlimited queries</li>
            <li className="flex items-center gap-3"><Check size={16} className="text-[#e11d48] shrink-0" /> Download Chat</li>
          </ul>

          <button 
            type="button"
            className="w-full py-2.5 rounded-xl bg-[#e11d48]/60 text-white text-sm font-semibold cursor-not-allowed transition-colors"
            disabled
          >
            Coming soon
          </button>
        </div>

        {/* Enterprise Card */}
        <div className="bg-white dark:bg-[#13161f] rounded-3xl p-7 border border-gray-100 dark:border-[rgba(255,255,255,0.08)] shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col transition-transform hover:-translate-y-1 hover:border-red-200 dark:hover:border-[#e11d48]/40">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-[rgba(255,26,60,0.1)] border border-red-100 dark:border-[rgba(255,26,60,0.15)] text-[#e11d48] mb-5">
            <Building2 size={20} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1.5">Enterprise</h3>
          <p className="text-gray-500 dark:text-[#94a3b8] text-xs mb-6">For clinics and organisations</p>
          
          <ul className="space-y-3.5 mb-8 flex-1 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-center gap-3"><Check size={16} className="text-[#e11d48] shrink-0" /> As per your requirements</li>
            <li className="flex items-center gap-3"><Check size={16} className="text-[#e11d48] shrink-0" /> 24/7 support</li>
            <li className="flex items-center gap-3"><Check size={16} className="text-[#e11d48] shrink-0" /> API</li>
          </ul>

          <button 
            type="button"
            onClick={() => alert("Enterprise contact form coming soon!")}
            className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Connect
          </button>
        </div>

      </div>
    </div>
  );
}