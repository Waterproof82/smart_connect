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

export const SourceTag: React.FC<SourceTagProps> = ({ source, onRemove }) => {
  const trimmed = source.trim();
  const color = getSourceColor(trimmed);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mr-1 mb-1 border"
      style={{
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}50`
      }}
    >
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      {trimmed}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:text-white focus:outline-none"
          type="button"
          aria-label={`Remove tag ${trimmed}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
