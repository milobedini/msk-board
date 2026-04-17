import { fetchEmployees } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees,
    staleTime: 60_000
  });
};
