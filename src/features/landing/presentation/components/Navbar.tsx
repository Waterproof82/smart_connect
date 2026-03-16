import React, { useState, useEffect } from 'react';
import { Cpu, ChevronDown, Code2, Settings2, Smartphone, Utensils, Shield, X, Menu, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  scrolled: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ scrolled }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Initialize theme from localStorage after mount (no setState in effect)
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.documentElement.classList.add('light');
    }
  }, []);

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault();
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const solutions = [
    {
      id: 'software-ia',
      icon: <Code2 className="w-5 h-5 text-blue-500" />,
      title: 'Software & IA',
      desc: 'Soluciones a medida',
      href: '#soluciones'
    },
    {
      id: 'automatizacion-n8n',
      icon: <Settings2 className="w-5 h-5 text-purple-500" />,
      title: 'Automatización n8n',
      desc: 'Flujos inteligentes',
      href: '#soluciones'
    },
    {
      id: 'tarjetas-nfc',
      icon: <Smartphone className="w-5 h-5 text-emerald-500" />,
      title: 'Tarjetas NFC',
      desc: 'Reseñas al instante',
      href: '#soluciones'
    },
    {
      id: 'qribar',
      icon: <Utensils className="w-5 h-5 text-amber-500" />,
      title: 'QR iBar',
      desc: 'Menús digitales HOSTELERÍA',
      href: 'https://qribar.es',
      external: true
    }
  ];

  const handleMobileLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setIsMobileMenuOpen(false);
    if (e.currentTarget.hash) {
      e.preventDefault();
      const hash = e.currentTarget.hash;
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  const handleDropdownLinkClick = (e?: React.MouseEvent<HTMLAnchorElement>) => {
    setIsDropdownOpen(false);
    if (e?.currentTarget?.hash) {
      const target = document.querySelector(e.currentTarget.hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b border-white/5 shadow-2xl bg-sc-dark ${
        scrolled ? 'py-2 md:py-3' : 'py-3 md:py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#inicio" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
            <Cpu className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tighter text-white">
            SmartConnect <span className="text-blue-500">AI</span>
          </span>
        </a>

        {/* Navigation - Desktop */}
        <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-neutral-400">
          <div
            className="relative group"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
            onFocus={() => setIsDropdownOpen(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setIsDropdownOpen(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsDropdownOpen(!isDropdownOpen);
              }
              if (e.key === 'Escape') setIsDropdownOpen(false);
            }}
          >
            <button
              className="flex items-center gap-1.5 hover:text-white transition-colors py-2 outline-none"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              Soluciones
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-300 ${
              isDropdownOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}>
              <div className="w-[280px] bg-sc-dark-surface border border-white/10 rounded-[2rem] p-4 shadow-2xl" role="menu">
                <div className="grid gap-2">
                  {solutions.map((item) => (
                    <a
                      key={item.id}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors group/item"
                      onClick={(e) => {
                        if (item.external) {
                          // No cerrar el dropdown si es externo
                          setIsDropdownOpen(false);
                        } else {
                          handleDropdownLinkClick(e);
                          setIsDropdownOpen(false);
                        }
                      }}
                    >
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-white text-xs font-bold">{item.title}</p>
                        <p className="text-xs text-neutral-500 font-medium">{item.desc}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <a href="#exito" className="hover:text-white transition-colors" onClick={handleDropdownLinkClick}>Éxito</a>
          <a href="#contacto" className="hover:text-white transition-colors" onClick={handleDropdownLinkClick}>Contacto</a>
          <Link to="/admin" className="flex items-center gap-2 text-neutral-300 hover:text-blue-400 transition-colors">
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </Link>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-yellow-400" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-600" />
            )}
          </button>
        </div>

        {/* Hamburger for mobile */}
        <button
          className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 text-white"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex justify-end"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsMobileMenuOpen(false);
              if (e.key === 'Tab') {
                const focusable = e.currentTarget.querySelectorAll<HTMLElement>('a, button');
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first.focus();
                }
              }
            }}
          >
            <div className="w-[80vw] max-w-xs h-full bg-sc-dark border-l border-white/10 p-6 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-right">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xl text-white">SmartConnect <span className="text-blue-500">AI</span></span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white" aria-label="Cerrar menu" autoFocus>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {solutions.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className="flex items-center gap-3 p-3 text-neutral-300 min-h-[48px] hover:bg-white/5 focus:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-xl transition-colors"
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    onClick={(e) => item.external ? setIsMobileMenuOpen(false) : handleMobileLinkClick(e)}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </a>
                ))}
                <hr className="border-white/10 my-2" />
                <a href="#exito" className="text-neutral-300 p-3 min-h-[48px] flex items-center hover:bg-white/5 focus:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-xl transition-colors" onClick={handleMobileLinkClick}>Éxito</a>
                <a href="#contacto" className="text-neutral-300 p-3 min-h-[48px] flex items-center hover:bg-white/5 focus:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-xl transition-colors" onClick={handleMobileLinkClick}>Contacto</a>
                <Link to="/admin" className="text-neutral-300 flex items-center gap-2 p-3 min-h-[48px] hover:bg-white/5 focus:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};