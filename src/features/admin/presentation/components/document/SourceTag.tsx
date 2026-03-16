import React from 'react';
import { X } from 'lucide-react';

interface SourceTagProps {
  source: string;
  onRemove?: () => void;
}

const getSourceColor = (source: string): string => {
  let hash = 5381;
  for (let i = 0; i < source.length; i++) {
    const code = source.codePointAt(i) ?? 0;
    hash = ((hash << 5) + hash) + code;
  }
  const hue = (hash % 360 + 360) % 360;
  const sat = 65 + ((hash >> 8) % 15);
  const light = 50 + ((hash >> 16) % 10);
  return `hsl(${hue}, ${sat}%, ${light}%)`;
};

export const SourceTag: React.FC<SourceTagProps> = React.memo(({ source, onRemove }) => {
  const trimmed = source.trim();
  const color = getSourceColor(trimmed);
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mr-1 mb-1"
      style={{
        backgroundColor: `${color}15`,
        color: color,
        border: `1px solid ${color}40`
      }}
    >
      {trimmed}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 p-1 min-w-[28px] min-h-[28px] flex items-center justify-center rounded-full hover:bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
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
