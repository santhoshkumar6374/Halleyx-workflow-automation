import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Step } from '../types';
import toast from 'react-hot-toast';

export const useSteps = (workflowId: string) => {
  return useQuery({
    queryKey: ['steps', workflowId],
    queryFn: async () => {
      const { data } = await api.get<Step[]>(`/workflows/${workflowId}/steps`);
      return data;
    },
    enabled: !!workflowId,
  });
};

export const useCreateStep = (workflowId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (step: Partial<Step>) => {
      const { data } = await api.post<Step>(`/workflows/${workflowId}/steps`, step);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['steps', workflowId] });
      toast.success('Step added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add step');
    },
  });
};

export const useDeleteStep = (workflowId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (stepId: number) => {
      await api.delete(`/steps/${stepId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['steps', workflowId] });
      toast.success('Step deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete step');
    },
  });
};
