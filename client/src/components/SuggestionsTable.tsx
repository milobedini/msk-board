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

const truncate = (text: string, maxLength: number): string =>
  text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead className="hidden md:table-cell">Type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="hidden sm:table-cell">Priority</TableHead>
          <TableHead>Status</TableHead>
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
            <TableCell className="font-medium">{suggestion.employee.name}</TableCell>
            <TableCell className="hidden capitalize md:table-cell">{suggestion.type}</TableCell>
            <TableCell className="max-w-75">{truncate(suggestion.description, 60)}</TableCell>
            <TableCell className="hidden sm:table-cell">
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
