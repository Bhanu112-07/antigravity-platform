"use client";
import React, { useState, useEffect } from 'react';
import { API_BASE_URL, resolveImageUrl } from '@/lib/api';

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
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', category: 'T-Shirt', image_url: '', stock: '', colors: '', sizes: '', image_urls: [], video_url: '', is_bestseller: 0 });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{show: boolean, title: string, message: string, onConfirm: () => void} | null>(null);

  // FAB Form State
  const [fabForm, setFabForm] = useState({ 
    title: '', 
    stat1_title: '', 
    stat1_subtitle: '', 
    stat2_title: '', 
    stat2_subtitle: '', 
    video_url: '' 
  });
  const [fabReelFile, setFabReelFile] = useState<File | null>(null);
  const [savingFab, setSavingFab] = useState(false);

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
      } else if (activeTab === 'fab') {
        const fabRes = await fetch(`${API_BASE_URL}/api/site/fab`);
        if (fabRes.ok) {
          const fabData = await fabRes.json();
          setFabForm(fabData);
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
        setProductForm({ name: '', description: '', price: '', category: 'T-Shirt', image_url: '', stock: '', colors: '', sizes: '', image_urls: [], video_url: '', is_bestseller: 0 });
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
    setConfirmModal({
      show: true,
      title: 'Delete Category',
      message: 'Are you sure? Products in this category will remain, but the category itself will be gone.',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/admin/categories/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          });
          if (res.ok) {
            fetchDashboardData();
            setConfirmModal(null);
          } else {
            const errorData = await res.json();
            alert('Failed to delete category: ' + (errorData.error || 'Unknown error'));
          }
        } catch (err) {
          alert('Error deleting category');
        }
      }
    });
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
    setConfirmModal({
      show: true,
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product from inventory?',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          });
          if (res.ok) {
            fetchDashboardData();
            setConfirmModal(null);
          } else {
            const errorData = await res.json();
            alert('Failed to delete product: ' + (errorData.error || 'Unknown error'));
          }
        } catch (e) {
          alert('Error deleting product');
        }
      }
    });
  };

  const handleDeleteOrder = async (id: string) => {
    setConfirmModal({
      show: true,
      title: 'Erase Order Record',
      message: 'Are you sure you want to permanently delete this order record? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/admin/orders/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          });
          if (res.ok) {
            fetchDashboardData();
            setSelectedOrder(null);
            setConfirmModal(null);
          } else {
            const errorData = await res.json();
            alert('Failed to delete order: ' + (errorData.error || 'Unknown error'));
          }
        } catch (err) {
          alert('Error deleting order');
        }
      }
    });
  };

  const handleFabUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingFab(true);
      const formData = new FormData();
      formData.append('title', fabForm.title);
      formData.append('stat1_title', fabForm.stat1_title);
      formData.append('stat1_subtitle', fabForm.stat1_subtitle);
      formData.append('stat2_title', fabForm.stat2_title);
      formData.append('stat2_subtitle', fabForm.stat2_subtitle);
      formData.append('existing_video_url', fabForm.video_url);
      
      if (fabReelFile) {
        formData.append('video', fabReelFile);
      }

      const res = await fetch(`${API_BASE_URL}/api/site/fab/sqlite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ag_token')}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setFabForm(prev => ({ ...prev, video_url: data.video_url }));
        setFabReelFile(null);
        alert('FAB Section updated successfully!');
      } else {
        alert('Failed to update FAB section');
      }
    } catch (err) {
      alert('Error updating FAB section');
    } finally {
      setSavingFab(false);
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
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-black/5 p-8 flex flex-col min-h-full shadow-2xl z-20">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-600 uppercase tracking-tighter mb-12">
          Management
        </h2>
        
        <nav className="flex-grow space-y-3">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-black text-white shadow-2xl scale-105' : 'text-black/40 hover:text-black hover:bg-black/5'}`}
          >
            <DashboardIcon />
            <span className="font-black text-[10px] uppercase tracking-widest">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'products' ? 'bg-black text-white shadow-2xl scale-105' : 'text-black/40 hover:text-black hover:bg-black/5'}`}
          >
            <ProductsIcon />
            <span className="font-black text-[10px] uppercase tracking-widest">Inventory</span>
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'orders' ? 'bg-black text-white shadow-2xl scale-105' : 'text-black/40 hover:text-black hover:bg-black/5'}`}
          >
            <OrdersIcon />
            <span className="font-black text-[10px] uppercase tracking-widest">Orders</span>
          </button>
          <button onClick={() => setActiveTab('categories')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'categories' ? 'bg-black text-white shadow-xl' : 'text-black/40 hover:bg-black/5'}`}>
                <div className={`${activeTab === 'categories' ? 'text-white' : 'text-black opacity-20'}`}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
                Category
              </button>
              <button onClick={() => setActiveTab('fab')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'fab' ? 'bg-[#2EABEB] text-white shadow-xl' : 'text-black/40 hover:bg-black/5'}`}>
                <div className={`${activeTab === 'fab' ? 'text-white' : 'text-black opacity-20'}`}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M10 8l6 4-6 4V8z"/></svg></div>
                FAB Reel
              </button>
        </nav>
        
        <div className="mt-auto pt-10">
          <button onClick={handleLogout} className="w-full py-4 border-2 border-red-500/10 text-red-600 hover:bg-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
            Deactivate Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-12 overflow-y-auto h-screen bg-gray-50">
        {error && <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-[2rem] font-black uppercase text-[10px] tracking-widest mb-10 shadow-xl">{error}</div>}
        
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="w-12 h-12 border-4 border-black/5 border-t-black rounded-full animate-spin"></span>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-4xl font-black text-black uppercase tracking-tighter mb-12">Operational Matrix</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                  <div className="bg-white border border-black/[0.03] p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all group">
                    <p className="text-black/30 text-[10px] font-black mb-4 uppercase tracking-[0.2em] group-hover:text-purple-600 transition-colors">Gross Revenue</p>
                    <h3 className="text-4xl font-black text-black tracking-tighter">
                      ₹{stats.revenue?.toLocaleString() || 0}
                    </h3>
                  </div>
                  <div className="bg-white border border-black/[0.03] p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all group">
                    <p className="text-black/30 text-[10px] font-black mb-4 uppercase tracking-[0.2em] group-hover:text-cyan-600 transition-colors">Total Orders</p>
                    <h3 className="text-4xl font-black text-black tracking-tighter">{stats.orders}</h3>
                  </div>
                  <div className="bg-white border border-black/[0.03] p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all group">
                    <p className="text-black/30 text-[10px] font-black mb-4 uppercase tracking-[0.2em] group-hover:text-emerald-600 transition-colors">Identities</p>
                    <h3 className="text-4xl font-black text-black tracking-tighter">{stats.users}</h3>
                  </div>
                  <div className="bg-white border border-black/[0.03] p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all group">
                    <p className="text-black/30 text-[10px] font-black mb-4 uppercase tracking-[0.2em] group-hover:text-blue-600 transition-colors">Matter Catalog</p>
                    <h3 className="text-4xl font-black text-black tracking-tighter">{stats.products}</h3>
                  </div>
                </div>

                <div>
                  <h2 className="text-xs font-black mb-8 uppercase tracking-[0.4em] text-black/30 flex items-center gap-4">
                    Recent Orders
                    <span className="h-px bg-black/5 flex-grow"></span>
                  </h2>
                  <div className="overflow-hidden bg-white border border-black/[0.03] rounded-[2.5rem] shadow-2xl">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="bg-gray-50 text-black/30 border-b border-black/[0.03]">
                        <tr>
                          <th className="p-6 font-black uppercase text-[10px] tracking-widest">Hash</th>
                          <th className="p-6 font-black uppercase text-[10px] tracking-widest">Subject</th>
                          <th className="p-6 font-black uppercase text-[10px] tracking-widest">Timeline</th>
                          <th className="p-6 font-black uppercase text-[10px] tracking-widest">Value</th>
                          <th className="p-6 font-black uppercase text-[10px] tracking-widest">Status</th>
                          <th className="p-6 font-black uppercase text-[10px] tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/[0.03]">
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="p-6 font-mono text-[10px] text-black/40">#{order.id}</td>
                            <td className="p-6 font-black uppercase text-xs">{order.user_email}</td>
                            <td className="p-6 text-black/40 text-[10px] font-black uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</td>
                            <td className="p-6 font-black text-black">₹{order.total_amount}</td>
                            <td className="p-6">
                              <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                                order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                order.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' :
                                'bg-gray-100 text-black/40'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-6 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setSelectedOrder(order)} className="px-3 py-1.5 hover:bg-black hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-black/5">View</button>
                                <button onClick={() => handleDeleteOrder(order.id)} className="px-3 py-1.5 hover:bg-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-black/5 text-red-600">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {orders.length === 0 && (
                          <tr><td colSpan={6} className="p-16 text-center text-black/20 font-black uppercase tracking-widest text-xs">No active orders found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'products' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-center mb-12">
                  <h1 className="text-4xl font-black text-black uppercase tracking-tighter">Inventory Control</h1>
                  <button 
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({ name: '', description: '', price: '', category: 'T-Shirt', image_url: '', stock: '', colors: '', sizes: '', image_urls: [], video_url: '', is_bestseller: 0 });
                      setImageFiles([]);
                      setVideoFile(null);
                      setShowProductForm(!showProductForm);
                    }}
                    className="bg-black hover:bg-neutral-800 text-white px-8 py-4 flex items-center gap-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl transition-all"
                  >
                    {showProductForm ? 'Close Terminal' : 'Deploy New Matter'}
                  </button>
                </div>

                {showProductForm && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white border border-black/[0.03] p-10 rounded-[2.5rem] w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar relative">
                      <button 
                        onClick={() => {
                          setShowProductForm(false);
                          setEditingProduct(null);
                        }}
                        className="absolute top-8 right-8 text-black/20 hover:text-black transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                      </button>

                      <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-8">Data Entry Terminal: {editingProduct ? 'Modification' : 'Initialization'}</h2>
                      <form onSubmit={handleProductSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <label className="block text-[10px] font-black text-black/30 mb-3 uppercase tracking-widest">Descriptor Name</label>
                            <input type="text" required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-gray-50 border border-black/[0.05] rounded-2xl p-4 focus:bg-white focus:border-black outline-none transition-all font-medium" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-black/30 mb-3 uppercase tracking-widest">Market Value (₹)</label>
                            <input type="number" step="0.01" required value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full bg-gray-50 border border-black/[0.05] rounded-2xl p-4 focus:bg-white focus:border-black outline-none transition-all font-medium" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-black/30 mb-3 uppercase tracking-widest">Division Architecture</label>
                            <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full bg-gray-50 border border-black/[0.05] rounded-2xl p-4 focus:bg-white focus:border-black outline-none transition-all font-bold appearance-none">
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                              ))}
                              {categories.length === 0 && (
                                <>
                                  <option value="T-Shirt">T-Shirt</option>
                                  <option value="PHANTS">PHANTS</option>
                                  <option value="Accessories">Accessories</option>
                                </>
                              )}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-black/30 mb-3 uppercase tracking-widest">Stock Reserves</label>
                            <input type="number" required value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="w-full bg-gray-50 border border-black/[0.05] rounded-2xl p-4 focus:bg-white focus:border-black outline-none transition-all font-medium" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-black/30 mb-3 uppercase tracking-widest">Chroma Spectrum</label>
                            <input type="text" value={productForm.colors} onChange={e => setProductForm({...productForm, colors: e.target.value})} className="w-full bg-gray-50 border border-black/[0.05] rounded-2xl p-4 focus:bg-white focus:border-black outline-none transition-all font-medium" placeholder="Black, White, Neon" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-black/30 mb-3 uppercase tracking-widest">Geometric Scale</label>
                            <input type="text" value={productForm.sizes} onChange={e => setProductForm({...productForm, sizes: e.target.value})} className="w-full bg-gray-50 border border-black/[0.05] rounded-2xl p-4 focus:bg-white focus:border-black outline-none transition-all font-medium" placeholder="S, M, L, XL" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-black/30 mb-3 uppercase tracking-widest">Cinematic Feed (MP4)</label>
                            <input 
                              type="file" 
                              accept="video/mp4,video/x-m4v,video/*" 
                              onChange={e => {
                                if (e.target.files) setVideoFile(e.target.files[0]);
                              }} 
                              className="w-full bg-gray-50 border border-black/[0.05] rounded-2xl p-4 focus:bg-white focus:border-black outline-none text-[10px] font-black uppercase tracking-widest file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-black file:text-white hover:file:bg-neutral-800 transition-all cursor-pointer" 
                            />
                          </div>
                          <div className="flex items-center gap-4 pt-4">
                            <input 
                              type="checkbox" 
                              id="is_bestseller"
                              checked={productForm.is_bestseller === 1} 
                              onChange={e => setProductForm({...productForm, is_bestseller: e.target.checked ? 1 : 0})} 
                              className="w-6 h-6 accent-black rounded-lg cursor-pointer"
                            />
                            <label htmlFor="is_bestseller" className="text-[10px] font-black uppercase tracking-widest cursor-pointer text-black/60 hover:text-black transition-colors">Prioritize in Featured Stream</label>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-black/30 mb-3 uppercase tracking-widest">Visual Data Arrays (Limit 5)</label>
                            <input type="file" multiple accept="image/*" onChange={e => {
                              if (e.target.files) setImageFiles(Array.from(e.target.files));
                            }} className="w-full bg-gray-50 border border-black/[0.05] rounded-2xl p-4 focus:bg-white focus:border-black outline-none text-[10px] font-black uppercase tracking-widest file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-black file:text-white hover:file:bg-neutral-800 transition-all cursor-pointer" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-black/30 mb-3 uppercase tracking-widest">Technical Description</label>
                            <textarea rows={4} value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full bg-gray-50 border border-black/[0.05] rounded-2xl p-6 focus:bg-white focus:border-black outline-none transition-all font-medium leading-relaxed"></textarea>
                          </div>
                        </div>
                        <button type="submit" className="w-full bg-black text-white font-black px-10 py-6 rounded-2xl hover:bg-neutral-800 transition-all uppercase text-[10px] tracking-[0.3em] shadow-2xl">
                          {editingProduct ? 'Commit Changes' : 'Execute Creation'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                <div className="overflow-hidden bg-white border border-black/[0.03] rounded-[2.5rem] shadow-2xl">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-gray-50 text-black/30 border-b border-black/[0.03]">
                      <tr>
                        <th className="p-6 font-black uppercase text-[10px] tracking-widest">Matter Entity</th>
                        <th className="p-6 font-black uppercase text-[10px] tracking-widest">Division</th>
                        <th className="p-6 font-black uppercase text-[10px] tracking-widest">Value</th>
                        <th className="p-6 font-black uppercase text-[10px] tracking-widest">Reserves</th>
                        <th className="p-6 font-black uppercase text-[10px] tracking-widest text-right">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.03]">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="p-6 flex items-center gap-4">
                            <div className="w-12 h-16 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden shadow-md border border-black/5">
                              {product.image_url && (
                                <img 
                                  src={resolveImageUrl(product.image_url)} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                />
                              )}
                            </div>
                            <span className="font-black uppercase text-xs tracking-tight">{product.name}</span>
                          </td>
                          <td className="p-6 text-black/40 text-[10px] font-black uppercase tracking-widest">{product.category}</td>
                          <td className="p-6 font-black text-black">₹{product.price}</td>
                          <td className="p-6 text-black/40 font-bold">{product.stock}</td>
                          <td className="p-6 text-right">
                            <div className="flex justify-end gap-3">
                              <button onClick={() => openEditProduct(product)} className="px-5 py-2 hover:bg-black hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-black/5">Modify</button>
                              <button onClick={() => handleDeleteProduct(product.id)} className="px-5 py-2 hover:bg-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-black/5 text-red-600">Erase</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {activeTab === 'orders' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-4xl font-black text-black uppercase tracking-tighter mb-12">Order Management</h1>
                <div className="overflow-hidden bg-white border border-black/[0.03] rounded-[2.5rem] shadow-2xl">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-gray-50 text-black/30 border-b border-black/[0.03]">
                      <tr>
                        <th className="p-6 font-black uppercase text-[10px] tracking-widest">Hash</th>
                        <th className="p-6 font-black uppercase text-[10px] tracking-widest">Subject</th>
                        <th className="p-6 font-black uppercase text-[10px] tracking-widest">Matter Profile</th>
                        <th className="p-6 font-black uppercase text-[10px] tracking-widest">Total Value</th>
                        <th className="p-6 font-black uppercase text-[10px] tracking-widest">Status Control</th>
                        <th className="p-6 font-black uppercase text-[10px] tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.03]">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="p-6 font-mono text-[10px] text-black/40">#{order.id}</td>
                          <td className="p-6">
                            <div className="font-black uppercase text-xs mb-1">{order.user_email}</div>
                            <div className="text-[10px] text-black/30 font-black uppercase tracking-widest">{new Date(order.created_at).toLocaleString()}</div>
                          </td>
                          <td className="p-6">
                            <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-[10px] font-black uppercase tracking-widest text-black/40">
                              {(() => {
                                try {
                                  const items = JSON.parse(order.items);
                                  return items.map((item: any) => `${item.name} (x${item.quantity})`).join(', ');
                                } catch (e) { return order.items; }
                              })()}
                            </div>
                          </td>
                          <td className="p-6 font-black text-black">₹{order.total_amount}</td>
                          <td className="p-6">
                            <select 
                              value={order.status} 
                              onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm outline-none cursor-pointer transition-all ${
                                order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                order.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' :
                                'bg-gray-100 text-black/40 border-black/5'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setSelectedOrder(order)} className="px-3 py-2 hover:bg-black hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-black/5">View Details</button>
                              <button onClick={() => handleDeleteOrder(order.id)} className="px-3 py-2 hover:bg-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-black/5 text-red-600">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                        {orders.length === 0 && (
                          <tr><td colSpan={6} className="p-16 text-center text-black/20 font-black uppercase tracking-widest text-xs">No active orders found.</td></tr>
                        )}
                    </tbody>
                  </table>
                </div>

                {/* Order Details Modal */}
                {selectedOrder && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white border border-black/[0.03] rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                      <div className="p-6 border-b border-black/[0.03] flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-black uppercase tracking-widest text-black">Order Details #{selectedOrder.id}</h2>
                        <button onClick={() => setSelectedOrder(null)} className="text-black/30 hover:text-black transition-colors text-2xl">&times;</button>
                      </div>
                      
                      <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                        {/* Customer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-xl border border-black/[0.03]">
                          <div>
                            <p className="text-black/40 text-xs font-bold uppercase tracking-widest mb-3">Order Details</p>
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs text-black/30 uppercase tracking-tighter">Customer Name</p>
                                <p className="font-bold text-black">{selectedOrder.customer_name || selectedOrder.user_name || 'Guest'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-black/30 uppercase tracking-tighter">Email</p>
                                <p className="font-semibold text-sm text-black">{selectedOrder.customer_email || selectedOrder.user_email}</p>
                              </div>
                              <div>
                                <p className="text-xs text-black/30 uppercase tracking-tighter">Phone</p>
                                <p className="font-semibold text-sm text-black">{selectedOrder.customer_phone || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-black/40 text-xs font-bold uppercase tracking-widest mb-3">Shipping Info</p>
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs text-black/30 uppercase tracking-tighter">Address</p>
                                <p className="text-sm font-medium leading-relaxed text-black">{selectedOrder.shipping_address || 'N/A'}</p>
                              </div>
                              <div className="flex gap-8">
                                <div>
                                  <p className="text-xs text-black/30 uppercase tracking-tighter">City</p>
                                  <p className="font-bold text-sm tracking-wide text-black">{selectedOrder.city || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-black/30 uppercase tracking-tighter">PIN Code</p>
                                  <p className="font-bold text-sm tracking-widest text-black">{selectedOrder.pin_code || 'N/A'}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-black/30 uppercase tracking-tighter">Payment</p>
                                <p className="font-bold text-xs uppercase tracking-widest bg-purple-100 text-purple-600 px-2 py-1 rounded inline-block">
                                  {selectedOrder.payment_method || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {selectedOrder.shiprocket_order_id && (
                          <div className="bg-cyan-50/10 border border-cyan-100 p-4 rounded-xl flex justify-between items-center">
                            <div>
                              <p className="text-[10px] text-cyan-600 font-bold uppercase tracking-widest mb-1">Shiprocket Sync Active</p>
                              <p className="text-sm font-mono text-black">Order ID: <span className="text-black">{selectedOrder.shiprocket_order_id}</span></p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-black/40 uppercase tracking-tighter">Shipment ID</p>
                              <p className="text-xs font-mono text-black/70">{selectedOrder.shiprocket_shipment_id}</p>
                            </div>
                          </div>
                        )}

                        {/* Order Items */}
                        <div>
                          <p className="text-black/40 text-xs font-bold uppercase tracking-widest mb-4">Line Items</p>
                          <div className="space-y-4">
                            {(() => {
                              try {
                                const items = JSON.parse(selectedOrder.items || '[]');
                                if (items.length === 0) return <p className="text-black/40 italic">No item details available for this order.</p>;
                                return items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-black/[0.03] hover:bg-gray-100 transition-colors">
                                    <div className="w-12 h-16 bg-black/50 rounded overflow-hidden flex-shrink-0 border border-black/5">
                                      {item.image_url && (
                                        <img 
                                          src={resolveImageUrl(item.image_url)} 
                                          alt={item.name} 
                                          className="w-full h-full object-cover" 
                                        />
                                      )}
                                    </div>
                                    <div className="flex-grow">
                                      <p className="font-bold text-sm tracking-tight text-black">{item.name}</p>
                                      <div className="flex gap-3 mt-1.5">
                                        <div className="flex flex-col">
                                          <span className="text-[9px] uppercase font-bold text-black/20 tracking-tighter">Size</span>
                                          <span className="text-[11px] font-black text-black/70">{item.size || 'N/A'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-[9px] uppercase font-bold text-black/20 tracking-tighter">Quantity</span>
                                          <span className="text-[11px] font-black text-black/70">{item.quantity}</span>
                                        </div>
                                        {item.color && (
                                          <div className="flex flex-col">
                                            <span className="text-[9px] uppercase font-bold text-black/20 tracking-tighter">Color</span>
                                            <span className="text-[11px] font-black text-black/70">{item.color}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-black">₹{item.price * item.quantity}</p>
                                    </div>
                                  </div>
                                ));
                              } catch (e) {
                                return <p className="text-black/40 italic">Error parsing order items.</p>;
                              }
                            })()}
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div className="border-t border-black/[0.03] pt-6 mt-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-black/30 text-[10px] uppercase tracking-[0.2em] mb-1">Total Billable</p>
                              <span className="font-black text-black text-4xl">₹{selectedOrder.total_amount}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-black/30 text-[10px] uppercase tracking-[0.2em] mb-1">Status</p>
                              <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-black/80 border border-black/5">
                                {selectedOrder.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-gray-50 border-t border-black/[0.03] flex justify-end gap-4">
                        {!selectedOrder.shiprocket_order_id && (
                          <button 
                            onClick={() => handleShipRocket(selectedOrder.id)}
                            className="px-6 py-2 bg-black text-white rounded-lg font-black uppercase tracking-widest text-xs hover:bg-neutral-800 shadow-xl transition-all"
                          >
                            Ship with Shiprocket
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedOrder(null)}
                          className="px-6 py-2 border border-black/5 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors text-black"
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
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-center mb-12">
                  <h1 className="text-4xl font-black text-black uppercase tracking-tighter">Category Management</h1>
                  <button 
                    onClick={() => {
                      setCategoryForm({ name: '', description: '' });
                      setShowCategoryForm(!showCategoryForm);
                    }}
                    className="bg-black hover:bg-neutral-800 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl transition-all"
                  >
                    {showCategoryForm ? 'Close Terminal' : 'Design Core Division'}
                  </button>
                </div>

                {showCategoryForm && (
                  <div className="bg-white border border-black/[0.03] p-10 rounded-[2.5rem] mb-12 shadow-2xl animate-in slide-in-from-top-6 duration-500">
                    <h2 className="text-xl font-black text-black uppercase tracking-tight mb-8">Add New Category</h2>
                    <form onSubmit={handleCategorySubmit} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-[10px] font-black text-black/30 mb-3 uppercase tracking-widest">Category Name</label>
                          <input 
                            type="text" 
                            required 
                            value={categoryForm.name} 
                            onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} 
                            className="w-full bg-gray-50 border border-black/[0.05] rounded-2xl p-4 focus:bg-white focus:border-black outline-none transition-all font-bold placeholder:text-black/20" 
                            placeholder="e.g., PHANTS"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-black/30 mb-3 uppercase tracking-widest">Description</label>
                          <input 
                            type="text" 
                            value={categoryForm.description} 
                            onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} 
                            className="w-full bg-gray-50 border border-black/[0.05] rounded-2xl p-4 focus:bg-white focus:border-black outline-none transition-all font-medium placeholder:text-black/20" 
                            placeholder="Brief description of category"
                          />
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-black text-white font-black px-10 py-6 rounded-2xl hover:bg-neutral-800 transition-all uppercase text-[10px] tracking-[0.3em] shadow-2xl">
                        Add Category
                      </button>
                    </form>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categories.map((cat) => (
                    <div key={cat.id} className="bg-white border border-black/[0.03] p-10 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all group relative">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-2xl font-black text-black uppercase tracking-tight group-hover:text-purple-600 transition-colors uppercase">{cat.name}</h3>
                          <p className="text-black/30 text-[10px] font-black uppercase tracking-widest mt-2">{cat.description || 'No data stream available'}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100 shadow-sm transition-all hover:bg-red-500 hover:text-white group-hover:scale-110"
                          title="Delete Category"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mt-6 text-[9px] font-black text-black/20 uppercase tracking-[0.3em]">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                        Category ID: {cat.id}
                      </div>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div className="col-span-full py-32 text-center bg-white border-2 border-dashed border-black/5 rounded-[3rem]">
                      <p className="text-black/10 font-black uppercase tracking-[0.4em] text-xs underline underline-offset-8 decoration-black/5">No custom divisions recognized</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'fab' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
                <h1 className="text-4xl font-black text-black uppercase tracking-tighter mb-4">FAB Section Manager</h1>
                <p className="text-black/40 text-sm font-bold uppercase tracking-widest mb-12">Control the storytelling reel on your homepage</p>
                
                <div className="bg-white border border-black/[0.03] rounded-[2.5rem] p-12 shadow-2xl">
                  <form onSubmit={handleFabUpdate} className="space-y-10">
                    <div className="grid grid-cols-1 gap-10">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black/30 mb-4">Section Main Title</label>
                        <input 
                          type="text" 
                          value={fabForm.title}
                          onChange={(e) => setFabForm({...fabForm, title: e.target.value})}
                          className="w-full bg-gray-50 border border-black/5 rounded-2xl px-6 py-5 text-sm font-black uppercase tracking-tight focus:border-[#2EABEB] outline-none transition-all"
                          placeholder="WELCOME TO THE FLIPSIDE"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6 p-8 bg-[#2EABEB]/5 rounded-[2rem] border border-[#2EABEB]/10">
                          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-[#2EABEB] mb-2">Stat Point 01</label>
                          <input 
                            type="text" 
                            value={fabForm.stat1_title}
                            onChange={(e) => setFabForm({...fabForm, stat1_title: e.target.value})}
                            className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 text-xs font-black uppercase"
                            placeholder="5 YEARS"
                          />
                          <input 
                            type="text" 
                            value={fabForm.stat1_subtitle}
                            onChange={(e) => setFabForm({...fabForm, stat1_subtitle: e.target.value})}
                            className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 text-xs font-black uppercase text-black/40"
                            placeholder="OF CREATING TRENDS"
                          />
                        </div>
                        
                        <div className="space-y-6 p-8 bg-[#FF007A]/5 rounded-[2rem] border border-[#FF007A]/10">
                          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-[#FF007A] mb-2">Stat Point 02</label>
                          <input 
                            type="text" 
                            value={fabForm.stat2_title}
                            onChange={(e) => setFabForm({...fabForm, stat2_title: e.target.value})}
                            className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 text-xs font-black uppercase"
                            placeholder="2.5 MILLION+"
                          />
                          <input 
                            type="text" 
                            value={fabForm.stat2_subtitle}
                            onChange={(e) => setFabForm({...fabForm, stat2_subtitle: e.target.value})}
                            className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 text-xs font-black uppercase text-black/40"
                            placeholder="STYLISH CUSTOMERS"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black/30 mb-4">Background Reel (Video)</label>
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                          <div className="w-full md:w-64 aspect-[9/16] bg-black rounded-[2rem] overflow-hidden shadow-2xl relative group">
                            {fabReelFile ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                                    <span className="text-[10px] font-black text-white uppercase text-center p-4">New video ready<br/>to sync</span>
                                </div>
                            ) : null}
                            {fabForm.video_url ? (
                              <video 
                                src={resolveImageUrl(fabForm.video_url)} 
                                autoPlay muted loop playsInline 
                                className="w-full h-full object-cover opacity-60"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/20 font-black uppercase text-[10px]">No Reel Set</div>
                            )}
                          </div>
                          
                          <div className="flex-1 space-y-6">
                            <p className="text-xs text-black/40 font-bold leading-relaxed">
                              Upload a high-quality vertical MP4 video for the FAB section background. Suggested aspect ratio is 9:16.
                            </p>
                            <label className="inline-block px-8 py-4 bg-gray-50 border border-black/5 rounded-xl cursor-pointer hover:bg-gray-100 transition-all font-black uppercase text-[10px] tracking-widest text-black/60">
                              Choose New Reel
                              <input 
                                type="file" 
                                accept="video/*" 
                                onChange={(e) => setFabReelFile(e.target.files?.[0] || null)}
                                className="hidden" 
                              />
                            </label>
                            {fabReelFile && <span className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest">✓ {fabReelFile.name}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-10 border-t border-black/5">
                      <button 
                        type="submit" 
                        disabled={savingFab}
                        className={`w-full py-6 rounded-2xl bg-black text-white font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-neutral-800 transition-all ${savingFab ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {savingFab ? 'Syncing Content...' : 'Update FAB Section'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Custom Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white border border-black/[0.03] rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
              </div>
              <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4">{confirmModal.title}</h2>
              <p className="text-black/40 text-sm font-bold leading-relaxed mb-10 px-4">{confirmModal.message}</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-5 rounded-2xl bg-gray-50 text-black font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all border border-black/5"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmModal.onConfirm}
                  className="flex-1 py-5 rounded-2xl bg-red-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-500/20"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
