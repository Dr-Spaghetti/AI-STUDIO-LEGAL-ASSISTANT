import React, { useState } from 'react';
import { login, requestPasswordReset, isAuthConfigured } from '../lib/auth';
import type { User } from '../lib/auth';

interface LoginPageProps {
  onLogin: (user: User) => void;
  branding?: {
    firmName?: string;
    logoUrl?: string;
    primaryColor?: string;
  };
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, branding }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const isDemoMode = !isAuthConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { user, error: loginError } = await login({ email, password });

    setIsLoading(false);

    if (loginError) {
      setError(loginError);
      return;
    }

    if (user) {
      onLogin(user);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { success, error: resetError } = await requestPasswordReset(email);

    setIsLoading(false);

    if (resetError) {
      setError(resetError);
      return;
    }

    if (success) {
      setResetEmailSent(true);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@lawfirm.com');
    setPassword('demo123');
    setIsLoading(true);

    const { user } = await login({ email: 'demo@lawfirm.com', password: 'demo123' });

    setIsLoading(false);

    if (user) {
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          {branding?.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.firmName || 'Logo'}
              className="h-16 mx-auto mb-4"
            />
          ) : (
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: branding?.primaryColor || 'var(--primary-accent, #00FFC8)' }}
            >
              <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
          )}
          <h1 className="text-2xl font-bold text-white">
            {branding?.firmName || 'Legal Intake Assistant'}
          </h1>
          <p className="text-[#6B7280] mt-2">Staff Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1A1D24] border border-[#2D3139] rounded-2xl p-8">
          {isDemoMode && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-yellow-500 font-medium text-sm">Demo Mode</p>
                  <p className="text-yellow-500/70 text-xs mt-1">
                    Supabase not configured. Any credentials will work.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!showForgotPassword ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0F1115] border border-[#2D3139] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[var(--primary-accent)] transition"
                    placeholder="you@lawfirm.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0F1115] border border-[#2D3139] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[var(--primary-accent)] transition"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-lg font-semibold text-black transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--primary-accent, #00FFC8)' }}
                >
                  {isLoading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-[#6B7280] hover:text-white transition"
                >
                  Forgot password?
                </button>
              </div>

              {isDemoMode && (
                <div className="mt-6 pt-6 border-t border-[#2D3139]">
                  <button
                    onClick={handleDemoLogin}
                    className="w-full py-3 px-4 rounded-lg font-medium text-white bg-[#2D3139] hover:bg-[#3D4149] transition"
                  >
                    Continue as Demo User
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {!resetEmailSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Reset Password</h2>
                    <p className="text-[#6B7280] text-sm mt-2">
                      Enter your email and we'll send you a reset link
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0F1115] border border-[#2D3139] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[var(--primary-accent)] transition"
                      placeholder="you@lawfirm.com"
                      required
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-lg font-semibold text-black transition disabled:opacity-50"
                    style={{ backgroundColor: 'var(--primary-accent, #00FFC8)' }}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setError(null);
                    }}
                    className="w-full py-3 px-4 rounded-lg font-medium text-[#6B7280] hover:text-white transition"
                  >
                    Back to Sign In
                  </button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">Check Your Email</h2>
                  <p className="text-[#6B7280] text-sm mb-6">
                    We've sent a password reset link to <br />
                    <span className="text-white">{email}</span>
                  </p>
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmailSent(false);
                      setError(null);
                    }}
                    className="text-sm hover:underline"
                    style={{ color: 'var(--primary-accent, #00FFC8)' }}
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[#6B7280] text-xs mt-8">
          Powered by AI Legal Intake Assistant
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
