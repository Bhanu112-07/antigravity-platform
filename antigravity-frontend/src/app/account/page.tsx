"use client";
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';
import Link from 'next/link';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rawUser = localStorage.getItem('ag_user');
    const token = localStorage.getItem('ag_token');
    
    if (!rawUser || !token) {
      window.location.href = '/login';
      return;
    }

    try {
      setUser(JSON.parse(rawUser));
      fetch(`${API_BASE_URL}/api/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setOrders(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    } catch (e) {
      window.location.href = '/login';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ag_token');
    localStorage.removeItem('ag_user');
    window.location.href = '/';
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <span className="w-10 h-10 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin"></span>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] p-4 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              Commander Profile
            </h1>
            <p className="text-white/60 mt-2 text-lg">Welcome back, {user?.name}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-6 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded text-sm font-bold uppercase tracking-wider transition-colors"
          >
            Abort Mission (Logout)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="md:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              
              <h2 className="text-xl font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Details</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Name</p>
                  <p className="font-semibold">{user?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Email</p>
                  <p className="font-semibold">{user?.email}</p>
                </div>
                {user?.phone && (
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Phone</p>
                    <p className="font-semibold">{user?.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Clearance Level</p>
                  <p className={`font-semibold uppercase text-xs inline-block px-2 py-1 rounded ${user?.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                    {user?.role}
                  </p>
                </div>
                {user?.role === 'admin' && (
                  <div className="pt-4 border-t border-white/10">
                    <Link 
                      href="/admin" 
                      className="w-full inline-block text-center py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black uppercase tracking-widest text-xs rounded-lg hover:opacity-90 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
                    >
                      Admin Dashboard
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold uppercase tracking-widest mb-6">Mission History (Orders)</h2>
            
            {orders.length === 0 ? (
              <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-12 text-center text-white/50">
                <p className="mb-4">No deployments recorded yet.</p>
                <Link href="/products" className="inline-block px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider rounded text-sm transition-colors">
                  Browse Collection
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 pb-4 border-b border-white/5">
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Order ID</p>
                        <p className="font-mono font-bold text-lg">#{order.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Date</p>
                        <p className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Status</p>
                        <span className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-widest border ${
                          order.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                          order.status === 'processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          order.status === 'shipped' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                          'bg-white/5 text-white/40 border-white/10'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-white/60">Total Value:</p>
                      <p className="text-xl font-black">₹{order.total_amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
