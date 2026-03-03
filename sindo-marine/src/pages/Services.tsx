import React from 'react';
import { Wrench, Anchor, Hammer, Ruler, Component, PenTool, Ship } from 'lucide-react';

const Services: React.FC = () => {
  const mainServices = [
    {
      title: "Vessel Construction",
      description: "Complete shipbuilding services from design to delivery, ensuring high-quality standards and compliance with international maritime regulations.",
      icon: Ship,
      image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Vessel Repairing",
      description: "Comprehensive repair and maintenance services for all types of vessels, minimizing downtime and extending vessel lifespan.",
      icon: Wrench,
      image: "https://images.unsplash.com/photo-1581092921461-eab62e97a783?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    }
  ];

  const accommodationServices = [
    {
      title: "Carpentry Works",
      description: "Expert marine carpentry including custom furniture, cabinetry, and wooden deck installations.",
      icon: Hammer
    },
    {
      title: "Insulation Installation",
      description: "Thermal and acoustic insulation solutions for enhanced comfort and safety on board.",
      icon: Component
    },
    {
      title: "Wall & Ceiling Panels",
      description: "Installation of high-grade marine wall and ceiling panels for durable and aesthetic interiors.",
      icon: Ruler
    },
    {
      title: "Deck Covering",
      description: "Professional application of various deck covering materials suitable for marine environments.",
      icon: Anchor
    },
    {
      title: "Marine Furniture",
      description: "Supply and installation of ergonomic and space-saving marine furniture.",
      icon: PenTool
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[400px] bg-slate-900 flex items-center justify-center">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '0.4'
          }}
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-xl max-w-2xl mx-auto text-gray-200">
            Specialized in Construction and Repairing of Vessels with Excellence in Marine Accommodation Works.
          </p>
        </div>
      </div>

      {/* Main Services */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Core Business Areas</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We deliver comprehensive solutions for the marine industry, focusing on quality, efficiency, and safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {mainServices.map((service, index) => (
            <div key={index} className="group relative overflow-hidden rounded-2xl shadow-lg h-[400px]">
              <img 
                src={service.image} 
                alt={service.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-90" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <div className="bg-orange-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <service.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-200 leading-relaxed max-w-lg">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Accommodation Works */}
        <div className="bg-slate-50 rounded-3xl p-8 md:p-16">
          <div className="text-center mb-12">
            <span className="text-orange-600 font-bold tracking-wider uppercase text-sm">Specialized Capabilities</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Marine Accommodation Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide end-to-end solutions for marine interiors, ensuring comfort and functionality for crew and passengers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accommodationServices.map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-orange-200 group">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-600 transition-colors">
                  <service.icon className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Contact us today to discuss your vessel construction, repair, or accommodation needs with our experts.
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  );
};

export default Services;
