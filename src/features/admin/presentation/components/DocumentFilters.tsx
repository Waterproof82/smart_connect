import React from "react";
import { Search, Filter, Plus } from "lucide-react";

interface DocumentFiltersProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  sourceFilter: string;
  onSourceFilterChange: (value: string) => void;
  availableSources: string[];
  onSearch: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  onCreateClick: () => void;
  canCreate: boolean;
}

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  searchText,
  onSearchChange,
  sourceFilter,
  onSourceFilterChange,
  availableSources,
  onSearch,
  onCreateClick,
  canCreate,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-[var(--color-bg-alt)]/50 p-4 rounded-xl border border-[var(--color-border)]">
      <form
        onSubmit={onSearch}
        className="w-full md:w-auto flex flex-col md:flex-row gap-3 flex-1 max-w-3xl"
      >
        <div className="relative w-full md:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
            <Filter className="w-4 h-4" />
          </div>
          <label htmlFor="sourceFilter" className="sr-only">
            Filtrar por fuente
          </label>
          <select
            id="sourceFilter"
            value={sourceFilter}
            onChange={(e) => onSourceFilterChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg text-sm text-default focus:ring-2 focus:ring-[var(--color-primary)] appearance-none"
          >
            <option value="">Todas las fuentes</option>
            {availableSources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 w-full md:flex-1">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
              <Search className="w-4 h-4" />
            </div>
            <label htmlFor="searchInput" className="sr-only">
              Buscar en el contenido
            </label>
            <input
              id="searchInput"
              type="text"
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar contenido..."
              className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg text-sm text-default focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] text-[var(--color-on-accent)] rounded-lg transition-colors"
          >
            Buscar
          </button>
        </div>
      </form>

      {canCreate && (
        <button
          onClick={onCreateClick}
          className="w-full md:w-auto px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-medium shadow-lg shadow-green-900/20"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo documento</span>
        </button>
      )}
    </div>
  );
};

export default DocumentFilters;
