export type ElementType = 'rect' | 'circle' | 'line' | 'text' | 'image';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface RectElement extends BaseElement {
  type: 'rect';
  cornerRadius: number;
}

export interface CircleElement extends BaseElement {
  type: 'circle';
}

export interface LineElement extends BaseElement {
  type: 'line';
  points: number[];
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  align: string;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
}

export type CanvasElement =
  | RectElement
  | CircleElement
  | LineElement
  | TextElement
  | ImageElement;

export interface CanvasState {
  width: number;
  height: number;
  background: string;
  elements: CanvasElement[];
}
