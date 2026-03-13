"use client";
import { useState } from 'react';
import api from '@/lib/api'; // Assuming your api helper is here
import { Lock, ShieldCheck, CheckCircle2, ArrowRight, KeyRound, AlertCircle } from 'lucide-react';
import OverlayLoader from '@/components/loader';

export default function ResetPasswordPage() {
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("Passwords do not match!");
      return;
    }
    
    setLoading(true);
    try {
      // Replace with your actual reset endpoint and token logic
      // await api.post('/auth/reset-password', { password: passwords.new });
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
      }, 2000);
    } catch (err) {
      alert("Link expired or invalid.");
      setLoading(false);
    }
  };

  const css = {
    page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', padding: '20px' },
    card: { backgroundColor: '#ffffff', width: '100%', maxWidth: '420px', borderRadius: '16px', border: '2px solid #cbd5e1', padding: '40px', textAlign: 'center' },
    inputGroup: { position: 'relative', marginBottom: '15px', textAlign: 'left' },
    label: { display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' },
    input: { width: '100%', padding: '12px 15px 12px 42px', borderRadius: '10px', border: '2px solid #e2e8f0', outline: 'none', fontSize: '14px', fontWeight: '600' },
    icon: { position: 'absolute', left: '14px', top: '38px', color: '#94a3b8' },
    button: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' },
    requirement: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '5px' }
  };

  if (success) {
    return (
      <div style={css.page}>
        <div style={css.card}>
          <div style={{ backgroundColor: '#f0fdf4', color: '#166534', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 size={32} />
          </div>
          <h2 style={{ fontWeight: '900', margin: '0 0 10px 0' }}>PASSWORD UPDATED</h2>
          <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', marginBottom: '25px' }}>Your account is now secure. You can now log in with your new password.</p>
          <button style={css.button} onClick={() => window.location.href = '/login'}>GO TO LOGIN</button>
        </div>
      </div>
    );
  }

  return (
    <div style={css.page}>
      {loading && <OverlayLoader message="Updating Password..." />}
      
      <div style={css.card}>
        <div style={{ display: 'inline-flex', padding: '12px', backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', marginBottom: '20px' }}>
          <KeyRound size={28} />
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: '0 0 10px 0' }}>SET NEW PASSWORD</h1>
        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', marginBottom: '30px' }}>Please choose a strong password that you haven't used before.</p>

        <form onSubmit={handleSubmit}>
          <div style={css.inputGroup}>
            <label style={css.label}>New Password</label>
            <Lock style={css.icon} size={18} />
            <input 
              type="password" 
              placeholder="••••••••" 
              style={css.input} 
              required 
              onChange={(e) => setPasswords({...passwords, new: e.target.value})}
            />
          </div>

          <div style={css.inputGroup}>
            <label style={css.label}>Confirm New Password</label>
            <Lock style={css.icon} size={18} />
            <input 
              type="password" 
              placeholder="••••••••" 
              style={css.input} 
              required 
              onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
            />
          </div>

          <div style={{ textAlign: 'left', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <div style={css.requirement}>
              {passwords.new.length >= 8 ? <CheckCircle2 size={14} color="#166534" /> : <AlertCircle size={14} />}
              Minimum 8 characters
            </div>
            <div style={css.requirement}>
              {passwords.new === passwords.confirm && passwords.new !== '' ? <CheckCircle2 size={14} color="#166534" /> : <AlertCircle size={14} />}
              Passwords must match
            </div>
          </div>

          <button style={css.button} type="submit">
            UPDATE PASSWORD <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}