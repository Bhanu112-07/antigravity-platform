"use client";
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

// Icons
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
const ProductsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/><path d="M10 22h4"/></svg>;
const OrdersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0 });
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Category Form State
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  // Product Form State
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', category: 'Men', image_url: '', stock: '', colors: '', sizes: '', image_urls: [], video_url: '', is_bestseller: 0 });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('ag_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (activeTab === 'dashboard') {
        const statsRes = await fetch(`${API_BASE_URL}/api/admin/stats`, { headers: getAuthHeaders() });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
        
        const ordersRes = await fetch(`${API_BASE_URL}/api/admin/orders`, { headers: getAuthHeaders() });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        }
      } else if (activeTab === 'products') {
        const prodRes = await fetch(`${API_BASE_URL}/api/products`);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData);
        }
      } else if (activeTab === 'orders') {
        const ordersRes = await fetch(`${API_BASE_URL}/api/admin/orders`, { headers: getAuthHeaders() });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        } else {
          setError('Failed to fetch orders. Make sure you are an admin.');
        }
      } else if (activeTab === 'categories') {
        const catRes = await fetch(`${API_BASE_URL}/api/admin/categories`, { headers: getAuthHeaders() });
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('ag_token');
    localStorage.removeItem('ag_user');
    window.location.href = '/login';
  };

  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchDashboardData();
      } else {
        const errorData = await res.json();
        alert('Failed to update status: ' + (errorData.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct 
        ? `${API_BASE_URL}/api/products/${editingProduct.id}` 
        : `${API_BASE_URL}/api/products`;
      
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('category', productForm.category);
      formData.append('stock', productForm.stock);
      formData.append('sizes', productForm.sizes);
      formData.append('is_bestseller', String(productForm.is_bestseller));
      
      if (videoFile) {
        formData.append('video', videoFile);
      } else {
        formData.append('video_url', productForm.video_url);
      }
      
      if (productForm.image_urls && productForm.image_urls.length > 0) {
        formData.append('existing_image_urls', JSON.stringify(productForm.image_urls));
      }

      if (imageFiles.length > 0) {
        imageFiles.forEach(file => formData.append('images', file));
      } else if (productForm.image_url) {
        formData.append('image_url', productForm.image_url);
      }

      const token = localStorage.getItem('ag_token');
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        setShowProductForm(false);
        setEditingProduct(null);
        setProductForm({ name: '', description: '', price: '', category: 'Men', image_url: '', stock: '', colors: '', sizes: '', image_urls: [], video_url: '', is_bestseller: 0 });
        setImageFiles([]);
        setVideoFile(null);
        fetchDashboardData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save product');
      }
    } catch (err) {
      alert('Error saving product');
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryForm)
      });
      if (res.ok) {
        setCategoryForm({ name: '', description: '' });
        setShowCategoryForm(false);
        fetchDashboardData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add category');
      }
    } catch (err) {
      alert('Error adding category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure? Products in this category will remain, but the category itself will be gone.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchDashboardData();
      } else {
        alert('Failed to delete category');
      }
    } catch (err) {
      alert('Error deleting category');
    }
  };

  const openEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url || '',
      stock: product.stock.toString(),
      colors: product.colors || '',
      sizes: product.sizes || '',
      image_urls: product.image_urls ? (typeof product.image_urls === 'string' ? JSON.parse(product.image_urls) : product.image_urls) : [],
      video_url: product.video_url || '',
      is_bestseller: product.is_bestseller || 0
    });
    setImageFiles([]);
    setVideoFile(null);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchDashboardData();
      } else {
        alert('Failed to delete product');
      }
    } catch (e) {
      alert('Error deleting product');
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchDashboardData();
        setSelectedOrder(null);
      } else {
        alert('Failed to delete order');
      }
    } catch (err) {
      alert('Error deleting order');
    }
  };

  const handleShipRocket = async (orderId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/ship`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        alert('Order successfully pushed to Shiprocket! Order ID: ' + data.shiprocketOrder.order_id);
        fetchDashboardData();
        setSelectedOrder(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to ship via Shiprocket');
      }
    } catch (err) {
      alert('Error connecting to Shiprocket service');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row">
      {/* Sidebar sidebar */}
      <aside className="w-full md:w-64 bg-white/5 border-r border-white/10 p-6 flex flex-col min-h-full">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 uppercase tracking-tighter mb-10">
          Admin Panel
        </h2>
        
        <nav className="flex-grow space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <DashboardIcon />
            <span className="font-bold text-sm">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'products' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <ProductsIcon />
            <span className="font-bold text-sm">Products</span>
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <OrdersIcon />
            <span className="font-bold text-sm">Orders</span>
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'categories' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 6 4 14H4L8 6Z"/><path d="M12 2v4"/><path d="m8 10 8 4"/><path d="m16 10-8 4"/></svg>
            <span className="font-bold text-sm">Categories</span>
          </button>
        </nav>
        
        <div className="mt-auto pt-10">
          <button onClick={handleLogout} className="w-full py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-bold transition-colors">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto h-screen">
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded mb-6">{error}</div>}
        
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="w-10 h-10 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin"></span>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="animate-in fade-in duration-500">
                <h1 className="text-3xl font-bold mb-8">Overview</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-xl border-l-4 border-l-purple-500 shadow-lg">
                    <p className="text-white/50 text-sm font-semibold mb-2 uppercase tracking-wider">Total Revenue</p>
                    <h3 className="text-3xl font-black text-white">
                      ₹{stats.revenue?.toLocaleString() || 0}
                    </h3>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-xl border-l-4 border-l-cyan-500 shadow-lg">
                    <p className="text-white/50 text-sm font-semibold mb-2 uppercase tracking-wider">Total Orders</p>
                    <h3 className="text-3xl font-black text-white">{stats.orders}</h3>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-xl border-l-4 border-l-green-500 shadow-lg">
                    <p className="text-white/50 text-sm font-semibold mb-2 uppercase tracking-wider">Customers</p>
                    <h3 className="text-3xl font-black text-white">{stats.users}</h3>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-xl border-l-4 border-l-blue-500 shadow-lg">
                    <p className="text-white/50 text-sm font-semibold mb-2 uppercase tracking-wider">Products</p>
                    <h3 className="text-3xl font-black text-white">{stats.products}</h3>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Recent Orders</h2>
                  <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-xl">
                    <table className="w-full text-left text-sm">
                      <thead className="text-white/50 border-b border-white/10">
                        <tr>
                          <th className="p-4 font-semibold">Order ID</th>
                          <th className="p-4 font-semibold">Customer Email</th>
                          <th className="p-4 font-semibold">Date</th>
                          <th className="p-4 font-semibold">Amount</th>
                          <th className="p-4 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-mono text-xs">#{order.id}</td>
                            <td className="p-4 font-semibold">{order.user_email}</td>
                            <td className="p-4 text-white/60">{new Date(order.created_at).toLocaleDateString()}</td>
                            <td className="p-4 font-bold">₹{order.total_amount}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 border rounded text-xs font-bold uppercase ${
                                order.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                'bg-white/10 text-white/70 border-white/20'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {orders.length === 0 && (
                          <tr><td colSpan={5} className="p-8 text-center text-white/40">No orders found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold">Manage Products</h1>
                  <button 
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({ name: '', description: '', price: '', category: 'Men', image_url: '', stock: '', colors: '', sizes: '', image_urls: [], video_url: '', is_bestseller: 0 });
                      setImageFiles([]);
                      setVideoFile(null);
                      setShowProductForm(!showProductForm);
                    }}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 flex items-center gap-2 rounded text-sm font-bold shadow-lg transition-colors"
                  >
                    {showProductForm ? 'Cancel' : '+ Add Product'}
                  </button>
                </div>

                {showProductForm && (
                  <div className="bg-white/5 border border-purple-500/30 p-6 rounded-xl mb-8 animate-in slide-in-from-top-4 duration-300">
                    <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                    <form onSubmit={handleProductSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-white/60 mb-1">Product Name</label>
                          <input type="text" required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-black border border-white/20 rounded p-2 focus:border-purple-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">Price (₹)</label>
                          <input type="number" step="0.01" required value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full bg-black border border-white/20 rounded p-2 focus:border-purple-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">Category</label>
                          <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full bg-black border border-white/20 rounded p-2 focus:border-purple-500 outline-none text-white appearance-none">
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                            {categories.length === 0 && (
                              <>
                                <option value="Men">Men</option>
                                <option value="Women">Women</option>
                                <option value="Accessories">Accessories</option>
                              </>
                            )}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">Stock</label>
                          <input type="number" required value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="w-full bg-black border border-white/20 rounded p-2 focus:border-purple-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">Colors (Comma separated)</label>
                          <input type="text" value={productForm.colors} onChange={e => setProductForm({...productForm, colors: e.target.value})} className="w-full bg-black border border-white/20 rounded p-2 focus:border-purple-500 outline-none placeholder:text-white/20" placeholder="Black, White, Neon" />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">Sizes (Comma separated)</label>
                          <input type="text" value={productForm.sizes} onChange={e => setProductForm({...productForm, sizes: e.target.value})} className="w-full bg-black border border-white/20 rounded p-2 focus:border-purple-500 outline-none placeholder:text-white/20" placeholder="S, M, L, XL" />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">Bestseller Video (MP4)</label>
                          <input 
                            type="file" 
                            accept="video/mp4,video/x-m4v,video/*" 
                            onChange={e => {
                              if (e.target.files) setVideoFile(e.target.files[0]);
                            }} 
                            className="w-full bg-black border border-white/20 rounded p-2 focus:border-purple-500 outline-none text-sm text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer" 
                          />
                          {(videoFile || productForm.video_url) && (
                            <div className="mt-2 flex items-center gap-2 text-[10px] text-cyan-400 font-mono">
                              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                              {videoFile ? `New Video ready: ${videoFile.name}` : 'Current video preserved'}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <input 
                            type="checkbox" 
                            id="is_bestseller"
                            checked={productForm.is_bestseller === 1} 
                            onChange={e => setProductForm({...productForm, is_bestseller: e.target.checked ? 1 : 0})} 
                            className="w-5 h-5 accent-purple-500"
                          />
                          <label htmlFor="is_bestseller" className="text-sm font-bold uppercase tracking-wider cursor-pointer">Mark as Bestseller</label>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm text-white/60 mb-1">Product Images (Select up to 5)</label>
                          <input type="file" multiple accept="image/*" onChange={e => {
                            if (e.target.files) setImageFiles(Array.from(e.target.files));
                          }} className="w-full bg-black border border-white/20 rounded p-2 focus:border-purple-500 outline-none text-sm text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer" />
                          
                          {editingProduct && productForm.image_urls && productForm.image_urls.length > 0 && imageFiles.length === 0 && (
                            <div className="mt-2 flex gap-3 flex-wrap">
                              {productForm.image_urls.map((url: string, i: number) => (
                                <div key={i} className="relative group">
                                  <img src={url} alt={`Current image ${i+1}`} className="h-16 w-16 object-cover rounded border border-white/20" />
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      const newUrls = [...productForm.image_urls];
                                      newUrls.splice(i, 1);
                                      setProductForm({ ...productForm, image_urls: newUrls });
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-400 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {!productForm.image_urls?.length && productForm.image_url && imageFiles.length === 0 && (
                            <div className="relative group w-max mt-2">
                              <img src={productForm.image_url} alt="Current fallback image" className="h-16 w-16 object-cover rounded border border-white/20" />
                              <button 
                                type="button"
                                onClick={() => setProductForm({ ...productForm, image_url: '' })}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-400 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm text-white/60 mb-1">Description</label>
                          <textarea rows={3} value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full bg-black border border-white/20 rounded p-2 focus:border-purple-500 outline-none"></textarea>
                        </div>
                      </div>
                      <button type="submit" className="bg-white text-black font-bold px-6 py-2 rounded hover:bg-gray-200 transition-colors uppercase text-sm tracking-wider">
                        {editingProduct ? 'Update Product' : 'Save Product'}
                      </button>
                    </form>
                  </div>
                )}

                <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="text-white/50 border-b border-white/10 bg-black/50">
                      <tr>
                        <th className="p-4 font-semibold">Product</th>
                        <th className="p-4 font-semibold">Category</th>
                        <th className="p-4 font-semibold">Price</th>
                        <th className="p-4 font-semibold">Stock</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded flex-shrink-0 overflow-hidden">
                              {product.image_url && (
                                <img 
                                  src={product.image_url.startsWith('http') ? product.image_url : `http://localhost:5000${product.image_url.startsWith('/') ? '' : '/'}${product.image_url}`} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover" 
                                />
                              )}
                            </div>
                            <span className="font-semibold">{product.name}</span>
                          </td>
                          <td className="p-4 text-white/70">{product.category}</td>
                          <td className="p-4 font-bold">₹{product.price}</td>
                          <td className="p-4">{product.stock}</td>
                          <td className="p-4 text-right flex justify-end gap-2">
                            <button onClick={() => openEditProduct(product)} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-bold transition-colors">Edit</button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded text-xs font-bold transition-colors">Delete</button>
                          </td>
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-white/40">No products found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="animate-in fade-in duration-500">
                <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>
                
                <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="text-white/50 border-b border-white/10 bg-black/50">
                      <tr>
                        <th className="p-4 font-semibold uppercase tracking-wider">Order ID</th>
                        <th className="p-4 font-semibold uppercase tracking-wider">Customer</th>
                        <th className="p-4 font-semibold uppercase tracking-wider">Date</th>
                        <th className="p-4 font-semibold uppercase tracking-wider">Amount</th>
                        <th className="p-4 font-semibold uppercase tracking-wider">Status</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono text-xs">#{order.id}</td>
                          <td className="p-4 font-semibold">
                            {order.user_name} <br/>
                            <span className="text-xs font-normal text-white/50">{order.user_email}</span>
                          </td>
                          <td className="p-4 text-white/60">{new Date(order.created_at).toLocaleString()}</td>
                          <td className="p-4 font-bold">₹{order.total_amount}</td>
                          <td className="p-4">
                            <select 
                              value={order.status}
                              onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                              className={`bg-black border rounded p-2 text-xs font-bold uppercase outline-none focus:border-white transition-colors cursor-pointer ${
                                order.status === 'completed' ? 'text-green-400 border-green-500/30' :
                                order.status === 'pending' ? 'text-yellow-400 border-yellow-500/30' :
                                'text-white/70 border-white/20'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => setSelectedOrder(order)}
                                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                              >
                                View Details
                              </button>
                              <button 
                                onClick={() => handleDeleteOrder(order.id)}
                                className="px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center text-white/40">No orders found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Order Details Modal */}
                {selectedOrder && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h2 className="text-xl font-black uppercase tracking-widest">Order Details #{selectedOrder.id}</h2>
                        <button onClick={() => setSelectedOrder(null)} className="text-white/50 hover:text-white transition-colors text-2xl">&times;</button>
                      </div>
                      
                      <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                        {/* Customer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/5 p-6 rounded-xl border border-white/5">
                          <div>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Order Details</p>
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs text-white/30 uppercase tracking-tighter">Customer Name</p>
                                <p className="font-bold">{selectedOrder.customer_name || selectedOrder.user_name || 'Guest'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-white/30 uppercase tracking-tighter">Email</p>
                                <p className="font-semibold text-sm">{selectedOrder.customer_email || selectedOrder.user_email}</p>
                              </div>
                              <div>
                                <p className="text-xs text-white/30 uppercase tracking-tighter">Phone</p>
                                <p className="font-semibold text-sm">{selectedOrder.customer_phone || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Shipping Info</p>
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs text-white/30 uppercase tracking-tighter">Address</p>
                                <p className="text-sm font-medium leading-relaxed">{selectedOrder.shipping_address || 'N/A'}</p>
                              </div>
                              <div className="flex gap-8">
                                <div>
                                  <p className="text-xs text-white/30 uppercase tracking-tighter">City</p>
                                  <p className="font-bold text-sm tracking-wide">{selectedOrder.city || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-white/30 uppercase tracking-tighter">PIN Code</p>
                                  <p className="font-bold text-sm tracking-widest">{selectedOrder.pin_code || 'N/A'}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-white/30 uppercase tracking-tighter">Payment</p>
                                <p className="font-bold text-xs uppercase tracking-widest bg-purple-500/20 text-purple-300 px-2 py-1 rounded inline-block">
                                  {selectedOrder.payment_method || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {selectedOrder.shiprocket_order_id && (
                          <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-xl flex justify-between items-center">
                            <div>
                              <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-1">Shiprocket Sync Active</p>
                              <p className="text-sm font-mono">Order ID: <span className="text-white">{selectedOrder.shiprocket_order_id}</span></p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-white/40 uppercase tracking-tighter">Shipment ID</p>
                              <p className="text-xs font-mono text-white/70">{selectedOrder.shiprocket_shipment_id}</p>
                            </div>
                          </div>
                        )}

                        {/* Order Items */}
                        <div>
                          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Line Items</p>
                          <div className="space-y-4">
                            {(() => {
                              try {
                                const items = JSON.parse(selectedOrder.items || '[]');
                                if (items.length === 0) return <p className="text-white/40 italic">No item details available for this order.</p>;
                                return items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/[0.07] transition-colors">
                                    <div className="w-12 h-16 bg-black/50 rounded overflow-hidden flex-shrink-0 border border-white/10">
                                      {item.image_url && (
                                        <img 
                                          src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:5000${item.image_url.startsWith('/') ? '' : '/'}${item.image_url}`} 
                                          alt={item.name} 
                                          className="w-full h-full object-cover" 
                                        />
                                      )}
                                    </div>
                                    <div className="flex-grow">
                                      <p className="font-bold text-sm tracking-tight">{item.name}</p>
                                      <div className="flex gap-3 mt-1.5">
                                        <div className="flex flex-col">
                                          <span className="text-[9px] uppercase font-bold text-white/20 tracking-tighter">Size</span>
                                          <span className="text-[11px] font-black text-white/70">{item.size || 'N/A'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-[9px] uppercase font-bold text-white/20 tracking-tighter">Quantity</span>
                                          <span className="text-[11px] font-black text-white/70">{item.quantity}</span>
                                        </div>
                                        {item.color && (
                                          <div className="flex flex-col">
                                            <span className="text-[9px] uppercase font-bold text-white/20 tracking-tighter">Color</span>
                                            <span className="text-[11px] font-black text-white/70">{item.color}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">₹{item.price * item.quantity}</p>
                                    </div>
                                  </div>
                                ));
                              } catch (e) {
                                return <p className="text-white/40 italic">Error parsing order items.</p>;
                              }
                            })()}
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div className="border-t border-white/10 pt-6 mt-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] mb-1">Total Billable</p>
                              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 text-4xl">₹{selectedOrder.total_amount}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] mb-1">Status</p>
                              <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/80 border border-white/20">
                                {selectedOrder.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-white/5 border-t border-white/10 flex justify-end gap-4">
                        {!selectedOrder.shiprocket_order_id && (
                          <button 
                            onClick={() => handleShipRocket(selectedOrder.id)}
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-black uppercase tracking-widest text-xs hover:opacity-90 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
                          >
                            Ship with Shiprocket
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedOrder(null)}
                          className="px-6 py-2 border border-white/20 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold">Manage Categories</h1>
                  <button 
                    onClick={() => setShowCategoryForm(!showCategoryForm)}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 flex items-center gap-2 rounded text-sm font-bold shadow-lg transition-colors"
                  >
                    {showCategoryForm ? 'Cancel' : '+ Add Category'}
                  </button>
                </div>

                {showCategoryForm && (
                  <div className="bg-white/5 border border-purple-500/30 p-6 rounded-xl mb-8 animate-in slide-in-from-top-4 duration-300">
                    <h2 className="text-xl font-bold mb-4">Add New Category</h2>
                    <form onSubmit={handleCategorySubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-white/60 mb-1">Category Name</label>
                          <input 
                            type="text" 
                            required 
                            value={categoryForm.name} 
                            onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} 
                            className="w-full bg-black border border-white/20 rounded p-2 focus:border-purple-500 outline-none" 
                            placeholder="e.g., Summer Wear"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">Description</label>
                          <input 
                            type="text" 
                            value={categoryForm.description} 
                            onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} 
                            className="w-full bg-black border border-white/20 rounded p-2 focus:border-purple-500 outline-none" 
                            placeholder="Brief description"
                          />
                        </div>
                      </div>
                      <button type="submit" className="bg-white text-black font-bold px-6 py-2 rounded hover:bg-gray-200 transition-colors uppercase text-sm tracking-wider">
                        Save Category
                      </button>
                    </form>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((cat) => (
                    <div key={cat.id} className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-purple-500/30 transition-all group relative">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{cat.name}</h3>
                          <p className="text-white/40 text-xs mt-1">{cat.description || 'No description provided'}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="text-white/20 hover:text-red-500 transition-colors p-2"
                          title="Delete Category"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                        Active Category
                      </div>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div className="col-span-full p-20 text-center border-2 border-dashed border-white/5 rounded-2xl">
                      <p className="text-white/20 font-bold uppercase tracking-widest text-sm">No custom categories found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
