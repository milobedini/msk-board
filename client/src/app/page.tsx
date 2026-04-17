"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FilterBar } from "@/components/FilterBar";
import { SuggestionsTable } from "@/components/SuggestionsTable";
import { SuggestionDetail } from "@/components/SuggestionDetail";
import { Pagination } from "@/components/Pagination";
import { useSuggestions } from "@/hooks/useSuggestions";
import type { SuggestionFilters } from "@/lib/api";
import type { SuggestionWithEmployee, SuggestionStatus, SuggestionType } from "@server/types";

const ITEMS_PER_PAGE = 10;

export default function SuggestionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: SuggestionFilters = {
    status: (searchParams.get("status") as SuggestionStatus) || undefined,
    type: (searchParams.get("type") as SuggestionType) || undefined,
    employeeId: searchParams.get("employeeId") || undefined,
    page: Number(searchParams.get("page")) || 1,
    limit: ITEMS_PER_PAGE,
  };

  const { data, isLoading, isError } = useSuggestions(filters);

  const [selectedSuggestion, setSelectedSuggestion] = useState<SuggestionWithEmployee | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const updateSearchParams = useCallback(
    (newFilters: SuggestionFilters) => {
      const params = new URLSearchParams();
      if (newFilters.status) params.set("status", newFilters.status);
      if (newFilters.type) params.set("type", newFilters.type);
      if (newFilters.employeeId) params.set("employeeId", newFilters.employeeId);
      if (newFilters.page && newFilters.page > 1) params.set("page", String(newFilters.page));
      const qs = params.toString();
      router.push(qs ? `?${qs}` : "/", { scroll: false });
    },
    [router],
  );

  const handleSelect = (suggestion: SuggestionWithEmployee) => {
    setSelectedSuggestion(suggestion);
    setSheetOpen(true);
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ ...filters, page });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">MSK Suggestions Board</h1>
        <p className="mt-1 text-muted-foreground">
          View and manage employee wellbeing suggestions from VIDA
        </p>
      </div>

      <div className="mb-6">
        <FilterBar filters={filters} onFiltersChange={updateSearchParams} />
      </div>

      {isError ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
          Failed to load suggestions. Please try again.
        </div>
      ) : (
        <>
          <SuggestionsTable
            suggestions={data?.data ?? []}
            isLoading={isLoading}
            selectedId={selectedSuggestion?.id ?? null}
            onSelect={handleSelect}
          />

          {data?.pagination && (
            <Pagination pagination={data.pagination} onPageChange={handlePageChange} />
          )}
        </>
      )}

      <SuggestionDetail
        suggestion={selectedSuggestion}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </main>
  );
}
