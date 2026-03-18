"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { API_BASE_URL } from '@/lib/api';

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch from backend
    const searchParam = searchParams.get('search');
    
    let endpoint = `${API_BASE_URL}/api/products?`;
    if (categoryParam) endpoint += `category=${categoryParam}&`;
    if (searchParam) endpoint += `search=${searchParam}`;
      
    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [categoryParam, searchParams]);

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen bg-white">
      <div className="mb-16 border-b border-black/5 pb-8">
        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-black">
          {categoryParam ? `${categoryParam}'s Collection` : 'All Products'}
        </h1>
        <p className="text-black/40 mt-4 text-xl font-medium tracking-tight">
          Showing {products.length} {products.length === 1 ? 'exceptional piece' : 'exceptional pieces'}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-72 shrink-0">
          <div className="bg-gray-50/50 border border-black/[0.03] p-8 rounded-[2rem] sticky top-32">
            <h3 className="font-black text-xs mb-6 uppercase tracking-[0.3em] text-black border-b border-black/5 pb-6">Filters</h3>
            
            <div className="mb-8">
              <h4 className="font-black text-[10px] mb-4 text-black/40 uppercase tracking-widest">Category</h4>
              <ul className="space-y-3 text-sm font-semibold">
                <li><a href="/products" className="text-black/60 hover:text-black transition-colors flex items-center gap-2">All Collections</a></li>
                <li><a href="/products?category=T-Shirt" className="text-black/60 hover:text-black transition-colors flex items-center gap-2 underline decoration-transparent hover:decoration-black underline-offset-4 decoration-2">T-Shirt</a></li>
                <li><a href="/products?category=PHANTS" className="text-black/60 hover:text-black transition-colors flex items-center gap-2 underline decoration-transparent hover:decoration-black underline-offset-4 decoration-2">PHANTS</a></li>
                <li><a href="/products?category=Accessories" className="text-black/60 hover:text-black transition-colors flex items-center gap-2 underline decoration-transparent hover:decoration-black underline-offset-4 decoration-2">Accessories</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-[10px] mb-4 text-black/40 uppercase tracking-widest">Price Point</h4>
              <div className="flex items-center gap-3 text-sm">
                <input type="number" placeholder="Min" className="w-full bg-black/5 border border-black/5 rounded-xl p-3 focus:bg-white focus:border-black/20 outline-none transition-all" />
                <span className="text-black/20">—</span>
                <input type="number" placeholder="Max" className="w-full bg-black/5 border border-black/5 rounded-xl p-3 focus:bg-white focus:border-black/20 outline-none transition-all" />
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-[2.5rem] h-[500px]"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-black/5 rounded-[3rem] bg-gray-50">
              <p className="text-2xl font-black text-black/20 uppercase tracking-widest mb-4">No Products Found</p>
              <a href="/products" className="text-xs font-black uppercase tracking-widest text-black underline underline-offset-8 decoration-2">Clear Filters</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center animate-pulse">Loading collection...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
