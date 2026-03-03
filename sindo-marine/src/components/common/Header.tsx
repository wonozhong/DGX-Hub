import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Anchor } from 'lucide-react';
import { cn } from '../../utils';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Products', path: '/products' },
    { name: 'Services', path: '/services' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-white/65 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
      )}
    >
      <div className="w-full px-4 md:px-12 flex items-center justify-between">
        <Link 
          to="/" 
          className={cn(
            "flex items-center gap-2 group transition-opacity duration-500",
            (isHome && !scrolled) ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          <img 
            src="/images/ptsindomarine.svg" 
            alt="Sindo Marine" 
            className={cn(
              "h-12 w-auto object-contain transition-all duration-300",
              !scrolled && "brightness-0 invert"
            )}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className={cn(
          "hidden md:flex items-center gap-8 transition-opacity duration-500",
          (isHome && !scrolled) ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'text-sm font-medium transition-colors hover:text-secondary',
                location.pathname === link.path
                  ? 'text-secondary font-semibold'
                  : scrolled
                  ? 'text-gray-700'
                  : 'text-white/90'
              )}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/contact"
            className="px-5 py-2.5 bg-secondary text-white text-sm font-medium rounded-full hover:bg-secondary-600 transition-colors shadow-lg shadow-secondary/20"
          >
            Get a Quote
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className={cn(
            "md:hidden p-2 text-gray-600 transition-opacity duration-500",
            (isHome && !scrolled) ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className={scrolled ? "text-gray-900" : "text-white"} />
          ) : (
            <Menu className={scrolled ? "text-gray-900" : "text-white"} />
          )}
        </button>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg p-4 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'text-base font-medium p-2 rounded-md hover:bg-gray-50',
                  location.pathname === link.path ? 'text-secondary' : 'text-gray-700'
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/contact"
              className="w-full text-center px-5 py-3 bg-secondary text-white font-medium rounded-lg hover:bg-secondary-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Get a Quote
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
