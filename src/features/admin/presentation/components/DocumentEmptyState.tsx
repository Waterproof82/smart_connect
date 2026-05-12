import React from "react";
import { Database } from "lucide-react";

export const DocumentEmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-bg-alt)]/30">
      <Database className="w-12 h-12 mb-4 opacity-50" />
      <p>No se encontraron documentos con esos criterios.</p>
    </div>
  );
};

export default DocumentEmptyState;
