import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, ArrowLeft, Info } from 'lucide-react';
import { useRules, useCreateRule, useDeleteRule } from '../hooks/useRules';

const ruleSchema = z.object({
  condition: z.string().min(1, 'Condition is required'),
  priority: z.number().min(1, 'Priority must be at least 1'),
  nextStepId: z.string().optional(),
});

type RuleFormValues = z.infer<typeof ruleSchema>;

export function RuleEditor() {
  const { stepId } = useParams<{ stepId: string }>();
  const navigate = useNavigate();
  const { data: rules, isLoading } = useRules(stepId!);
  const { mutateAsync: createRule, isPending: isCreating } = useCreateRule(stepId!);
  const { mutateAsync: deleteRule } = useDeleteRule(stepId!);

  const [isAdding, setIsAdding] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: { condition: '', priority: 1, nextStepId: '' },
  });

  const onSubmit = async (data: RuleFormValues) => {
    try {
      await createRule({
        ...data,
        stepId: Number(stepId),
        nextStepId: data.nextStepId ? Number(data.nextStepId) : null,
      });
      setIsAdding(false);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (ruleId: number) => {
    if (confirm('Delete this rule?')) {
      await deleteRule(ruleId);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading rules...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rule Editor Configuration</h1>
          <p className="mt-1 text-sm text-gray-500">Define transition logic for Step ID: {stepId}</p>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Rules are evaluated by priority order. Write conditions like <code className="bg-blue-100 px-1 rounded">amount {'>'} 1000</code> or use <code className="bg-blue-100 px-1 rounded">DEFAULT</code> as a fallback. Leave "Next Step ID" empty to end the workflow.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Conditions</h3>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Rule
            </button>
          )}
        </div>

        {isAdding && (
          <div className="p-4 border-b border-gray-200 bg-indigo-50">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Condition</label>
                  <input
                    type="text"
                    placeholder="e.g. status == 'verified' || DEFAULT"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border font-mono"
                    {...register('condition')}
                  />
                  {errors.condition && <p className="mt-1 text-xs text-red-600">{errors.condition.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <input
                    type="number"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                    {...register('priority', { valueAsNumber: true })}
                  />
                  {errors.priority && <p className="mt-1 text-xs text-red-600">{errors.priority.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Next Step ID</label>
                  <input
                    type="number"
                    placeholder="Leave empty to stop"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                    {...register('nextStepId')}
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
                  disabled={isCreating}
                  className="px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {isCreating ? 'Saving...' : 'Save Rule'}
                </button>
              </div>
            </form>
          </div>
        )}

        <ul className="divide-y divide-gray-200">
          {!rules?.length && !isAdding && (
            <li className="px-6 py-10 text-center text-gray-500">No rules defined. Workflow will stop at this step.</li>
          )}
          {rules?.map((rule) => (
            <li key={rule.id}>
              <div className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 mr-3">
                      Priority {rule.priority}
                    </span>
                    <p className="text-sm font-mono text-gray-800">{rule.condition}</p>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Next Step ID: {rule.nextStepId ? <span className="font-semibold text-indigo-600">{rule.nextStepId}</span> : <span className="text-gray-400 italic">None (End Workflow)</span>}
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => handleDelete(rule.id!)}
                    className="text-gray-400 hover:text-red-600"
                    title="Delete Rule"
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
