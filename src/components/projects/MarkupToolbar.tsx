// src/components/projects/MarkupToolbar.tsx
'use client';

import {
  Pen,
  Highlighter,
  Eraser,
  Type,
  Undo2,
  Redo2,
  Trash2,
  Check,
  Square,
  Circle,
  ArrowUpRight,
  Shapes,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { ShapeTool } from './AnnotationCanvas';

// Color options for markup
export const MARKUP_COLORS = [
  { id: 'red', value: '#EF4444', label: 'Red', isHighlighter: false },
  { id: 'orange', value: '#F97316', label: 'Orange', isHighlighter: false },
  { id: 'amber', value: '#F59E0B', label: 'Amber', isHighlighter: false },
  { id: 'green', value: '#22C55E', label: 'Green', isHighlighter: false },
  { id: 'blue', value: '#3B82F6', label: 'Blue', isHighlighter: false },
  { id: 'purple', value: '#8B5CF6', label: 'Purple', isHighlighter: false },
  { id: 'black', value: '#1F2937', label: 'Black', isHighlighter: false },
  { id: 'yellow-hl', value: '#FEF08A', label: 'Yellow', isHighlighter: true },
  { id: 'green-hl', value: '#BBF7D0', label: 'Green', isHighlighter: true },
  { id: 'blue-hl', value: '#BFDBFE', label: 'Blue', isHighlighter: true },
  { id: 'pink-hl', value: '#FBCFE8', label: 'Pink', isHighlighter: true },
] as const;

export type MarkupColor = (typeof MARKUP_COLORS)[number];

// Stroke width options
export const STROKE_WIDTHS = {
  thin: 2,
  medium: 4,
  thick: 8,
} as const;

export type StrokeWidth = keyof typeof STROKE_WIDTHS;

// Font size options for text
export const TEXT_FONT_SIZES = {
  small: 14,
  medium: 20,
  large: 28,
} as const;

export type TextFontSize = keyof typeof TEXT_FONT_SIZES;

// Shape tool options
export const SHAPE_TOOLS = [
  { id: 'rectangle' as const, label: 'Rectangle', icon: Square },
  { id: 'circle' as const, label: 'Circle', icon: Circle },
  { id: 'arrow' as const, label: 'Arrow', icon: ArrowUpRight },
] as const;

interface MarkupToolbarProps {
  selectedColor: MarkupColor;
  selectedStrokeWidth: StrokeWidth;
  isEraser: boolean;
  isTextMode: boolean;
  selectedFontSize: TextFontSize;
  activeShapeTool: ShapeTool;
  shapeFilled: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onColorSelect: (color: MarkupColor) => void;
  onStrokeWidthSelect: (width: StrokeWidth) => void;
  onEraserToggle: () => void;
  onTextModeToggle: () => void;
  onFontSizeSelect: (size: TextFontSize) => void;
  onShapeToolSelect: (tool: ShapeTool) => void;
  onShapeFilledToggle: (filled: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClearAll: () => void;
  onDone: () => void;
}

export function MarkupToolbar({
  selectedColor,
  selectedStrokeWidth,
  isEraser,
  isTextMode,
  selectedFontSize,
  activeShapeTool,
  shapeFilled,
  canUndo,
  canRedo,
  onColorSelect,
  onStrokeWidthSelect,
  onEraserToggle,
  onTextModeToggle,
  onFontSizeSelect,
  onShapeToolSelect,
  onShapeFilledToggle,
  onUndo,
  onRedo,
  onClearAll,
  onDone,
}: MarkupToolbarProps) {
  const penColors = MARKUP_COLORS.filter((c) => !c.isHighlighter);
  const highlighterColors = MARKUP_COLORS.filter((c) => c.isHighlighter);
  const isPenActive = !isEraser && !isTextMode && !activeShapeTool && !selectedColor.isHighlighter;
  const isHighlighterActive = !isEraser && !isTextMode && !activeShapeTool && selectedColor.isHighlighter;
  const isShapeActive = !!activeShapeTool;

  // Get the icon for the currently active shape tool
  const ActiveShapeIcon = activeShapeTool
    ? SHAPE_TOOLS.find((s) => s.id === activeShapeTool)?.icon || Shapes
    : Shapes;

  return (
    <div className="flex items-center justify-center gap-1 p-2 bg-background border-t">
      {/* Pen Tool */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={isPenActive ? 'default' : 'ghost'}
            size="icon"
            className="h-9 w-9"
          >
            <Pen className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3" side="top">
          <div className="space-y-3">
            <p className="text-sm font-medium">Pen Colors</p>
            <div className="grid grid-cols-7 gap-2">
              {penColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => onColorSelect(color)}
                  className={cn(
                    'w-6 h-6 rounded-full border-2 transition-transform',
                    selectedColor.id === color.id
                      ? 'border-primary scale-110'
                      : 'border-transparent hover:scale-110'
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm font-medium mb-2">Line Thickness</p>
              <div className="flex justify-center gap-4">
                {(Object.keys(STROKE_WIDTHS) as StrokeWidth[]).map((width) => (
                  <button
                    key={width}
                    onClick={() => onStrokeWidthSelect(width)}
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-lg border',
                      selectedStrokeWidth === width
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted'
                    )}
                    title={width}
                  >
                    <div
                      className="rounded-full bg-foreground"
                      style={{
                        width: STROKE_WIDTHS[width] * 2,
                        height: STROKE_WIDTHS[width] * 2,
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Highlighter Tool */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={isHighlighterActive ? 'default' : 'ghost'}
            size="icon"
            className="h-9 w-9"
          >
            <Highlighter className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-3" side="top">
          <div className="space-y-2">
            <p className="text-sm font-medium">Highlighter Colors</p>
            <div className="grid grid-cols-4 gap-2">
              {highlighterColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => onColorSelect(color)}
                  className={cn(
                    'w-8 h-8 rounded border-2 transition-transform',
                    selectedColor.id === color.id
                      ? 'border-primary scale-110'
                      : 'border-transparent hover:scale-110'
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Shape Tools */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={isShapeActive ? 'default' : 'ghost'}
            size="icon"
            className="h-9 w-9"
          >
            <ActiveShapeIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-3" side="top">
          <div className="space-y-3">
            <p className="text-sm font-medium">Shape Tools</p>
            <div className="flex justify-center gap-2">
              {SHAPE_TOOLS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onShapeToolSelect(id)}
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-lg border transition-colors',
                    activeShapeTool === id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted'
                  )}
                  title={label}
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shape-filled"
                  checked={shapeFilled}
                  onCheckedChange={(checked) => onShapeFilledToggle(!!checked)}
                />
                <Label
                  htmlFor="shape-filled"
                  className="text-sm font-medium cursor-pointer"
                >
                  Fill shapes
                </Label>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Eraser */}
      <Button
        variant={isEraser ? 'default' : 'ghost'}
        size="icon"
        className="h-9 w-9"
        onClick={onEraserToggle}
      >
        <Eraser className="h-4 w-4" />
      </Button>

      {/* Text Tool */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={isTextMode ? 'default' : 'ghost'}
            size="icon"
            className="h-9 w-9"
            onClick={onTextModeToggle}
          >
            <Type className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-3" side="top">
          <div className="space-y-3">
            <p className="text-sm font-medium">Text Size</p>
            <div className="flex justify-center gap-2">
              {(Object.keys(TEXT_FONT_SIZES) as TextFontSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => onFontSizeSelect(size)}
                  className={cn(
                    'px-3 py-2 rounded border',
                    selectedFontSize === size
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <span
                    className="font-medium"
                    style={{ fontSize: TEXT_FONT_SIZES[size] * 0.6 }}
                  >
                    {size.charAt(0).toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Undo/Redo */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        disabled={!canUndo}
        onClick={onUndo}
      >
        <Undo2 className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        disabled={!canRedo}
        onClick={onRedo}
      >
        <Redo2 className="h-4 w-4" />
      </Button>

      {/* Clear All */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-destructive hover:text-destructive"
        onClick={onClearAll}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Done */}
      <Button
        size="sm"
        className="gap-1"
        onClick={onDone}
      >
        <Check className="h-4 w-4" />
        Done
      </Button>
    </div>
  );
}
