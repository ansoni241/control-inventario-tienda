import { useState } from 'react';

interface DescriptionCellProps {
  text: string | null;
}

export function DescriptionCell({ text }: DescriptionCellProps) {
  const [expanded, setExpanded] = useState(false);
  const maxChars = 50;

  if (!text) return <span className="text-gray-400">Sin descripción</span>;

  return (
    <div>
      <span>
        {expanded ? text : text.slice(0, maxChars) + (text.length > maxChars ? '...' : '')}
      </span>
      {text.length > maxChars && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-2 text-blue-600 hover:underline text-sm"
        >
          {expanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  );
}

