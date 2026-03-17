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
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <span className="w-10 h-10 border-4 border-black/5 border-t-purple-600 rounded-full animate-spin"></span>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-16 gap-6">
          <div>
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-black">
              Profile
            </h1>
            <p className="text-black/40 mt-4 text-xl font-medium tracking-tight">Welcome back, {user?.name}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-neutral-800 transition-all shadow-xl"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-black/5 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              
              <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-10 border-b border-black/5 pb-6 text-black">Details</h2>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] text-black/30 font-black uppercase tracking-widest mb-2">Full Identity</p>
                  <p className="font-bold text-black">{user?.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-black/30 font-black uppercase tracking-widest mb-2">Email Address</p>
                  <p className="font-bold text-black">{user?.email}</p>
                </div>
                {user?.phone && (
                  <div>
                    <p className="text-[10px] text-black/30 font-black uppercase tracking-widest mb-2">Contact</p>
                    <p className="font-bold text-black">{user?.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] text-black/30 font-black uppercase tracking-widest mb-2">Access Role</p>
                  <p className={`font-black uppercase text-[10px] tracking-widest inline-block px-3 py-1 rounded-full ${user?.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-cyan-50 text-cyan-600'}`}>
                    {user?.role}
                  </p>
                </div>
                {user?.role === 'admin' && (
                  <div className="pt-8 mt-4 border-t border-black/5">
                    <Link 
                      href="/admin" 
                      className="w-full inline-block text-center py-4 bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-neutral-800 shadow-xl transition-all"
                    >
                      Management Portal
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="lg:col-span-2">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-10 text-black">Order History</h2>
            
            {orders.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-black/5 rounded-[3rem] p-16 text-center shadow-sm">
                <p className="mb-8 font-black uppercase tracking-widest text-black/20">No orders recorded yet.</p>
                <Link href="/products" className="inline-block px-10 py-4 bg-black text-white font-black uppercase tracking-widest rounded-2xl text-[10px] hover:bg-neutral-800 transition-all shadow-xl">
                  Browse Collection
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white border border-black/5 rounded-[2.5rem] p-8 hover:shadow-2xl transition-all group">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8 pb-8 border-b border-black/5">
                      <div>
                        <p className="text-[10px] text-black/30 font-black uppercase tracking-widest mb-2">Reference</p>
                        <p className="font-black text-xl text-black">#{order.id}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-black/30 font-black uppercase tracking-widest mb-2">Placed On</p>
                        <p className="font-bold text-black">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-[10px] text-black/30 font-black uppercase tracking-widest mb-2">Status</p>
                        <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${
                          order.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' :
                          order.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                          'bg-gray-50 text-black/40 border-black/5'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="font-black text-xs uppercase tracking-widest text-black/40">Total Amount</p>
                      <p className="text-3xl font-black text-black tracking-tighter">₹{order.total_amount.toLocaleString()}</p>
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
