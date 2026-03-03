import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  FireIcon, 
  ShieldCheckIcon, 
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';

export default function LandingPage() {
  const { user } = useAuthStore();
  return (
    <div className="min-h-screen bg-black text-white font-serif overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-yellow-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0 flex items-center">
              <img src="/images/dgx-logo-white.svg" alt="DGX Logo" className="h-12 w-auto object-contain" />
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#about" className="hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">About</a>
                <a href="#features" className="hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</a>
                <a href="#gallery" className="hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Gallery</a>
                <Link to="/public-forum" className="hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Forum</Link>
                <a href="#contact" className="hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Contact</a>
                <Link to={user ? "/dashboard" : "/login"} className="bg-yellow-600 text-black hover:bg-yellow-500 px-6 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105">
                  {user ? "Dashboard" : "Enter Realm"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2568&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80"></div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="flex justify-center items-center gap-2 mb-6 animate-fade-in-up opacity-80">
            <span className="text-gray-400 tracking-widest text-xs uppercase">Powered by</span>
            <img src="/images/dgx-logo-white.svg" alt="DGX Logo" className="h-5" />
          </div>

          <h2 className="text-yellow-500 text-lg md:text-xl tracking-[0.5em] uppercase mb-8 animate-pulse">
            Indie AAA • RPG • Global
          </h2>
          
          <div className="mb-12 flex justify-center">
             <img 
               src="/images/mandala-logo.png" 
               alt="MANDALA: Shadowed Truths" 
               className="w-full max-w-3xl h-auto drop-shadow-[0_0_50px_rgba(234,179,8,0.3)] animate-fade-in transform hover:scale-105 transition-transform duration-700" 
             />
          </div>

          <p className="text-gray-300 text-lg md:text-2xl max-w-2xl mx-auto mb-12 font-sans leading-relaxed">
            Blends the richness of Nusantara-inspired mythology with modern, globally appealing design.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Link to={user ? "/dashboard" : "/login"} className="group relative px-8 py-4 bg-yellow-600 text-black font-bold text-lg rounded-sm overflow-hidden transition-all hover:bg-yellow-500 z-50 cursor-pointer shadow-[0_0_20px_rgba(234,179,8,0.5)]">
              <span className="relative z-10 flex items-center gap-2">
                {user ? "GO TO DASHBOARD" : "ENTER REALM"} <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </Link>
            <button className="px-8 py-4 border border-yellow-600 text-yellow-500 font-bold text-lg rounded-sm hover:bg-yellow-900/20 transition-all z-50">
              WATCH TRAILER
            </button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="py-24 bg-zinc-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-4">DRAGONIX INTERACTIVE</h2>
            <div className="w-24 h-1 bg-yellow-600 mx-auto"></div>
            <p className="mt-4 text-gray-400 max-w-3xl mx-auto text-lg">
              We are an independent studio crafting modern, globally appealing action RPGs. Founded by the core creative leadership behind a previously acquired IP, we build original worlds with strong global potential.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black border border-yellow-900/30 p-8 rounded-lg hover:border-yellow-500/50 transition-colors">
              <SparklesIcon className="w-12 h-12 text-yellow-500 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Global Indie AAA</h3>
              <p className="text-gray-500">
                Designed to resonate with audiences in North America, Europe, and beyond with high production values.
              </p>
            </div>
            <div className="bg-black border border-yellow-900/30 p-8 rounded-lg hover:border-yellow-500/50 transition-colors">
              <FireIcon className="w-12 h-12 text-yellow-500 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Action Combat</h3>
              <p className="text-gray-500">
                Skill-based action combat with meaningful progression and tight mechanics.
              </p>
            </div>
            <div className="bg-black border border-yellow-900/30 p-8 rounded-lg hover:border-yellow-500/50 transition-colors">
              <ShieldCheckIcon className="w-12 h-12 text-yellow-500 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Myth-Driven</h3>
              <p className="text-gray-500">
                Rich worldbuilding rooted in Nusantara-inspired mythology mixed with modern fantasy elements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery/Parallax Section */}
      <div id="gallery" className="py-24 bg-black relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-900 via-black to-black"></div>
         <div className="max-w-7xl mx-auto px-4 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">VISUAL SHOWCASE</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-64 md:h-96 bg-zinc-800 rounded-lg overflow-hidden border border-yellow-900/30 group">
                    <img src="https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2574&auto=format&fit=crop" alt="Game Art" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                </div>
                <div className="h-64 md:h-96 bg-zinc-800 rounded-lg overflow-hidden border border-yellow-900/30 group">
                     <img src="https://images.unsplash.com/photo-1533158307581-c30932c02e1c?q=80&w=2670&auto=format&fit=crop" alt="Combat" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                </div>
            </div>
         </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="py-24 bg-zinc-900 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-8">CONTACT US</h2>
            <p className="text-gray-400 mb-12">
              Interested in partnership, investment, or joining our team? Reach out to us.
            </p>
            
            <form className="space-y-6 text-left">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-400">Name</label>
                <input type="text" id="name" className="mt-1 block w-full rounded-md bg-black border-gray-700 text-white shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm p-3" placeholder="Your Name" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email</label>
                <input type="email" id="email" className="mt-1 block w-full rounded-md bg-black border-gray-700 text-white shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm p-3" placeholder="you@example.com" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-400">Message</label>
                <textarea id="message" rows={4} className="mt-1 block w-full rounded-md bg-black border-gray-700 text-white shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm p-3" placeholder="How can we help you?"></textarea>
              </div>
              <div>
                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-600 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors font-bold">
                  SEND MESSAGE
                </button>
              </div>
            </form>

            <div className="mt-16 pt-8 border-t border-gray-800">
               <p className="text-gray-500">Or email us directly at:</p>
               <a href="mailto:contact@dragonixinteractive.com" className="text-yellow-500 hover:text-yellow-400 font-medium text-lg mt-2 inline-block">
                 contact@dragonixinteractive.com
               </a>
            </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-zinc-950 py-12 border-t border-yellow-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="mb-4 md:mb-0 flex flex-col items-start">
               <img src="/images/mandala-logo.png" alt="Mandala" className="h-16 w-auto mb-6 opacity-90" />
               
               <div className="flex items-center gap-3 border-t border-gray-800 pt-4 mt-2">
                 <span className="text-gray-500 text-xs uppercase tracking-wider">Created by</span>
                  <div className="flex flex-col">
                     <img src="/images/dgx-logo-white.svg" alt="DGX Logo" className="h-6 w-auto" />
                     <span className="text-[10px] text-gray-400 tracking-[0.2em] uppercase mt-1">Dragonix Interactive</span>
                  </div>
               </div>
               
               <p className="text-gray-600 text-sm mt-4">© 2025 Dragonix Interactive. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
               <a href="#" className="text-gray-500 hover:text-yellow-500 transition-colors">Privacy Policy</a>
               <a href="#" className="text-gray-500 hover:text-yellow-500 transition-colors">Terms of Service</a>
               <a href="#" className="text-gray-500 hover:text-yellow-500 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
