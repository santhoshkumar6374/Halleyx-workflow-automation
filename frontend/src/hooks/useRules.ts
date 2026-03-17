import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Rule } from '../types';
import toast from 'react-hot-toast';

export const useRules = (stepId: string) => {
  return useQuery({
    queryKey: ['rules', stepId],
    queryFn: async () => {
      const { data } = await api.get<Rule[]>(`/steps/${stepId}/rules`);
      return data;
    },
    enabled: !!stepId,
  });
};

export const useCreateRule = (stepId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rule: Partial<Rule>) => {
      const { data } = await api.post<Rule>(`/steps/${stepId}/rules`, rule);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules', stepId] });
      toast.success('Rule added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add rule');
    },
  });
};

export const useDeleteRule = (stepId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ruleId: number) => {
      await api.delete(`/rules/${ruleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules', stepId] });
      toast.success('Rule deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete rule');
    },
  });
};
