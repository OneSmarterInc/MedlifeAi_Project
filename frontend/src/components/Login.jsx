import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/token/', {
        username,
        password
      });

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('username', username);

      navigate('/dashboard');
    } catch (err) {
      console.error("Login error:", err);
      setError('Invalid username or password. Please try again.');
    }
  };

  // 🌟 Redirects back to the Home / Landing page when clicking 'X' 🌟
  const handleSkipLogin = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Login Card with relative positioning for the X button */}
      <div className="relative max-w-md w-full bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-2xl">
        
        {/* 🌟 Close (X) Button at Top Right 🌟 */}
        <button
          type="button"
          onClick={handleSkipLogin}
          title="Back to home"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-white mb-1">Welcome to medlife.ai</h2>
          <p className="text-xs text-gray-400">Sign in to access your family health dashboard.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800 rounded-xl text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold tracking-wider text-gray-400 uppercase mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
              required 
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] font-semibold tracking-wider text-gray-400 uppercase">Password</label>
              <Link to="/forgot-password" class="text-[11px] text-rose-500 hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-600 pr-16"
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white px-2 py-1"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-600/20 transition cursor-pointer mt-2"
          >
            Continue →
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            Don't have an account? <Link to="/signup" className="text-rose-500 font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}