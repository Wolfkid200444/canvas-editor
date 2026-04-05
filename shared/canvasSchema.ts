import { z } from 'zod';

const BaseElementSchema = z.object({
  id: z.string(),
  type: z.enum(['rect', 'circle', 'line', 'text', 'image']),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number(),
  opacity: z.number().min(0).max(1),
  zIndex: z.number(),
  fill: z.string(),
  stroke: z.string(),
  strokeWidth: z.number(),
});

export const RectElementSchema = BaseElementSchema.extend({
  type: z.literal('rect'),
  cornerRadius: z.number(),
});

export const CircleElementSchema = BaseElementSchema.extend({
  type: z.literal('circle'),
});

export const LineElementSchema = BaseElementSchema.extend({
  type: z.literal('line'),
  points: z.array(z.number()),
});

export const TextElementSchema = BaseElementSchema.extend({
  type: z.literal('text'),
  text: z.string(),
  fontSize: z.number(),
  fontFamily: z.string(),
  align: z.string(),
});

export const ImageElementSchema = BaseElementSchema.extend({
  type: z.literal('image'),
  src: z.string(),
});

export const CanvasElementSchema = z.discriminatedUnion('type', [
  RectElementSchema,
  CircleElementSchema,
  LineElementSchema,
  TextElementSchema,
  ImageElementSchema,
]);

export const CanvasStateSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
  background: z.string(),
  elements: z.array(CanvasElementSchema),
});

export const ExportRequestSchema = z.object({
  state: CanvasStateSchema,
  language: z.enum(['javascript', 'typescript', 'python']),
});

export type ExportRequest = z.infer<typeof ExportRequestSchema>;
export type CanvasElement = z.infer<typeof CanvasElementSchema>;
export type CanvasState = z.infer<typeof CanvasStateSchema>;
