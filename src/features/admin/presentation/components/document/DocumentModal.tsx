import React from 'react';
import { X } from 'lucide-react';

import { Document } from '../../../domain/entities/Document';

interface DocumentModalProps {
  isEditing: boolean;
  selectedDocument: Document;
  editedContent: string;
  editedSources: string[];
  newSourceInput: string;
  availableSources: string[];
  onClose: () => void;
  onSave: () => void;
  onEditChange: (content: string) => void;
  onSourceChange: (sources: string[]) => void;
  onSourceInputChange: (input: string) => void;
  isSaving: boolean;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isEditing,
  selectedDocument,
  editedContent,
  editedSources,
  newSourceInput,
  availableSources,
  onClose,
  onSave,
  onEditChange,
  onSourceChange,
  onSourceInputChange,
  isSaving,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
    <button
      type="button"
      className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      aria-label="Cerrar modal"
      tabIndex={0}
      onClick={onClose}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') onClose();
      }}
      style={{ cursor: 'pointer' }}
    />
    <div className="relative bg-[var(--color-bg-alt)] w-full h-full sm:h-auto sm:max-h-[85vh] sm:rounded-xl sm:border border-[var(--color-border)] flex flex-col max-w-4xl shadow-2xl">
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/95 sticky top-0 z-10">
        <h3 className="text-lg font-bold text-default flex items-center gap-2">
          {isEditing ? 'Edit Document' : 'Document Details'}
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg text-muted hover:text-[var(--color-text)]" aria-label="Close modal" type="button">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div className="bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border)]">
              <label htmlFor="edit-tags-input" className="text-xs font-medium text-muted uppercase mb-2 block">Sources</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editedSources.map(s => (
                  <span key={s} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mr-1 mb-1 bg-blue-900 text-blue-300 border border-blue-700">
                    {s}
                    <button onClick={() => onSourceChange(editedSources.filter(x => x !== s))} className="ml-1.5 hover:text-white focus:outline-none cursor-pointer" type="button" aria-label={`Remove tag ${s}`}>×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  id="edit-tags-input"
                  type="text"
                  list="available-sources-list"
                  className="flex-1 bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded px-3 py-1.5 text-sm text-default focus:ring-1 focus:ring-blue-500"
                  placeholder="Select or type tag..."
                  value={newSourceInput}
                  onChange={e => onSourceInputChange(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const val = newSourceInput.trim();
                      if (val && !editedSources.includes(val)) {
                        onSourceChange([...editedSources, val]);
                        onSourceInputChange('');
                      }
                    }
                  }}
                />
                <datalist id="available-sources-list">
                  {availableSources.map(source => (
                    <option key={source} value={source} />
                  ))}
                </datalist>
                <button
                  onClick={() => {
                    const val = newSourceInput.trim();
                    if (val && !editedSources.includes(val)) {
                      onSourceChange([...editedSources, val]);
                      onSourceInputChange('');
                    }
                  }}
                  className="px-3 py-1 bg-[var(--color-surface)] text-default text-xs rounded hover:bg-[var(--color-border)]"
                  type="button"
                >Add</button>
              </div>
            </div>
            <label htmlFor="edit-content-area" className="sr-only">Document Content</label>
            <textarea
              id="edit-content-area"
              value={editedContent}
              onChange={e => onEditChange(e.target.value)}
              className="w-full h-[50vh] sm:h-[400px] bg-[var(--color-bg-alt)] text-default p-4 rounded-lg font-mono text-sm leading-relaxed resize-none focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {selectedDocument.source.split(',').map(s => (
                <span key={s} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mr-1 mb-1 bg-blue-900 text-blue-300 border border-blue-700">{s}</span>
              ))}
            </div>
            <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)]">
              <pre className="text-sm text-default whitespace-pre-wrap font-mono leading-relaxed break-words">{selectedDocument.content}</pre>
            </div>
            <div className="text-xs text-muted pt-2 border-t border-[var(--color-border)]">
              ID: {selectedDocument.id} • Created: {selectedDocument.createdAt.toLocaleString()}
            </div>
          </>
        )}
      </div>
      <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-alt)]/95 flex justify-end gap-3 sticky bottom-0">
        {isEditing ? (
          <>
            <button onClick={onClose} className="px-4 py-2 text-default hover:text-[var(--color-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:opacity-50" disabled={isSaving} type="button">Cancel</button>
            <button onClick={onSave} disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50" type="button">{isSaving ? 'Saving...' : 'Save Changes'}</button>
          </>
        ) : (
          <button onClick={onClose} className="px-4 py-2 bg-[var(--color-surface)] text-default rounded-lg hover:bg-[var(--color-border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400" type="button">Close</button>
        )}
      </div>
    </div>
  </div>
);
