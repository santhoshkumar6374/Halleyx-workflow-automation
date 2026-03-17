import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Workflow } from '../types';
import toast from 'react-hot-toast';

export const useWorkflows = () => {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data } = await api.get<Workflow[]>('/workflows');
      return data;
    },
  });
};

export const useWorkflow = (id: string) => {
  return useQuery({
    queryKey: ['workflows', id],
    queryFn: async () => {
      const { data } = await api.get<Workflow>(`/workflows/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (workflow: Partial<Workflow>) => {
      const { data } = await api.post<Workflow>('/workflows', workflow);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create workflow');
    },
  });
};

// Add more hooks for Steps, Rules, and Executions here
