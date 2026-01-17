// src/components/common/StatusPill.tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ProjectStatus } from '@/types/project';

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  planned: {
    label: 'Planned',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  },
  finished: {
    label: 'Finished',
    className: 'bg-green-100 text-green-700 hover:bg-green-100',
  },
};

interface StatusPillProps {
  status: ProjectStatus;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
