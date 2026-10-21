import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = { username, password };
      if (requires2FA) {
        payload.totp_code = totpCode;
      }

      const res = await axios.post('http://127.0.0.1:8000/api/login/', payload);

      if (res.data.requires_2fa) {
        setRequires2FA(true);
        setSetupRequired(res.data.setup_required);
        if (res.data.qr_code_url) {
          setQrCodeUrl(res.data.qr_code_url);
        }
        if (res.data.message) {
          setMessage(res.data.message);
        }
        return;
      }

      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('username', res.data.username);
      navigate('/dashboard');

    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-2xl font-bold mb-1">Welcome to medlife.ai</h2>
        <p className="text-xs text-gray-400 mb-6">Sign in to access your family health dashboard.</p>

        {error && <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-400 text-xs rounded-xl">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          {!requires2FA ? (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Username</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500" 
                  required 
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold uppercase text-gray-400">Password</label>
                  <span onClick={() => navigate('/forgot-password')} className="text-xs text-rose-500 hover:underline cursor-pointer">Forgot password?</span>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500" 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-3 text-xs text-gray-400 hover:text-white"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 leading-relaxed text-center">
                {message || "Two-Factor Authentication required."}
              </div>

              {setupRequired && qrCodeUrl && (
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-md my-2">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-40 h-40 object-contain mb-2" />
                  <span className="text-[11px] text-gray-600 font-medium">Scan with Google Authenticator or Authy</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Authenticator Code (6 digits)</label>
                <input 
                  type="text" 
                  maxLength="6"
                  value={totpCode} 
                  onChange={(e) => setTotpCode(e.target.value)} 
                  placeholder="123456"
                  className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-xl text-center text-lg tracking-widest text-white focus:outline-none focus:border-rose-500" 
                  required 
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl shadow-lg transition cursor-pointer mt-2"
          >
            {requires2FA ? "Verify Code & Sign In →" : "Continue →"}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-gray-400">
          Don't have an account? <span onClick={() => navigate('/signup')} className="text-rose-500 hover:underline cursor-pointer font-semibold">Sign up</span>
        </div>
      </div>
    </div>
  );
}