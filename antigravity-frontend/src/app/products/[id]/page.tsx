"use client";
import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { API_BASE_URL, resolveImageUrl } from '@/lib/api';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('Original');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        
        // Parse the image urls
        let images: string[] = [];
        if (data.image_urls) {
          try {
            images = JSON.parse(data.image_urls);
          } catch (e) {
            images = typeof data.image_urls === 'string' ? [data.image_urls] : data.image_urls;
          }
        }
        
        if (images.length === 0 && data.image_url) {
          images = [data.image_url];
        }

        setAllImages(images);
        if (images.length > 0) setSelectedImage(images[0]);
        
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // Fetch reviews
    fetch(`${API_BASE_URL}/api/reviews/${id}`)
      .then(res => res.json())
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching reviews:", err));

    // Check if user has purchased this product
    const userStr = localStorage.getItem('ag_user');
    const token = localStorage.getItem('ag_token');
    if (userStr && token) {
      const user = JSON.parse(userStr);
      fetch(`${API_BASE_URL}/api/orders/my-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(orders => {
        if (Array.isArray(orders)) {
          const purchased = orders.some(order => {
            try {
              const items = JSON.parse(order.items);
              return items.some((item: any) => String(item.product_id) === String(id));
            } catch (e) { return false; }
          });
          setHasPurchased(purchased);
        }
      })
      .catch(err => console.error("Error checking purchase history:", err));
    }
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('ag_token');
    if (!token) {
      alert("Please login to submit a review");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: parseInt(id),
          rating: newReview.rating,
          comment: newReview.comment
        })
      });

      if (res.ok) {
        setNewReview({ rating: 5, comment: '' });
        // Refresh reviews
        const reviewsRes = await fetch(`${API_BASE_URL}/api/reviews/${id}`);
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData);
        alert("Review submitted successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit review");
      }
    } catch (err) {
      alert("Error submitting review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center animate-pulse">Loading product...</div>;
  if (!product || product.error) return <div className="min-h-screen flex items-center justify-center text-white/50 text-xl">Product not found.</div>;

  const productSizes = product.sizes 
    ? (typeof product.sizes === 'string' ? product.sizes.split(',').map((s: string) => s.trim()).filter(Boolean) : product.sizes)
    : ['S', 'M', 'L', 'XL'];

  return (
    <div className="container mx-auto px-4 py-20 min-h-screen bg-white">
      <Link href="/products" className="text-black/40 hover:text-black flex items-center gap-3 mb-10 text-xs font-black uppercase tracking-widest transition-all cursor-pointer w-fit underline decoration-transparent hover:decoration-black underline-offset-8">
        <span>←</span> Heritage Collection
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 items-start">
        {/* Product Image Gallery */}
        <div className="md:col-span-7 flex flex-col gap-6">
          {product.video_url ? (
            <div className="w-full bg-gray-50 rounded-[2.5rem] border border-black/[0.03] overflow-hidden relative group aspect-video shadow-2xl">
              <video 
                src={resolveImageUrl(product.video_url)} 
                controls 
                autoPlay 
                muted 
                loop 
                className="w-full h-full object-cover"
              />
            </div>
          ) : selectedImage ? (
            <div className="w-full bg-gray-50 rounded-[2.5rem] border border-black/[0.03] overflow-hidden relative group shadow-2xl">
              <img 
                src={resolveImageUrl(selectedImage)} 
                alt={product.name} 
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000" 
              />
            </div>
          ) : (
            <div className="w-full aspect-[4/5] bg-gray-50 rounded-[2.5rem] border border-black/5 flex flex-col items-center justify-center text-black/10 font-black uppercase tracking-widest text-xs">
              No Visual Feed
            </div>
          )}
          
          {/* Thumbnails below if video exists */}
          {product.video_url && allImages.length > 0 && (
             <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
                {allImages.map((img, i) => (
                  <button 
                    key={i} 
                    className="w-24 h-32 flex-shrink-0 rounded-2xl overflow-hidden border border-black/[0.05] hover:border-black/20 transition-all shadow-md"
                  >
                    <img src={resolveImageUrl(img)} className="w-full h-full object-cover" />
                  </button>
                ))}
             </div>
          )}
        </div>

        {/* Product Info (Sticky right column) */}
        <div className="md:col-span-5 relative">
          <div className="sticky top-32 flex flex-col justify-center">
            <h1 className="text-4xl md:text-6xl font-black text-black mb-4 tracking-tighter uppercase leading-none">{product.name}</h1>
            <div className="mb-8 flex items-center gap-4">
              <span className="text-4xl font-light text-black">₹{product.price}</span>
              <span className="text-xl text-black/20 line-through">₹{Math.round(product.price * 1.5)}</span>
              <span className="text-[10px] bg-red-600 text-white px-3 py-1.5 rounded-full font-black uppercase tracking-widest animate-pulse">33% OFF</span>
            </div>
            <p className="text-[10px] font-black text-black/30 mb-8 uppercase tracking-[0.3em] border-b border-black/5 pb-6">Complimentary Overnight Shipping Included</p>
            
            {allImages.length > 1 && (
              <div className="mb-10">
                <span className="font-black tracking-[0.2em] uppercase text-[10px] text-black/40 mb-5 block">Architectural Variants</span>
                <div className="flex flex-wrap gap-4">
                  {allImages.map((img, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        setSelectedImage(img);
                        setSelectedColor(`Variant ${i + 1}`);
                      }}
                      className={`w-18 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-500 ${
                        selectedImage === img 
                          ? 'border-black scale-105 shadow-2xl z-10' 
                          : 'border-black/5 hover:border-black/20 opacity-60 hover:opacity-100'
                      }`}
                      title={`Select variant ${i+1}`}
                    >
                      <img 
                        src={resolveImageUrl(img)} 
                        alt={`${product.name} Variant ${i+1}`} 
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-10">
              <div className="flex justify-between items-center mb-5">
                <span className="font-black tracking-[0.2em] uppercase text-[10px] text-black/40">Geometric Scale</span>
                <button className="text-purple-600 hover:text-black font-black text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {productSizes.map((size: string) => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black transition-all ${
                      selectedSize === size 
                        ? 'bg-black text-white shadow-2xl' 
                        : 'bg-gray-50 text-black/40 border border-black/[0.03] hover:border-black/10 hover:text-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4 mb-8">
              <div className="flex border border-black/[0.05] rounded-2xl w-1/3 h-16 bg-gray-50 overflow-hidden shadow-sm">
                <button 
                  className="w-full flex items-center justify-center text-black/40 hover:text-black hover:bg-black/5 transition-colors border-r border-black/[0.05]"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >-</button>
                <div className="w-full flex items-center justify-center font-black text-lg text-black">{quantity}</div>
                <button 
                  className="w-full flex items-center justify-center text-black/40 hover:text-black hover:bg-black/5 transition-colors border-l border-black/[0.05]"
                  onClick={() => setQuantity(quantity + 1)}
                >+</button>
              </div>
              
              <button 
                onClick={() => {
                  const cart = JSON.parse(localStorage.getItem('ag_cart') || '[]');
                  cart.push({
                    product_id: product.id,
                    name: product.name,
                    price: product.price,
                    image_url: selectedImage || product.image_url,
                    size: selectedSize,
                    color: selectedColor,
                    quantity: quantity
                  });
                  localStorage.setItem('ag_cart', JSON.stringify(cart));
                  window.dispatchEvent(new Event('cart_updated'));
                  alert('Added to cart!');
                }}
                className="w-2/3 bg-black text-white font-black uppercase tracking-[0.2em] text-[10px] h-16 rounded-2xl hover:bg-neutral-800 shadow-2xl shadow-black/10 transition-all"
              >
                Add To Cart
              </button>
            </div>
            
            <button 
              onClick={() => {
                const cart = JSON.parse(localStorage.getItem('ag_cart') || '[]');
                cart.push({
                  product_id: product.id,
                  name: product.name,
                  price: product.price,
                  image_url: selectedImage || product.image_url,
                  size: selectedSize,
                  color: selectedColor,
                  quantity: quantity
                });
                localStorage.setItem('ag_cart', JSON.stringify(cart));
                window.dispatchEvent(new Event('cart_updated'));
                window.location.href = '/cart';
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black uppercase tracking-[0.2em] text-[10px] h-16 rounded-2xl hover:opacity-90 shadow-2xl shadow-purple-500/20 transition-all mb-12"
            >
              Buy Now
            </button>
            
            <div className="bg-gray-50 border border-black/[0.03] rounded-[2rem] overflow-hidden mb-10 shadow-sm">
              <div className="p-6 border-b border-black/5 font-black uppercase tracking-widest text-[10px] flex justify-between items-center group cursor-pointer hover:bg-black/5 transition-colors text-black">
                Technical Blueprint
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-black/20 group-hover:text-black"><path d="m6 9 6 6 6-6"/></svg>
              </div>
              <div className="p-8 text-black/60 leading-relaxed text-sm bg-white/50">
                <p className="mb-6 font-medium leading-relaxed">{product.description}</p>
                <div className="grid grid-cols-2 gap-8 text-[10px] font-black uppercase tracking-widest">
                  <div>
                    <span className="block text-black/30 mb-2">Structure</span>
                    <span className="text-black">Oversized Geometries</span>
                  </div>
                  <div>
                    <span className="block text-black/30 mb-2">Matter</span>
                    <span className="text-black">100% Core Cotton</span>
                  </div>
                  <div>
                    <span className="block text-black/30 mb-2">Division</span>
                    <span className="text-black">{product.category}</span>
                  </div>
                  <div>
                    <span className="block text-black/30 mb-2">Status</span>
                    <span className="text-green-600">{product.stock > 0 ? `Active (${product.stock})` : 'Depleted'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-12 border-t border-black/5 pt-10">
              <div className="flex flex-col items-center text-center gap-4 p-6 bg-gray-50 rounded-[2rem] border border-black/[0.03] hover:shadow-xl transition-all group">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 group-hover:scale-110 transition-transform"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
                Secure Portal
              </div>
              <div className="flex flex-col items-center text-center gap-4 p-6 bg-gray-50 rounded-[2rem] border border-black/[0.03] hover:shadow-xl transition-all group">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-600 group-hover:scale-110 transition-transform"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                Zero-Gravity Ship
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-40 border-t border-black/5 pt-24">
        <div className="flex flex-col md:flex-row gap-20">
          <div className="md:w-1/3">
            <h2 className="text-5xl font-black uppercase tracking-tighter mb-6 text-black">Field Logs</h2>
            <div className="flex items-center gap-4 mb-10">
              <div className="flex items-center text-black">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={reviews.length > 0 && star <= (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ))}
              </div>
              <span className="text-black/30 font-black tracking-[0.2em] uppercase text-[10px]">
                {reviews.length} Validated Transmissions
              </span>
            </div>

            {hasPurchased ? (
              <form onSubmit={handleReviewSubmit} className="bg-gray-50 border border-black/[0.03] p-10 rounded-[2.5rem] shadow-xl">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-10 text-purple-600">Sync Field Report</h3>
                <div className="mb-8">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-black/30 mb-4">Integrity Level</label>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        type="button" 
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className={`hover:scale-125 transition-all duration-300 ${star <= newReview.rating ? 'text-black' : 'text-black/10'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={star <= newReview.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-10">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-black/30 mb-4">Transmission Data</label>
                  <textarea 
                    rows={4} 
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full bg-white border border-black/[0.05] rounded-2xl p-6 text-sm focus:border-black outline-none transition-all placeholder:text-black/20 font-medium"
                    placeholder="Provide detailed feedback..."
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmittingReview}
                  className="w-full bg-black text-white font-black uppercase tracking-widest py-5 rounded-2xl hover:bg-neutral-800 transition-all shadow-2xl disabled:opacity-50 text-[10px]"
                >
                  {isSubmittingReview ? 'Syncing...' : 'Initiate Transmission'}
                </button>
              </form>
            ) : (
              <div className="bg-gray-50 border border-black/[0.03] p-10 rounded-[2.5rem] text-center">
                <p className="text-black/30 text-[10px] font-black uppercase tracking-[0.2em] leading-loose">
                  Acquisition required for <br/> field report validation.
                </p>
              </div>
            )}
          </div>

          <div className="md:w-2/3">
            <div className="space-y-12">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="pb-12 border-b border-black/5 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="font-black text-black tracking-tighter uppercase text-xl leading-none mb-2">{review.user_name}</h4>
                        <p className="text-[9px] text-black/30 font-black uppercase tracking-[0.3em] mt-1">
                          Transmission Sync: {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex text-black">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={star <= review.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-black/70 leading-relaxed font-medium text-lg italic">"{review.comment}"</p>
                  </div>
                ))
              ) : (
                <div className="h-80 flex flex-col items-center justify-center border-2 border-dashed border-black/5 rounded-[3rem] bg-gray-50/50">
                  <p className="text-black/10 font-black uppercase tracking-[0.4em] text-xs">Transmission Silence</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
