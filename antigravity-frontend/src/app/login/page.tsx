"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  useEffect(() => {
    if (window.location.search.includes('admin=true')) {
      setIsAdminLogin(true);
    }
  }, []);

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const url = `http://localhost:5000${endpoint}`;
      
      const payload = isLogin 
        ? { email: formData.email, password: formData.password } 
        : { name: formData.name, email: formData.email, password: formData.password };
        
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
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
              {isAdminLogin ? 'Admin Portal' : 'Antigravity'}
            </h1>
            <p className="text-white/60 text-sm">
              {isAdminLogin 
                ? 'Authorized personnel only.'
                : isLogin ? 'Welcome back. Prepare for liftoff.' : 'Join the revolution. Create your account.'}
            </p>
          </div>

          <div className="flex bg-black/50 p-1 rounded-lg mb-8 border border-white/10">
            <button 
              className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider rounded-md transition-all ${isLogin ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
              onClick={() => { setIsLogin(true); setError(''); }}
            >
              Login
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider rounded-md transition-all ${!isLogin ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
              onClick={() => { setIsLogin(false); setError(''); }}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6 text-center animate-in fade-in duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Full Name</label>
                <input 
                  type="text" 
                  required={!isLogin}
                  className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-3.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-white/20" 
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-3.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-white/20" 
                placeholder="you@space.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-white/60 uppercase tracking-widest">Password</label>
                {isLogin && <a href="#" className="text-xs text-purple-400 hover:text-cyan-400 transition-colors">Forgot password?</a>}
              </div>
              <input 
                type="password" 
                required
                className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-3.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-white/20" 
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-8 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black uppercase tracking-widest py-4 rounded-lg hover:opacity-90 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : isLogin ? 'Launch' : 'Create Profile'}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors border-b border-transparent hover:border-white">
              ← Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
