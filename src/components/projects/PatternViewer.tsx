// src/components/projects/PatternViewer.tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  X,
  Share,
  Pen,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { AnnotationCanvas, type DrawingPath, type ShapeTool, type CurrentShape } from './AnnotationCanvas';
import {
  MarkupToolbar,
  MARKUP_COLORS,
  STROKE_WIDTHS,
  TEXT_FONT_SIZES,
  type MarkupColor,
  type StrokeWidth,
  type TextFontSize,
} from './MarkupToolbar';
import { useSaveAnnotations } from '@/hooks/useProjects';
import type {
  PatternAnnotation,
  TextAnnotation,
  DrawPathAnnotation,
  RectangleAnnotation,
  CircleAnnotation,
  ArrowAnnotation,
} from '@/types/project';
// cn utility imported for potential future conditional styling
import { toast } from 'sonner';

interface PatternViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string | null;
  fileName: string | null;
  mimeType?: string;
  projectId: string;
  initialAnnotations?: PatternAnnotation[];
}

export function PatternViewer({
  open,
  onOpenChange,
  fileUrl,
  fileName,
  mimeType,
  projectId,
  initialAnnotations = [],
}: PatternViewerProps) {
  // Markup state
  const [isMarkupMode, setIsMarkupMode] = useState(false);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [selectedColor, setSelectedColor] = useState<MarkupColor>(MARKUP_COLORS[0]);
  const [selectedStrokeWidth, setSelectedStrokeWidth] = useState<StrokeWidth>('medium');
  const [selectedFontSize, setSelectedFontSize] = useState<TextFontSize>('medium');
  const [isEraser, setIsEraser] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [undoStack, setUndoStack] = useState<DrawingPath[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawingPath[][]>([]);

  // Shape annotation state
  const [rectangles, setRectangles] = useState<RectangleAnnotation[]>([]);
  const [circles, setCircles] = useState<CircleAnnotation[]>([]);
  const [arrows, setArrows] = useState<ArrowAnnotation[]>([]);
  const [activeShapeTool, setActiveShapeTool] = useState<ShapeTool>(null);
  const [shapeFilled, setShapeFilled] = useState(false);
  const [currentShape, setCurrentShape] = useState<CurrentShape | null>(null);

  // Text input state
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputCoords, setTextInputCoords] = useState<{ x: number; y: number } | null>(null);
  const [textInputValue, setTextInputValue] = useState('');

  // Clear all confirmation
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Zoom state for images
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);

  // Save mutations
  const saveAnnotations = useSaveAnnotations(projectId);

  // Determine file type
  const isPDF = mimeType?.includes('pdf') || fileName?.toLowerCase().endsWith('.pdf');
  const isImage =
    mimeType?.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName || '');

  // Load initial annotations when dialog opens
  // This intentionally syncs props to state when the dialog opens - a valid pattern for modals
  const hasLoadedAnnotations = useRef(false);
  useEffect(() => {
    if (open && initialAnnotations.length > 0 && !hasLoadedAnnotations.current) {
      const pathAnns: DrawingPath[] = [];
      const textAnns: TextAnnotation[] = [];
      const rectAnns: RectangleAnnotation[] = [];
      const circleAnns: CircleAnnotation[] = [];
      const arrowAnns: ArrowAnnotation[] = [];

      initialAnnotations.forEach((ann) => {
        if (ann.type === 'text') {
          textAnns.push(ann as TextAnnotation);
        } else if (ann.type === 'rectangle') {
          rectAnns.push(ann as RectangleAnnotation);
        } else if (ann.type === 'circle') {
          circleAnns.push(ann as CircleAnnotation);
        } else if (ann.type === 'arrow') {
          arrowAnns.push(ann as ArrowAnnotation);
        } else if (ann.type === 'path') {
          const pathAnn = ann as DrawPathAnnotation;
          pathAnns.push({
            id: pathAnn.id,
            path: pathAnn.path,
            color: pathAnn.color,
            strokeWidth: pathAnn.strokeWidth,
            isHighlighter: pathAnn.isHighlighter,
          });
        }
      });

      // Intentionally setting state to sync initial annotations when dialog opens
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Modal pattern: sync props to state on open
      setPaths(pathAnns);
      setTextAnnotations(textAnns);
      setRectangles(rectAnns);
      setCircles(circleAnns);
      setArrows(arrowAnns);
      hasLoadedAnnotations.current = true;
    }
    // Reset loaded flag when dialog closes
    if (!open) {
      hasLoadedAnnotations.current = false;
    }
  }, [open, initialAnnotations]);

  // Auto-save annotations
  const saveCurrentAnnotations = useCallback(() => {
    const allAnnotations: PatternAnnotation[] = [
      ...paths.map(
        (p): DrawPathAnnotation => ({
          id: p.id,
          type: 'path',
          path: p.path,
          color: p.color,
          strokeWidth: p.strokeWidth,
          isHighlighter: p.isHighlighter,
        })
      ),
      ...textAnnotations,
      ...rectangles,
      ...circles,
      ...arrows,
    ];

    saveAnnotations.mutate(allAnnotations, {
      onSuccess: () => {
        toast.success('Annotations saved');
      },
    });
  }, [paths, textAnnotations, rectangles, circles, arrows, saveAnnotations]);

  // Handle close with state reset
  const handleClose = useCallback(() => {
    // Save annotations before closing if there are any
    const hasAnnotations =
      paths.length > 0 ||
      textAnnotations.length > 0 ||
      rectangles.length > 0 ||
      circles.length > 0 ||
      arrows.length > 0;
    if (hasAnnotations) {
      saveCurrentAnnotations();
    }
    // Reset state
    setIsMarkupMode(false);
    setIsEraser(false);
    setIsTextMode(false);
    setActiveShapeTool(null);
    setCurrentPath('');
    setCurrentShape(null);
    setZoom(1);
    setLoading(true);
    onOpenChange(false);
  }, [paths, textAnnotations, rectangles, circles, arrows, saveCurrentAnnotations, onOpenChange]);

  // Path handlers
  const handlePathStart = useCallback(() => {
    setUndoStack((prev) => [...prev, paths]);
    setRedoStack([]);
  }, [paths]);

  const handlePathUpdate = useCallback((path: string) => {
    setCurrentPath(path);
  }, []);

  const handlePathEnd = useCallback(() => {
    if (currentPath) {
      const newPath: DrawingPath = {
        id: Date.now().toString(),
        path: currentPath,
        color: selectedColor.value,
        strokeWidth: STROKE_WIDTHS[selectedStrokeWidth],
        isHighlighter: selectedColor.isHighlighter || false,
      };
      setPaths((prev) => [...prev, newPath]);
      setCurrentPath('');
    }
  }, [currentPath, selectedColor, selectedStrokeWidth]);

  const handleErase = useCallback(
    (id: string) => {
      setUndoStack((prev) => [...prev, paths]);
      setRedoStack([]);

      if (paths.some((p) => p.id === id)) {
        setPaths((prev) => prev.filter((p) => p.id !== id));
      }
      if (textAnnotations.some((t) => t.id === id)) {
        setTextAnnotations((prev) => prev.filter((t) => t.id !== id));
      }
      if (rectangles.some((r) => r.id === id)) {
        setRectangles((prev) => prev.filter((r) => r.id !== id));
      }
      if (circles.some((c) => c.id === id)) {
        setCircles((prev) => prev.filter((c) => c.id !== id));
      }
      if (arrows.some((a) => a.id === id)) {
        setArrows((prev) => prev.filter((a) => a.id !== id));
      }
    },
    [paths, textAnnotations, rectangles, circles, arrows]
  );

  // Text handlers
  const handleTextTap = useCallback((x: number, y: number) => {
    setTextInputCoords({ x, y });
    setTextInputValue('');
    setShowTextInput(true);
  }, []);

  const handleTextSubmit = useCallback(() => {
    if (textInputCoords && textInputValue.trim()) {
      setUndoStack((prev) => [...prev, paths]);
      setRedoStack([]);

      const newText: TextAnnotation = {
        id: `text-${Date.now()}`,
        type: 'text',
        text: textInputValue.trim(),
        x: textInputCoords.x,
        y: textInputCoords.y,
        fontSize: TEXT_FONT_SIZES[selectedFontSize],
        color: selectedColor.value,
      };

      setTextAnnotations((prev) => [...prev, newText]);
    }
    setShowTextInput(false);
    setTextInputCoords(null);
  }, [textInputCoords, textInputValue, selectedFontSize, selectedColor, paths]);

  // Shape handlers
  const handleShapeStart = useCallback(
    (x: number, y: number) => {
      if (!activeShapeTool) return;
      setUndoStack((prev) => [...prev, paths]);
      setRedoStack([]);
      setCurrentShape({
        type: activeShapeTool,
        startX: x,
        startY: y,
        endX: x,
        endY: y,
      });
    },
    [activeShapeTool, paths]
  );

  const handleShapeUpdate = useCallback((x: number, y: number) => {
    setCurrentShape((prev) =>
      prev ? { ...prev, endX: x, endY: y } : null
    );
  }, []);

  const handleShapeEnd = useCallback(() => {
    if (!currentShape || !currentShape.type) return;

    const id = `shape-${Date.now()}`;
    const color = selectedColor.value;
    const strokeWidth = STROKE_WIDTHS[selectedStrokeWidth];

    if (currentShape.type === 'rectangle') {
      const newRect: RectangleAnnotation = {
        id,
        type: 'rectangle',
        x: Math.min(currentShape.startX, currentShape.endX),
        y: Math.min(currentShape.startY, currentShape.endY),
        width: Math.abs(currentShape.endX - currentShape.startX),
        height: Math.abs(currentShape.endY - currentShape.startY),
        color,
        strokeWidth,
        filled: shapeFilled,
      };
      setRectangles((prev) => [...prev, newRect]);
    } else if (currentShape.type === 'circle') {
      const newCircle: CircleAnnotation = {
        id,
        type: 'circle',
        cx: currentShape.startX,
        cy: currentShape.startY,
        rx: Math.abs(currentShape.endX - currentShape.startX),
        ry: Math.abs(currentShape.endY - currentShape.startY),
        color,
        strokeWidth,
        filled: shapeFilled,
      };
      setCircles((prev) => [...prev, newCircle]);
    } else if (currentShape.type === 'arrow') {
      const newArrow: ArrowAnnotation = {
        id,
        type: 'arrow',
        startX: currentShape.startX,
        startY: currentShape.startY,
        endX: currentShape.endX,
        endY: currentShape.endY,
        color,
        strokeWidth,
      };
      setArrows((prev) => [...prev, newArrow]);
    }

    setCurrentShape(null);
  }, [currentShape, selectedColor, selectedStrokeWidth, shapeFilled]);

  // Shape tool toggle handler
  const handleShapeToolSelect = useCallback((tool: ShapeTool) => {
    setActiveShapeTool(tool);
    setIsEraser(false);
    setIsTextMode(false);
  }, []);

  // Undo/Redo
  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      setRedoStack((prev) => [...prev, paths]);
      setPaths(undoStack[undoStack.length - 1]);
      setUndoStack((prev) => prev.slice(0, -1));
    }
  }, [undoStack, paths]);

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      setUndoStack((prev) => [...prev, paths]);
      setPaths(redoStack[redoStack.length - 1]);
      setRedoStack((prev) => prev.slice(0, -1));
    }
  }, [redoStack, paths]);

  // Clear all
  const handleClearAll = useCallback(() => {
    setShowClearConfirm(true);
  }, []);

  const confirmClearAll = useCallback(() => {
    setUndoStack((prev) => [...prev, paths]);
    setRedoStack([]);
    setPaths([]);
    setTextAnnotations([]);
    setRectangles([]);
    setCircles([]);
    setArrows([]);
    setShowClearConfirm(false);
  }, [paths]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  // Share/Open external
  const handleShare = useCallback(() => {
    if (fileUrl) {
      navigator.share?.({ url: fileUrl, title: fileName || 'Pattern' }).catch(() => {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(fileUrl);
        toast.success('Link copied to clipboard');
      });
    }
  }, [fileUrl, fileName]);

  const handleOpenExternal = useCallback(() => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  }, [fileUrl]);

  if (!fileUrl) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
          {/* Header */}
          <DialogHeader className="p-4 border-b flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              {isMarkupMode ? (
                <Pen className="h-5 w-5 text-primary" />
              ) : isPDF ? (
                <FileText className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              )}
              <DialogTitle className="truncate max-w-[200px] md:max-w-[400px]">
                {isMarkupMode ? 'Markup Mode' : fileName || 'Pattern'}
              </DialogTitle>
            </div>

            <div className="flex items-center gap-1">
              {!isMarkupMode && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    title="Share"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleOpenExternal}
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 relative overflow-hidden bg-muted/30">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {isPDF ? (
              // PDF viewer using iframe
              <iframe
                src={fileUrl}
                className="w-full h-full border-0"
                onLoad={() => setLoading(false)}
                title={fileName || 'Pattern PDF'}
              />
            ) : isImage ? (
              // Image viewer
              <div
                className="w-full h-full overflow-auto flex items-center justify-center"
                style={{
                  scrollbarWidth: 'thin',
                }}
              >
                <img
                  src={fileUrl}
                  alt={fileName || 'Pattern'}
                  className="max-w-full max-h-full object-contain transition-transform"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center center',
                  }}
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setLoading(false);
                    toast.error('Failed to load image');
                  }}
                />
              </div>
            ) : (
              // Unsupported file type
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <FileText className="h-16 w-16 text-muted-foreground" />
                <p className="text-muted-foreground">Unsupported file format</p>
                <Button onClick={handleOpenExternal} className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open Externally
                </Button>
              </div>
            )}

            {/* Annotation Canvas Overlay (for images) */}
            {isImage && !loading && (
              <AnnotationCanvas
                paths={paths}
                textAnnotations={textAnnotations}
                rectangles={rectangles}
                circles={circles}
                arrows={arrows}
                currentPath={currentPath}
                currentShape={currentShape}
                currentColor={selectedColor.value}
                currentStrokeWidth={STROKE_WIDTHS[selectedStrokeWidth]}
                isHighlighter={selectedColor.isHighlighter || false}
                isEraser={isEraser}
                isTextMode={isTextMode}
                activeShapeTool={activeShapeTool}
                shapeFilled={shapeFilled}
                onPathStart={handlePathStart}
                onPathUpdate={handlePathUpdate}
                onPathEnd={handlePathEnd}
                onShapeStart={handleShapeStart}
                onShapeUpdate={handleShapeUpdate}
                onShapeEnd={handleShapeEnd}
                onErase={handleErase}
                onTextTap={handleTextTap}
                enabled={isMarkupMode}
              />
            )}
          </div>

          {/* Footer */}
          {isMarkupMode ? (
            <MarkupToolbar
              selectedColor={selectedColor}
              selectedStrokeWidth={selectedStrokeWidth}
              isEraser={isEraser}
              isTextMode={isTextMode}
              selectedFontSize={selectedFontSize}
              activeShapeTool={activeShapeTool}
              shapeFilled={shapeFilled}
              canUndo={undoStack.length > 0}
              canRedo={redoStack.length > 0}
              onColorSelect={(color) => {
                setSelectedColor(color);
                setIsEraser(false);
                setIsTextMode(false);
                setActiveShapeTool(null);
              }}
              onStrokeWidthSelect={setSelectedStrokeWidth}
              onEraserToggle={() => {
                setIsEraser(!isEraser);
                setIsTextMode(false);
                setActiveShapeTool(null);
              }}
              onTextModeToggle={() => {
                setIsTextMode(!isTextMode);
                setIsEraser(false);
                setActiveShapeTool(null);
              }}
              onFontSizeSelect={setSelectedFontSize}
              onShapeToolSelect={handleShapeToolSelect}
              onShapeFilledToggle={setShapeFilled}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onClearAll={handleClearAll}
              onDone={() => {
                setIsMarkupMode(false);
                setActiveShapeTool(null);
                saveCurrentAnnotations();
              }}
            />
          ) : (
            <div className="p-3 border-t flex items-center justify-between">
              {/* Zoom controls (for images) */}
              {isImage && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center text-sm">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {!isImage && <div />}

              {/* Markup button (for images) */}
              {isImage && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setIsMarkupMode(true)}
                >
                  <Pen className="h-4 w-4" />
                  Markup
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Text Input Dialog */}
      <AlertDialog open={showTextInput} onOpenChange={setShowTextInput}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Text Annotation</AlertDialogTitle>
            <AlertDialogDescription>
              Enter text to add at the selected location.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={textInputValue}
            onChange={(e) => setTextInputValue(e.target.value)}
            placeholder="Enter annotation text..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTextSubmit();
              }
            }}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowTextInput(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleTextSubmit}>Add</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Confirmation */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Annotations?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all your markup from this pattern. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClearAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
