"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import HeroCarousel from '@/components/HeroCarousel';
import ProductCard from '@/components/ProductCard';
import { API_BASE_URL, resolveImageUrl } from '@/lib/api';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [phants, setPhants] = useState<any[]>([]);
  const [tshirts, setTshirts] = useState<any[]>([]);
  const [bestsellers, setBestsellers] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalImage, setModalImage] = useState<string>('');
  const [quickAddSize, setQuickAddSize] = useState('M');
  const [isAdding, setIsAdding] = useState(false);

  const [fabData, setFabData] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        setFeaturedProducts(data.slice(0, 4));
        setPhants(data.filter((p: any) => p.category === 'PHANTS').slice(0, 4));
        setTshirts(data.filter((p: any) => p.category === 'T-Shirt').slice(0, 4));
        setBestsellers(data.filter((p: any) => p.is_bestseller === 1));
      })
      .catch(err => console.error("Error fetching products:", err));

    fetch(`${API_BASE_URL}/api/site/fab`)
      .then(res => res.json())
      .then(data => setFabData(data))
      .catch(err => console.error("Error fetching FAB data:", err));
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
    <div className="flex flex-col min-h-screen bg-white">

      {/* Hero Carousel Section */}
      <HeroCarousel />

      {/* Bestseller Reel Section */}
      {bestsellers.length > 0 && (
        <section className="py-24 overflow-hidden bg-gray-50/50">
          <div className="container mx-auto px-4 mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black inline-block relative">
                Top Picks
                <span className="absolute -right-14 top-0 text-[10px] bg-red-600 text-white px-2 py-1 rounded-full font-black animate-pulse">TRENDING</span>
              </h2>
              <p className="text-black/40 mt-3 font-mono text-[10px] uppercase tracking-[0.4em]">Limited Edition • Summer Series</p>
            </div>
          </div>

          <div className="flex overflow-x-auto pb-12 px-4 gap-8 scrollbar-hide no-scrollbar snap-x snap-mandatory">
            {bestsellers.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[300px] h-[520px] relative rounded-[2rem] overflow-hidden group border border-black/5 snap-center cursor-pointer shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:border-purple-500/30 bg-white"
                onClick={() => {
                  setSelectedProduct(product);
                  setModalImage(product.image_url);
                  const sizes = product.sizes ? product.sizes.split(',').map((s: string) => s.trim()) : ['M'];
                  setQuickAddSize(sizes[0]);
                }}
              >
                {product.video_url ? (
                  <video
                    src={resolveImageUrl(product.video_url)}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <img
                    src={resolveImageUrl(product.image_url)}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                {/* Content */}
                <div className="absolute bottom-0 inset-x-0 p-8 z-20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Premium Grade</span>
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1 leading-tight group-hover:text-purple-300 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-lg font-light text-white/90">₹{product.price}</span>
                    <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
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
        <div 
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-0 sm:px-4 backdrop-blur-sm bg-black/40 animate-in fade-in duration-300"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="bg-white w-full sm:max-w-md rounded-t-[2.5rem] sm:rounded-[2rem] overflow-hidden border-t sm:border border-black/5 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] sm:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 relative max-h-[90vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-50 text-black/20 hover:text-black transition-colors bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>

            <div className="h-48 sm:h-64 relative bg-gray-100">
              <img src={resolveImageUrl(modalImage || selectedProduct.image_url)} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent opacity-40"></div>

              {/* Thumbnail Gallery in Modal */}
              {(() => {
                const images = selectedProduct.image_urls ? (typeof selectedProduct.image_urls === 'string' ? JSON.parse(selectedProduct.image_urls) : selectedProduct.image_urls) : [];
                if (images.length > 1) {
                  return (
                    <div className="absolute bottom-4 left-6 flex gap-2 z-50">
                      {images.slice(0, 4).map((img: string, i: number) => (
                        <button
                          key={i}
                          onClick={(e) => { e.stopPropagation(); setModalImage(img); }}
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border-2 overflow-hidden transition-all shadow-lg ${(modalImage || selectedProduct.image_url) === img ? 'border-black scale-110' : 'border-white opacity-80 hover:opacity-100'
                            }`}
                        >
                          <img src={resolveImageUrl(img)} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  );
                }
              })()}
            </div>

            <div className="p-6 sm:p-8 pt-4">
              <div className="mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-1 block">Available Now</span>
                <h2 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tighter leading-none mb-4">{selectedProduct.name}</h2>
                <p className="text-[10px] text-black/40 uppercase tracking-[0.2em] mb-3 font-bold">Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {(selectedProduct.sizes ? selectedProduct.sizes.split(',') : ['S', 'M', 'L', 'XL']).map((size: string) => {
                    const s = size.trim();
                    return (
                      <button
                        key={s}
                        onClick={() => setQuickAddSize(s)}
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl border-2 font-black text-xs transition-all ${quickAddSize === s
                            ? 'border-black bg-black text-white shadow-lg'
                            : 'border-black/5 text-black/30 hover:border-black/20'
                          }`}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-t border-black/5">
                  <span className="text-black/40 font-bold uppercase tracking-widest text-[10px]">Total Amount</span>
                  <span className="text-xl sm:text-2xl font-black text-black">₹{selectedProduct.price}</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleQuickAdd(selectedProduct)}
                    disabled={isAdding}
                    className={`flex-1 h-12 sm:h-14 rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${isAdding
                        ? 'bg-green-500 text-white'
                        : 'bg-black text-white hover:bg-neutral-800 shadow-xl hover:shadow-black/20'
                      }`}
                  >
                    {isAdding ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                        Added
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                  <Link
                    href={`/products/${selectedProduct.id}`}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl border-2 border-black/5 flex items-center justify-center hover:bg-black group transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-white transition-colors"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Products */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4 mb-16">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black">New Arrivals</h2>
              <p className="text-black/40 mt-3 font-medium uppercase tracking-widest text-xs">Curated style for the modern era</p>
            </div>
            <Link href="/products" className="hidden md:flex items-center gap-2 group text-black font-black uppercase tracking-widest text-xs transition-colors">
              <span>View Collection</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="flex overflow-x-auto pb-12 px-4 md:px-12 gap-8 scrollbar-hide no-scrollbar snap-x snap-mandatory">
          {featuredProducts.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-[300px] snap-center transition-all duration-500 hover:scale-[1.02]">
              <ProductCard {...product} />
            </div>
          ))}
        </div>

        <div className="container mx-auto px-4 mt-12 text-center md:hidden">
          <Link href="/products" className="inline-block bg-black text-white px-10 py-4 uppercase tracking-widest text-xs font-black shadow-xl">
            Shop All
          </Link>
        </div>
      </section>

      {/* T-Shirt Section */}
      {tshirts.length > 0 && (
        <section className="py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-4 mb-16">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black">T-Shirts</h2>
                <p className="text-black/40 mt-3 font-medium uppercase tracking-widest text-xs">Essential urban staples</p>
              </div>
              <Link href="/products?category=T-Shirt" className="hidden md:flex items-center gap-2 group text-black font-black uppercase tracking-widest text-xs transition-colors">
                <span>View All T-Shirts</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="flex overflow-x-auto pb-12 px-4 md:px-12 gap-8 scrollbar-hide no-scrollbar snap-x snap-mandatory">
            {tshirts.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-[300px] snap-center transition-all duration-500 hover:scale-[1.02]">
                <ProductCard {...product} />
              </div>
            ))}
          </div>

          <div className="container mx-auto px-4 mt-12 text-center md:hidden">
            <Link href="/products?category=T-Shirt" className="inline-block bg-black text-white px-10 py-4 uppercase tracking-widest text-xs font-black shadow-xl">
              Shop T-Shirts
            </Link>
          </div>
        </section>
      )}

      {/* PHANTS Section */}
      {phants.length > 0 && (
        <section className="py-24 bg-gray-50/30 overflow-hidden">
          <div className="container mx-auto px-4 mb-16">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black">PHANTS</h2>
                <p className="text-black/40 mt-3 font-medium uppercase tracking-widest text-xs">Engineered for the urban landscape</p>
              </div>
              <Link href="/products?category=PHANTS" className="hidden md:flex items-center gap-2 group text-black font-black uppercase tracking-widest text-xs transition-colors">
                <span>View All PHANTS</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="flex overflow-x-auto pb-12 px-4 md:px-12 gap-8 scrollbar-hide no-scrollbar snap-x snap-mandatory">
            {phants.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-[300px] snap-center transition-all duration-500 hover:scale-[1.02]">
                <ProductCard {...product} />
              </div>
            ))}
          </div>

          <div className="container mx-auto px-4 mt-12 text-center md:hidden">
            <Link href="/products?category=PHANTS" className="inline-block bg-black text-white px-10 py-4 uppercase tracking-widest text-xs font-black shadow-xl">
              Shop PHANTS
            </Link>
          </div>
        </section>
      )}

      {/* FAB Section */}
      {fabData && (
        <section className="relative min-h-[600px] bg-[#2EABEB] overflow-hidden flex flex-col lg:flex-row items-stretch">
          <div className="flex-1 p-12 lg:p-24 flex flex-col justify-center relative z-10">
            <div className="mb-6">
              <span className="bg-[#FFF200] text-black px-4 py-1.5 rounded-lg text-sm font-black uppercase tracking-widest shadow-lg -rotate-2 inline-block">
                Welcome To
              </span>
            </div>
            <h2 className="text-6xl md:text-[5.5rem] font-black text-white uppercase tracking-tighter leading-[0.8] mb-12 drop-shadow-2xl">
              {fabData.title.split(' ')[0]} <br/>
              <span className="text-white/90">{fabData.title.split(' ').slice(1).join(' ')}</span>
            </h2>

            <div className="space-y-6 max-w-md">
              <div className="bg-white rounded-[2rem] p-8 shadow-2xl transform transition-all hover:-translate-y-2 duration-500">
                <span className="block text-4xl font-black text-[#FF007A] leading-none mb-2">{fabData.stat1_title}</span>
                <span className="block text-[10px] font-black text-black/40 uppercase tracking-[0.3em] font-mono leading-tight">{fabData.stat1_subtitle}</span>
              </div>
              <div className="bg-white rounded-[2rem] p-8 shadow-2xl transform transition-all hover:-translate-y-2 duration-500">
                <span className="block text-4xl font-black text-[#FF007A] leading-none mb-2">{fabData.stat2_title}</span>
                <span className="block text-[10px] font-black text-black/40 uppercase tracking-[0.3em] font-mono leading-tight">{fabData.stat2_subtitle}</span>
              </div>
            </div>

            <div className="mt-12">
              <button className="bg-white text-black px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#FFF200] hover:scale-105 transition-all shadow-2xl">
                Explore Flipside
              </button>
            </div>
          </div>

          <div className="flex-1 relative min-h-[400px] lg:min-h-0 overflow-hidden">
            {/* Slanted divider for desktop */}
            <div className="hidden lg:block absolute inset-y-0 -left-16 w-32 bg-[#2EABEB] -skew-x-6 z-20"></div>
            
            <div className="absolute inset-0 z-10">
              {fabData.video_url ? (
                <video 
                  src={resolveImageUrl(fabData.video_url)} 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-black/10 flex items-center justify-center text-white/20 font-black uppercase text-4xl">Reel Space</div>
              )}
            </div>
            
            {/* Play button overlay */}
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full border-4 border-white/40 flex items-center justify-center animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="white" viewBox="0 0 24 24" className="ml-1"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About Us Section */}
      <section id="about" className="relative py-32 overflow-hidden bg-gray-50">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-100 to-cyan-100 rounded-[3rem] opacity-50 blur-2xl group-hover:opacity-80 transition-opacity duration-700"></div>
                <div className="relative rounded-[2.5rem] overflow-hidden border border-black/5 aspect-[4/5] lg:aspect-auto lg:h-[650px] shadow-2xl">
                  <img
                    src="/images/about-us.png"
                    alt="Antigravity Streetwear Culture"
                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-12 left-12">
                    <p className="text-6xl font-black text-white italic tracking-tighter leading-none opacity-90">EST. <br/> 2024</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-8">
                  <span className="h-px w-12 bg-black"></span>
                  <span className="text-xs font-black uppercase tracking-[0.6em] text-black/40">The Identity</span>
                </div>

                <h2 className="text-6xl md:text-8xl font-black text-black uppercase tracking-tighter mb-10 leading-[0.85]">
                  Redefining <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-600">Reality</span>
                </h2>

                <p className="text-xl text-black/60 font-medium leading-relaxed mb-12 max-w-xl">
                  Born from the intersection of architectural precision and urban chaos. We create garments that serve as armor for the digital age—where style is a necessity and quality is non-negotiable.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                  <div className="p-8 rounded-3xl bg-white border border-black/5 hover:border-black/10 transition-shadow shadow-sm hover:shadow-xl group">
                    <h4 className="text-4xl font-black text-black mb-3 group-hover:text-purple-600 transition-colors">Elite</h4>
                    <p className="text-black/40 text-[10px] uppercase tracking-widest font-black">Craftsmanship & Materials</p>
                  </div>
                  <div className="p-8 rounded-3xl bg-white border border-black/5 hover:border-black/10 transition-shadow shadow-sm hover:shadow-xl group">
                    <h4 className="text-4xl font-black text-black mb-3 group-hover:text-cyan-600 transition-colors">Global</h4>
                    <p className="text-black/40 text-[10px] uppercase tracking-widest font-black">Next-Generation Reach</p>
                  </div>
                </div>

                <button className="group relative px-14 py-6 bg-black text-white font-black uppercase tracking-widest text-xs overflow-hidden transition-all hover:pr-20 self-start shadow-2xl hover:bg-neutral-800">
                  <span className="relative z-10">Learn Our Story</span>
                  <span className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
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
