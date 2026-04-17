import type { Priority } from '@server/types';

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  high: { label: 'High', className: 'text-red-600' },
  medium: { label: 'Medium', className: 'text-amber-600' },
  low: { label: 'Low', className: 'text-slate-500' }
};

export const PriorityIndicator = ({ priority }: { priority: Priority }) => {
  const config = priorityConfig[priority];
  return <span className={`text-sm font-medium ${config.className}`}>{config.label}</span>;
};
