// src/components/projects/CreateProjectSheet.tsx
'use client';

import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Upload, Wand2, PenLine, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateProjectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CREATION_OPTIONS = [
  {
    id: 'upload',
    label: 'Upload Pattern',
    description: 'Import a PDF or image and let AI parse it',
    icon: Upload,
    href: '/projects/new/upload',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    id: 'wizard',
    label: 'AI Wizard',
    description: 'Generate a custom pattern from scratch',
    icon: Wand2,
    href: '/projects/new/wizard',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    id: 'manual',
    label: 'Manual Entry',
    description: 'Enter your project details yourself',
    icon: PenLine,
    href: '/projects/new/manual',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
];

export function CreateProjectSheet({
  open,
  onOpenChange,
}: CreateProjectSheetProps) {
  const router = useRouter();

  const handleOptionSelect = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="text-center mb-6">
          <SheetTitle>Create New Project</SheetTitle>
          <SheetDescription>
            Choose how you&apos;d like to start your project
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3">
          {CREATION_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl',
                  'border border-border bg-card',
                  'transition-all hover:border-primary/20 hover:shadow-sm',
                  'text-left'
                )}
                onClick={() => handleOptionSelect(option.href)}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center',
                    option.iconBg
                  )}
                >
                  <Icon className={cn('h-6 w-6', option.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">
                    {option.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
