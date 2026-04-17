import { Badge } from "@/components/ui/badge";
import type { SuggestionStatus } from "@server/types";

const statusConfig: Record<SuggestionStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "outline" },
  in_progress: { label: "In Progress", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  overdue: { label: "Overdue", variant: "destructive" },
};

export const StatusBadge = ({ status }: { status: SuggestionStatus }) => {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};
