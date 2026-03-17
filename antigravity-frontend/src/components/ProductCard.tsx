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
    <div className="group relative bg-white border border-black/[0.03] rounded-[2rem] overflow-hidden hover:border-black/10 transition-all duration-500 hover:shadow-2xl">
      {/* Image container */}
      <Link href={`/products/${id}`} className="block aspect-[3/4] overflow-hidden relative bg-gray-50">
        {/* Placeholder for real image */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-cyan-50 opacity-50 z-0"></div>
        {finalImageUrl ? (
          <img 
            src={resolveImageUrl(finalImageUrl)} 
            alt={name} 
            className="w-full h-full object-cover z-10 relative group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-black/10 z-10 relative font-black uppercase tracking-widest text-xs">No Image</div>
        )}
        
        {/* Quick Add Button - Appears on hover */}
        <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20">
          <button className="w-full py-4 bg-black text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:bg-neutral-800 transition-all shadow-2xl">
            Quick View
          </button>
        </div>
      </Link>
      
      {/* Product Info */}
      <div className="p-7">
        <div className="text-[10px] text-purple-600 mb-2 uppercase tracking-[0.2em] font-black">{category}</div>
        <Link href={`/products/${id}`} className="block w-full">
          <h3 className="text-xl font-black text-black mb-3 truncate group-hover:text-purple-600 transition-colors uppercase tracking-tight">{name}</h3>
        </Link>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-light text-black/90">₹{price}</span>
        </div>
      </div>
    </div>
  );
}
