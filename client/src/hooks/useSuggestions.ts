import { useQuery } from "@tanstack/react-query";
import { fetchSuggestions } from "@/lib/api";
import type { SuggestionFilters } from "@/lib/api";

export const suggestionsQueryKey = (filters: SuggestionFilters) =>
  ["suggestions", filters] as const;

export const useSuggestions = (filters: SuggestionFilters) => {
  return useQuery({
    queryKey: suggestionsQueryKey(filters),
    queryFn: () => fetchSuggestions(filters),
  });
};
