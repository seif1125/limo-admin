"use client";
import { useState } from 'react';
import api from '@/lib/api';
import { Lock, Mail, User, ArrowRight, Car, ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import OverlayLoader from '@/components/loader';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // Toggles between Login and Register
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const res = await api.post(endpoint, formData);
      
      if (isLogin) {
        // 1. Save Token to LocalStorage
     
        
        // 2. Set Default Authorization Header for future API calls
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        

  localStorage.setItem('user', JSON.stringify(res.data.user)); // Optional: Store user info for easy access

 
        // 3. Redirect to Dashboard
        router.push('/dashboard');
      } else {
        // 1. Success in Register: Show success message
        alert("Registration successful! Please login.");
        
        // 2. Switch to Login Tab
        setIsLogin(true);
        
        // 3. Clear sensitive fields but keep email for convenience
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        setLoading(false);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Authentication failed";
      alert(errorMsg);
      setLoading(false);
    }
  };

  const css = {
    page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', padding: '20px' },
    card: { backgroundColor: '#ffffff', width: '100%', maxWidth: '450px', borderRadius: '16px', border: '2px solid #cbd5e1', padding: '40px', textAlign: 'center' },
    tabContainer: { display: 'flex', backgroundColor: '#f8fafc', padding: '5px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px' },
    tab: (active) => ({
      flex: 1, padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '900', cursor: 'pointer', border: 'none',
      backgroundColor: active ? '#0f172a' : 'transparent',
      color: active ? '#fff' : '#64748b',
      transition: 'all 0.2s',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
    }),
    inputGroup: { position: 'relative', marginBottom: '18px', textAlign: 'left' },
    label: { display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' },
    input: { width: '100%', padding: '12px 15px 12px 42px', borderRadius: '10px', border: '2px solid #e2e8f0', outline: 'none', fontSize: '14px', fontWeight: '600', color: '#000' },
    icon: { position: 'absolute', left: '14px', top: '35px', color: '#94a3b8' },
    submitBtn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' },
    footerLink: { marginTop: '20px', fontSize: '13px', fontWeight: '700', color: '#64748b', cursor: 'pointer', textDecoration: 'underline', background: 'none', border: 'none' }
  };

  return (
    <div style={css.page}>
      {loading && <OverlayLoader message={isLogin ? "Signing in..." : "Creating account..."} />}
      
      <div style={css.card}>
        {/* Brand Icon */}
        <div style={{ display: 'inline-flex', padding: '12px', backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', marginBottom: '15px' }}>
          <Car size={32} />
        </div>
        
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '0 0 5px 0' }}>RESERVATIONS HUB</h1>
    

        {/* Login/Register Tabs */}
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
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}

          <div style={css.inputGroup}>
            <label style={css.label}>Email Address</label>
            <Mail style={css.icon} size={18} />
            <input 
              type="email" placeholder="admin@fleet.com" style={css.input} required 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div style={css.inputGroup}>
            <label style={css.label}>Password</label>
            <Lock style={css.icon} size={18} />
            <input 
              type="password" placeholder="••••••••" style={css.input} required 
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {!isLogin && (
            <div style={css.inputGroup}>
              <label style={css.label}>Confirm Password</label>
              <Lock style={css.icon} size={18} />
              <input 
                type="password" placeholder="••••••••" style={css.input} required 
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          )}

          <button style={css.submitBtn} type="submit">
            {isLogin ? "ACCESS DASHBOARD" : "CREATE ACCOUNT"} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}