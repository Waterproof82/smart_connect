import React from 'react';
import { X } from 'lucide-react';

interface SourceTagProps {
  source: string;
  onRemove?: () => void;
}

const TAG_PALETTE = [
  { text: 'text-[var(--color-icon-blue)]', bg: 'bg-[var(--color-icon-blue)]/10', border: 'border-[var(--color-icon-blue)]/30' },
  { text: 'text-[var(--color-icon-purple)]', bg: 'bg-[var(--color-icon-purple)]/10', border: 'border-[var(--color-icon-purple)]/30' },
  { text: 'text-[var(--color-icon-emerald)]', bg: 'bg-[var(--color-icon-emerald)]/10', border: 'border-[var(--color-icon-emerald)]/30' },
  { text: 'text-[var(--color-icon-amber)]', bg: 'bg-[var(--color-icon-amber)]/10', border: 'border-[var(--color-icon-amber)]/30' },
  { text: 'text-[var(--color-icon-rose)]', bg: 'bg-[var(--color-icon-rose)]/10', border: 'border-[var(--color-icon-rose)]/30' },
  { text: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10', border: 'border-[var(--color-primary)]/30' },
  { text: 'text-[var(--color-success-text)]', bg: 'bg-[var(--color-success-text)]/10', border: 'border-[var(--color-success-text)]/30' },
  { text: 'text-[var(--color-warning)]', bg: 'bg-[var(--color-warning)]/10', border: 'border-[var(--color-warning)]/30' },
] as const;

const getSourceColor = (source: string) => {
  let hash = 5381;
  for (let i = 0; i < source.length; i++) {
    const code = source.codePointAt(i) ?? 0;
    hash = ((hash << 5) + hash) + code;
  }
  return TAG_PALETTE[((hash % TAG_PALETTE.length) + TAG_PALETTE.length) % TAG_PALETTE.length];
};

export const SourceTag: React.FC<SourceTagProps> = React.memo(({ source, onRemove }) => {
  const trimmed = source.trim();
  const color = getSourceColor(trimmed);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mr-1 mb-1 border ${color.text} ${color.bg} ${color.border}`}
    >
      {trimmed}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 p-1 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-[var(--color-overlay-medium)] focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
          type="button"
          aria-label={`Eliminar etiqueta ${trimmed}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
});
SourceTag.displayName = 'SourceTag';
