import React from "react";
import { X, Edit2 } from "lucide-react";
import { Document } from "../../domain/entities/Document";
import { SourceTag } from "./document";

interface DocumentViewModalProps {
  document: Document | null;
  isEditing: boolean;
  editedContent: string;
  editedSources: string[];
  newSourceInput: string;
  availableSources: string[];
  isSaving: boolean;
  canEdit: boolean;
  onClose: () => void;
  onEditOpen: (doc: Document) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onContentChange: (content: string) => void;
  onSourceInputChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const DocumentViewModal: React.FC<DocumentViewModalProps> = ({
  document,
  isEditing,
  editedContent,
  editedSources,
  newSourceInput,
  availableSources,
  isSaving,
  canEdit,
  onClose,
  onEditOpen,
  onSave,
  onCancelEdit,
  onContentChange,
  onSourceInputChange,
  onAddTag,
  onRemoveTag,
  onKeyDown,
}) => {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        aria-label="Cerrar modal"
        tabIndex={0}
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClose();
        }}
        style={{ cursor: "pointer" }}
      />
      <div className="relative bg-[var(--color-bg-alt)] w-full h-full sm:h-auto sm:max-h-[85vh] sm:rounded-xl sm:border border-[var(--color-border)] flex flex-col max-w-4xl shadow-lg">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/95 sticky top-0 z-10">
          <h3 className="text-lg font-bold text-default flex items-center gap-2">
            {isEditing ? "Editar documento" : "Detalles del documento"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-surface)] rounded-lg text-muted hover:text-[var(--color-text)]"
            aria-label="Close modal"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div className="bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border)]">
                <label
                  htmlFor="edit-tags-input"
                  className="text-xs font-medium text-muted uppercase mb-2 block"
                >
                  Fuentes
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editedSources.map((s) => (
                    <SourceTag
                      key={s}
                      source={s}
                      onRemove={() => onRemoveTag(s)}
                    />
                  ))}
                </div>
                <label
                  htmlFor="edit-tags-input"
                  className="block text-xs font-medium text-muted uppercase mb-2"
                >
                  Fuentes
                </label>
                <div className="flex gap-2">
                  <input
                    id="edit-tags-input"
                    type="text"
                    list="available-sources-list"
                    className="flex-1 bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded px-3 py-1.5 text-sm text-default focus:ring-1 focus:ring-[var(--color-primary)]"
                    placeholder="Selecciona o escribe una etiqueta..."
                    value={newSourceInput}
                    onChange={(e) => onSourceInputChange(e.target.value)}
                    onKeyDown={onKeyDown}
                  />
                  <datalist id="available-sources-list">
                    {availableSources.map((source) => (
                      <option key={source} value={source} />
                    ))}
                  </datalist>

                  <button
                    onClick={onAddTag}
                    className="px-3 py-1 bg-[var(--color-surface)] text-default text-xs rounded hover:bg-[var(--color-border)]"
                    type="button"
                  >
                    Añadir
                  </button>
                </div>
              </div>
              <label
                htmlFor="edit-content-area"
                className="block text-xs font-medium text-muted uppercase mb-2"
              >
                Contenido
              </label>
              <textarea
                id="edit-content-area"
                value={editedContent}
                onChange={(e) => onContentChange(e.target.value)}
                className="w-full h-[50vh] sm:h-[400px] bg-[var(--color-bg-alt)] text-default p-4 rounded-lg font-mono text-sm leading-relaxed resize-none focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {document.source.split(",").map((s) => (
                  <SourceTag key={s} source={s} />
                ))}
              </div>
              <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)]">
                <pre className="text-sm text-default whitespace-pre-wrap font-mono leading-relaxed break-words">
                  {document.content}
                </pre>
              </div>
              <div className="text-xs text-muted pt-2 border-t border-[var(--color-border)]">
                ID: {document.id} • Created:{" "}
                {document.createdAt.toLocaleString()}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-alt)]/95 flex justify-end gap-3 sticky bottom-0">
          {isEditing ? (
            <>
              <button
                onClick={onCancelEdit}
                className="px-4 py-2 text-default hover:text-[var(--color-text)]"
                disabled={isSaving}
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={isSaving}
                className="px-6 py-2 bg-[var(--color-accent)] text-[var(--color-on-accent)] rounded-lg hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
                type="button"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <>
              {canEdit && (
                <button
                  onClick={() => onEditOpen(document)}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-alt)] text-default rounded-lg hover:bg-[var(--color-surface)]"
                  type="button"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[var(--color-surface)] text-default rounded-lg hover:bg-[var(--color-border)]"
                type="button"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewModal;
