import React from 'react';
import { Ship, Wrench, Home, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Features: React.FC = () => {
  const services = [
    {
      icon: <Ship className="h-10 w-10 text-secondary" />,
      title: 'Ship Building',
      description: 'Custom vessel construction with state-of-the-art technology and experienced naval architects.',
      image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=modern%20ship%20building%20dry%20dock%20construction%2C%20industrial%2C%20sunny%20day&image_size=landscape_4_3'
    },
    {
      icon: <Wrench className="h-10 w-10 text-secondary" />,
      title: 'Repair Services',
      description: 'Comprehensive repair and maintenance services to ensure your fleet operates at peak performance.',
      image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=ship%20repair%20welding%20propeller%20maintenance%2C%20dry%20dock%2C%20detailed&image_size=landscape_4_3'
    },
    {
      icon: <Home className="h-10 w-10 text-secondary" />,
      title: 'Marine Accommodation',
      description: 'High-quality marine accommodation outfitting solutions for crew comfort and safety.',
      image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20ship%20interior%20cabin%20crew%20accommodation%2C%20modern%2C%20clean&image_size=landscape_4_3'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h4 className="text-secondary font-bold uppercase tracking-wider mb-2">Our Services</h4>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">World-Class Marine Solutions</h2>
          <p className="text-gray-600">
            We provide integrated services to meet all your marine needs, from construction to maintenance and outfitting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Link 
                    to="/services" 
                    className="p-3 bg-white rounded-full text-primary hover:bg-secondary hover:text-white transition-colors"
                  >
                    <ArrowRight className="h-6 w-6" />
                  </Link>
                </div>
              </div>
              <div className="p-8">
                <div className="mb-4 p-3 bg-gray-50 w-fit rounded-xl group-hover:bg-primary/10 transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {service.description}
                </p>
                <Link 
                  to="/services" 
                  className="inline-flex items-center text-sm font-semibold text-secondary hover:text-secondary-600"
                >
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
