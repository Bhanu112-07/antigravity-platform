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
    <div className="min-h-screen bg-white p-6 md:p-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black mb-12">
          Your Collection
        </h1>

        {error && <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-2xl mb-8 font-bold text-sm">{error}</div>}

        {cart.length === 0 ? (
          <div className="bg-gray-50 border border-black/5 rounded-[3rem] p-16 text-center">
            <p className="text-black/40 font-bold uppercase tracking-widest mb-8">Your cart is currently empty.</p>
            <Link href="/products" className="inline-block px-10 py-4 bg-black text-white font-black uppercase tracking-widest rounded-2xl text-xs hover:bg-neutral-800 transition-all shadow-xl">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-6">
              {cart.map((item, index) => (
                <div key={index} className="flex gap-6 bg-white border border-black/5 shadow-sm rounded-3xl p-6 items-center hover:shadow-xl transition-all group">
                  <div className="w-24 h-32 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
                    <img 
                      src={resolveImageUrl(item.image_url)} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-black text-xl uppercase tracking-tight text-black">{item.name}</h3>
                    <p className="text-black/40 text-xs font-bold uppercase tracking-widest mt-2">Size: <span className="text-black">{item.size}</span></p>
                    <p className="text-black/40 text-xs font-bold uppercase tracking-widest">Qty: <span className="text-black">{item.quantity}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-2xl text-black">₹{item.price * item.quantity}</p>
                    <button onClick={() => removeItem(index)} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 mt-4 underline underline-offset-4">Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="md:col-span-1">
              <div className="bg-gray-50 border border-black/5 rounded-[2.5rem] p-8 sticky top-32">
                <h3 className="font-black text-xs mb-8 uppercase tracking-[0.3em] text-black border-b border-black/5 pb-6">Summary</h3>
                <div className="space-y-4 mb-8 text-sm font-bold">
                  <div className="flex justify-between text-black/40">
                    <span className="uppercase tracking-widest text-[10px]">Subtotal</span>
                    <span className="text-black">₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="uppercase tracking-widest text-[10px] text-black/40">Shipping</span>
                    <span className="text-green-600 uppercase tracking-widest text-[10px]">Complimentary</span>
                  </div>
                </div>
                <div className="flex justify-between font-black text-3xl mb-10 pt-8 border-t border-black/5 text-black">
                  <span className="tracking-tighter uppercase">Total</span>
                  <span className="tracking-tighter">₹{total.toLocaleString()}</span>
                </div>
                
                <button 
                  onClick={handleCheckout} 
                  disabled={loading}
                  className="w-full bg-black text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl hover:bg-neutral-800 shadow-2xl hover:shadow-black/20 transition-all flex justify-center items-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      Proceed to Checkout
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
