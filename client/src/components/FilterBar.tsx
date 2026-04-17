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

  const statusItems = [
    { label: "All Statuses", value: null },
    ...SUGGESTION_STATUSES.map((s) => ({ label: statusLabels[s], value: s })),
  ];

  const typeItems = [
    { label: "All Types", value: null },
    ...SUGGESTION_TYPES.map((t) => ({ label: typeLabels[t], value: t })),
  ];

  const employeeItems = [
    { label: "All Employees", value: null },
    ...employees.map((e) => ({ label: e.name, value: e.id })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        items={statusItems}
        value={filters.status ?? null}
        onValueChange={(v) => updateFilter("status", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          {statusItems.map((item) => (
            <SelectItem key={item.value ?? "all"} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={typeItems}
        value={filters.type ?? null}
        onValueChange={(v) => updateFilter("type", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          {typeItems.map((item) => (
            <SelectItem key={item.value ?? "all"} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={employeeItems}
        value={filters.employeeId ?? null}
        onValueChange={(v) => updateFilter("employeeId", v)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All Employees" />
        </SelectTrigger>
        <SelectContent>
          {employeeItems.map((item) => (
            <SelectItem key={item.value ?? "all"} value={item.value}>
              {item.label}
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
