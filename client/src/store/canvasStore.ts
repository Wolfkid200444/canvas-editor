import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { CanvasElement, CanvasState } from '../types/elements';

interface HistoryEntry {
  elements: CanvasElement[];
  width: number;
  height: number;
  background: string;
}

interface CanvasStore {
  // Canvas state
  width: number;
  height: number;
  background: string;
  elements: CanvasElement[];

  // Selection
  selectedIds: string[];

  // History
  past: HistoryEntry[];
  future: HistoryEntry[];

  // Actions
  addElement: (element: Omit<CanvasElement, 'id' | 'zIndex'>) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (ids: string[]) => void;
  selectElement: (ids: string[]) => void;
  clearSelection: () => void;
  undo: () => void;
  redo: () => void;
  importState: (state: CanvasState) => void;
  exportState: () => CanvasState;
  setCanvasSize: (width: number, height: number) => void;
  setBackground: (background: string) => void;
  duplicateElements: (ids: string[]) => void;
  reorderElement: (id: string, newZIndex: number) => void;
}

function snapshot(store: Pick<CanvasStore, 'elements' | 'width' | 'height' | 'background'>): HistoryEntry {
  return {
    elements: JSON.parse(JSON.stringify(store.elements)),
    width: store.width,
    height: store.height,
    background: store.background,
  };
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  width: 800,
  height: 600,
  background: '#1e1e2e',
  elements: [],
  selectedIds: [],
  past: [],
  future: [],

  addElement: (element) => {
    const state = get();
    const past = [...state.past, snapshot(state)];
    const maxZ = state.elements.reduce((m, e) => Math.max(m, e.zIndex), 0);
    const newEl = { ...element, id: uuidv4(), zIndex: maxZ + 1 } as CanvasElement;
    set({ elements: [...state.elements, newEl], past, future: [], selectedIds: [newEl.id] });
  },

  updateElement: (id, updates) => {
    const state = get();
    const past = [...state.past, snapshot(state)];
    const elements = state.elements.map((el) =>
      el.id === id ? ({ ...el, ...updates } as CanvasElement) : el
    );
    set({ elements, past, future: [] });
  },

  deleteElement: (ids) => {
    const state = get();
    const past = [...state.past, snapshot(state)];
    const elements = state.elements.filter((el) => !ids.includes(el.id));
    const selectedIds = state.selectedIds.filter((id) => !ids.includes(id));
    set({ elements, past, future: [], selectedIds });
  },

  selectElement: (ids) => set({ selectedIds: ids }),

  clearSelection: () => set({ selectedIds: [] }),

  undo: () => {
    const state = get();
    if (state.past.length === 0) return;
    const past = [...state.past];
    const entry = past.pop()!;
    const future = [snapshot(state), ...state.future];
    set({
      elements: entry.elements,
      width: entry.width,
      height: entry.height,
      background: entry.background,
      past,
      future,
      selectedIds: [],
    });
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return;
    const future = [...state.future];
    const entry = future.shift()!;
    const past = [...state.past, snapshot(state)];
    set({
      elements: entry.elements,
      width: entry.width,
      height: entry.height,
      background: entry.background,
      past,
      future,
      selectedIds: [],
    });
  },

  importState: (canvasState) => {
    const state = get();
    const past = [...state.past, snapshot(state)];
    set({
      elements: canvasState.elements,
      width: canvasState.width,
      height: canvasState.height,
      background: canvasState.background,
      past,
      future: [],
      selectedIds: [],
    });
  },

  exportState: () => {
    const { width, height, background, elements } = get();
    return { width, height, background, elements };
  },

  setCanvasSize: (width, height) => {
    const state = get();
    const past = [...state.past, snapshot(state)];
    set({ width, height, past, future: [] });
  },

  setBackground: (background) => {
    const state = get();
    const past = [...state.past, snapshot(state)];
    set({ background, past, future: [] });
  },

  duplicateElements: (ids) => {
    const state = get();
    const past = [...state.past, snapshot(state)];
    const maxZ = state.elements.reduce((m, e) => Math.max(m, e.zIndex), 0);
    const toDup = state.elements.filter((el) => ids.includes(el.id));
    const duped = toDup.map((el, i) => ({
      ...el,
      id: uuidv4(),
      x: el.x + 20,
      y: el.y + 20,
      zIndex: maxZ + i + 1,
    })) as CanvasElement[];
    set({
      elements: [...state.elements, ...duped],
      past,
      future: [],
      selectedIds: duped.map((e) => e.id),
    });
  },

  reorderElement: (id, newZIndex) => {
    const state = get();
    const past = [...state.past, snapshot(state)];
    const sorted = [...state.elements].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex((e) => e.id === id);
    if (idx === -1) return;
    sorted.splice(idx, 1);
    sorted.splice(newZIndex, 0, state.elements.find((e) => e.id === id)!);
    const elements = sorted.map((el, i) => ({ ...el, zIndex: i }));
    set({ elements, past, future: [] });
  },
}));
