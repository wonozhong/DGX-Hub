import React, { useState } from 'react';
import { Box, Layers, DoorOpen, LayoutGrid, Sofa, Trees, Bath, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useContentStore } from '../store/contentStore';

// Map product IDs to icons since we can't store functions/components in localStorage
const iconMap: Record<string, React.ElementType> = {
  'wall-paneling': Layers,
  'ceiling-panel': LayoutGrid,
  'marine-fire-door': DoorOpen,
  'deck-covering': Box,
  'marine-furniture': Sofa,
  'wooden-deck-sheating': Trees,
  'toilet-module': Bath,
  'default': Box
};

const Products: React.FC = () => {
  const products = useContentStore((state) => state.products);
  
  // State to track current image index for each product
  const [currentImageIndices, setCurrentImageIndices] = useState<Record<string, number>>({});

  const nextImage = (productId: string, totalImages: number) => {
    setCurrentImageIndices(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (productId: string, totalImages: number) => {
    setCurrentImageIndices(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-slate-900 py-24 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Products</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          We provide the best marine products, engineered for quality, safety, and performance in the harshest marine environments.
        </p>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const Icon = iconMap[product.id] || iconMap['default'];
            const currentImageIndex = currentImageIndices[product.id] || 0;
            const hasMultipleImages = product.images.length > 1;

            return (
              <div 
                key={product.id} 
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
              >
                {/* Image Container with Slider */}
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img 
                    src={product.images[currentImageIndex]} 
                    alt={product.title} 
                    className="w-full h-full object-cover transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-60 pointer-events-none" />
                  
                  {/* Slider Controls */}
                  {hasMultipleImages && (
                    <>
                      <button 
                        onClick={(e) => { e.preventDefault(); prevImage(product.id, product.images.length); }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full backdrop-blur-sm transition-colors z-10"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => { e.preventDefault(); nextImage(product.id, product.images.length); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full backdrop-blur-sm transition-colors z-10"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      
                      {/* Dots Indicator */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                        {product.images.map((_, idx) => (
                          <div 
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-3' : 'bg-white/50'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  <div className="absolute bottom-4 left-4 text-white pointer-events-none">
                    <div className="bg-orange-600 w-10 h-10 rounded-lg flex items-center justify-center mb-2">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 mb-6 flex-1">
                    {product.description}
                  </p>

                  <button className="flex items-center text-orange-600 font-semibold text-sm hover:gap-2 transition-all group-hover:translate-x-1">
                    Learn More <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Need a Custom Solution?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Our team of experts can help you find the perfect marine accommodation and outfitting products for your specific needs.
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-slate-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default Products;

