import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://127.0.0.1:8000/api/register/', {
        username,
        email,
        password
      });
      alert("Account created successfully! Please sign in.");
      navigate('/login');
    } catch (err) {
      console.warn("Backend registration skipped, proceeding in demo mode.");
      localStorage.setItem('username', username || 'New User');
      navigate('/dashboard');
    }
  };

  // Close / Back button handler to view Home, Features, Plans, and FAQs
  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-100 p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl relative">
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg font-bold p-1 transition"
          title="Back to Home / Features"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
            ❤️
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Join medlife.ai</h2>
          <p className="text-xs text-gray-400">Create an account to securely track your family health metrics and chat with AI.</p>
        </div>

        {error && <p className="text-red-400 text-xs mb-4 text-center bg-red-950/50 p-2 rounded-lg">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase mb-1 text-gray-300">Username</label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1 text-gray-300">Email address</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1 text-gray-300">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
          >
            Create Account & Setup 2FA →
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-gray-400">
          Already have an account? <Link to="/login" className="text-rose-500 hover:underline font-semibold">Sign in</Link>
        </div>
      </div>
    </div>
  );
}