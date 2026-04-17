import { Button } from '@/components/ui/button';
import type { PaginationMeta } from '@server/types';

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ pagination, onPageChange }: PaginationProps) => {
  const { page, limit, totalPages, total } = pagination;

  if (totalPages <= 1) return null;

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-muted-foreground text-sm">
        {start}-{end} of {total}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
};
