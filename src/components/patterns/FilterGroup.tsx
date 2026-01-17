'use client';

// src/components/patterns/FilterGroup.tsx
// A collapsible group of filter options (checkboxes or toggle buttons)

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

export interface FilterOption {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Count of matching items (optional) */
  count?: number;
  /** Whether option is disabled */
  disabled?: boolean;
}

export interface FilterGroupProps {
  /** Group title */
  title: string;
  /** Filter options */
  options: FilterOption[];
  /** Currently selected option IDs */
  selected: string[];
  /** Callback when selection changes */
  onChange: (selected: string[]) => void;
  /** Display variant */
  variant?: 'checkbox' | 'button';
  /** Whether the group is collapsible */
  collapsible?: boolean;
  /** Whether the group starts expanded (if collapsible) */
  defaultOpen?: boolean;
  /** Additional className */
  className?: string;
}

export function FilterGroup({
  title,
  options,
  selected,
  onChange,
  variant = 'checkbox',
  collapsible = true,
  defaultOpen = true,
  className,
}: FilterGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = (optionId: string) => {
    const isSelected = selected.includes(optionId);
    if (isSelected) {
      onChange(selected.filter((id) => id !== optionId));
    } else {
      onChange([...selected, optionId]);
    }
  };

  const content = (
    <div className={cn('space-y-2', variant === 'button' && 'flex flex-wrap gap-2')}>
      {options.map((option) => {
        const isSelected = selected.includes(option.id);

        if (variant === 'button') {
          return (
            <Button
              key={option.id}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToggle(option.id)}
              disabled={option.disabled}
              className={cn(
                'h-8 px-3',
                isSelected && 'bg-copper hover:bg-copper-dark'
              )}
            >
              {option.label}
              {option.count !== undefined && (
                <span className="ml-1 text-xs opacity-70">({option.count})</span>
              )}
            </Button>
          );
        }

        // Checkbox variant
        return (
          <div key={option.id} className="flex items-center gap-2">
            <Checkbox
              id={`filter-${option.id}`}
              checked={isSelected}
              onCheckedChange={() => handleToggle(option.id)}
              disabled={option.disabled}
            />
            <Label
              htmlFor={`filter-${option.id}`}
              className={cn(
                'text-sm cursor-pointer flex items-center gap-2',
                option.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {option.label}
              {option.count !== undefined && (
                <span className="text-xs text-muted-foreground">({option.count})</span>
              )}
            </Label>
          </div>
        );
      })}
    </div>
  );

  if (!collapsible) {
    return (
      <div className={cn('space-y-3', className)}>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {content}
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-semibold text-foreground hover:text-copper transition-colors">
        {title}
        <ChevronDown
          className={cn(
            'size-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">{content}</CollapsibleContent>
    </Collapsible>
  );
}
