import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowRight, CheckCircle, X } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/password-reset/', {
        email: email
      });

      setMessage(response.data.message || "If an account with that email exists, a reset link has been sent.");
      setSubmitted(true);
    } catch (err) {
      console.error("Password reset request error:", err);
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (errorData.error) {
          setError(errorData.error);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else {
          setError("Failed to send reset email. Please try again.");
        }
      } else {
        setError("Network error. Make sure the backend server is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white dark:bg-[#121212] w-full max-w-md rounded-3xl p-8 relative shadow-2xl border border-gray-100 dark:border-[#222]">
        
        {/* Close Button / Back to Login */}
        <Link 
          to="/login" 
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
        >
          <X size={20} />
        </Link>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Forgot Password?</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Enter your account email and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Success State */}
        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle className="mx-auto text-green-500 w-12 h-12" />
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
              {message}
            </p>
            <Link
              to="/login"
              className="block w-full bg-[#e11d48] hover:bg-[#be123c] text-white py-3 rounded-xl text-xs font-semibold transition shadow-md shadow-[#e11d48]/20 text-center"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            {/* Error Box */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-xs text-center font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#333] rounded-xl py-2.5 pl-10 pr-4 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e11d48]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#e11d48] hover:bg-[#be123c] text-white py-3 rounded-xl text-xs font-semibold transition shadow-md shadow-[#e11d48]/20 flex items-center justify-center space-x-1"
              >
                <span>{loading ? 'Sending Link...' : 'Send Reset Link'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </>
        )}

        {/* Back to sign in link */}
        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          Remembered your password?{' '}
          <Link to="/login" className="text-[#e11d48] font-semibold hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}