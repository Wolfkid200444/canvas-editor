import { useCanvasStore } from '../store/canvasStore';
import type { CanvasElement } from '../types/elements';
import { v4 as uuidv4 } from 'uuid';

export function useCanvas() {
  const store = useCanvasStore();

  const selectedElements = store.elements.filter((el) =>
    store.selectedIds.includes(el.id)
  );

  const canUndo = store.past.length > 0;
  const canRedo = store.future.length > 0;

  const centerX = store.width / 2;
  const centerY = store.height / 2;

  function addRectAtCenter() {
    store.addElement({
      type: 'rect',
      x: centerX - 60,
      y: centerY - 40,
      width: 120,
      height: 80,
      rotation: 0,
      opacity: 1,
      fill: '#6366f1',
      stroke: '#4f46e5',
      strokeWidth: 1,
      cornerRadius: 4,
    } as Omit<CanvasElement, 'id' | 'zIndex'>);
  }

  function addCircleAtCenter() {
    store.addElement({
      type: 'circle',
      x: centerX - 50,
      y: centerY - 50,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      fill: '#ec4899',
      stroke: '#db2777',
      strokeWidth: 1,
    } as Omit<CanvasElement, 'id' | 'zIndex'>);
  }

  function addTextAtCenter(text = 'Text') {
    store.addElement({
      type: 'text',
      x: centerX - 60,
      y: centerY - 15,
      width: 120,
      height: 30,
      rotation: 0,
      opacity: 1,
      fill: '#f8fafc',
      stroke: 'transparent',
      strokeWidth: 0,
      text,
      fontSize: 20,
      fontFamily: 'Inter, sans-serif',
      align: 'left',
    } as Omit<CanvasElement, 'id' | 'zIndex'>);
  }

  function addImageAtCenter(src: string) {
    store.addElement({
      type: 'image',
      x: centerX - 100,
      y: centerY - 75,
      width: 200,
      height: 150,
      rotation: 0,
      opacity: 1,
      fill: 'transparent',
      stroke: 'transparent',
      strokeWidth: 0,
      src,
    } as Omit<CanvasElement, 'id' | 'zIndex'>);
  }

  return {
    ...store,
    selectedElements,
    canUndo,
    canRedo,
    addRectAtCenter,
    addCircleAtCenter,
    addTextAtCenter,
    addImageAtCenter,
  };
}
