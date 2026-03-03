import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useContentStore } from '../../store/contentStore';

const Hero: React.FC = () => {
  const hero = useContentStore((state) => state.hero);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=huge%20modern%20shipyard%20with%20large%20vessels%20under%20construction%2C%20cinematic%20lighting%2C%20high%20resolution%2C%20realistic%20photography%2C%20blue%20hour&image_size=landscape_16_9" 
          alt="Sindo Marine Shipyard" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/40"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10 relative flex flex-col items-center justify-center h-full pt-20">
        <div className="max-w-4xl text-center animate-in slide-in-from-bottom-10 fade-in duration-1000">
          <img 
            src="/images/ptsindomarine.svg" 
            alt="Sindo Marine Logo" 
            className="h-24 md:h-32 w-auto mx-auto mb-8 brightness-0 invert drop-shadow-lg"
          />
          <h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg"
            dangerouslySetInnerHTML={{ __html: hero.title }}
          />
          <p className="text-xl text-gray-100 mb-8 leading-relaxed max-w-2xl mx-auto drop-shadow-md">
            {hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/services" 
              className="px-8 py-4 bg-secondary text-white rounded-full font-semibold hover:bg-secondary-600 transition-all flex items-center justify-center gap-2 group shadow-lg"
            >
              Explore Services
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/contact" 
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-primary transition-all text-center shadow-lg"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 border-2 border-white/30 rounded-full flex justify-center p-2">
          <div className="w-1 h-3 bg-white rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
