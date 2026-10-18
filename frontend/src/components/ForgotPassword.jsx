import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/forgot-password/', { 
        email: identifier 
      });
      setMessage(res.data.message || "Password reset link has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reset link. Please check your username/email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-100 p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-bold mb-2 text-center">Reset your password</h2>
        <p className="text-xs text-gray-400 text-center mb-8">Enter your registered username or email to receive a password reset link.</p>

        {error && <div className="mb-4 p-3 bg-red-950/50 text-red-400 text-xs rounded-xl">{error}</div>}
        {message && <div className="mb-4 p-3 bg-green-950/50 text-green-400 text-xs rounded-xl">{message}</div>}

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Username or Email</label>
            <input 
              type="text" 
              value={identifier} 
              onChange={(e) => setIdentifier(e.target.value)} 
              placeholder="user123@gmail.com"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-lg transition cursor-pointer mt-4 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link →"}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-gray-400">
          Remembered your password? <span onClick={() => navigate('/')} className="text-rose-500 hover:underline cursor-pointer font-medium">Sign in</span>
        </div>
      </div>
    </div>
  );
}