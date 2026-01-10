import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // Assuming framer-motion is available, if not I'll remove it or install it. I'll check first.
import { 
  SparklesIcon, 
  FireIcon, 
  ShieldCheckIcon, 
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-serif overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-yellow-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-black font-bold text-xl border-2 border-yellow-400">
                M
              </div>
              <span className="text-xl font-bold text-yellow-500 tracking-widest uppercase">Mandala</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#about" className="hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">About</a>
                <a href="#features" className="hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</a>
                <a href="#gallery" className="hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Gallery</a>
                <Link to="/login" className="bg-yellow-600 text-black hover:bg-yellow-500 px-6 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105">
                  Enter Realm
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
          <h2 className="text-yellow-500 text-lg md:text-xl tracking-[0.5em] uppercase mb-4 animate-pulse">
            The Awakening
          </h2>
          <h1 className="text-5xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-700 mb-8 drop-shadow-2xl">
            MANDALA<br />SHADOWED TRUTH
          </h1>
          <p className="text-gray-300 text-lg md:text-2xl max-w-2xl mx-auto mb-12 font-sans leading-relaxed">
            Dive into the abyss of ancient mythology. Uncover the secrets hidden within the shadows of the eternal mandala.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Link to="/login" className="group relative px-8 py-4 bg-yellow-600 text-black font-bold text-lg rounded-sm overflow-hidden transition-all hover:bg-yellow-500">
              <span className="relative z-10 flex items-center gap-2">
                PLAY NOW <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </Link>
            <button className="px-8 py-4 border border-yellow-600 text-yellow-500 font-bold text-lg rounded-sm hover:bg-yellow-900/20 transition-all">
              WATCH TRAILER
            </button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="py-24 bg-zinc-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-4">THE LEGEND RETURNS</h2>
            <div className="w-24 h-1 bg-yellow-600 mx-auto"></div>
            <p className="mt-4 text-gray-400 max-w-3xl mx-auto text-lg">
              Experience the next generation of dark mythology action RPG. "Mandala Shadowed Truth" takes you on a journey through the forgotten realms of the East, where gods and demons clash in an eternal struggle for dominance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black border border-yellow-900/30 p-8 rounded-lg hover:border-yellow-500/50 transition-colors">
              <SparklesIcon className="w-12 h-12 text-yellow-500 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Ancient Mythology</h3>
              <p className="text-gray-500">
                Deep exploration of traditional eastern mythology, presenting an authentic fantasy world to global players.
              </p>
            </div>
            <div className="bg-black border border-yellow-900/30 p-8 rounded-lg hover:border-yellow-500/50 transition-colors">
              <FireIcon className="w-12 h-12 text-yellow-500 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Epic Combat</h3>
              <p className="text-gray-500">
                Innovative combat system combined with traditional martial arts brings unprecedented action experience.
              </p>
            </div>
            <div className="bg-black border border-yellow-900/30 p-8 rounded-lg hover:border-yellow-500/50 transition-colors">
              <ShieldCheckIcon className="w-12 h-12 text-yellow-500 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">AAA Quality</h3>
              <p className="text-gray-500">
                Meticulously crafted with stunning visuals, immersive audio, and a gripping narrative that defines the genre.
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

      {/* Footer */}
      <footer className="bg-zinc-950 py-12 border-t border-yellow-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="mb-4 md:mb-0 flex flex-col items-start">
               <span className="text-2xl font-bold text-yellow-500 tracking-widest uppercase mb-4">Mandala</span>
               
               <div className="flex items-center gap-3 border-t border-gray-800 pt-4 mt-2">
                 <span className="text-gray-500 text-xs uppercase tracking-wider">Created by</span>
                 <div className="flex flex-col">
                    <DGXLogo className="h-6" />
                    <span className="text-[10px] text-gray-600 tracking-[0.2em] uppercase mt-1">Dragonix Interactive</span>
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
