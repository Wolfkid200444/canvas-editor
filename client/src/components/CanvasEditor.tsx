import React, { useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';
import type Konva from 'konva';
import { useCanvas } from '../hooks/useCanvas';
import type { CanvasElement, ImageElement } from '../types/elements';

const GRID_SIZE = 20;

function GridLines({ width, height }: { width: number; height: number }) {
  const lines: React.ReactElement[] = [];
  for (let x = 0; x <= width; x += GRID_SIZE) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, height]}
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={1}
        listening={false}
      />
    );
  }
  for (let y = 0; y <= height; y += GRID_SIZE) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, width, y]}
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={1}
        listening={false}
      />
    );
  }
  return <>{lines}</>;
}

interface KonvaImageElProps {
  element: ImageElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<ImageElement>) => void;
}

function KonvaImageEl({ element, isSelected, onSelect, onChange }: KonvaImageElProps) {
  const [image] = useImage(element.src, 'anonymous');
  return (
    <KonvaImage
      id={element.id}
      image={image}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      opacity={element.opacity}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: Math.round(e.target.x() / GRID_SIZE) * GRID_SIZE,
          y: Math.round(e.target.y() / GRID_SIZE) * GRID_SIZE,
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          x: Math.round(node.x() / GRID_SIZE) * GRID_SIZE,
          y: Math.round(node.y() / GRID_SIZE) * GRID_SIZE,
          width: Math.max(5, Math.round((node.width() * scaleX) / GRID_SIZE) * GRID_SIZE),
          height: Math.max(5, Math.round((node.height() * scaleY) / GRID_SIZE) * GRID_SIZE),
          rotation: node.rotation(),
        });
      }}
    />
  );
}

interface ElementNodeProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<CanvasElement>) => void;
}

function ElementNode({ element, isSelected, onSelect, onChange }: ElementNodeProps) {
  const commonDrag = {
    draggable: true,
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      onChange({
        x: Math.round(e.target.x() / GRID_SIZE) * GRID_SIZE,
        y: Math.round(e.target.y() / GRID_SIZE) * GRID_SIZE,
      } as Partial<CanvasElement>);
    },
  };

  const onTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    onChange({
      x: Math.round(node.x() / GRID_SIZE) * GRID_SIZE,
      y: Math.round(node.y() / GRID_SIZE) * GRID_SIZE,
      width: Math.max(5, Math.round((node.width() * scaleX) / GRID_SIZE) * GRID_SIZE),
      height: Math.max(5, Math.round((node.height() * scaleY) / GRID_SIZE) * GRID_SIZE),
      rotation: node.rotation(),
    } as Partial<CanvasElement>);
  };

  if (element.type === 'image') {
    return (
      <KonvaImageEl
        element={element}
        isSelected={isSelected}
        onSelect={onSelect}
        onChange={(u) => onChange(u as Partial<CanvasElement>)}
      />
    );
  }

  if (element.type === 'rect') {
    return (
      <Rect
        id={element.id}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation}
        opacity={element.opacity}
        fill={element.fill}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth}
        cornerRadius={element.cornerRadius}
        onClick={onSelect}
        onTap={onSelect}
        onTransformEnd={onTransformEnd}
        {...commonDrag}
      />
    );
  }

  if (element.type === 'circle') {
    return (
      <Circle
        id={element.id}
        x={element.x + element.width / 2}
        y={element.y + element.height / 2}
        radiusX={element.width / 2}
        radiusY={element.height / 2}
        rotation={element.rotation}
        opacity={element.opacity}
        fill={element.fill}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth}
        onClick={onSelect}
        onTap={onSelect}
        onTransformEnd={(e) => {
          const node = e.target;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          const newW = Math.max(5, Math.round((element.width * scaleX) / GRID_SIZE) * GRID_SIZE);
          const newH = Math.max(5, Math.round((element.height * scaleY) / GRID_SIZE) * GRID_SIZE);
          onChange({
            x: Math.round((node.x() - newW / 2) / GRID_SIZE) * GRID_SIZE,
            y: Math.round((node.y() - newH / 2) / GRID_SIZE) * GRID_SIZE,
            width: newW,
            height: newH,
            rotation: node.rotation(),
          } as Partial<CanvasElement>);
        }}
        draggable
        onDragEnd={(e) => {
          onChange({
            x: Math.round((e.target.x() - element.width / 2) / GRID_SIZE) * GRID_SIZE,
            y: Math.round((e.target.y() - element.height / 2) / GRID_SIZE) * GRID_SIZE,
          } as Partial<CanvasElement>);
        }}
      />
    );
  }

  if (element.type === 'line') {
    return (
      <Line
        id={element.id}
        x={element.x}
        y={element.y}
        points={element.points}
        rotation={element.rotation}
        opacity={element.opacity}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth}
        onClick={onSelect}
        onTap={onSelect}
        {...commonDrag}
      />
    );
  }

  if (element.type === 'text') {
    return (
      <Text
        id={element.id}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation}
        opacity={element.opacity}
        fill={element.fill}
        text={element.text}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        align={element.align as 'left' | 'center' | 'right'}
        onClick={onSelect}
        onTap={onSelect}
        onTransformEnd={onTransformEnd}
        {...commonDrag}
      />
    );
  }

  return null;
}

export default function CanvasEditor() {
  const {
    width,
    height,
    background,
    elements,
    selectedIds,
    selectElement,
    clearSelection,
    updateElement,
    deleteElement,
    duplicateElements,
    undo,
    redo,
    addRectAtCenter,
    canUndo,
    canRedo,
  } = useCanvas();

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fit stage in container
  const [scale, setScale] = React.useState(1);
  const [stagePos, setStagePos] = React.useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const padding = 40;
    const sx = (clientWidth - padding * 2) / width;
    const sy = (clientHeight - padding * 2) / height;
    const s = Math.min(sx, sy, 1);
    setScale(s);
    setStagePos({
      x: (clientWidth - width * s) / 2,
      y: (clientHeight - height * s) / 2,
    });
  }, [width, height]);

  // Update transformer
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    const stage = stageRef.current;
    const nodes = selectedIds
      .map((id) => stage.findOne(`#${id}`))
      .filter(Boolean) as Konva.Node[];
    transformerRef.current.nodes(nodes);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedIds, elements]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) deleteElement(selectedIds);
      } else if (e.key === 'Escape') {
        clearSelection();
      } else if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        if (canUndo) undo();
      } else if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        if (canRedo) redo();
      } else if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        if (selectedIds.length > 0) duplicateElements(selectedIds);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedIds, deleteElement, clearSelection, undo, redo, duplicateElements, canUndo, canRedo]);

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = e.target.getStage();
    if (!stage) return;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clamped = Math.min(Math.max(newScale, 0.1), 5);
    setScale(clamped);
    setStagePos({
      x: pointer.x - mousePointTo.x * clamped,
      y: pointer.y - mousePointTo.y * clamped,
    });
  }, []);

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage() || e.target.name() === 'background') {
        clearSelection();
      }
    },
    [clearSelection]
  );

  const handleStageDblClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage() || e.target.name() === 'background') {
        addRectAtCenter();
      }
    },
    [addRectAtCenter]
  );

  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden bg-neutral-900 relative"
      style={{ minWidth: 0 }}
    >
      <Stage
        ref={stageRef}
        width={containerRef.current?.clientWidth ?? 800}
        height={containerRef.current?.clientHeight ?? 600}
        scaleX={scale}
        scaleY={scale}
        x={stagePos.x}
        y={stagePos.y}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onDblClick={handleStageDblClick}
      >
        <Layer>
          {/* Canvas background */}
          <Rect
            name="background"
            x={0}
            y={0}
            width={width}
            height={height}
            fill={background}
            shadowColor="black"
            shadowBlur={20}
            shadowOpacity={0.5}
            listening={true}
          />
          {/* Grid */}
          <GridLines width={width} height={height} />
          {/* Elements */}
          {sorted.map((el) => (
            <ElementNode
              key={el.id}
              element={el}
              isSelected={selectedIds.includes(el.id)}
              onSelect={() => selectElement([el.id])}
              onChange={(updates) => updateElement(el.id, updates)}
            />
          ))}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) return oldBox;
              return newBox;
            }}
          />
        </Layer>
      </Stage>

      {/* Zoom indicator */}
      <div className="absolute bottom-3 right-3 bg-neutral-800 text-neutral-300 text-xs px-2 py-1 rounded">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
}
