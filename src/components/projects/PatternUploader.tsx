// src/components/projects/PatternUploader.tsx
'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PatternUploaderProps {
  onFileSelected: (file: File, base64: string) => void;
  accept?: string[];
  maxSize?: number;
}

const DEFAULT_ACCEPT = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50MB

export function PatternUploader({
  onFileSelected,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
}: PatternUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);
      const file = acceptedFiles[0];

      if (!file) return;

      // Validate file type
      if (!accept.includes(file.type)) {
        setError(`Invalid file type. Please upload a PDF or image file.`);
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        setError(`File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`);
        return;
      }

      setSelectedFile(file);
      setIsConverting(true);

      try {
        // Convert to base64
        const base64 = await fileToBase64(file);
        onFileSelected(file, base64);
      } catch {
        setError('Failed to read file. Please try again.');
        setSelectedFile(null);
      } finally {
        setIsConverting(false);
      }
    },
    [accept, maxSize, onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce(
      (acc, type) => {
        acc[type] = [];
        return acc;
      },
      {} as Record<string, string[]>
    ),
    maxFiles: 1,
    maxSize,
    disabled: isConverting,
  });

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/pdf') return FileText;
    if (mimeType.startsWith('image/')) return Image;
    return FileText;
  };

  if (selectedFile && !error) {
    const FileIcon = getFileIcon(selectedFile.type);
    return (
      <div className="border-2 border-dashed border-primary/30 rounded-xl p-6 bg-primary/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveFile}
            disabled={isConverting}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        {isConverting && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Preparing file...
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer',
          'flex flex-col items-center justify-center text-center',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/50',
          error && 'border-destructive/50'
        )}
      >
        <input {...getInputProps()} />

        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Upload className="h-8 w-8 text-primary" />
        </div>

        {isDragActive ? (
          <p className="text-lg font-medium text-primary">Drop your pattern here</p>
        ) : (
          <>
            <p className="text-lg font-medium text-foreground mb-1">
              Drop your pattern here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse files
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PDF, JPEG, PNG, WebP • Max 50MB
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// Helper to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to read file as string'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
