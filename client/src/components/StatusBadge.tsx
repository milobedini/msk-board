import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SuggestionStatus } from '@server/types';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const statusConfig: Record<SuggestionStatus, { label: string; variant: BadgeVariant; className?: string }> = {
  pending: { label: 'Pending', variant: 'outline' },
  in_progress: { label: 'In Progress', variant: 'default' },
  completed: {
    label: 'Completed',
    variant: 'outline',
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
  },
  overdue: { label: 'Overdue', variant: 'destructive' }
};

export const StatusBadge = ({ status }: { status: SuggestionStatus }) => {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {status === 'completed' && <Check aria-hidden />}
      {config.label}
    </Badge>
  );
};
