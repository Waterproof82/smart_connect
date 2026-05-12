import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DocumentPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const DocumentPagination: React.FC<DocumentPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
      <span className="text-sm text-muted hidden sm:block">
        Página {currentPage} de {totalPages}
      </span>
      <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-[var(--color-bg-alt)] text-default rounded-lg hover:bg-[var(--color-surface)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
          type="button"
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>
        <span className="sm:hidden text-sm text-muted flex items-center">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-[var(--color-bg-alt)] text-default rounded-lg hover:bg-[var(--color-surface)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
          type="button"
        >
          Siguiente <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DocumentPagination;
