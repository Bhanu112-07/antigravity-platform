"use client";
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';
import Link from 'next/link';

export default function LoginPage() {
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  useEffect(() => {
    if (window.location.search.includes('admin=true')) {
      setIsAdminLogin(true);
    }
  }, []);

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', countryCode: '+91' });

  const COUNTRY_CODES = [
    { code: '+91', name: 'India' },
    { code: '+1', name: 'USA/Canada' },
    { code: '+44', name: 'UK' },
    { code: '+61', name: 'Australia' },
    { code: '+971', name: 'UAE' },
    { code: '+65', name: 'Singapore' },
    { code: '+49', name: 'Germany' },
    { code: '+33', name: 'France' },
    { code: '+81', name: 'Japan' },
  ];
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const url = `${API_BASE_URL}${endpoint}`;
      
      const payload = isLogin 
        ? { email: formData.email, password: formData.password } 
        : { name: formData.name, email: formData.email, password: formData.password, phone: formData.phone ? (formData.countryCode + formData.phone) : '' };

      if (!isLogin && formData.phone) {
        const combinedPhone = formData.countryCode + formData.phone;
        const cleanedPhone = combinedPhone.replace(/\D/g, '');
        const phoneRegex = /^\+[0-9]{11,15}$/;
        
        if (cleanedPhone.length < 11 || cleanedPhone.length > 15 || !phoneRegex.test(combinedPhone)) {
          throw new Error('Please enter a valid phone number');
        }

        if (formData.countryCode === '+91' && !/^[6-9]/.test(formData.phone)) {
          throw new Error('Indian mobile numbers must start with 6, 7, 8, or 9');
        }
      }
        
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      // Store token
      localStorage.setItem('ag_token', data.token);
      localStorage.setItem('ag_user', JSON.stringify(data.user));
      
      // Redirect to home or admin panel based on role
      window.location.href = data.user.role === 'admin' ? '/admin' : '/';
      
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-black/5 rounded-[3rem] p-12 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-600 mb-4">
              {isAdminLogin ? 'Operations' : 'Rarewingz'}
            </h1>
            <p className="text-black/40 text-[11px] font-black uppercase tracking-widest">
              {isAdminLogin 
                ? 'Secured terminal access'
                : isLogin ? 'Authenticate to proceed' : 'Join the new dimension'}
            </p>
          </div>

          <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-10 border border-black/5">
            <button 
              className={`flex-1 py-3 text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all ${isLogin ? 'bg-white text-black shadow-lg' : 'text-black/30 hover:text-black'}`}
              onClick={() => { setIsLogin(true); setError(''); }}
            >
              Login
            </button>
            <button 
              className={`flex-1 py-3 text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all ${!isLogin ? 'bg-white text-black shadow-lg' : 'text-black/30 hover:text-black'}`}
              onClick={() => { setIsLogin(false); setError(''); }}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest p-4 rounded-xl mb-8 text-center animate-in fade-in duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <div>
                  <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-3">Full Name</label>
                  <input 
                    type="text" 
                    required={!isLogin}
                    className="w-full bg-gray-50 border border-black/5 text-black rounded-2xl p-4 focus:bg-white focus:border-black/20 outline-none transition-all placeholder:text-black/20 font-medium" 
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-3">Communication</label>
                  <div className="flex gap-3">
                    <select 
                      value={formData.countryCode}
                      onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                      className="bg-gray-50 border border-black/5 text-black rounded-2xl p-4 focus:bg-white focus:border-black/20 outline-none transition-all w-32 text-xs font-bold"
                    >
                      {COUNTRY_CODES.map(c => (
                        <option key={c.code} value={c.code}>{c.code}</option>
                      ))}
                    </select>
                    <input 
                      type="tel"
                      className="flex-grow bg-gray-50 border border-black/5 text-black rounded-2xl p-4 focus:bg-white focus:border-black/20 outline-none transition-all placeholder:text-black/20 font-medium" 
                      placeholder="Phone number"
                      value={formData.phone}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '');
                        setFormData({...formData, phone: cleaned});
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-3">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full bg-gray-50 border border-black/5 text-black rounded-2xl p-4 focus:bg-white focus:border-black/20 outline-none transition-all placeholder:text-black/20 font-medium" 
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest">Secret Keyword</label>
                {isLogin && <a href="#" className="text-[10px] font-black uppercase text-purple-600 hover:text-cyan-600 transition-colors">Forgot?</a>}
              </div>
              <input 
                type="password" 
                required
                className="w-full bg-gray-50 border border-black/5 text-black rounded-2xl p-4 focus:bg-white focus:border-black/20 outline-none transition-all placeholder:text-black/20 font-medium" 
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-10 bg-black text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl hover:bg-neutral-800 shadow-2xl hover:shadow-black/20 transition-all flex justify-center items-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : isLogin ? 'Access Portal' : 'Register Identity'}
            </button>
          </form>
          
          <div className="mt-12 text-center">
            <Link href="/" className="text-black/40 hover:text-black text-[10px] font-black uppercase tracking-widest transition-all border-b border-transparent hover:border-black pb-1">
              ← Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
