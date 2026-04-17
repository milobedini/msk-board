import { readFileSync } from 'fs';
import { resolve } from 'path';

import type {
  Employee,
  PaginatedResponse,
  Suggestion,
  SuggestionStatus,
  SuggestionType,
  SuggestionWithEmployee
} from '../types/index.js';

interface SampleData {
  employees: Employee[];
  suggestions: Suggestion[];
}

interface SuggestionFilters {
  status?: SuggestionStatus;
  type?: SuggestionType;
  employeeId?: string;
  page?: number;
  limit?: number;
}

const loadData = (): SampleData => {
  const filePath = resolve(process.cwd(), '..', 'data', 'sample-data.json');
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as SampleData;
};

const data = loadData();

const employeeMap = new Map(data.employees.map((e) => [e.id, e]));

export const getEmployees = (): Employee[] => {
  return [...data.employees];
};

export const getSuggestions = (filters: SuggestionFilters): PaginatedResponse<SuggestionWithEmployee> => {
  const { status, type, employeeId, page = 1, limit = 20 } = filters;

  const filtered = data.suggestions.filter((s) => {
    if (status && s.status !== status) return false;
    if (type && s.type !== type) return false;
    if (employeeId && s.employeeId !== employeeId) return false;
    return true;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  const enriched = paginated.map((s) => {
    const employee = employeeMap.get(s.employeeId);
    return {
      ...s,
      employee: employee
        ? { name: employee.name, department: employee.department, riskLevel: employee.riskLevel }
        : { name: 'Unknown', department: 'Unknown', riskLevel: 'low' as const }
    };
  });

  return {
    data: enriched,
    pagination: { page, limit, total, totalPages }
  };
};

export const getSuggestionById = (id: string): SuggestionWithEmployee | undefined => {
  const suggestion = data.suggestions.find((s) => s.id === id);
  if (!suggestion) return undefined;

  const employee = employeeMap.get(suggestion.employeeId);
  return {
    ...suggestion,
    employee: employee
      ? { name: employee.name, department: employee.department, riskLevel: employee.riskLevel }
      : { name: 'Unknown', department: 'Unknown', riskLevel: 'low' as const }
  };
};

export const updateSuggestion = (
  id: string,
  updates: { status?: SuggestionStatus; notes?: string }
): SuggestionWithEmployee | undefined => {
  const index = data.suggestions.findIndex((s) => s.id === id);
  if (index === -1) return undefined;

  const now = new Date().toISOString();
  const suggestion = data.suggestions[index];

  if (updates.status !== undefined) {
    suggestion.status = updates.status;
  }
  if (updates.notes !== undefined) {
    suggestion.notes = updates.notes;
  }
  suggestion.dateUpdated = now;

  if (updates.status === 'completed') {
    suggestion.dateCompleted = now;
  }

  const employee = employeeMap.get(suggestion.employeeId);
  return {
    ...suggestion,
    employee: employee
      ? { name: employee.name, department: employee.department, riskLevel: employee.riskLevel }
      : { name: 'Unknown', department: 'Unknown', riskLevel: 'low' as const }
  };
};
