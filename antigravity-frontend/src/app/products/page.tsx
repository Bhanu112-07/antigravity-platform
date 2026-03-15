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
    const endpoint = categoryParam 
      ? `${API_BASE_URL}/api/products?category=${categoryParam}`
      : `${API_BASE_URL}/api/products`;
      
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
  }, [categoryParam]);

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="mb-12 border-b border-white/10 pb-6">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
          {categoryParam ? `${categoryParam}'s Collection` : 'All Products'}
        </h1>
        <p className="text-white/60 mt-4 text-lg">
          {products.length} {products.length === 1 ? 'Product' : 'Products'} Found
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white/5 border border-white/10 p-6 rounded-xl sticky top-28">
            <h3 className="font-bold text-lg mb-4 uppercase tracking-widest border-b border-white/10 pb-4">Filters</h3>
            
            <div className="mb-6">
              <h4 className="font-semibold text-sm mb-3 text-white/80">Category</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/products" className="text-white/60 hover:text-cyan-400 cursor-pointer">All Categories</a></li>
                <li><a href="/products?category=Men" className="text-white/60 hover:text-cyan-400 cursor-pointer">Men</a></li>
                <li><a href="/products?category=Women" className="text-white/60 hover:text-cyan-400 cursor-pointer">Women</a></li>
                <li><a href="/products?category=Accessories" className="text-white/60 hover:text-cyan-400 cursor-pointer">Accessories</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3 text-white/80">Price</h4>
              <div className="flex items-center gap-2 text-sm">
                <input type="number" placeholder="Min" className="w-full bg-black border border-white/20 rounded p-2 focus:border-purple-400 outline-none" />
                <span>-</span>
                <input type="number" placeholder="Max" className="w-full bg-black border border-white/20 rounded p-2 focus:border-purple-400 outline-none" />
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl h-96"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border border-dashed border-white/20 rounded-xl">
              <p className="text-xl text-white/50">No products found in this category.</p>
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
