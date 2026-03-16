import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { SourceTag } from './SourceTag';
import { Document } from '../../../domain/entities/Document';

interface DocumentTableProps {
  documents: Document[];
  onView: (doc: Document) => void;
  onEdit: (doc: Document) => void;
  onDelete: (docId: string) => void;
  canEdit: boolean;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({ documents, onView, onEdit, onDelete, canEdit }) => (
  <table className="min-w-full divide-y divide-[var(--color-border)]">
    <thead className="bg-[var(--color-surface)]">
      <tr>
        <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Content Preview</th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Source</th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Created</th>
        <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-[var(--color-border)]">
      {documents.map(doc => (
        <tr key={doc.id} className="hover:bg-[var(--color-surface)]/40 transition-colors group focus-within:bg-[var(--color-surface)]/30">
          <td className="px-6 py-4 text-sm text-default max-w-md">
            <button onClick={() => onView(doc)} className="text-left hover:text-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded transition-colors line-clamp-2 w-full">
              {doc.getContentPreview ? doc.getContentPreview(120) : doc.content}
            </button>
          </td>
          <td className="px-6 py-4">
            <div className="flex flex-wrap gap-1 max-w-[200px]">
              {doc.source.split(',').map((s: string) => <SourceTag key={s} source={s} />)}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
            {doc.createdAt.toLocaleDateString()}
          </td>
          <td className="px-6 py-4 text-center">
            <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <button onClick={() => onEdit(doc)} className="p-1.5 text-blue-400 hover:bg-blue-900/30 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" aria-label="Edit document">
                <Edit2 className="w-4 h-4" />
              </button>
              {canEdit && (
                <button onClick={() => onDelete(doc.id)} className="p-1.5 text-red-400 hover:bg-red-900/30 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400" aria-label="Delete document">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
