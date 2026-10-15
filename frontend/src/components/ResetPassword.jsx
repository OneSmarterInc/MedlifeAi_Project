import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Ensure backend successfully commits the new password
      const response = await axios.post(
        `http://localhost:8000/api/password-reset-confirm/${uid}/${token}/`,
        { new_password: password }
      );

      setSuccessMessage(response.data.message || "Password successfully reset! Redirecting to login...");
      
      // Give the database sufficient time to persist before redirecting
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      console.error("Password reset error:", err);
      const errorMsg = err.response?.data?.error || "The reset link is invalid or has expired.";
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-gray-800">
        <h2 className="text-2xl font-bold text-center mb-1">Reset Password</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Enter your new secure password below.</p>

        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg mb-4">{error}</p>}
        {successMessage && <p className="text-green-600 text-sm text-center font-semibold bg-green-50 p-2 rounded-lg mb-4">{successMessage}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              New Password
            </label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Confirm New Password
            </label>
            <input 
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? "Updating Password..." : "Reset Password →"}
          </button>
        </form>

        <div className="text-center mt-4">
          <a href="/login" className="text-xs text-rose-600 hover:underline">
            Remembered your password? Sign in →
          </a>
        </div>
      </div>
    </div>
  );
}