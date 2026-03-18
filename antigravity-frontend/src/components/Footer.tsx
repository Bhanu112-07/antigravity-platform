import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-black/5 bg-white text-black/70 mt-20">
      <div className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">

        <div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-600 uppercase tracking-tighter mb-4">
            Rarewingz
          </h2>
          <p className="text-sm leading-relaxed mb-6 font-medium">
            Redefining reality through fashion. Discover a new dimension of streetwear where quality meets architectural precision.
          </p>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors cursor-pointer text-black font-black text-[10px]">IG</div>
            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors cursor-pointer text-black font-black text-[10px]">TW</div>
          </div>
        </div>

        <div>
          <h4 className="text-black font-black mb-6 text-sm tracking-[0.2em] uppercase">Shop</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link href="/products?category=Men" className="hover:text-purple-600 transition-colors">Men's Collection</Link></li>
            <li><Link href="/products?category=PHANTS" className="hover:text-purple-600 transition-colors">PHANTS Collection</Link></li>
            <li><Link href="/products?category=Accessories" className="hover:text-purple-600 transition-colors">Accessories</Link></li>
            <li><Link href="/products" className="hover:text-purple-600 transition-colors">All Products</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-black font-black mb-6 text-sm tracking-[0.2em] uppercase">Support</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link href="/shipping" className="hover:text-purple-600 transition-colors">Shipping & Returns</Link></li>
            <li><Link href="/track-order" className="hover:text-purple-600 transition-colors">Order Status</Link></li>
            <li><Link href="/contact" className="hover:text-purple-600 transition-colors">Contact Support</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600 uppercase tracking-tighter mb-4">
            Designed By Bhanu
          </h2>
          <p className="text-sm italic leading-relaxed mb-4 font-medium text-black/50">
            "Innovation is the bridge between imagination and reality."
          </p>
          <div className="pt-4 border-t border-black/5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Developer Portfolio</p>
            <p className="text-sm font-bold mt-1 tracking-tight">Full Stack Architecture & Design</p>
          </div>
        </div>

      </div>
      <div className="border-t border-black/5 py-8 text-center text-[10px] font-black uppercase tracking-[0.3em] flex justify-center items-center gap-2 relative">
        <p>&copy; {new Date().getFullYear()} Rarewingz. All rights reserved.</p>
        <Link href="/login?admin=true" className="absolute right-4 md:right-10 text-black/10 hover:text-purple-600 transition-colors" title="Admin Portal">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        </Link>
      </div>
    </footer>
  );
}
