import React from 'react';
import { Target, Anchor, Users, Award, CheckCircle2 } from 'lucide-react';
import { useContentStore } from '../store/contentStore';

const About: React.FC = () => {
  const about = useContentStore((state) => state.about);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[400px] bg-slate-900 flex items-center justify-center">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1534639969623-28f96e479a6d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '0.4'
          }}
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl max-w-2xl mx-auto text-gray-200">
            Leading Ship Building and Marine Specialist based in Batam, Indonesia.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <div className="flex items-center gap-2 text-orange-600 font-semibold mb-4">
              <Anchor className="w-5 h-5" />
              <span>WHO WE ARE</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Founded in 2006, Sindo Marine is a Global Leader in Marine Solutions
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>{about.description}</p>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1566373733075-e9949b2c8a2b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Marine Engineering" 
              className="rounded-lg shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-orange-600 text-white p-8 rounded-lg hidden md:block">
              <p className="text-4xl font-bold mb-1">15+</p>
              <p className="text-sm font-medium opacity-90">Years of Excellence</p>
            </div>
          </div>
        </div>

        {/* Vision & Goal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-slate-50 p-8 rounded-xl border-l-4 border-orange-600">
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
            <p className="text-gray-600">{about.vision}</p>
          </div>
          <div className="bg-slate-50 p-8 rounded-xl border-l-4 border-blue-900">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <Award className="w-6 h-6 text-blue-900" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Goal</h3>
            <p className="text-gray-600">{about.mission}</p>
          </div>
        </div>

        {/* Core Values / Stats */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We are committed to achieving quality management excellence in all of our business operations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "Experience", percentage: "95%", icon: CheckCircle2 },
              { label: "Skills", percentage: "96%", icon: Users },
              { label: "Knowledge", percentage: "95%", icon: Anchor }
            ].map((stat, index) => (
              <div key={index} className="bg-white border border-gray-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full text-white mb-4">
                  <stat.icon className="w-8 h-8" />
                </div>
                <h3 className="text-4xl font-bold text-orange-600 mb-2">{stat.percentage}</h3>
                <p className="text-lg font-semibold text-slate-900">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section (Text Only based on content) */}
        <div className="bg-slate-900 text-white rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-6">Our Management Team</h2>
          <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Sindo Marine has built up a strong, competent and experienced management team who is collectively responsible for the strategy planning, operations and overall management to ensure timely delivery of services and to execute projects of varying scope and complexity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
