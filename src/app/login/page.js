"use client";
import { useState } from 'react';
import api from '@/lib/api';
import { Lock, Mail, User, ArrowRight, Car, LogIn, UserPlus } from 'lucide-react';
import OverlayLoader from '@/components/loader';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie'; // Import js-cookie (npm install js-cookie)

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Unified Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple Validation for Register
    if (!isLogin && formData.password !== formData.confirmPassword) {
      return alert("Passwords do not match!");
    }

    setLoading(true);
    try {
      if (isLogin) {
        await handleLogin();
      } else {
        await handleRegister();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Authentication failed";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 1. Login Logic
  const handleLogin = async () => {
    const res = await api.post('/auth/login', {
      email: formData.email,
      password: formData.password
    });

    const { token, user } = res.data;

    // Set Cookie for Middleware (Redirect Protection)
    // expires: 1 means 1 day
    Cookies.set('adminToken', token, { expires: 1, path: '/' });

    // Store for Client-side API use
    localStorage.setItem('adminToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Set header for current session
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    router.push('/dashboard');
    router.refresh(); // Forces the middleware to re-evaluate
  };

  // 2. Register Logic
  const handleRegister = async () => {
    await api.post('/auth/register', {
      name: formData.name,
      email: formData.email,
      password: formData.password
    });

    alert("Account created successfully! Please login.");
    setIsLogin(true);
    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
  };

  const css = {
    page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', padding: '20px' },
    card: { backgroundColor: '#ffffff', width: '100%', maxWidth: '450px', borderRadius: '24px', border: '2px solid #cbd5e1', padding: '40px', textAlign: 'center', shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' },
    tabContainer: { display: 'flex', backgroundColor: '#f8fafc', padding: '5px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px' },
    tab: (active) => ({
      flex: 1, padding: '12px', borderRadius: '8px', fontSize: '11px', fontWeight: '900', cursor: 'pointer', border: 'none',
      backgroundColor: active ? '#0f172a' : 'transparent',
      color: active ? '#fff' : '#64748b',
      transition: 'all 0.2s',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '1px'
    }),
    inputGroup: { position: 'relative', marginBottom: '18px', textAlign: 'left' },
    label: { display: 'block', fontSize: '10px', fontWeight: '900', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' },
    input: { width: '100%', padding: '14px 15px 14px 45px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', fontSize: '14px', fontWeight: '600', color: '#000', transition: 'border-color 0.2s' },
    icon: { position: 'absolute', left: '16px', top: '38px', color: '#94a3b8' },
    submitBtn: { width: '100%', padding: '16px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px', transition: 'transform 0.1s', letterSpacing: '2px' }
  };

  return (
    <div style={css.page}>
      {loading && <OverlayLoader message={isLogin ? "Verifying VIP Access..." : "Registering Account..."} />}
      
      <div style={css.card}>
        <div style={{ display: 'inline-flex', padding: '15px', backgroundColor: '#0f172a', borderRadius: '16px', color: '#fff', marginBottom: '20px' }}>
          <Car size={32} />
        </div>
        
        <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: '0 0 5px 0', letterSpacing: '-0.5px' }}>VIP LIMOUSINE</h1>
        <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '2px' }}>Administrative Portal</p>

        <div style={css.tabContainer}>
          <button style={css.tab(isLogin)} onClick={() => setIsLogin(true)}>
            <LogIn size={14} /> LOGIN
          </button>
          <button style={css.tab(!isLogin)} onClick={() => setIsLogin(false)}>
            <UserPlus size={14} /> REGISTER
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={css.inputGroup}>
              <label style={css.label}>Full Name</label>
              <User style={css.icon} size={18} />
              <input 
                type="text" placeholder="John Doe" style={css.input} required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}

          <div style={css.inputGroup}>
            <label style={css.label}>Email Address</label>
            <Mail style={css.icon} size={18} />
            <input 
              type="email" placeholder="admin@viplimoegypt.com" style={css.input} required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div style={css.inputGroup}>
            <label style={css.label}>Password</label>
            <Lock style={css.icon} size={18} />
            <input 
              type="password" placeholder="••••••••" style={css.input} required 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {!isLogin && (
            <div style={css.inputGroup}>
              <label style={css.label}>Confirm Password</label>
              <Lock style={css.icon} size={18} />
              <input 
                type="password" placeholder="••••••••" style={css.input} required 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          )}

          <button 
            style={css.submitBtn} 
            type="submit"
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isLogin ? "AUTHENTICATE" : "CREATE ACCOUNT"} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}