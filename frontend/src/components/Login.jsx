import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/token/', {
        username,
        password
      });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('username', username);
      navigate('/dashboard');
           } catch (err) {
         setError('Invalid username or password.');
       }
  };

  const handleForgotPassword = async () => {
  const userInput = prompt("Enter your registered username or email address:");
  if (!userInput) return;

  try {
    const res = await axios.post('http://127.0.0.1:8000/api/forgot-password/', { email: userInput });
    alert(res.data.message || "Password reset link sent to your email.");
  } catch (err) {
    alert(err.response?.data?.error || "Failed to send reset link.");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-100 p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-bold mb-2 text-center">Welcome to medlife.ai</h2>
        <p className="text-xs text-gray-400 text-center mb-8">Sign in to access your family health dashboard.</p>

        {error && <div className="mb-4 p-3 bg-red-950/50 text-red-400 text-xs rounded-xl">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              required 
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold uppercase text-gray-400">Password</label>
              <span 
                onClick={handleForgotPassword} 
                className="text-xs text-rose-500 hover:underline cursor-pointer font-medium"
              >
                Forgot password?
              </span>
            </div>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-lg transition cursor-pointer mt-4"
          >
            Continue →
          </button>
        </form>
      </div>
    </div>
  );
}