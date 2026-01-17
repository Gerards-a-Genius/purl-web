// src/components/projects/AnnotationCanvas.tsx
'use client';

import { useRef, useCallback } from 'react';
import type {
  TextAnnotation,
  RectangleAnnotation,
  CircleAnnotation,
  ArrowAnnotation,
} from '@/types/project';

// Drawing path interface
export interface DrawingPath {
  id: string;
  path: string;
  color: string;
  strokeWidth: number;
  isHighlighter: boolean;
}

// Shape tool types
export type ShapeTool = 'rectangle' | 'circle' | 'arrow' | null;

// Current shape being drawn (preview)
export interface CurrentShape {
  type: ShapeTool;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface AnnotationCanvasProps {
  paths: DrawingPath[];
  textAnnotations: TextAnnotation[];
  rectangles: RectangleAnnotation[];
  circles: CircleAnnotation[];
  arrows: ArrowAnnotation[];
  currentPath: string;
  currentShape: CurrentShape | null;
  currentColor: string;
  currentStrokeWidth: number;
  isHighlighter: boolean;
  isEraser: boolean;
  isTextMode: boolean;
  activeShapeTool: ShapeTool;
  shapeFilled: boolean;
  onPathStart: () => void;
  onPathUpdate: (path: string) => void;
  onPathEnd: () => void;
  onShapeStart: (x: number, y: number) => void;
  onShapeUpdate: (x: number, y: number) => void;
  onShapeEnd: () => void;
  onErase: (id: string) => void;
  onTextTap: (x: number, y: number) => void;
  enabled: boolean;
}

export function AnnotationCanvas({
  paths,
  textAnnotations,
  rectangles,
  circles,
  arrows,
  currentPath,
  currentShape,
  currentColor,
  currentStrokeWidth,
  isHighlighter,
  isEraser,
  isTextMode,
  activeShapeTool,
  shapeFilled,
  onPathStart,
  onPathUpdate,
  onPathEnd,
  onShapeStart,
  onShapeUpdate,
  onShapeEnd,
  onErase,
  onTextTap,
  enabled,
}: AnnotationCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<string>('');
  const isDrawing = useRef(false);
  const isDrawingShape = useRef(false);

  // Find annotation at point for eraser
  const findAnnotationAtPoint = useCallback(
    (x: number, y: number): string | null => {
      const hitPadding = 10;

      // Check text annotations first
      for (const textAnn of textAnnotations) {
        const charWidth = textAnn.fontSize * 0.6;
        const textWidth = textAnn.text.length * charWidth;
        const textHeight = textAnn.fontSize;

        if (
          x >= textAnn.x - hitPadding &&
          x <= textAnn.x + textWidth + hitPadding &&
          y >= textAnn.y - textHeight - hitPadding &&
          y <= textAnn.y + hitPadding
        ) {
          return textAnn.id;
        }
      }

      // Check rectangle annotations
      for (const rect of rectangles) {
        const nearEdge =
          Math.abs(x - rect.x) < hitPadding ||
          Math.abs(x - (rect.x + rect.width)) < hitPadding ||
          Math.abs(y - rect.y) < hitPadding ||
          Math.abs(y - (rect.y + rect.height)) < hitPadding;

        const inside =
          x >= rect.x - hitPadding &&
          x <= rect.x + rect.width + hitPadding &&
          y >= rect.y - hitPadding &&
          y <= rect.y + rect.height + hitPadding;

        if (inside && (rect.filled || nearEdge)) {
          return rect.id;
        }
      }

      // Check circle annotations
      for (const circle of circles) {
        const normalizedX = (x - circle.cx) / circle.rx;
        const normalizedY = (y - circle.cy) / circle.ry;
        const distance = Math.sqrt(normalizedX ** 2 + normalizedY ** 2);

        if (circle.filled) {
          if (distance <= 1.1) return circle.id;
        } else {
          if (Math.abs(distance - 1) < 0.2) return circle.id;
        }
      }

      // Check arrow annotations
      for (const arrow of arrows) {
        const dx = arrow.endX - arrow.startX;
        const dy = arrow.endY - arrow.startY;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length === 0) continue;

        const t = Math.max(
          0,
          Math.min(1, ((x - arrow.startX) * dx + (y - arrow.startY) * dy) / (length * length))
        );

        const projX = arrow.startX + t * dx;
        const projY = arrow.startY + t * dy;
        const dist = Math.sqrt((x - projX) ** 2 + (y - projY) ** 2);

        if (dist < 15) return arrow.id;
      }

      // Check path annotations
      for (const pathAnn of paths) {
        const coords = pathAnn.path.match(/[\d.]+/g);
        if (coords) {
          for (let i = 0; i < coords.length - 1; i += 2) {
            const px = parseFloat(coords[i]);
            const py = parseFloat(coords[i + 1]);
            const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
            if (distance < 20) {
              return pathAnn.id;
            }
          }
        }
      }

      return null;
    },
    [paths, textAnnotations, rectangles, circles, arrows]
  );

  // Get SVG coordinates from event
  const getSvgCoords = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
      if (!svgRef.current) return null;

      const svg = svgRef.current;
      const rect = svg.getBoundingClientRect();

      let clientX: number;
      let clientY: number;

      if ('touches' in e) {
        if (e.touches.length === 0) return null;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    []
  );

  // Handle pointer down
  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!enabled) return;

      const coords = getSvgCoords(e);
      if (!coords) return;

      if (isTextMode) {
        onTextTap(coords.x, coords.y);
        return;
      }

      if (isEraser) {
        const id = findAnnotationAtPoint(coords.x, coords.y);
        if (id) onErase(id);
        return;
      }

      // Start drawing shape
      if (activeShapeTool) {
        isDrawingShape.current = true;
        onShapeStart(coords.x, coords.y);
        return;
      }

      // Start drawing path
      isDrawing.current = true;
      pathRef.current = `M ${coords.x} ${coords.y}`;
      onPathStart();
      onPathUpdate(pathRef.current);
    },
    [enabled, isTextMode, isEraser, activeShapeTool, getSvgCoords, onTextTap, findAnnotationAtPoint, onErase, onShapeStart, onPathStart, onPathUpdate]
  );

  // Handle pointer move
  const handlePointerMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!enabled) return;

      const coords = getSvgCoords(e);
      if (!coords) return;

      if (isEraser) {
        const id = findAnnotationAtPoint(coords.x, coords.y);
        if (id) onErase(id);
        return;
      }

      // Update shape preview
      if (isDrawingShape.current) {
        onShapeUpdate(coords.x, coords.y);
        return;
      }

      // Update path
      if (isDrawing.current) {
        pathRef.current += ` L ${coords.x} ${coords.y}`;
        onPathUpdate(pathRef.current);
      }
    },
    [enabled, isEraser, getSvgCoords, findAnnotationAtPoint, onErase, onShapeUpdate, onPathUpdate]
  );

  // Handle pointer up
  const handlePointerUp = useCallback(() => {
    if (!enabled) return;

    // Finish shape drawing
    if (isDrawingShape.current) {
      isDrawingShape.current = false;
      onShapeEnd();
      return;
    }

    // Finish path drawing
    if (isDrawing.current) {
      isDrawing.current = false;
      onPathEnd();
      pathRef.current = '';
    }
  }, [enabled, onShapeEnd, onPathEnd]);

  // Calculate arrow head points
  const getArrowHeadPoints = (startX: number, startY: number, endX: number, endY: number) => {
    const angle = Math.atan2(endY - startY, endX - startX);
    const headLength = 12;
    const headAngle = Math.PI / 6; // 30 degrees

    const x1 = endX - headLength * Math.cos(angle - headAngle);
    const y1 = endY - headLength * Math.sin(angle - headAngle);
    const x2 = endX - headLength * Math.cos(angle + headAngle);
    const y2 = endY - headLength * Math.sin(angle + headAngle);

    return `${endX},${endY} ${x1},${y1} ${x2},${y2}`;
  };

  // Check if there are any annotations to render
  const hasAnnotations =
    paths.length > 0 ||
    textAnnotations.length > 0 ||
    rectangles.length > 0 ||
    circles.length > 0 ||
    arrows.length > 0;

  // If not enabled and no annotations, don't render
  if (!enabled && !hasAnnotations) {
    return null;
  }

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full"
      style={{
        pointerEvents: enabled ? 'auto' : 'none',
        cursor: enabled
          ? isEraser
            ? 'crosshair'
            : isTextMode
            ? 'text'
            : activeShapeTool
            ? 'crosshair'
            : 'crosshair'
          : 'default',
        touchAction: enabled ? 'none' : 'auto',
      }}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >
      {/* Render saved paths */}
      {paths.map((p) => (
        <path
          key={p.id}
          d={p.path}
          stroke={p.color}
          strokeWidth={p.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={p.isHighlighter ? 0.4 : 1}
        />
      ))}

      {/* Render rectangle annotations */}
      {rectangles.map((rect) => (
        <rect
          key={rect.id}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          stroke={rect.color}
          strokeWidth={rect.strokeWidth}
          fill={rect.filled ? rect.color : 'none'}
          fillOpacity={rect.filled ? 0.2 : 0}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* Render circle annotations */}
      {circles.map((circle) => (
        <ellipse
          key={circle.id}
          cx={circle.cx}
          cy={circle.cy}
          rx={circle.rx}
          ry={circle.ry}
          stroke={circle.color}
          strokeWidth={circle.strokeWidth}
          fill={circle.filled ? circle.color : 'none'}
          fillOpacity={circle.filled ? 0.2 : 0}
        />
      ))}

      {/* Render arrow annotations */}
      {arrows.map((arrow) => (
        <g key={arrow.id}>
          <line
            x1={arrow.startX}
            y1={arrow.startY}
            x2={arrow.endX}
            y2={arrow.endY}
            stroke={arrow.color}
            strokeWidth={arrow.strokeWidth}
            strokeLinecap="round"
          />
          <polygon
            points={getArrowHeadPoints(arrow.startX, arrow.startY, arrow.endX, arrow.endY)}
            fill={arrow.color}
          />
        </g>
      ))}

      {/* Render text annotations */}
      {textAnnotations.map((t) => (
        <text
          key={t.id}
          x={t.x}
          y={t.y}
          fill={t.color}
          fontSize={t.fontSize}
          fontWeight="500"
          fontFamily="system-ui, sans-serif"
        >
          {t.text}
        </text>
      ))}

      {/* Render current drawing path */}
      {currentPath && (
        <path
          d={currentPath}
          stroke={currentColor}
          strokeWidth={currentStrokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={isHighlighter ? 0.4 : 1}
        />
      )}

      {/* Render current shape preview */}
      {currentShape && currentShape.type === 'rectangle' && (
        <rect
          x={Math.min(currentShape.startX, currentShape.endX)}
          y={Math.min(currentShape.startY, currentShape.endY)}
          width={Math.abs(currentShape.endX - currentShape.startX)}
          height={Math.abs(currentShape.endY - currentShape.startY)}
          stroke={currentColor}
          strokeWidth={currentStrokeWidth}
          fill={shapeFilled ? currentColor : 'none'}
          fillOpacity={shapeFilled ? 0.2 : 0}
          opacity={0.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {currentShape && currentShape.type === 'circle' && (
        <ellipse
          cx={currentShape.startX}
          cy={currentShape.startY}
          rx={Math.abs(currentShape.endX - currentShape.startX)}
          ry={Math.abs(currentShape.endY - currentShape.startY)}
          stroke={currentColor}
          strokeWidth={currentStrokeWidth}
          fill={shapeFilled ? currentColor : 'none'}
          fillOpacity={shapeFilled ? 0.2 : 0}
          opacity={0.6}
        />
      )}

      {currentShape && currentShape.type === 'arrow' && (
        <g opacity={0.6}>
          <line
            x1={currentShape.startX}
            y1={currentShape.startY}
            x2={currentShape.endX}
            y2={currentShape.endY}
            stroke={currentColor}
            strokeWidth={currentStrokeWidth}
            strokeLinecap="round"
          />
          <polygon
            points={getArrowHeadPoints(currentShape.startX, currentShape.startY, currentShape.endX, currentShape.endY)}
            fill={currentColor}
          />
        </g>
      )}
    </svg>
  );
}
