'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useUpdateSuggestion } from '@/hooks/useUpdateSuggestion';
import type { SuggestionStatus, SuggestionWithEmployee } from '@server/types';
import { SUGGESTION_STATUSES } from '@server/types';

import { PriorityIndicator } from './PriorityIndicator';

interface SuggestionDetailProps {
  suggestion: SuggestionWithEmployee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabels: Record<SuggestionStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  overdue: 'Overdue'
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const SuggestionDetail = ({ suggestion, open, onOpenChange }: SuggestionDetailProps) => {
  const [status, setStatus] = useState<SuggestionStatus>(suggestion?.status ?? 'pending');
  const [notes, setNotes] = useState(suggestion?.notes ?? '');
  const [prevSuggestionId, setPrevSuggestionId] = useState(suggestion?.id);
  const isMobile = useIsMobile();
  const updateMutation = useUpdateSuggestion();

  if (suggestion && suggestion.id !== prevSuggestionId) {
    setPrevSuggestionId(suggestion.id);
    setStatus(suggestion.status);
    setNotes(suggestion.notes);
  }

  const hasChanges = suggestion && (status !== suggestion.status || notes !== suggestion.notes);

  const handleSave = () => {
    if (!suggestion || !hasChanges) return;

    const updates: { status?: SuggestionStatus; notes?: string } = {};
    if (status !== suggestion.status) updates.status = status;
    if (notes !== suggestion.notes) updates.notes = notes;

    updateMutation.mutate({ id: suggestion.id, updates }, { onSuccess: () => onOpenChange(false) });
  };

  if (!suggestion) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={clsx('w-full max-w-lg overflow-y-auto p-4', isMobile && 'h-[85vh] max-w-full')}
      >
        <SheetHeader>
          <SheetTitle>Suggestion Detail</SheetTitle>
          <SheetDescription>
            {suggestion.employee.name} &middot; {suggestion.employee.department}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="bg-muted/80 rounded-lg p-4">
            <p className="text-muted-foreground mb-1 text-xs font-medium uppercase">{suggestion.type}</p>
            <p className="text-sm leading-relaxed">{suggestion.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium uppercase">Priority</p>
              <PriorityIndicator priority={suggestion.priority} />
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium uppercase">Source</p>
              <p className="text-sm capitalize">{suggestion.source}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium uppercase">Created</p>
              <p className="text-sm">{formatDate(suggestion.dateCreated)}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium uppercase">Updated</p>
              <p className="text-sm">{formatDate(suggestion.dateUpdated)}</p>
            </div>
            {suggestion.dateCompleted && (
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium uppercase">Completed</p>
                <p className="text-sm">{formatDate(suggestion.dateCompleted)}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium uppercase">Risk Level</p>
              <p className="text-sm capitalize">{suggestion.employee.riskLevel}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <label className="text-muted-foreground mb-2 block text-xs font-medium uppercase">Status</label>
              <Select
                items={SUGGESTION_STATUSES.map((s) => ({
                  label: statusLabels[s],
                  value: s
                }))}
                value={status}
                onValueChange={(v) => setStatus(v as SuggestionStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUGGESTION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-muted-foreground mb-2 block text-xs font-medium uppercase">Notes</label>
              <textarea
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-25 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={!hasChanges || updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
