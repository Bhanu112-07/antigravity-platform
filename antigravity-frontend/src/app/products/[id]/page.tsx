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
    <div className="container mx-auto px-4 py-12">
      <Link href="/products" className="text-white/50 hover:text-white flex items-center gap-2 mb-8 text-sm transition-colors cursor-pointer w-fit">
        <span>←</span> Back to products
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 items-start">
        {/* Product Image Gallery */}
        <div className="md:col-span-7 flex flex-col gap-4">
          {selectedImage ? (
            <div className="w-full bg-white/5 rounded-xl border border-white/10 overflow-hidden relative group">
              <img 
                src={resolveImageUrl(selectedImage)} 
                alt={product.name} 
                className="w-full h-auto object-cover" 
              />
            </div>
          ) : (
            <div className="w-full aspect-[4/5] bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center text-white/20">
              No Image
            </div>
          )}
        </div>

        {/* Product Info (Sticky right column) */}
        <div className="md:col-span-5 relative">
          <div className="sticky top-28 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight uppercase leading-tight">{product.name}</h1>
            <div className="mb-6 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-white">₹{product.price}</span>
              <span className="text-xl text-white/40 line-through">₹{Math.round(product.price * 1.5)}</span>
              <span className="text-sm font-bold text-green-400">33% OFF</span>
            </div>
            <p className="text-xs text-white/50 mb-6 uppercase tracking-widest border-b border-white/10 pb-4">Inclusive of all taxes</p>
            
            {allImages.length > 1 && (
              <div className="mb-6">
                <span className="font-bold tracking-wide uppercase text-sm mb-4 block">Select Color / Style</span>
                <div className="flex flex-wrap gap-3">
                  {allImages.map((img, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        setSelectedImage(img);
                        setSelectedColor(`Variant ${i + 1}`);
                      }}
                      className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === img 
                          ? 'border-cyan-400 scale-105 shadow-[0_0_15px_rgba(34,211,238,0.5)] z-10' 
                          : 'border-white/10 hover:border-white/50 opacity-60 hover:opacity-100'
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

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold tracking-wide uppercase text-sm">Size</span>
                <button className="text-purple-400 hover:text-cyan-400 font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg>
                  Size Chart
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {productSizes.map((size: string) => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 border rounded-lg flex items-center justify-center font-bold transition-all ${
                      selectedSize === size 
                        ? 'bg-gradient-to-br from-purple-500/20 to-cyan-500/20 text-white border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
                        : 'bg-white/5 text-white/70 border-white/10 hover:border-white/40 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4 mb-8">
              <div className="flex border border-white/20 rounded-lg w-1/3 h-14 bg-white/5 overflow-hidden">
                <button 
                  className="w-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors border-r border-white/10"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >-</button>
                <div className="w-full flex items-center justify-center font-bold text-lg">{quantity}</div>
                <button 
                  className="w-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors border-l border-white/10"
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
                className="w-2/3 bg-white text-black font-black uppercase tracking-widest h-14 rounded-lg hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all"
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
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black uppercase tracking-widest h-14 rounded-lg hover:opacity-90 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all mb-10"
            >
              Buy It Now
            </button>
            
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-6">
              <div className="p-4 border-b border-white/10 font-bold uppercase tracking-widest text-sm flex justify-between items-center group cursor-pointer hover:bg-white/5 transition-colors">
                Product Details
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50 group-hover:text-white"><path d="m6 9 6 6 6-6"/></svg>
              </div>
              <div className="p-4 text-white/70 leading-relaxed text-sm bg-black/30">
                <p className="mb-4">{product.description}</p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-white/40 uppercase tracking-wider mb-1">Fit</span>
                    <span className="font-semibold text-white">Oversized Fit</span>
                  </div>
                  <div>
                    <span className="block text-white/40 uppercase tracking-wider mb-1">Fabric</span>
                    <span className="font-semibold text-white">100% Cotton</span>
                  </div>
                  <div>
                    <span className="block text-white/40 uppercase tracking-wider mb-1">Category</span>
                    <span className="font-semibold text-white">{product.category}</span>
                  </div>
                  <div>
                    <span className="block text-white/40 uppercase tracking-wider mb-1">Stock</span>
                    <span className="font-semibold text-green-400">{product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold uppercase tracking-widest text-white/60 mb-8 border-t border-white/10 pt-8">
              <div className="flex flex-col items-center text-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
                Secure Checkout
              </div>
              <div className="flex flex-col items-center text-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                Free Delivery
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-32 border-t border-white/10 pt-20">
        <div className="flex flex-col md:flex-row gap-16">
          <div className="md:w-1/3">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-white">Client Intel</h2>
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={reviews.length > 0 && star <= (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ))}
              </div>
              <span className="text-white/60 font-bold tracking-widest uppercase text-sm">
                {reviews.length} Feedbacks
              </span>
            </div>

            {hasPurchased ? (
              <form onSubmit={handleReviewSubmit} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                <h3 className="text-lg font-bold uppercase tracking-widest mb-6 text-purple-400">Write a Review</h3>
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        type="button" 
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className={`hover:scale-110 transition-transform ${star <= newReview.rating ? 'text-yellow-400' : 'text-white/20'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={star <= newReview.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Comment</label>
                  <textarea 
                    rows={4} 
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-purple-500 outline-none transition-colors"
                    placeholder="Shared your transmission..."
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmittingReview}
                  className="w-full bg-white text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Transmitting...' : 'Submit Feedback'}
                </button>
              </form>
            ) : (
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-loose">
                  You must purchase this gear before you can provide field intel.
                </p>
              </div>
            )}
          </div>

          <div className="md:w-2/3">
            <div className="space-y-8">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="pb-8 border-b border-white/5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-white tracking-wide uppercase">{review.user_name}</h4>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">
                          {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={star <= review.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-white/70 leading-relaxed italic text-sm">"{review.comment}"</p>
                  </div>
                ))
              ) : (
                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl">
                  <p className="text-white/20 font-bold uppercase tracking-[0.2em] text-sm italic">Transmission Silence</p>
                  <p className="text-white/10 text-[10px] uppercase mt-2">Be the first to leave intel.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
