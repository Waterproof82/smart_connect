import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, X, Menu, Cpu, ArrowLeft } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";
import LanguageSelector from "@shared/components/LanguageSelector";
import { SOLUTIONS } from "@shared/config/solutions";
import { mapSolutions } from "@shared/utils/solutionHelpers";

const CartaDigitalNavbar: React.FC<{ scrolled?: boolean }> = ({
  scrolled = false,
}) => {
  const { t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [focusedDropdownIndex, setFocusedDropdownIndex] = useState<number>(-1);

  // Close mobile menu on Escape key
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const solutions = mapSolutions(SOLUTIONS, t, {
    filterOut: ["carta-digital"],
    hrefPrefix: "/",
  });

  return (
    <nav
      aria-label="Navegación principal"
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b border-[var(--color-border)] bg-[var(--color-bg)] ${scrolled ? "py-2 md:py-3" : "py-3 md:py-6"}`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-[var(--color-accent)] rounded-xl flex items-center justify-center shadow-lg motion-safe:group-hover:scale-110 transition-transform">
            <Cpu className="text-[var(--color-on-accent)] w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tighter text-default hidden sm:block">
            SmartConnect <span className="text-[var(--color-primary)]">AI</span>
          </span>
        </Link>

        {/* Navigation - Desktop */}
        <div className="hidden md:flex items-center gap-8 lg:gap-10 text-sm font-semibold text-muted">
          <Link
            to="/"
            className="flex items-center gap-1.5 hover:text-[var(--color-text)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.navBack}
          </Link>
          <div
            role="none"
            className="relative group"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => {
              setIsDropdownOpen(false);
              setFocusedDropdownIndex(-1);
            }}
          >
            <button
              className="flex items-center gap-1.5 hover:text-[var(--color-text)] transition-colors py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-lg"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              {t.navSolutions}
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-300 ${isDropdownOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}`}
            >
              <div className="w-[280px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2rem] p-4 shadow-lg">
                <div className="grid gap-2">
                  {solutions.map((item, idx) => (
                    <React.Fragment key={item.id}>
                      {item.external ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          tabIndex={isDropdownOpen ? 0 : -1}
                          className={`flex items-center gap-4 p-3 rounded-2xl hover:bg-[var(--color-bg-alt)] transition-colors group/item ${focusedDropdownIndex === idx ? "bg-[var(--color-bg-alt)]" : ""}`}
                          onClick={() => setIsDropdownOpen(false)}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              setFocusedDropdownIndex(
                                (idx + 1) % solutions.length,
                              );
                            }
                            if (e.key === "ArrowUp") {
                              e.preventDefault();
                              setFocusedDropdownIndex(
                                (idx - 1 + solutions.length) % solutions.length,
                              );
                            }
                          }}
                        >
                          <div className="w-10 h-10 bg-[var(--color-surface)] rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform">
                            {item.icon}
                          </div>
                          <div>
                            <p className="text-default text-xs font-bold">
                              {item.title}
                            </p>
                            <p className="text-xs text-muted font-medium">
                              {item.desc}
                            </p>
                          </div>
                        </a>
                      ) : (
                        <a
                          href={item.href}
                          tabIndex={isDropdownOpen ? 0 : -1}
                          className={`flex items-center gap-4 p-3 rounded-2xl hover:bg-[var(--color-bg-alt)] transition-colors group/item ${focusedDropdownIndex === idx ? "bg-[var(--color-bg-alt)]" : ""}`}
                          onClick={(e) => {
                            e.preventDefault();
                            setIsDropdownOpen(false);
                            globalThis.location.href = item.href;
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              setFocusedDropdownIndex(
                                (idx + 1) % solutions.length,
                              );
                            }
                            if (e.key === "ArrowUp") {
                              e.preventDefault();
                              setFocusedDropdownIndex(
                                (idx - 1 + solutions.length) % solutions.length,
                              );
                            }
                          }}
                        >
                          <div className="w-10 h-10 bg-[var(--color-surface)] rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform">
                            {item.icon}
                          </div>
                          <div>
                            <p className="text-default text-xs font-bold">
                              {item.title}
                            </p>
                            <p className="text-xs text-muted font-medium">
                              {item.desc}
                            </p>
                          </div>
                        </a>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/#exito"
            className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline focus-visible:outline-none transition-colors"
          >
            {t.navSuccess}
          </Link>
          <Link
            to="/#contacto"
            className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline focus-visible:outline-none transition-colors"
          >
            {t.navContact}
          </Link>
          <LanguageSelector />
        </div>

        {/* Hamburger for mobile */}
        <button
          className="md:hidden flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg bg-[var(--color-accent)] text-[var(--color-on-accent)]"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <dialog
            className="fixed inset-0 z-[200] w-full h-full bg-transparent !flex justify-end m-0"
            open={isMobileMenuOpen}
          >
            <button
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-default border-none"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
              tabIndex={-1}
              type="button"
            />
            <div className="relative w-[80vw] max-w-xs h-full bg-[var(--color-bg)] border-l border-[var(--color-border)] p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-right overflow-y-auto z-10">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xl text-default">
                  SmartConnect{" "}
                  <span className="text-[var(--color-primary)]">AI</span>
                </span>
                <div className="flex items-center gap-4">
                  <LanguageSelector />
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-default p-2 rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                    aria-label="Cerrar"
                    autoFocus
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Link
                  to="/"
                  className="flex items-center gap-3 p-3 text-muted hover:bg-[var(--color-surface)] rounded-xl transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ArrowLeft className="w-5 h-5" />
                  {t.navBack}
                </Link>
                <hr className="border-[var(--color-border)] my-1" />
                <span className="px-3 py-1.5 text-xs font-bold text-muted uppercase tracking-wider">
                  {t.navSolutions}
                </span>
                {solutions.map((item) =>
                  item.external ? (
                    <a
                      key={item.id}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 min-h-[44px] text-muted hover:bg-[var(--color-surface)] focus:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xl transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon}
                      <span className="font-semibold">{item.title}</span>
                    </a>
                  ) : (
                    <a
                      key={item.id}
                      href={item.href}
                      className="flex items-center gap-3 p-3 min-h-[44px] text-muted hover:bg-[var(--color-surface)] focus:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xl transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false);
                        globalThis.location.href = item.href;
                      }}
                    >
                      {item.icon}
                      <span className="font-semibold">{item.title}</span>
                    </a>
                  ),
                )}
                <hr className="border-[var(--color-border)] my-1" />
                <a
                  href="/#exito"
                  className="flex items-center gap-3 p-3 min-h-[44px] text-muted hover:bg-[var(--color-surface)] focus:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xl transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    globalThis.location.href = "/#exito";
                  }}
                >
                  {t.navSuccess}
                </a>
                <a
                  href="/#contacto"
                  className="flex items-center gap-3 p-3 min-h-[44px] text-muted hover:bg-[var(--color-surface)] focus:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xl transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    globalThis.location.href = "/#contacto";
                  }}
                >
                  {t.navContact}
                </a>
              </div>
            </div>
          </dialog>
        )}
      </div>
    </nav>
  );
};

export default CartaDigitalNavbar;
