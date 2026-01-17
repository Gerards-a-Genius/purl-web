// src/components/projects/PatternValidationBanner.tsx
'use client';

import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface PatternValidationBannerProps {
  warnings: string[];
  errors?: string[];
  className?: string;
}

export function PatternValidationBanner({
  warnings,
  errors = [],
  className,
}: PatternValidationBannerProps) {
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;
  const isValid = !hasErrors && !hasWarnings;

  if (isValid) {
    return (
      <Alert
        className={cn('border-green-200 bg-green-50', className)}
      >
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Pattern parsed successfully</AlertTitle>
        <AlertDescription className="text-green-700">
          All required information was detected. Review the details and create your project.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Errors */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Parsing Issues</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {hasWarnings && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Review Recommended</AlertTitle>
          <AlertDescription className="text-amber-700">
            <ul className="list-disc list-inside mt-2 space-y-1">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
