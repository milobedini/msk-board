import type { SuggestionFilters } from '@/lib/api';
import { fetchSuggestions } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export const suggestionsQueryKey = (filters: SuggestionFilters) => ['suggestions', filters] as const;

export const useSuggestions = (filters: SuggestionFilters) => {
  return useQuery({
    queryKey: suggestionsQueryKey(filters),
    queryFn: () => fetchSuggestions(filters)
  });
};
