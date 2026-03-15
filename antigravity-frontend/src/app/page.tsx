"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { API_BASE_URL, resolveImageUrl } from '@/lib/api';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [bestsellers, setBestsellers] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalImage, setModalImage] = useState<string>('');
  const [quickAddSize, setQuickAddSize] = useState('M');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        setFeaturedProducts(data.slice(0, 4));
        setBestsellers(data.filter((p: any) => p.is_bestseller === 1));
      })
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  const handleQuickAdd = (product: any) => {
    const cart = JSON.parse(localStorage.getItem('ag_cart') || '[]');
    const sizes = product.sizes ? product.sizes.split(',').map((s: string) => s.trim()) : ['M'];

    cart.push({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      size: quickAddSize || sizes[0],
      color: 'Original',
      quantity: 1
    });

    localStorage.setItem('ag_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart_updated'));
    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      setSelectedProduct(null);
    }, 1000);
  };


  return (
    <div className="flex flex-col min-h-screen bg-black">

      {/* Hero Section */}
      <section className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-black to-cyan-900/40 z-0"></div>
        <div className="absolute inset-0 bg-[url('/images/hero.png')] bg-cover bg-center mix-blend-overlay opacity-50"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-cyan-400 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            DEFY THE NORM
          </h1>
          <p className="text-lg md:text-2xl text-white/80 mb-10 font-light max-w-2xl">
            Step into the future of streetwear. Break boundaries with the new Zero-G Collection.
          </p>
          <div className="flex gap-4">
            <Link href="/products?category=Men" className="px-8 py-4 bg-white text-black font-bold uppercase tracking-wider rounded-none hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.5)]">
              Shop Men
            </Link>
            <Link href="/products?category=Women" className="px-8 py-4 bg-transparent border border-white text-white font-bold uppercase tracking-wider rounded-none hover:bg-white/10 transition-colors">
              Shop Women
            </Link>
          </div>
        </div>
      </section>

      {/* Bestseller Reel Section */}
      {bestsellers.length > 0 && (
        <section className="py-20 overflow-hidden">
          <div className="container mx-auto px-4 mb-10">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white inline-block relative">
              Bestsellers
              <span className="absolute -right-12 top-0 text-xs bg-cyan-500 text-black px-2 py-1 rounded-full font-black animate-bounce">HOT</span>
            </h2>
            <p className="text-white/40 mt-2 font-mono text-xs uppercase tracking-[0.3em]">Trending Now • Limited Stock</p>
          </div>

          <div className="flex overflow-x-auto pb-10 px-4 gap-6 scrollbar-hide no-scrollbar snap-x snap-mandatory">
            {bestsellers.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[280px] h-[500px] relative rounded-3xl overflow-hidden group border border-white/10 snap-center cursor-pointer shadow-2xl transition-all duration-500 hover:scale-105 hover:border-purple-500/50"
                onClick={() => {
                  setSelectedProduct(product);
                  setModalImage(product.image_url);
                  const sizes = product.sizes ? product.sizes.split(',').map((s: string) => s.trim()) : ['M'];
                  setQuickAddSize(sizes[0]);
                }}
              >
                {product.video_url ? (
                  <video
                    src={product.video_url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <img
                    src={resolveImageUrl(product.image_url)}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 opacity-80 group-hover:opacity-60 transition-opacity"></div>

                {/* Content */}
                <div className="absolute bottom-0 inset-x-0 p-6 z-20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Live Reel</span>
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1 leading-tight group-hover:text-purple-400 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-light text-white/90">₹{product.price}</span>
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Add Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
          <div className="bg-neutral-900 w-full max-w-md rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.3)] animate-in zoom-in-95 duration-300 relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-50 text-white/40 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>

            <div className="h-64 relative bg-black">
              <img src={resolveImageUrl(modalImage || selectedProduct.image_url)} className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent"></div>

              {/* Thumbnail Gallery in Modal */}
              {(() => {
                const images = selectedProduct.image_urls ? (typeof selectedProduct.image_urls === 'string' ? JSON.parse(selectedProduct.image_urls) : selectedProduct.image_urls) : [];
                if (images.length > 1) {
                  return (
                    <div className="absolute top-4 left-6 flex gap-2 z-50">
                      {images.slice(0, 4).map((img: string, i: number) => (
                        <button
                          key={i}
                          onClick={(e) => { e.stopPropagation(); setModalImage(img); }}
                          className={`w-10 h-12 rounded-lg border-2 overflow-hidden transition-all ${(modalImage || selectedProduct.image_url) === img ? 'border-purple-500 scale-110' : 'border-white/10 opacity-50'
                            }`}
                        >
                          <img src={resolveImageUrl(img)} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  );
                }
              })()}
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-1 block">Best Seller Item</span>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight">{selectedProduct.name}</h2>
              </div>
            </div>

            <div className="p-8 pt-2">
              <div className="mb-6">
                <p className="text-xs text-white/40 uppercase tracking-widest mb-3 font-bold">Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {(selectedProduct.sizes ? selectedProduct.sizes.split(',') : ['S', 'M', 'L', 'XL']).map((size: string) => {
                    const s = size.trim();
                    return (
                      <button
                        key={s}
                        onClick={() => setQuickAddSize(s)}
                        className={`w-12 h-12 rounded-xl border-2 font-black transition-all ${quickAddSize === s
                            ? 'border-purple-500 bg-purple-500/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                            : 'border-white/5 text-white/40 hover:border-white/20'
                          }`}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-t border-white/5">
                  <span className="text-white/40 font-medium">Price</span>
                  <span className="text-2xl font-black text-white">₹{selectedProduct.price}</span>
                </div>

                <button
                  onClick={() => handleQuickAdd(selectedProduct)}
                  disabled={isAdding}
                  className={`w-full h-16 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isAdding
                      ? 'bg-green-500 text-black'
                      : 'bg-white text-black hover:bg-gray-200'
                    }`}
                >
                  {isAdding ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                      Quick Add
                    </>
                  )}
                </button>

                <Link
                  href={`/products/${selectedProduct.id}`}
                  className="w-full py-4 text-center block text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  View Full Mission Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-b from-black to-purple-950/20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">Latest Drops</h2>
              <p className="text-white/60 mt-2">Cop them before they're gone.</p>
            </div>
            <Link href="/products" className="hidden md:block text-purple-400 hover:text-cyan-400 uppercase tracking-widest text-sm font-bold transition-colors">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/products" className="inline-block border border-white/20 px-8 py-3 uppercase tracking-widest text-sm font-bold hover:bg-white/10 transition-colors">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="relative py-32 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/10 to-black z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-3xl opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-700"></div>
                <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-[4/5] lg:aspect-auto lg:h-[600px] shadow-2xl">
                  <img
                    src="/images/about-us.png"
                    alt="Antigravity Streetwear Culture"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  <div className="absolute bottom-10 left-10">
                    <p className="text-4xl font-black text-white italic tracking-tighter drop-shadow-lg">EST. 2024</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6">
                  <span className="h-px w-8 bg-cyan-500"></span>
                  <span className="text-sm font-bold uppercase tracking-[0.5em] text-cyan-400">The Manifesto</span>
                </div>

                <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-8 leading-[0.9]">
                  Gravity is <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Optional</span>
                </h2>

                <p className="text-xl text-white/70 font-light leading-relaxed mb-10 max-w-lg">
                  Born in the neon-lit backstreets of the digital age, Antigravity represents the collision between raw urban energy and precision engineering. We don't just dress the body; we equip the spirit for the challenges of tomorrow.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors group">
                    <h4 className="text-3xl font-black text-white mb-2 group-hover:text-purple-400 transition-colors">100%</h4>
                    <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Cyber-Grade Materials</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-colors group">
                    <h4 className="text-3xl font-black text-white mb-2 group-hover:text-cyan-400 transition-colors">Global</h4>
                    <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Next-Gen Logistics</p>
                  </div>
                </div>

                <button className="group relative px-12 py-5 bg-white text-black font-black uppercase tracking-widest text-sm overflow-hidden transition-all hover:pr-16 self-start">
                  <span className="relative z-10">Our Philosophy</span>
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}


    </div>
  );
}
