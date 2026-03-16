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

export const DocumentCard: React.FC<DocumentCardProps> = React.memo(({ doc, onView, onDelete, canEdit }) => (
  <div
    className="relative bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl p-4 active:scale-[0.99] transition-transform outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
  >
    <button
      type="button"
      className="block w-full text-left focus:outline-none bg-transparent border-none p-0"
      onClick={onView}
      aria-label={`Ver documento: ${doc.content.slice(0, 50)}`}
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
          {doc.source.split(',').length > 2 && <span className="text-xs text-muted self-center">+more</span>}
        </div>
        <span className="text-xs text-muted flex items-center gap-1 shrink-0">
          <Calendar className="w-3 h-3" />
          {doc.createdAt.toLocaleDateString()}
        </span>
      </div>
      <p className="text-default text-sm line-clamp-3 mb-4 leading-relaxed">
        {doc.content}
      </p>
      <div className="flex justify-between items-center border-t border-[var(--color-border)] pt-3 mt-2">
        <span className="text-xs text-[var(--color-primary)] font-medium">Toca para ver detalles</span>
      </div>
    </button>
    {canEdit && (
      <button
        onClick={e => {
          e.stopPropagation();
          if (onDelete) onDelete(e);
        }}
        className="absolute bottom-4 right-4 p-2 text-[var(--color-error-text)] bg-[var(--color-error-bg)] rounded-lg hover:opacity-80 z-10 ml-2"
        aria-label="Eliminar documento"
        tabIndex={0}
        type="button"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    )}
  </div>
));
DocumentCard.displayName = 'DocumentCard';
