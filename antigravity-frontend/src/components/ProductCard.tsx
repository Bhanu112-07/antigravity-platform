import React from 'react';
import { resolveImageUrl } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  id: string | number;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  image_url?: string;
}

export default function ProductCard({ id, name, price, category, imageUrl, image_url }: ProductCardProps) {
  const finalImageUrl = imageUrl || image_url;
  return (
    <div className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300">
      {/* Image container */}
      <Link href={`/products/${id}`} className="block aspect-[4/5] overflow-hidden relative bg-black/50">
        {/* Placeholder for real image, using a div with gradient for now if finalImageUrl fails */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-cyan-900/40 opacity-50 z-0"></div>
        {finalImageUrl ? (
          <img 
            src={resolveImageUrl(finalImageUrl)} 
            alt={name} 
            className="w-full h-full object-cover z-10 relative group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 z-10 relative">No Image</div>
        )}
        
        {/* Quick Add Button - Appears on hover */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
          <button className="w-full py-3 bg-white text-black font-bold uppercase text-sm tracking-wider rounded-lg hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.5)]">
            Quick Add
          </button>
        </div>
      </Link>
      
      {/* Product Info */}
      <div className="p-5">
        <div className="text-xs text-purple-400 mb-1 uppercase tracking-widest font-semibold">{category}</div>
        <Link href={`/products/${id}`} className="block w-full">
          <h3 className="text-lg font-bold text-white mb-2 truncate group-hover:text-purple-300 transition-colors">{name}</h3>
        </Link>
        <div className="flex items-center justify-between">
          <span className="text-xl font-light text-white">₹{price}</span>
        </div>
      </div>
    </div>
  );
}
