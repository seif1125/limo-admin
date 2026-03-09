"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Lock, User, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', formData);
      // Save the token for the interceptor to use
      localStorage.setItem('adminToken', res.data.token);
      // Redirect to the dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-black p-8 text-center text-white">
          <h1 className="text-2xl font-bold tracking-[0.2em] uppercase">Monochrome</h1>
          <p className="text-slate-400 text-xs mt-2 font-light">ADMINISTRATOR PORTAL</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Username"
                required
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition"
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="password"
                placeholder="Password"
                required
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "SIGN IN"}
          </button>
        </form>
      </div>
    </div>
  );
}