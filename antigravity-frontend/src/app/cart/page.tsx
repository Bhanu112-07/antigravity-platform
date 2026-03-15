"use client";
import React, { useState, useEffect } from 'react';
import { resolveImageUrl } from '@/lib/api';
import Link from 'next/link';

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('ag_cart') || '[]');
    setCart(storedCart);
  }, []);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const removeItem = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    localStorage.setItem('ag_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart_updated'));
  };

  const handleCheckout = () => {
    const token = localStorage.getItem('ag_token');
    if (!token) {
      window.location.href = '/login?redirect=cart';
      return;
    }

    if (cart.length === 0) return;
    
    // Redirect to the dedicated checkout page to collect details
    window.location.href = '/checkout';
  };

  return (
    <div className="min-h-screen bg-[#050505] p-4 md:p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-10">
          Your Cart
        </h1>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded mb-6">{error}</div>}

        {cart.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-white/50">
            <p className="mb-4">Your cart is currently empty.</p>
            <Link href="/products" className="inline-block px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider rounded text-sm transition-colors cursor-pointer">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cart.map((item, index) => (
                <div key={index} className="flex gap-4 bg-white/5 border border-white/10 rounded-xl p-4 items-center">
                  <div className="w-20 h-24 bg-black rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={resolveImageUrl(item.image_url)} 
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-white/60 text-sm mb-1">Size: {item.size}</p>
                    <p className="text-white/60 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg mb-2">₹{item.price * item.quantity}</p>
                    <button onClick={() => removeItem(index)} className="text-xs text-red-400 hover:text-red-300 underline">Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="md:col-span-1">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 sticky top-24">
                <h3 className="font-bold text-xl mb-4 border-b border-white/10 pb-4">Order Summary</h3>
                <div className="space-y-2 mb-6 text-sm text-white/80">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                </div>
                <div className="flex justify-between font-black text-xl mb-8 pt-4 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">₹{total.toFixed(2)}</span>
                </div>
                
                <button 
                  onClick={handleCheckout} 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black uppercase tracking-widest py-4 rounded-lg hover:opacity-90 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : 'Proceed to Checkout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
