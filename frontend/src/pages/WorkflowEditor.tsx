import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Settings, ArrowLeft } from 'lucide-react';
import { useWorkflow } from '../hooks/useWorkflows';
import { useSteps, useCreateStep, useDeleteStep } from '../hooks/useSteps';

const stepSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  stepType: z.enum(['TASK', 'APPROVAL', 'NOTIFICATION']),
  metadata: z.string().default('{}'),
});

export function WorkflowEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: workflow, isLoading: isLoadingWf } = useWorkflow(id!);
  const { data: steps, isLoading: isLoadingSteps } = useSteps(id!);
  const { mutateAsync: createStep, isPending: isCreatingStep } = useCreateStep(id!);
  const { mutateAsync: deleteStep } = useDeleteStep(id!);

  const [isAdding, setIsAdding] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(stepSchema),
    defaultValues: { name: '', stepType: 'TASK', metadata: '{}' },
  });

  const onSubmit = async (data: z.infer<typeof stepSchema>) => {
    try {
      await createStep({
        ...data,
        stepOrder: (steps?.length || 0) + 1,
        workflowId: Number(id),
      });
      setIsAdding(false);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (stepId: number) => {
    if (confirm('Are you sure you want to delete this step?')) {
      await deleteStep(stepId);
    }
  };

  if (isLoadingWf || isLoadingSteps) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!workflow) return <div className="p-8 text-center text-red-500">Workflow not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/workflows')}
          className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{workflow.name} Editor</h1>
          <p className="mt-1 text-sm text-gray-500">Manage steps and rules for this workflow.</p>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Workflow Steps</h3>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Step
            </button>
          )}
        </div>

        {isAdding && (
          <div className="p-4 border-b border-gray-200 bg-indigo-50">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Step Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                    {...register('name')}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border bg-white"
                    {...register('stepType')}
                  >
                    <option value="TASK">Task (Automated)</option>
                    <option value="APPROVAL">Approval (Wait)</option>
                    <option value="NOTIFICATION">Notification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Metadata (JSON)</label>
                  <input
                    type="text"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border font-mono"
                    {...register('metadata')}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingStep}
                  className="px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {isCreatingStep ? 'Saving...' : 'Save Step'}
                </button>
              </div>
            </form>
          </div>
        )}

        <ul className="divide-y divide-gray-200">
          {!steps?.length && !isAdding && (
            <li className="px-6 py-10 text-center text-gray-500">No steps defined. Add a step to begin.</li>
          )}
          {steps?.map((step: any, index: number) => (
            <li key={step.id}>
              <div className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-indigo-600 truncate">{step.name}</p>
                    <p className="text-xs text-gray-500">Type: {step.stepType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Link
                    to={`/steps/${step.id}/rules`}
                    className="flex items-center text-sm text-gray-500 hover:text-indigo-600"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Configure Rules
                  </Link>
                  <button
                    onClick={() => handleDelete(step.id!)}
                    className="text-gray-400 hover:text-red-600"
                    title="Delete Step"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
