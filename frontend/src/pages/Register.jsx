import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'farmer',      label: '🌾 Farmer',       desc: 'Register & manage food batches' },
  { value: 'processor',   label: '🏭 Processor',    desc: 'Process and package products' },
  { value: 'distributor', label: '🚚 Distributor',  desc: 'Transport and store products' },
  { value: 'retailer',    label: '🏪 Retailer',     desc: 'Stock and sell products' },
  { value: 'admin',       label: '🔐 Admin',         desc: 'Monitor and regulate the system' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'farmer', organization:'', location:'' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex-col justify-center items-center p-12 text-white">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Leaf className="w-10 h-10 text-green-300" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Join FoodTrace</h1>
          <p className="text-green-200 text-lg">Create your account and become part of the transparent food supply chain ecosystem.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <div className="lg:hidden w-14 h-14 bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-7 h-7 text-green-300" />
            </div>
            <h2 className="text-2xl font-bold text-green-900">Create Account</h2>
            <p className="text-gray-500 mt-1">Fill in your details to get started</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-name" className="label">Full Name *</label>
                <input id="reg-name" name="name" value={form.name} onChange={handle} className="input" placeholder="John Smith" required />
              </div>
              <div>
                <label htmlFor="reg-org" className="label">Organization</label>
                <input id="reg-org" name="organization" value={form.organization} onChange={handle} className="input" placeholder="Farm / Company name" />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="label">Email Address *</label>
              <input id="reg-email" name="email" type="email" value={form.email} onChange={handle} className="input" placeholder="you@example.com" required />
            </div>

            <div>
              <label htmlFor="reg-password" className="label">Password * (min 6 chars)</label>
              <div className="relative">
                <input id="reg-password" name="password" type={showPw ? 'text' : 'password'}
                  value={form.password} onChange={handle} className="input pr-10" placeholder="••••••••" required minLength={6} />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="reg-location" className="label">Location</label>
              <input id="reg-location" name="location" value={form.location} onChange={handle} className="input" placeholder="City, State" />
            </div>

            <div>
              <label className="label">Role *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ROLES.map(r => (
                  <button key={r.value} type="button" onClick={() => setForm(p => ({...p, role: r.value}))}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${
                      form.role === r.value ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'
                    }`}>
                    <div className="text-sm font-semibold">{r.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-green-700 font-semibold hover:underline">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
