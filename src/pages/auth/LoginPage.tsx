import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import {
  Store,
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const history = useHistory();
  const { login, switchDemoRole } = useAdminAuth();
  const [email, setEmail] = useState('owner@ezomart.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        history.push('/dashboard');
      } else {
        setErrorMessage('Invalid credentials. Please check your login details.');
      }
    } catch (err) {
      setErrorMessage('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    switchDemoRole(role);
    history.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-4">
          <Store className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">EZO Client Admin</h2>
        <p className="text-sm text-slate-500 mt-1">
          Retail Management Portal for Shop Owners & Authorized Managers
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          {/* Quick Demo Logins Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
            <span className="text-xs font-bold text-blue-900 block uppercase tracking-wider mb-2 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-600" />
              Quick One-Click Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('OWNER')}
                className="p-2.5 bg-white border border-blue-200 rounded-xl text-left hover:bg-blue-50/50 transition-all shadow-xs"
              >
                <span className="text-xs font-bold text-slate-800 block">Owner Login</span>
                <span className="text-[10px] text-slate-500 block">Rajesh V. (Full P&L)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('MANAGER')}
                className="p-2.5 bg-white border border-blue-200 rounded-xl text-left hover:bg-blue-50/50 transition-all shadow-xs"
              >
                <span className="text-xs font-bold text-slate-800 block">Manager Login</span>
                <span className="text-[10px] text-slate-500 block">Suresh N. (Stock/Sales)</span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Admin Email or Phone
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@ezomart.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                <span className="text-xs text-slate-600">Keep me logged in</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm shadow-blue-500/25 flex items-center justify-center space-x-2"
            >
              <span>{isLoading ? 'Verifying Account...' : 'Sign In to Admin Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
            <span>Powered by EZO SaaS Multi-Tenant Platform</span>
            <span className="block mt-0.5 text-[11px] text-slate-400">
              Need a new shop registration? Contact EZO Super Admin.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
