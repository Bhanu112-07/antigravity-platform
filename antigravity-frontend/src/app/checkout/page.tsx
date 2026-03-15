"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    pinCode: '',
    paymentMethod: 'UPI'
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('ag_cart') || '[]');
    setCart(savedCart);
    
    // Autofill if user is logged in
    const user = JSON.parse(localStorage.getItem('ag_user') || '{}');
    if (user.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || ''
      }));
    }
  }, []);

  const orderTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem('ag_token');
    if (!token) {
      alert('Please login to place an order');
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          total_amount: orderTotal,
          customer_name: `${formData.firstName} ${formData.lastName}`,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_address: formData.address,
          city: formData.city,
          pin_code: formData.pinCode,
          payment_method: formData.paymentMethod
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert('Order Placed Successfully!');
        localStorage.removeItem('ag_cart');
        window.dispatchEvent(new Event('cart_updated'));
        router.push('/account');
      } else {
        alert(data.error || 'Failed to place order');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-black uppercase mb-6">Your cart is empty</h1>
          <Link href="/products" className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-gray-200 transition-all">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column - Steps */}
          <div className="flex-grow">
            {/* Step Indicators */}
            <div className="flex justify-between mb-8 relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 z-0"></div>
              <div className="absolute top-1/2 left-0 h-0.5 bg-purple-500 transition-all duration-500 z-0" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
              
              <div className={`relative z-10 font-bold flex flex-col items-center gap-2 ${step >= 1 ? 'text-purple-400' : 'text-white/30'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-purple-500 bg-black' : 'border-white/10 bg-black'}`}>1</div>
                <span className="text-xs uppercase tracking-widest hidden sm:block">Details</span>
              </div>
              <div className={`relative z-10 font-bold flex flex-col items-center gap-2 ${step >= 2 ? 'text-purple-400' : 'text-white/30'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-purple-500 bg-black' : 'border-white/10 bg-black'}`}>2</div>
                <span className="text-xs uppercase tracking-widest hidden sm:block">Shipping</span>
              </div>
              <div className={`relative z-10 font-bold flex flex-col items-center gap-2 ${step >= 3 ? 'text-purple-400' : 'text-white/30'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-purple-500 bg-black' : 'border-white/10 bg-black'}`}>3</div>
                <span className="text-xs uppercase tracking-widest hidden sm:block">Payment</span>
              </div>
            </div>

            {/* Forms based on step */}
            <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl backdrop-blur-sm">
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Contact Information</h2>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all" 
                      placeholder="you@example.com" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all" 
                      placeholder="+91" 
                    />
                  </div>
                  <button onClick={() => setStep(2)} className="w-full mt-6 bg-white text-black font-black uppercase tracking-widest py-4 rounded-lg hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    Continue to Shipping
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Shipping Address</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/60 mb-2">First Name</label>
                      <input 
                        type="text" 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:border-purple-500 outline-none transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Last Name</label>
                      <input 
                        type="text" 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:border-purple-500 outline-none transition-all" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Address</label>
                    <input 
                      type="text" 
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:border-purple-500 outline-none transition-all" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/60 mb-2">City</label>
                      <input 
                        type="text" 
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:border-purple-500 outline-none transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">PIN Code</label>
                      <input 
                        type="text" 
                        name="pinCode"
                        value={formData.pinCode}
                        onChange={handleInputChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:border-purple-500 outline-none transition-all" 
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button onClick={() => setStep(1)} className="w-1/3 py-4 border border-white/20 text-white font-bold uppercase tracking-widest rounded-lg hover:bg-white/5 transition-colors">
                      Back
                    </button>
                    <button onClick={() => setStep(3)} className="w-2/3 bg-white text-black font-black uppercase tracking-widest py-4 rounded-lg hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Payment Method</h2>
                  
                  <div className="space-y-4">
                    <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${formData.paymentMethod === 'UPI' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-black/50'}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="UPI"
                        checked={formData.paymentMethod === 'UPI'}
                        onChange={handleInputChange}
                        className="w-5 h-5 accent-purple-500" 
                      />
                      <span className="font-bold">UPI (GPay, PhonePe, Paytm)</span>
                    </label>
                    <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${formData.paymentMethod === 'CARD' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-black/50'}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="CARD"
                        checked={formData.paymentMethod === 'CARD'}
                        onChange={handleInputChange}
                        className="w-5 h-5 accent-purple-500" 
                      />
                      <span className="font-bold">Credit / Debit Card</span>
                    </label>
                    <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${formData.paymentMethod === 'COD' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-black/50'}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="COD"
                        checked={formData.paymentMethod === 'COD'}
                        onChange={handleInputChange}
                        className="w-5 h-5 accent-purple-500" 
                      />
                      <span className="font-bold">Cash on Delivery</span>
                    </label>
                  </div>
                  
                  <div className="flex gap-4 mt-8">
                    <button onClick={() => setStep(2)} className="w-1/3 py-4 border border-white/20 text-white font-bold uppercase tracking-widest rounded-lg hover:bg-white/5 transition-colors">
                      Back
                    </button>
                    <button 
                      onClick={handlePlaceOrder} 
                      disabled={loading}
                      className="w-2/3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black uppercase tracking-widest py-4 rounded-lg hover:opacity-90 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : `Pay ₹${orderTotal}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl sticky top-28 backdrop-blur-sm">
              <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-20 h-24 bg-gradient-to-br from-purple-900/40 to-cyan-900/40 rounded border border-white/10 flex-shrink-0 overflow-hidden">
                      {item.image_url ? (
                        <img 
                          src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:5000${item.image_url.startsWith('/') ? '' : '/'}${item.image_url}`} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-white/20">IMG</div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-sm text-white tracking-tight">{item.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded">S: {item.size}</span>
                        <span className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded">Q: {item.quantity}</span>
                        {item.color && <span className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded truncate max-w-[60px]">{item.color}</span>}
                      </div>
                      <p className="font-bold text-xs mt-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-white/10 pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span>₹{orderTotal}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Shipping</span>
                  <span className="text-green-400">Free</span>
                </div>
                <div className="border-t border-white/10 pt-4 flex justify-between font-bold text-xl h-[40px] items-center">
                  <span>Total</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">₹{orderTotal}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

