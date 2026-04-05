import React, { useState } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import type { CanvasElement } from '../types/elements';

const TYPE_ICONS: Record<string, string> = {
  rect: '▭',
  circle: '◯',
  line: '╱',
  text: 'T',
  image: '🖼',
};

interface LayerItemProps {
  element: CanvasElement;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: () => void;
}

function LayerItem({
  element,
  index,
  isSelected,
  onSelect,
  onDelete,
  onToggleVisibility,
  onDragStart,
  onDragOver,
  onDrop,
}: LayerItemProps) {
  const isVisible = element.opacity > 0;
  const name = element.type === 'text'
    ? `"${element.text.slice(0, 12)}${element.text.length > 12 ? '…' : ''}"`
    : `${element.type} ${element.id.slice(0, 4)}`;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
      onDrop={onDrop}
      onClick={onSelect}
      className={`
        flex items-center gap-2 px-3 py-1.5 cursor-pointer select-none group
        ${isSelected ? 'bg-indigo-600/30 border-l-2 border-indigo-500' : 'hover:bg-neutral-700 border-l-2 border-transparent'}
      `}
    >
      <span className="text-neutral-400 text-xs w-4">{TYPE_ICONS[element.type]}</span>
      <span className={`flex-1 text-xs truncate ${isSelected ? 'text-indigo-300' : 'text-neutral-300'}`}>
        {name}
      </span>
      <button
        title={isVisible ? 'Hide' : 'Show'}
        onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
        className="text-neutral-500 hover:text-neutral-200 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {isVisible ? '👁' : '🙈'}
      </button>
      <button
        title="Delete"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="text-neutral-500 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
}

export default function LayersPanel() {
  const { elements, selectedIds, selectElement, deleteElement, updateElement, reorderElement } = useCanvas();
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  function handleDrop(toIndex: number) {
    if (dragFrom === null || dragFrom === toIndex) return;
    const el = sorted[dragFrom];
    const newZIndex = sorted.length - 1 - toIndex;
    reorderElement(el.id, newZIndex);
    setDragFrom(null);
    setDragOver(null);
  }

  return (
    <div className="flex flex-col border-t border-neutral-700 flex-1 min-h-0">
      <div className="px-3 py-2 border-b border-neutral-700 flex items-center justify-between">
        <h2 className="text-white font-semibold text-xs uppercase tracking-widest">Layers</h2>
        <span className="text-neutral-500 text-xs">{elements.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <p className="text-neutral-600 text-xs text-center py-6">No layers yet</p>
        ) : (
          sorted.map((el, idx) => (
            <div
              key={el.id}
              className={`transition-all ${dragOver === idx && dragFrom !== idx ? 'border-t-2 border-indigo-500' : ''}`}
            >
              <LayerItem
                element={el}
                index={idx}
                isSelected={selectedIds.includes(el.id)}
                onSelect={() => selectElement([el.id])}
                onDelete={() => deleteElement([el.id])}
                onToggleVisibility={() =>
                  updateElement(el.id, { opacity: el.opacity > 0 ? 0 : 1 } as Partial<CanvasElement>)
                }
                onDragStart={setDragFrom}
                onDragOver={setDragOver}
                onDrop={() => handleDrop(idx)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
