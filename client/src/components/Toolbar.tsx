import React, { useRef } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import type { CanvasState } from '../types/elements';

interface ButtonProps {
  onClick: () => void;
  title?: string;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}

function Btn({ onClick, title, disabled, active, children, className = '' }: ButtonProps) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-1.5 w-full px-3 py-1.5 text-xs rounded transition
        ${active ? 'bg-indigo-600 text-white' : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="border-t border-neutral-700 my-1" />;
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <p className="text-neutral-500 text-[10px] uppercase tracking-widest px-3 py-1">{label}</p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

export default function Toolbar() {
  const {
    selectedIds,
    canUndo,
    canRedo,
    undo,
    redo,
    addRectAtCenter,
    addCircleAtCenter,
    addTextAtCenter,
    addImageAtCenter,
    duplicateElements,
    deleteElement,
    elements,
    updateElement,
    importState,
    exportState,
  } = useCanvas();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // alignElements uses updateElement from the destructured store above
  function alignElements(type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
    if (selectedIds.length === 0) return;
    const sel = elements.filter((e) => selectedIds.includes(e.id));
    let refVal: number;
    switch (type) {
      case 'left':
        refVal = Math.min(...sel.map((e) => e.x));
        sel.forEach((e) => updateElement(e.id, { x: refVal }));
        break;
      case 'right':
        refVal = Math.max(...sel.map((e) => e.x + e.width));
        sel.forEach((e) => updateElement(e.id, { x: refVal - e.width }));
        break;
      case 'center':
        refVal =
          (Math.min(...sel.map((e) => e.x)) + Math.max(...sel.map((e) => e.x + e.width))) / 2;
        sel.forEach((e) => updateElement(e.id, { x: refVal - e.width / 2 }));
        break;
      case 'top':
        refVal = Math.min(...sel.map((e) => e.y));
        sel.forEach((e) => updateElement(e.id, { y: refVal }));
        break;
      case 'bottom':
        refVal = Math.max(...sel.map((e) => e.y + e.height));
        sel.forEach((e) => updateElement(e.id, { y: refVal - e.height }));
        break;
      case 'middle':
        refVal =
          (Math.min(...sel.map((e) => e.y)) + Math.max(...sel.map((e) => e.y + e.height))) / 2;
        sel.forEach((e) => updateElement(e.id, { y: refVal - e.height / 2 }));
        break;
    }
  }

  function handleImport() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as CanvasState;
        importState(parsed);
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleExport() {
    const state = exportState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleAddImage() {
    const url = prompt('Image URL:');
    if (url) addImageAtCenter(url);
  }

  const hasSelection = selectedIds.length > 0;

  return (
    <aside className="w-[220px] flex-shrink-0 bg-neutral-800 border-r border-neutral-700 flex flex-col overflow-y-auto">
      <div className="px-3 py-3 border-b border-neutral-700">
        <h1 className="text-white font-semibold text-sm tracking-tight">🎨 Canvas Editor</h1>
      </div>

      <div className="flex-1 py-2">
        <Section label="Add Elements">
          <Btn onClick={addRectAtCenter} title="Add Rectangle">
            <span>▭</span> Rectangle
          </Btn>
          <Btn onClick={addCircleAtCenter} title="Add Circle">
            <span>◯</span> Circle
          </Btn>
          <Btn onClick={() => addTextAtCenter()} title="Add Text">
            <span>T</span> Text
          </Btn>
          <Btn onClick={handleAddImage} title="Add Image">
            <span>🖼</span> Image
          </Btn>
        </Section>

        <Divider />

        <Section label="Edit">
          <Btn onClick={() => duplicateElements(selectedIds)} disabled={!hasSelection} title="Duplicate (Ctrl+D)">
            ⧉ Duplicate
          </Btn>
          <Btn onClick={() => deleteElement(selectedIds)} disabled={!hasSelection} title="Delete (Del)">
            🗑 Delete
          </Btn>
        </Section>

        <Divider />

        <Section label="Align">
          <div className="grid grid-cols-3 gap-0.5 px-3">
            {(
              [
                ['left', '⬛↤', 'Align Left'],
                ['center', '⬛↔', 'Align Center'],
                ['right', '↦⬛', 'Align Right'],
                ['top', '⬛↑', 'Align Top'],
                ['middle', '⬛↕', 'Align Middle'],
                ['bottom', '↓⬛', 'Align Bottom'],
              ] as const
            ).map(([type, icon, label]) => (
              <button
                key={type}
                title={label}
                onClick={() => alignElements(type)}
                disabled={!hasSelection}
                className="p-1.5 text-xs rounded text-neutral-400 hover:bg-neutral-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {icon}
              </button>
            ))}
          </div>
        </Section>

        <Divider />

        <Section label="History">
          <Btn onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
            ↩ Undo
          </Btn>
          <Btn onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
            ↪ Redo
          </Btn>
        </Section>

        <Divider />

        <Section label="File">
          <Btn onClick={handleImport}>⬆ Import JSON</Btn>
          <Btn onClick={handleExport}>⬇ Export JSON</Btn>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleFileChange}
          />
        </Section>
      </div>
    </aside>
  );
}
