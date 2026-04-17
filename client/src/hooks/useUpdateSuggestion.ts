import { toast } from 'sonner';
import { updateSuggestion } from '@/lib/api';
import type { SuggestionStatus } from '@server/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateVariables {
  id: string;
  updates: { status?: SuggestionStatus; notes?: string };
}

export const useUpdateSuggestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: UpdateVariables) => updateSuggestion(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
      toast.success('Suggestion updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update suggestion');
    }
  });
};
