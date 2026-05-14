/**
 * Theme Context
 *
 * Clean Architecture: Shared Context Layer
 *
 * Light/dark theme toggle with system preference detection.
 * Persists user choice in localStorage.
 * Also manages the html lang attribute for i18n.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "sc_theme";

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";
  // Read from the <html> class set by the inline theme script in index.html.
  // The inline script uses matchMedia BEFORE React hydrates and adds 'light'
  // to <html> if needed. Reading from the DOM instead of re-evaluating
  // matchMedia/localStorage ensures SSR and client produce the same tree.
  if (document.documentElement.classList.contains("light")) return "light";
  return "dark";
};

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("light", theme === "light");
  document.documentElement.classList.toggle("dark", theme === "dark");
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Apply theme on mount and restore saved preference post-hydration
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      setThemeState(saved);
      applyTheme(saved);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  // Listen for system preference changes when no explicit choice is saved
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const newTheme = e.matches ? "light" : "dark";
        setThemeState(newTheme);
      }
    };
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem(STORAGE_KEY, newTheme);
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme, setTheme }),
    [theme, toggleTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
