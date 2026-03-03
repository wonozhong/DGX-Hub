import React, { useState } from 'react';
import { useContentStore } from '../store/contentStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Save, LogOut, Layout, Info, Phone, CheckCircle, Package, Plus, Trash2, X, Image as ImageIcon } from 'lucide-react';

const Admin: React.FC = () => {
  const { hero, about, contact, products, updateHero, updateAbout, updateContact, addProduct, removeProduct } = useContentStore();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'contact' | 'products'>('hero');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);

  // Local state for forms
  const [heroForm, setHeroForm] = useState(hero);
  const [aboutForm, setAboutForm] = useState(about);
  const [contactForm, setContactForm] = useState(contact);
  const [newProductForm, setNewProductForm] = useState({
    id: '',
    title: '',
    description: '',
    images: ['']
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSave = () => {
    if (activeTab === 'hero') updateHero(heroForm);
    if (activeTab === 'about') updateAbout(aboutForm);
    if (activeTab === 'contact') updateContact(contactForm);
    // Products are saved individually
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAddProduct = () => {
    if (!newProductForm.title || !newProductForm.description) return;
    
    const productToAdd = {
      ...newProductForm,
      id: newProductForm.title.toLowerCase().replace(/\s+/g, '-'),
      images: newProductForm.images.filter(img => img.length > 0)
    };
    
    addProduct(productToAdd);
    setNewProductForm({ id: '', title: '', description: '', images: [''] });
    setIsEditingProduct(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      removeProduct(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 fixed h-full overflow-y-auto">
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <Layout className="w-6 h-6 text-orange-500" />
          Admin Panel
        </h1>
        
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('hero')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'hero' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-slate-800'
            }`}
          >
            <Layout className="w-5 h-5" />
            Hero Section
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'about' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-slate-800'
            }`}
          >
            <Info className="w-5 h-5" />
            About Us
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'contact' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-slate-800'
            }`}
          >
            <Phone className="w-5 h-5" />
            Contact Info
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'products' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-slate-800'
            }`}
          >
            <Package className="w-5 h-5" />
            Products
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-8 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 capitalize">{activeTab} Settings</h2>
            {activeTab !== 'products' && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            )}
            {activeTab === 'products' && !isEditingProduct && (
              <button
                onClick={() => setIsEditingProduct(true)}
                className="flex items-center gap-2 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            )}
          </div>

          {showSuccess && (
            <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="w-5 h-5" />
              Changes saved successfully!
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {activeTab === 'hero' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Main Title (Supports HTML)</label>
                  <input
                    type="text"
                    value={heroForm.title}
                    onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use &lt;br /&gt; for line breaks and &lt;span&gt; for styling.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                  <textarea
                    rows={4}
                    value={heroForm.subtitle}
                    onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
                  <textarea
                    rows={4}
                    value={aboutForm.description}
                    onChange={(e) => setAboutForm({ ...aboutForm, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vision</label>
                  <textarea
                    rows={3}
                    value={aboutForm.vision}
                    onChange={(e) => setAboutForm({ ...aboutForm, vision: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mission / Goal</label>
                  <textarea
                    rows={3}
                    value={aboutForm.mission}
                    onChange={(e) => setAboutForm({ ...aboutForm, mission: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number 1</label>
                  <input
                    type="text"
                    value={contactForm.phone1}
                    onChange={(e) => setContactForm({ ...contactForm, phone1: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number 2</label>
                  <input
                    type="text"
                    value={contactForm.phone2}
                    onChange={(e) => setContactForm({ ...contactForm, phone2: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fax</label>
                  <input
                    type="text"
                    value={contactForm.fax}
                    onChange={(e) => setContactForm({ ...contactForm, fax: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">General Email</label>
                  <input
                    type="text"
                    value={contactForm.emailGeneral}
                    onChange={(e) => setContactForm({ ...contactForm, emailGeneral: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    rows={3}
                    value={contactForm.address}
                    onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                {isEditingProduct ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
                      <h3 className="text-xl font-bold">Add New Product</h3>
                      <button onClick={() => setIsEditingProduct(false)} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Title</label>
                      <input
                        type="text"
                        value={newProductForm.title}
                        onChange={(e) => setNewProductForm({ ...newProductForm, title: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="e.g., Marine Fire Door"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        rows={3}
                        value={newProductForm.description}
                        onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="Product description..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Images (URL)</label>
                      {newProductForm.images.map((img, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={img}
                            onChange={(e) => {
                              const newImages = [...newProductForm.images];
                              newImages[idx] = e.target.value;
                              setNewProductForm({ ...newProductForm, images: newImages });
                            }}
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="https://example.com/image.jpg"
                          />
                          {idx > 0 && (
                            <button
                              onClick={() => {
                                const newImages = newProductForm.images.filter((_, i) => i !== idx);
                                setNewProductForm({ ...newProductForm, images: newImages });
                              }}
                              className="text-red-500 hover:text-red-700 p-2"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => setNewProductForm({ ...newProductForm, images: [...newProductForm.images, ''] })}
                        className="text-sm text-orange-600 font-medium hover:text-orange-700 flex items-center gap-1 mt-2"
                      >
                        <Plus className="w-4 h-4" /> Add Another Image
                      </button>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleAddProduct}
                        className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                      >
                        Save Product
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                            {product.images[0] ? (
                              <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-full h-full p-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{product.title}</h4>
                            <p className="text-sm text-gray-500 truncate max-w-md">{product.description}</p>
                            <p className="text-xs text-gray-400 mt-1">{product.images.length} images</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {products.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        No products found. Click "Add Product" to create one.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
