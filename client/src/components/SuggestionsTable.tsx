'use client';

import { clsx } from 'clsx';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { SuggestionWithEmployee } from '@server/types';

import { PriorityIndicator } from './PriorityIndicator';
import { StatusBadge } from './StatusBadge';

interface SuggestionsTableProps {
  suggestions: SuggestionWithEmployee[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (suggestion: SuggestionWithEmployee) => void;
}

export const SuggestionsTable = ({ suggestions, isLoading, selectedId, onSelect }: SuggestionsTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return <div className="text-muted-foreground flex items-center justify-center py-12">No suggestions found.</div>;
  }

  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead className="sm:w-48">Employee</TableHead>
          <TableHead className="hidden w-30 md:table-cell">Type</TableHead>
          <TableHead className="hidden sm:table-cell">Description</TableHead>
          <TableHead className="w-24">Priority</TableHead>
          <TableHead className="w-30">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {suggestions.map((suggestion) => (
          <TableRow
            key={suggestion.id}
            className={clsx(
              'cursor-pointer transition-colors',
              selectedId === suggestion.id ? 'bg-muted' : 'hover:bg-muted/50'
            )}
            onClick={() => onSelect(suggestion)}
          >
            <TableCell className="truncate font-medium">{suggestion.employee.name}</TableCell>
            <TableCell className="hidden truncate capitalize md:table-cell">{suggestion.type}</TableCell>
            <TableCell className="hidden truncate sm:table-cell" title={suggestion.description}>
              {suggestion.description}
            </TableCell>
            <TableCell>
              <PriorityIndicator priority={suggestion.priority} />
            </TableCell>
            <TableCell>
              <StatusBadge status={suggestion.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
