"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PriorityIndicator } from "./PriorityIndicator";
import { useUpdateSuggestion } from "@/hooks/useUpdateSuggestion";
import { SUGGESTION_STATUSES } from "@server/types";
import type { SuggestionWithEmployee, SuggestionStatus } from "@server/types";

interface SuggestionDetailProps {
  suggestion: SuggestionWithEmployee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabels: Record<SuggestionStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  overdue: "Overdue",
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const SuggestionDetail = ({
  suggestion,
  open,
  onOpenChange,
}: SuggestionDetailProps) => {
  const [status, setStatus] = useState<SuggestionStatus>("pending");
  const [notes, setNotes] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const updateMutation = useUpdateSuggestion();

  useEffect(() => {
    if (suggestion) {
      setStatus(suggestion.status);
      setNotes(suggestion.notes);
    }
  }, [suggestion]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const hasChanges =
    suggestion && (status !== suggestion.status || notes !== suggestion.notes);

  const handleSave = () => {
    if (!suggestion || !hasChanges) return;

    const updates: { status?: SuggestionStatus; notes?: string } = {};
    if (status !== suggestion.status) updates.status = status;
    if (notes !== suggestion.notes) updates.notes = notes;

    updateMutation.mutate(
      { id: suggestion.id, updates },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  if (!suggestion) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={isMobile ? "h-[85vh] overflow-y-auto" : "w-full sm:max-w-md overflow-y-auto"}
      >
        <SheetHeader>
          <SheetTitle>Suggestion Detail</SheetTitle>
          <SheetDescription>
            {suggestion.employee.name} &middot; {suggestion.employee.department}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
              {suggestion.type}
            </p>
            <p className="text-sm leading-relaxed">{suggestion.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Priority</p>
              <PriorityIndicator priority={suggestion.priority} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Source</p>
              <p className="text-sm capitalize">{suggestion.source}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Created</p>
              <p className="text-sm">{formatDate(suggestion.dateCreated)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Updated</p>
              <p className="text-sm">{formatDate(suggestion.dateUpdated)}</p>
            </div>
            {suggestion.dateCompleted && (
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Completed</p>
                <p className="text-sm">{formatDate(suggestion.dateCompleted)}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Risk Level</p>
              <p className="text-sm capitalize">{suggestion.employee.riskLevel}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium uppercase text-muted-foreground mb-2 block">
                Status
              </label>
              <Select
                items={SUGGESTION_STATUSES.map((s) => ({ label: statusLabels[s], value: s }))}
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
              <label className="text-xs font-medium uppercase text-muted-foreground mb-2 block">
                Notes
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={!hasChanges || updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
