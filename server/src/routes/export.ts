import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';

// Inline schema to avoid shared module resolution issues
const CanvasElementSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('rect'), id: z.string(), x: z.number(), y: z.number(), width: z.number(), height: z.number(), rotation: z.number(), opacity: z.number(), zIndex: z.number(), fill: z.string(), stroke: z.string(), strokeWidth: z.number(), cornerRadius: z.number() }),
  z.object({ type: z.literal('circle'), id: z.string(), x: z.number(), y: z.number(), width: z.number(), height: z.number(), rotation: z.number(), opacity: z.number(), zIndex: z.number(), fill: z.string(), stroke: z.string(), strokeWidth: z.number() }),
  z.object({ type: z.literal('line'), id: z.string(), x: z.number(), y: z.number(), width: z.number(), height: z.number(), rotation: z.number(), opacity: z.number(), zIndex: z.number(), fill: z.string(), stroke: z.string(), strokeWidth: z.number(), points: z.array(z.number()) }),
  z.object({ type: z.literal('text'), id: z.string(), x: z.number(), y: z.number(), width: z.number(), height: z.number(), rotation: z.number(), opacity: z.number(), zIndex: z.number(), fill: z.string(), stroke: z.string(), strokeWidth: z.number(), text: z.string(), fontSize: z.number(), fontFamily: z.string(), align: z.string() }),
  z.object({ type: z.literal('image'), id: z.string(), x: z.number(), y: z.number(), width: z.number(), height: z.number(), rotation: z.number(), opacity: z.number(), zIndex: z.number(), fill: z.string(), stroke: z.string(), strokeWidth: z.number(), src: z.string() }),
]);

const ExportRequestSchema = z.object({
  state: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    background: z.string(),
    elements: z.array(CanvasElementSchema),
  }),
  language: z.enum(['javascript', 'typescript', 'python']),
});

type CanvasElement = z.infer<typeof CanvasElementSchema>;
type CanvasState = z.infer<typeof ExportRequestSchema>['state'];

export const exportRouter = Router();

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toPythonColor(hex: string, alpha = 1): string {
  const [r, g, b] = hexToRgb(hex);
  return `(${r}, ${g}, ${b}, ${Math.round(alpha * 255)})`;
}

function renderElementJS(el: CanvasElement): string {
  const lines: string[] = [];
  lines.push(`  ctx.save();`);
  lines.push(`  ctx.globalAlpha = ${el.opacity};`);

  if (el.rotation !== 0) {
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    lines.push(`  ctx.translate(${cx}, ${cy});`);
    lines.push(`  ctx.rotate(${((el.rotation * Math.PI) / 180).toFixed(6)});`);
    lines.push(`  ctx.translate(${-el.width / 2}, ${-el.height / 2});`);
  } else {
    lines.push(`  ctx.translate(${el.x}, ${el.y});`);
  }

  switch (el.type) {
    case 'rect': {
      const r = el.cornerRadius;
      lines.push(`  ctx.beginPath();`);
      if (r > 0) {
        lines.push(`  ctx.roundRect(0, 0, ${el.width}, ${el.height}, ${r});`);
      } else {
        lines.push(`  ctx.rect(0, 0, ${el.width}, ${el.height});`);
      }
      lines.push(`  ctx.fillStyle = '${el.fill}';`);
      lines.push(`  ctx.fill();`);
      if (el.strokeWidth > 0) {
        lines.push(`  ctx.strokeStyle = '${el.stroke}';`);
        lines.push(`  ctx.lineWidth = ${el.strokeWidth};`);
        lines.push(`  ctx.stroke();`);
      }
      break;
    }
    case 'circle': {
      const rx = el.width / 2;
      const ry = el.height / 2;
      lines.push(`  ctx.beginPath();`);
      lines.push(`  ctx.ellipse(${rx}, ${ry}, ${rx}, ${ry}, 0, 0, Math.PI * 2);`);
      lines.push(`  ctx.fillStyle = '${el.fill}';`);
      lines.push(`  ctx.fill();`);
      if (el.strokeWidth > 0) {
        lines.push(`  ctx.strokeStyle = '${el.stroke}';`);
        lines.push(`  ctx.lineWidth = ${el.strokeWidth};`);
        lines.push(`  ctx.stroke();`);
      }
      break;
    }
    case 'line': {
      const pts = el.points;
      if (pts.length >= 4) {
        lines.push(`  ctx.beginPath();`);
        lines.push(`  ctx.moveTo(${pts[0]}, ${pts[1]});`);
        for (let i = 2; i < pts.length; i += 2) {
          lines.push(`  ctx.lineTo(${pts[i]}, ${pts[i + 1]});`);
        }
        lines.push(`  ctx.strokeStyle = '${el.stroke}';`);
        lines.push(`  ctx.lineWidth = ${el.strokeWidth};`);
        lines.push(`  ctx.stroke();`);
      }
      break;
    }
    case 'text': {
      lines.push(`  ctx.fillStyle = '${el.fill}';`);
      lines.push(`  ctx.font = '${el.fontSize}px ${el.fontFamily}';`);
      lines.push(`  ctx.textAlign = '${el.align}';`);
      lines.push(`  ctx.fillText('${el.text.replace(/'/g, "\\'")}', 0, ${el.fontSize});`);
      break;
    }
    case 'image': {
      const varName = `img_${el.id.replace(/-/g, '_')}`;
      lines.push(`  const ${varName} = await loadImage('${el.src}');`);
      lines.push(`  ctx.drawImage(${varName}, 0, 0, ${el.width}, ${el.height});`);
      break;
    }
  }

  lines.push(`  ctx.restore();`);
  return lines.join('\n');
}

function generateJavaScript(state: CanvasState): string {
  const sorted = [...state.elements].sort((a, b) => a.zIndex - b.zIndex);
  const elementCode = sorted.map(renderElementJS).join('\n\n');
  return `const { createCanvas, loadImage } = require('@napi-rs/canvas');

async function renderCanvas() {
  const canvas = createCanvas(${state.width}, ${state.height});
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '${state.background}';
  ctx.fillRect(0, 0, ${state.width}, ${state.height});

${elementCode}

  return canvas;
}

renderCanvas().then(canvas => {
  const buffer = canvas.toBuffer('image/png');
  require('fs').writeFileSync('output.png', buffer);
});
`;
}

function generateTypeScript(state: CanvasState): string {
  const sorted = [...state.elements].sort((a, b) => a.zIndex - b.zIndex);
  const elementCode = sorted.map(renderElementJS).join('\n\n');
  return `import { createCanvas, loadImage } from '@napi-rs/canvas';
import { writeFileSync } from 'fs';

async function renderCanvas(): Promise<ReturnType<typeof createCanvas>> {
  const canvas = createCanvas(${state.width}, ${state.height});
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '${state.background}';
  ctx.fillRect(0, 0, ${state.width}, ${state.height});

${elementCode}

  return canvas;
}

renderCanvas().then(canvas => {
  const buffer = canvas.toBuffer('image/png');
  writeFileSync('output.png', buffer);
});
`;
}

function renderElementPython(el: CanvasElement): string {
  const lines: string[] = [];
  switch (el.type) {
    case 'rect': {
      lines.push(`draw.rectangle([${Math.round(el.x)}, ${Math.round(el.y)}, ${Math.round(el.x + el.width)}, ${Math.round(el.y + el.height)}], fill=${toPythonColor(el.fill, el.opacity)}, outline=${toPythonColor(el.stroke, el.opacity)}, width=${el.strokeWidth})`);
      break;
    }
    case 'circle': {
      lines.push(`draw.ellipse([${Math.round(el.x)}, ${Math.round(el.y)}, ${Math.round(el.x + el.width)}, ${Math.round(el.y + el.height)}], fill=${toPythonColor(el.fill, el.opacity)}, outline=${toPythonColor(el.stroke, el.opacity)}, width=${el.strokeWidth})`);
      break;
    }
    case 'line': {
      const pts = el.points;
      if (pts.length >= 4) {
        const ptsStr = pts.reduce<string[]>((acc, _, i) => {
          if (i % 2 === 0) acc.push(`(${pts[i]}, ${pts[i + 1]})`);
          return acc;
        }, []).join(', ');
        lines.push(`draw.line([${ptsStr}], fill=${toPythonColor(el.stroke, el.opacity)}, width=${el.strokeWidth})`);
      }
      break;
    }
    case 'text': {
      lines.push(`draw.text((${Math.round(el.x)}, ${Math.round(el.y)}), '${el.text.replace(/'/g, "\\'")}', fill=${toPythonColor(el.fill, el.opacity)})`);
      break;
    }
    case 'image': {
      const v = `img_${el.id.replace(/-/g, '_').slice(0, 8)}`;
      lines.push(`${v} = Image.open('${el.src}').convert('RGBA')`);
      lines.push(`${v} = ${v}.resize((${Math.round(el.width)}, ${Math.round(el.height)}))`);
      lines.push(`img.paste(${v}, (${Math.round(el.x)}, ${Math.round(el.y)}), ${v})`);
      break;
    }
  }
  return lines.join('\n');
}

function generatePython(state: CanvasState): string {
  const sorted = [...state.elements].sort((a, b) => a.zIndex - b.zIndex);
  const [br, bg, bb] = hexToRgb(state.background);
  const elementCode = sorted.map(renderElementPython).map((l) => `    ${l}`).join('\n');
  return `from PIL import Image, ImageDraw

def render_canvas():
    img = Image.new('RGBA', (${state.width}, ${state.height}), (${br}, ${bg}, ${bb}, 255))
    draw = ImageDraw.Draw(img)

${elementCode}

    img.save('output.png')

render_canvas()
`;
}

exportRouter.post('/', (req: Request, res: Response) => {
  const parsed = ExportRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const { state, language } = parsed.data;
  let code: string;

  switch (language) {
    case 'javascript':
      code = generateJavaScript(state as CanvasState);
      break;
    case 'typescript':
      code = generateTypeScript(state as CanvasState);
      break;
    case 'python':
      code = generatePython(state as CanvasState);
      break;
    default:
      res.status(400).json({ error: 'Unsupported language' });
      return;
  }

  res.json({ code, language });
});
