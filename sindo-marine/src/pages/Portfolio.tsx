import React, { useState } from 'react';
import { Ruler, Users, Anchor, ChevronRight, Maximize2, X } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  owner: string;
  image: string;
  category: string;
  specs: {
    label: string;
    value: string;
  }[];
}

const projects: Project[] = [
  {
    id: 1,
    title: "64.2m Crane Barge (4 Units)",
    owner: "KENTON MARINE",
    category: "Crane Barge",
    image: "https://images.unsplash.com/photo-1605218427368-35b01625a3d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    specs: [
      { label: "Length O.A", value: "64.80 M" },
      { label: "Breadth MLD", value: "24.00 M" },
      { label: "Depth MLD", value: "4.80 M" },
      { label: "Loaded Draft", value: "3.50 M" },
      { label: "Operating Draft", value: "2.40 M" },
      { label: "Frame Spacing", value: "1800 MM" },
      { label: "Complement", value: "24 Men" },
    ]
  },
  {
    id: 2,
    title: "Offshore Supply Vessel",
    owner: "PACIFIC RADIANCE",
    category: "Offshore",
    image: "https://images.unsplash.com/photo-1545625754-04d49d949437?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    specs: [
      { label: "Length O.A", value: "58.00 M" },
      { label: "Breadth MLD", value: "14.00 M" },
      { label: "Depth MLD", value: "5.50 M" },
      { label: "Speed", value: "12 Knots" },
      { label: "Complement", value: "48 Men" },
    ]
  },
  {
    id: 3,
    title: "Anchor Handling Tug",
    owner: "SWIRE PACIFIC",
    category: "Tug Boat",
    image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    specs: [
      { label: "Bollard Pull", value: "65 Tonnes" },
      { label: "Length O.A", value: "48.00 M" },
      { label: "Engine Power", value: "5150 BHP" },
      { label: "Classification", value: "ABS" },
    ]
  }
];

const Portfolio: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-slate-900 pt-32 pb-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Project References</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          We share our best work with you. Discover our track record of delivering high-quality marine vessels.
        </p>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="relative h-80 overflow-hidden cursor-pointer" onClick={() => setSelectedProject(project)}>
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-1 rounded-full text-sm font-semibold text-slate-900">
                  {project.category}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="bg-white/20 backdrop-blur-md p-4 rounded-full text-white hover:bg-white hover:text-slate-900 transition-all">
                    <Maximize2 className="w-8 h-8" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{project.title}</h3>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Owner: {project.owner}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedProject(project)}
                    className="flex items-center text-orange-600 font-semibold hover:gap-2 transition-all"
                  >
                    View Details <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>

                <div className="bg-slate-50 rounded-xl p-6 border border-gray-100">
                  <h4 className="flex items-center text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                    <Ruler className="w-4 h-4 mr-2" />
                    Principal Dimensions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                    {project.specs.map((spec, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-gray-200/50 pb-2 last:border-0 last:pb-0">
                        <span className="text-gray-600 text-sm">{spec.label}</span>
                        <span className="font-semibold text-slate-900 text-sm">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Modal Detail */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="h-[400px] relative">
              <img 
                src={selectedProject.image} 
                alt={selectedProject.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                <h2 className="text-3xl font-bold text-white mb-2">{selectedProject.title}</h2>
                <p className="text-gray-200 flex items-center">
                  <Anchor className="w-4 h-4 mr-2" />
                  {selectedProject.category} | {selectedProject.owner}
                </p>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Project Overview</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    This project represents our commitment to excellence in marine engineering. 
                    Built for {selectedProject.owner}, this {selectedProject.category.toLowerCase()} was 
                    designed and constructed to meet rigorous international standards.
                  </p>
                  <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                    <p className="text-orange-800 text-sm font-medium">
                      Status: Successfully Delivered
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Technical Specifications</h3>
                  <div className="space-y-3">
                    {selectedProject.specs.map((spec, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">{spec.label}</span>
                        <span className="font-bold text-slate-900">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
