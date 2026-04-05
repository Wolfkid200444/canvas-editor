import React from 'react';
import { useCanvas } from '../hooks/useCanvas';
import type { CanvasElement } from '../types/elements';

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <label className="text-neutral-400 text-xs w-20 flex-shrink-0">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full bg-neutral-700 border border-neutral-600 text-neutral-100 text-xs rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
    />
  );
}

function TextInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-neutral-700 border border-neutral-600 text-neutral-100 text-xs rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
    />
  );
}

function ColorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value === 'transparent' ? '#000000' : value}
        onChange={(e) => onChange(e.target.value)}
        className="w-7 h-7 rounded cursor-pointer border border-neutral-600 bg-neutral-700 p-0.5"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-neutral-700 border border-neutral-600 text-neutral-100 text-xs rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
      />
    </div>
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-neutral-700 border border-neutral-600 text-neutral-100 text-xs rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-neutral-500 text-[10px] uppercase tracking-widest mb-2 mt-3">{children}</p>
  );
}

export default function PropertiesPanel() {
  const {
    width,
    height,
    background,
    setCanvasSize,
    setBackground,
    selectedIds,
    selectedElements,
    updateElement,
  } = useCanvas();

  const selected = selectedElements[0] as CanvasElement | undefined;

  function upd(updates: Partial<CanvasElement>) {
    if (!selected) return;
    updateElement(selected.id, updates);
  }

  return (
    <aside className="w-[260px] flex-shrink-0 bg-neutral-800 border-l border-neutral-700 overflow-y-auto">
      <div className="px-3 py-3 border-b border-neutral-700">
        <h2 className="text-white font-semibold text-sm">Properties</h2>
      </div>

      <div className="px-3 py-3">
        {!selected ? (
          <>
            <SectionTitle>Canvas</SectionTitle>
            <Field label="Width">
              <NumberInput
                value={width}
                onChange={(v) => setCanvasSize(v, height)}
                min={1}
              />
            </Field>
            <Field label="Height">
              <NumberInput
                value={height}
                onChange={(v) => setCanvasSize(width, v)}
                min={1}
              />
            </Field>
            <Field label="Background">
              <ColorInput value={background} onChange={setBackground} />
            </Field>
          </>
        ) : (
          <>
            <SectionTitle>Transform</SectionTitle>
            <Field label="X">
              <NumberInput value={Math.round(selected.x)} onChange={(v) => upd({ x: v } as Partial<CanvasElement>)} />
            </Field>
            <Field label="Y">
              <NumberInput value={Math.round(selected.y)} onChange={(v) => upd({ y: v } as Partial<CanvasElement>)} />
            </Field>
            <Field label="Width">
              <NumberInput value={Math.round(selected.width)} onChange={(v) => upd({ width: v } as Partial<CanvasElement>)} min={1} />
            </Field>
            <Field label="Height">
              <NumberInput value={Math.round(selected.height)} onChange={(v) => upd({ height: v } as Partial<CanvasElement>)} min={1} />
            </Field>
            <Field label="Rotation">
              <NumberInput value={Math.round(selected.rotation)} onChange={(v) => upd({ rotation: v } as Partial<CanvasElement>)} min={-360} max={360} />
            </Field>
            <Field label="Opacity">
              <NumberInput
                value={selected.opacity}
                onChange={(v) => upd({ opacity: Math.min(1, Math.max(0, v)) } as Partial<CanvasElement>)}
                min={0}
                max={1}
                step={0.01}
              />
            </Field>

            <SectionTitle>Appearance</SectionTitle>
            {selected.type !== 'line' && (
              <Field label="Fill">
                <ColorInput value={selected.fill} onChange={(v) => upd({ fill: v } as Partial<CanvasElement>)} />
              </Field>
            )}
            <Field label="Stroke">
              <ColorInput value={selected.stroke} onChange={(v) => upd({ stroke: v } as Partial<CanvasElement>)} />
            </Field>
            <Field label="Stroke W">
              <NumberInput
                value={selected.strokeWidth}
                onChange={(v) => upd({ strokeWidth: v } as Partial<CanvasElement>)}
                min={0}
              />
            </Field>

            {selected.type === 'rect' && (
              <>
                <SectionTitle>Rectangle</SectionTitle>
                <Field label="Radius">
                  <NumberInput
                    value={selected.cornerRadius}
                    onChange={(v) => upd({ cornerRadius: v } as Partial<CanvasElement>)}
                    min={0}
                  />
                </Field>
              </>
            )}

            {selected.type === 'text' && (
              <>
                <SectionTitle>Text</SectionTitle>
                <Field label="Content">
                  <TextInput
                    value={selected.text}
                    onChange={(v) => upd({ text: v } as Partial<CanvasElement>)}
                  />
                </Field>
                <Field label="Font Size">
                  <NumberInput
                    value={selected.fontSize}
                    onChange={(v) => upd({ fontSize: v } as Partial<CanvasElement>)}
                    min={1}
                  />
                </Field>
                <Field label="Font">
                  <SelectInput
                    value={selected.fontFamily}
                    onChange={(v) => upd({ fontFamily: v } as Partial<CanvasElement>)}
                    options={[
                      { value: 'Inter, sans-serif', label: 'Inter' },
                      { value: 'Arial', label: 'Arial' },
                      { value: 'Georgia', label: 'Georgia' },
                      { value: 'Courier New', label: 'Courier New' },
                      { value: 'Times New Roman', label: 'Times New Roman' },
                      { value: 'Verdana', label: 'Verdana' },
                    ]}
                  />
                </Field>
                <Field label="Align">
                  <SelectInput
                    value={selected.align}
                    onChange={(v) => upd({ align: v } as Partial<CanvasElement>)}
                    options={[
                      { value: 'left', label: 'Left' },
                      { value: 'center', label: 'Center' },
                      { value: 'right', label: 'Right' },
                    ]}
                  />
                </Field>
              </>
            )}

            {selected.type === 'image' && (
              <>
                <SectionTitle>Image</SectionTitle>
                <Field label="URL">
                  <TextInput
                    value={selected.src}
                    onChange={(v) => upd({ src: v } as Partial<CanvasElement>)}
                  />
                </Field>
              </>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
