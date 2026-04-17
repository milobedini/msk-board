export const SUGGESTION_STATUSES = ['pending', 'in_progress', 'completed', 'overdue'] as const;
export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number];

export const SUGGESTION_TYPES = ['equipment', 'exercise', 'behavioural', 'lifestyle'] as const;
export type SuggestionType = (typeof SUGGESTION_TYPES)[number];

export const RISK_LEVELS = ['low', 'medium', 'high'] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const PRIORITY_LEVELS = ['low', 'medium', 'high'] as const;
export type Priority = (typeof PRIORITY_LEVELS)[number];

export const SUGGESTION_SOURCES = ['vida', 'admin'] as const;
export type SuggestionSource = (typeof SUGGESTION_SOURCES)[number];

export interface Employee {
  id: string;
  name: string;
  department: string;
  riskLevel: RiskLevel;
}

export interface Suggestion {
  id: string;
  employeeId: string;
  type: SuggestionType;
  description: string;
  status: SuggestionStatus;
  priority: Priority;
  source: SuggestionSource;
  createdBy?: string;
  dateCreated: string;
  dateUpdated: string;
  dateCompleted?: string;
  notes: string;
}

export interface SuggestionWithEmployee extends Suggestion {
  employee: Pick<Employee, 'name' | 'department' | 'riskLevel'>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiError {
  error: {
    message: string;
    code: string;
  };
}
