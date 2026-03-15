import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-black text-white/70 mt-20">
      <div className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        <div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 uppercase tracking-tighter mb-4">
            Antigravity
          </h2>
          <p className="text-sm leading-relaxed mb-6">
            Defy gravity. Discover a new dimension of fashion with clothes that make you stand out from the earthbound crowd.
          </p>
          <div className="flex gap-4">
            {/* Social Icons Placeholder */}
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">IG</div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">TW</div>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 text-lg tracking-wide uppercase">Shop</h4>
          <ul className="space-y-4 text-sm">
            <li><Link href="/products?category=Men" className="hover:text-purple-400 transition-colors">Men's Collection</Link></li>
            <li><Link href="/products?category=Women" className="hover:text-purple-400 transition-colors">Women's Collection</Link></li>
            <li><Link href="/products?category=Accessories" className="hover:text-purple-400 transition-colors">Accessories</Link></li>
            <li><Link href="/products" className="hover:text-purple-400 transition-colors">All Products</Link></li>
            <li><Link href="/#about" className="hover:text-purple-400 transition-colors">About Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 text-lg tracking-wide uppercase">Support</h4>
          <ul className="space-y-4 text-sm">
            <li><Link href="/faq" className="hover:text-purple-400 transition-colors">FAQ</Link></li>
            <li><Link href="/shipping" className="hover:text-purple-400 transition-colors">Shipping & Returns</Link></li>
            <li><Link href="/track-order" className="hover:text-purple-400 transition-colors">Track Order</Link></li>
            <li><Link href="/contact" className="hover:text-purple-400 transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 text-lg tracking-wide uppercase">Newsletter</h4>
          <p className="text-sm mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
          <div className="flex">
            <input type="email" placeholder="Enter your email" className="bg-white/5 border border-white/10 text-white text-sm rounded-l-md px-4 py-2 w-full focus:outline-none focus:border-purple-400 transition-colors" />
            <button className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm px-6 py-2 rounded-r-md hover:opacity-90 transition-opacity">
              SUBSCRIBE
            </button>
          </div>
        </div>

      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs flex justify-center items-center gap-2 relative">
        <p>&copy; {new Date().getFullYear()} Antigravity. All rights reserved.</p>
        <Link href="/login?admin=true" className="absolute right-4 md:right-10 text-white/20 hover:text-purple-400 transition-colors" title="Admin Portal">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </Link>
      </div>
    </footer>
  );
}
