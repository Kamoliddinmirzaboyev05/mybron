import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../lib/AuthContext';
import { Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName, phone);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden bg-white/5 p-2">
            <img src="/bronlogo.png" alt="Bron Logo" className="w-full h-full object-contain" />
          </div>
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Registration Successful!</h1>
          <p className="text-slate-400 mb-6">
            Please check your email to verify your account. Once verified, you can sign in.
          </p>
          <button
            onClick={() => {
              const returnToPitch = sessionStorage.getItem('returnToPitch');
              if (returnToPitch) {
                sessionStorage.removeItem('returnToPitch');
                navigate(`/pitch/${returnToPitch}`);
              } else {
                navigate('/login');
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Kirish sahifasiga o'tish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden bg-white/5 p-2">
            <img src="/bronlogo.png" alt="Bron Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-slate-400">Sign up to start booking pitches</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Must be at least 6 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-slate-400">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
