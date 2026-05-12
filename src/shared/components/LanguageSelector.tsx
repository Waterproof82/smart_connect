import React from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted" aria-hidden="true" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as "es" | "en")}
        className="bg-transparent text-sm font-semibold text-muted cursor-pointer border-none outline-none hover:text-[var(--color-text)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded transition-colors"
        aria-label={
          language === "es" ? "Seleccionar idioma" : "Select language"
        }
      >
        <option value="es" className="text-default bg-[var(--color-bg)]">
          ES
        </option>
        <option value="en" className="text-default bg-[var(--color-bg)]">
          EN
        </option>
      </select>
    </div>
  );
};

export default LanguageSelector;
