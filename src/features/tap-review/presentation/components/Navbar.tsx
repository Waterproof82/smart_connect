import React from "react";
import { Link } from "react-router-dom";
import { Smartphone } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";

interface NavbarProps {
  scrolled?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ scrolled = false }) => {
  const { t } = useLanguage();
  return (
    <nav
      aria-label="Navegación principal"
      className={
        `fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b border-[var(--color-border)] bg-[var(--color-bg)]` +
        (scrolled ? " py-2 md:py-3" : " py-3 md:py-6")
      }
    >
      <div className="container mx-auto px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-[var(--color-accent)] rounded-xl flex items-center justify-center shadow-lg motion-safe:group-hover:scale-110 transition-transform">
            <Smartphone className="text-[var(--color-on-accent)] w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tighter text-default hidden sm:block">
            SmartConnect <span className="text-[var(--color-primary)]">AI</span>
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
