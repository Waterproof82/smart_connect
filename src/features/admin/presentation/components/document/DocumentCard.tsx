import React from 'react';
import { Calendar, Trash2 } from 'lucide-react';
import { SourceTag } from './SourceTag';

import { Document } from '../../../domain/entities/Document';

interface DocumentCardProps {
  doc: Document;
  onView: () => void;
  onDelete?: (e: React.MouseEvent) => void;
  canEdit: boolean;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ doc, onView, onDelete, canEdit }) => (
  <div
    className="relative bg-gray-900 border border-gray-800 rounded-xl p-4 active:scale-[0.99] transition-transform outline-none focus:ring-2 focus:ring-blue-500"
  >
    <button
      type="button"
      className="block w-full text-left focus:outline-none bg-transparent border-none p-0"
      onClick={onView}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onView();
        }
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-wrap gap-1">
          {doc.source.split(',').slice(0, 2).map((s: string) => <SourceTag key={s} source={s} />)}
          {doc.source.split(',').length > 2 && <span className="text-xs text-gray-500 self-center">+more</span>}
        </div>
        <span className="text-xs text-gray-500 flex items-center gap-1 shrink-0">
          <Calendar className="w-3 h-3" />
          {doc.createdAt.toLocaleDateString()}
        </span>
      </div>
      <p className="text-gray-300 text-sm line-clamp-3 mb-4 leading-relaxed">
        {doc.content}
      </p>
      <div className="flex justify-between items-center border-t border-gray-800 pt-3 mt-2">
        <span className="text-xs text-blue-400 font-medium">Tap to view details</span>
      </div>
    </button>
    {canEdit && (
      <button
        onClick={e => {
          e.stopPropagation();
          if (onDelete) onDelete(e);
        }}
        className="absolute bottom-4 right-4 p-2 text-red-400 bg-red-900/10 rounded-lg hover:bg-red-900/30 z-10 ml-2"
        aria-label="Delete document"
        tabIndex={0}
        type="button"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    )}
  </div>
);
