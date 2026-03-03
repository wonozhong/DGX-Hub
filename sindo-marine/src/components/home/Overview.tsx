import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const Overview: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Image Grid */}
          <div className="lg:w-1/2 grid grid-cols-2 gap-4">
            <img 
              src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=engineers%20inspecting%20ship%20blueprints%20at%20dry%20dock%2C%20professional%2C%20industrial%2C%20realistic&image_size=portrait_4_3" 
              alt="Marine Engineering" 
              className="rounded-2xl shadow-lg w-full h-64 object-cover transform translate-y-8"
            />
            <img 
              src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=welding%20works%20on%20ship%20hull%2C%20sparks%2C%20industrial%20safety%2C%20high%20detail&image_size=portrait_4_3" 
              alt="Ship Construction" 
              className="rounded-2xl shadow-lg w-full h-64 object-cover"
            />
          </div>

          {/* Content */}
          <div className="lg:w-1/2">
            <h4 className="text-secondary font-bold uppercase tracking-wider mb-2">Who We Are</h4>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Leading Ship Building & <br />Marine Specialist
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Located in Batam, Indonesia, Sindo Marine has built up a strong, competent and experienced management team collectively responsible for strategy planning, operations and overall management.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We ensure timely delivery of services and execute projects of varying scope and complexity. Our commitment to quality and safety has made us a trusted partner in the marine industry.
            </p>

            <div className="space-y-4">
              {[
                'Experienced Management Team',
                'Comprehensive Marine Solutions',
                'Timely Project Delivery',
                'High Quality Standards'
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="text-secondary h-6 w-6 shrink-0" />
                  <span className="text-gray-800 font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex gap-8">
              <div>
                <span className="block text-4xl font-bold text-primary mb-1">95%</span>
                <span className="text-sm text-gray-500">Experiences</span>
              </div>
              <div>
                <span className="block text-4xl font-bold text-primary mb-1">96%</span>
                <span className="text-sm text-gray-500">Skills</span>
              </div>
              <div>
                <span className="block text-4xl font-bold text-primary mb-1">100+</span>
                <span className="text-sm text-gray-500">Projects Done</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Overview;
