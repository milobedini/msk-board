"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEmployees } from "@/hooks/useEmployees";
import { SUGGESTION_STATUSES, SUGGESTION_TYPES } from "@server/types";
import type { SuggestionFilters } from "@/lib/api";

interface FilterBarProps {
  filters: SuggestionFilters;
  onFiltersChange: (filters: SuggestionFilters) => void;
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  overdue: "Overdue",
};

const typeLabels: Record<string, string> = {
  equipment: "Equipment",
  exercise: "Exercise",
  behavioural: "Behavioural",
  lifestyle: "Lifestyle",
};

export const FilterBar = ({ filters, onFiltersChange }: FilterBarProps) => {
  const { data: employeesData } = useEmployees();
  const employees = employeesData?.data ?? [];

  const hasActiveFilters = filters.status || filters.type || filters.employeeId;

  const updateFilter = (key: keyof SuggestionFilters, value: string | null | undefined) => {
    onFiltersChange({ ...filters, [key]: value ?? undefined, page: 1 });
  };

  const clearFilters = () => {
    onFiltersChange({ page: 1, limit: filters.limit });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filters.status ?? "all"}
        onValueChange={(v) => updateFilter("status", v === "all" ? undefined : v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {SUGGESTION_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {statusLabels[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.type ?? "all"}
        onValueChange={(v) => updateFilter("type", v === "all" ? undefined : v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {SUGGESTION_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {typeLabels[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.employeeId ?? "all"}
        onValueChange={(v) => updateFilter("employeeId", v === "all" ? undefined : v)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All Employees" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Employees</SelectItem>
          {employees.map((e) => (
            <SelectItem key={e.id} value={e.id}>
              {e.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  );
};
