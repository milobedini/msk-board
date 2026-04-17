import type {
  Employee,
  PaginatedResponse,
  SuggestionStatus,
  SuggestionType,
  SuggestionWithEmployee
} from '@server/types';

export interface SuggestionFilters {
  status?: SuggestionStatus;
  type?: SuggestionType;
  employeeId?: string;
  page?: number;
  limit?: number;
}

const buildQueryString = (filters: SuggestionFilters): string => {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
};

export const fetchSuggestions = async (
  filters: SuggestionFilters
): Promise<PaginatedResponse<SuggestionWithEmployee>> => {
  const qs = buildQueryString(filters);
  const res = await fetch(`/api/suggestions${qs}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? 'Failed to fetch suggestions');
  }
  return res.json();
};

export const updateSuggestion = async (
  id: string,
  updates: { status?: SuggestionStatus; notes?: string }
): Promise<{ data: SuggestionWithEmployee }> => {
  const res = await fetch(`/api/suggestions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? 'Failed to update suggestion');
  }
  return res.json();
};

export const fetchEmployees = async (): Promise<{ data: Employee[] }> => {
  const res = await fetch('/api/employees');
  if (!res.ok) {
    throw new Error('Failed to fetch employees');
  }
  return res.json();
};
