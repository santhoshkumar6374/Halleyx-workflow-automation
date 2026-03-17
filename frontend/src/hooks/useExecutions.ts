import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Execution } from '../types';
import toast from 'react-hot-toast';

export const useExecutions = (workflowId: string) => {
  return useQuery({
    queryKey: ['executions', workflowId],
    queryFn: async () => {
      // Create endpoint in backend if it doesn't exist, we will use a generic one or filter locally
      const { data } = await api.get<Execution[]>(`/workflows/${workflowId}/executions`);
      return data;
    },
    enabled: !!workflowId,
  });
};

export const useExecution = (id: string) => {
  return useQuery({
    queryKey: ['execution', id],
    queryFn: async () => {
      const { data } = await api.get<Execution>(`/executions/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useStartExecution = (workflowId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { data: string; triggeredBy: string }) => {
      const { data } = await api.post<Execution>(`/workflows/${workflowId}/execute`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['executions', workflowId] });
      toast.success('Execution started');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to start execution');
    },
  });
};

export const useCancelExecution = (workflowId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (executionId: number) => {
      const { data } = await api.post<Execution>(`/executions/${executionId}/cancel`);
      return data;
    },
    onSuccess: (_, executionId) => {
      queryClient.invalidateQueries({ queryKey: ['executions', workflowId] });
      queryClient.invalidateQueries({ queryKey: ['execution', executionId.toString()] });
      toast.success('Execution canceled');
    },
  });
};
