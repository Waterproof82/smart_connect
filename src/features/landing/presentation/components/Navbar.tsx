
import React, { useState } from 'react';
import { Cpu, ChevronDown, Code2, Settings2, Smartphone, Utensils, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  scrolled: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ scrolled }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      scrolled ? 'bg-[#020408]/80 backdrop-blur-xl py-3 border-b border-white/5 shadow-2xl' : 'bg-transparent py-6'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#inicio" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
            <Cpu className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tighter">SmartConnect <span className="text-blue-500">AI</span></span>
        </a>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-gray-400">
          {/* Soluciones Dropdown */}
          <div
            className="relative group"
            role="menu"
            tabIndex={0}
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
            onFocus={() => setIsDropdownOpen(true)}
            onBlur={() => setIsDropdownOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setIsDropdownOpen((prev) => !prev);
              }
              if (e.key === 'Escape') {
                setIsDropdownOpen(false);
              }
            }}
          >
            <button
              className="flex items-center gap-1.5 hover:text-white transition-colors py-2"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              tabIndex={-1}
            >
              Soluciones
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-300 ${
              isDropdownOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}>
              <div className="w-[280px] glass-card border border-white/10 rounded-[2rem] p-4 shadow-2xl">
                <div className="grid gap-2">
                  {solutions.map((item) => (
                    item.external ? (
                      <a
                        key={item.id}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors group/item"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-white text-xs font-bold">{item.title}</p>
                          <p className="text-[10px] text-gray-500 font-medium">{item.desc}</p>
                        </div>
                      </a>
                    ) : (
                      <a
                        key={item.id}
                        href={item.href}
                        onClick={handleDropdownLinkClick}
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors group/item"
                      >
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-white text-xs font-bold">{item.title}</p>
                          <p className="text-[10px] text-gray-500 font-medium">{item.desc}</p>
                        </div>
                      </a>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>

          <a href="#exito" className="hover:text-white transition-colors" onClick={handleDropdownLinkClick}>Éxito</a>
          <a href="#contacto" className="hover:text-white transition-colors" onClick={handleDropdownLinkClick}>Contacto</a>
          <Link 
            to="/admin"
            className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors"
          >
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};
