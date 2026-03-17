"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isAuth, setIsAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('ag_token');
      const user = JSON.parse(localStorage.getItem('ag_user') || '{}');
      setIsAuth(!!token);
      setIsAdmin(user.role === 'admin');
    };

    checkAuth();

    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('ag_cart') || '[]');
      setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
    };

    updateCartCount();
    window.addEventListener('storage', () => {
      checkAuth();
      updateCartCount();
    });
    // Add custom event listener for same-window updates
    window.addEventListener('cart_updated', updateCartCount);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('cart_updated', updateCartCount);
    };
  }, []);
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/70 border-b border-black/10 transition-all duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-600 uppercase tracking-tighter hover:scale-105 transition-transform">
          Rarewingz
        </Link>

        <nav className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-black/60">
          <Link href="/products?category=T-Shirt" className="hover:text-black transition-all">T-Shirt</Link>
          <Link href="/products?category=PHANTS" className="hover:text-black transition-all">PHANTS</Link>
          <Link href="/products?category=Accessories" className="hover:text-black transition-all">Accessories</Link>
          {isAdmin && (
            <Link href="/admin" className="text-cyan-600 font-bold hover:text-cyan-500 transition-all flex items-center gap-1 group">
              DASHBOARD
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-6">
          <button className="text-black/80 hover:text-black transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          </button>
          <Link href="/cart" className="text-black/80 hover:text-black transition-colors relative group">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center group-hover:scale-110 transition-transform">
              {cartCount}
            </span>
          </Link>
          <Link href={isAuth ? "/account" : "/login"} className="text-black/80 hover:text-black transition-colors relative group">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            {isAuth && <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white group-hover:bg-cyan-500 transition-colors"></span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
