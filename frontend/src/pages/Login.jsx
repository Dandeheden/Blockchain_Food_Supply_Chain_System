import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally { setLoading(false); }
  };

  const demoLogin = async (email, password) => {
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in as demo user!');
      navigate('/dashboard');
    } catch { toast.error('Demo login failed. Please seed the database first.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex-col justify-center items-center p-12 text-white">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Leaf className="w-10 h-10 text-green-300" />
          </div>
          <h1 className="text-4xl font-bold mb-4">FoodTrace</h1>
          <p className="text-green-200 text-lg mb-8">Blockchain-Powered Food Supply Chain Traceability</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[['Farm to Fork','Complete journey tracking'],['Blockchain','Immutable records'],['IoT Oracle','Temperature monitoring'],['Transparent','Full audit trail']].map(([title,desc]) => (
              <div key={title} className="bg-white/10 rounded-2xl p-4 text-left">
                <div className="font-semibold">{title}</div>
                <div className="text-green-300 text-xs mt-1">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden w-14 h-14 bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-7 h-7 text-green-300" />
            </div>
            <h2 className="text-2xl font-bold text-green-900">Welcome back</h2>
            <p className="text-gray-500 mt-1">Sign in to your FoodTrace account</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="label">Email address</label>
              <input id="login-email" name="email" type="email" value={form.email} onChange={handle}
                className="input" placeholder="you@example.com" required />
            </div>
            <div>
              <label htmlFor="login-password" className="label">Password</label>
              <div className="relative">
                <input id="login-password" name="password" type={showPw ? 'text' : 'password'}
                  value={form.password} onChange={handle} className="input pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            Don't have an account? <Link to="/register" className="text-green-700 font-semibold hover:underline">Register</Link>
          </div>

          <div className="mt-6 border-t pt-5">
            <p className="text-xs text-gray-400 text-center mb-3">Quick demo login (seed DB first):</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['farmer@demo.com','demo123','Farmer'],
                ['admin@demo.com','demo123','Admin'],
                ['distributor@demo.com','demo123','Distributor'],
                ['retailer@demo.com','demo123','Retailer'],
              ].map(([email, pw, label]) => (
                <button key={label} onClick={() => demoLogin(email, pw)}
                  className="text-xs border border-green-200 rounded-lg py-1.5 px-2 text-green-700 hover:bg-green-50 transition-colors">
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
