import React from "react";
import { X } from "lucide-react";

interface DocumentCreateModalProps {
  isOpen: boolean;
  availableSources: string[];
  newDocument: {
    content: string;
    source: string;
    metadata: Record<string, unknown>;
  };
  customSource: string;
  isCreating: boolean;
  onClose: () => void;
  onCreate: () => void;
  onDocumentChange: (doc: {
    content: string;
    source: string;
    metadata: Record<string, unknown>;
  }) => void;
  onCustomSourceChange: (value: string) => void;
}

export const DocumentCreateModal: React.FC<DocumentCreateModalProps> = ({
  isOpen,
  availableSources,
  newDocument,
  customSource,
  isCreating,
  onClose,
  onCreate,
  onDocumentChange,
  onCustomSourceChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
      <button
        className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative bg-[var(--color-bg-alt)] w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-xl border border-[var(--color-border)] flex flex-col max-w-4xl">
        <div className="flex justify-between p-5 border-b border-[var(--color-border)]">
          <h3 className="text-xl font-bold text-default">Nuevo Documento</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-[var(--color-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg p-1"
            aria-label="Close modal"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Source Selection */}
          <div>
            <label
              htmlFor="create-source-select"
              className="block text-sm font-medium text-muted mb-2"
            >
              Fuente
            </label>
            <select
              id="create-source-select"
              value={newDocument.source}
              onChange={(e) =>
                onDocumentChange({ ...newDocument, source: e.target.value })
              }
              className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg p-2.5 text-default focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">Selecciona fuente</option>
              {availableSources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value="_custom_">+ Nueva fuente</option>
            </select>
            {newDocument.source === "_custom_" && (
              <div className="mt-2">
                <label htmlFor="custom-source-input" className="sr-only">
                  Nombre de la nueva fuente
                </label>
                <input
                  id="custom-source-input"
                  type="text"
                  placeholder="Escribe el nombre de la fuente..."
                  className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg p-2.5 text-default"
                  value={customSource}
                  onChange={(e) => onCustomSourceChange(e.target.value)}
                />
              </div>
            )}
          </div>
          {/* Content Input */}
          <div>
            <label
              htmlFor="create-content-area"
              className="block text-sm font-medium text-muted mb-2"
            >
              Contenido
            </label>
            <textarea
              id="create-content-area"
              className="w-full h-64 bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg p-4 text-default font-mono text-sm focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="Pega el contenido aquí..."
              value={newDocument.content}
              onChange={(e) =>
                onDocumentChange({ ...newDocument, content: e.target.value })
              }
            />
          </div>
        </div>
        <div className="p-5 border-t border-[var(--color-border)] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-default hover:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded-lg"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={onCreate}
            disabled={isCreating}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 text-white rounded-lg font-medium disabled:opacity-50"
            type="button"
          >
            {isCreating ? "Creando..." : "Crear documento"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentCreateModal;
