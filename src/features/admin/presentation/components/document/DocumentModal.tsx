import React from 'react';
import { X } from 'lucide-react';

interface DocumentModalProps {
  isEditing: boolean;
  selectedDocument: any;
  editedContent: string;
  editedSources: string[];
  newSourceInput: string;
  availableSources: string[];
  onClose: () => void;
  onSave: () => void;
  onEditChange: (content: string) => void;
  onSourceChange: (sources: string[]) => void;
  onSourceInputChange: (input: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
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
  onAddTag,
  onRemoveTag,
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
    <div className="relative bg-gray-900 w-full h-full sm:h-auto sm:max-h-[85vh] sm:rounded-xl sm:border border-gray-800 flex flex-col max-w-4xl shadow-2xl">
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/95 sticky top-0 z-10">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          {isEditing ? 'Edit Document' : 'Document Details'}
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white" aria-label="Close modal" type="button">
          <X className="w-6 h-6" />
        </button>
      </div>
      {/* Modal Body: implement content as needed */}
    </div>
  </div>
);
