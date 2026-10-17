import React, { useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
        if (newPassword !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/reset-password-confirm/', {
        uid,
        token,
        new_password: newPassword
      });
      setMessage(res.data.message);
        setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-100 p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-bold mb-2 text-center">Reset Password</h2>
        <p className="text-xs text-gray-400 text-center mb-8">Enter your new password below.</p>

        {error && <div className="mb-4 p-3 bg-red-950/50 text-red-400 text-xs rounded-xl">{error}</div>}
        {message && <div className="mb-4 p-3 bg-green-950/50 text-green-400 text-xs rounded-xl">{message} Redirecting to login...</div>}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">New Password</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-lg transition cursor-pointer mt-4"
          >
            Update Password →
          </button>
        </form>
      </div>
    </div>
  );
}