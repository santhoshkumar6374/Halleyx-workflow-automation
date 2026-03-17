import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreateWorkflow } from '../hooks/useWorkflows';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';

const workflowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  isActive: z.boolean().default(true),
  inputSchema: z.string().min(1, 'Input schema is required').refine(
    (val) => {
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Invalid JSON format' }
  ),
});

type WorkflowFormValues = z.infer<typeof workflowSchema>;

export function CreateWorkflow() {
  const navigate = useNavigate();
  const { mutateAsync: createWorkflow, isPending } = useCreateWorkflow();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      isActive: true,
      name: '',
      inputSchema: '{\n  "amount": "number",\n  "department": "string"\n}',
    },
  });

  const [schemaFields, setSchemaFields] = useState([{ key: 'amount', type: 'number' }, { key: 'department', type: 'string' }]);

  useEffect(() => {
    const schemaObj = schemaFields.reduce((acc, field) => {
      if (field.key.trim()) acc[field.key.trim()] = field.type;
      return acc;
    }, {} as Record<string, string>);
    setValue('inputSchema', JSON.stringify(schemaObj, null, 2), { shouldValidate: true });
  }, [schemaFields, setValue]);

  const addField = () => setSchemaFields([...schemaFields, { key: '', type: 'string' }]);
  const removeField = (index: number) => setSchemaFields(schemaFields.filter((_, i) => i !== index));
  const updateField = (index: number, key: string, value: string) => {
    const newFields = [...schemaFields];
    newFields[index] = { ...newFields[index], [key]: value };
    setSchemaFields(newFields);
  };

  const onSubmit = async (data: WorkflowFormValues) => {
    try {
      const response = await createWorkflow({
        ...data,
        version: 1,
      });
      navigate(`/workflows/${response.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/workflows')}
          className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Workflow</h1>
          <p className="mt-1 text-sm text-gray-500">Define a new automated business process.</p>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Workflow Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="name"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="e.g., Expense Approval"
                  {...register('name')}
                />
                {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="isActive"
                  type="checkbox"
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  {...register('isActive')}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="isActive" className="font-medium text-gray-700">
                  Active
                </label>
                <p className="text-gray-500">Enable this workflow immediately after creation.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Input Schema Configuration
              </label>
              
              <div className="space-y-3 bg-gray-50 p-4 border border-gray-200 rounded-md">
                {schemaFields.map((field, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) => updateField(index, 'key', e.target.value)}
                      placeholder="Field name (e.g. amount)"
                      className="flex-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateField(index, 'type', e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-300 rounded-md p-2 border bg-white"
                    >
                      <option value="string">Text (string)</option>
                      <option value="number">Number</option>
                      <option value="boolean">Checkbox (boolean)</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="p-2 text-gray-400 hover:text-red-500 focus:outline-none"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addField}
                  className="mt-2 inline-flex items-center px-3 py-1.5 border border-indigo-300 shadow-sm text-xs font-medium rounded text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Field
                </button>
              </div>
              {errors.inputSchema && <p className="mt-2 text-sm text-red-600">{errors.inputSchema.message}</p>}
            </div>

            <div className="pt-5 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/workflows')}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="ml-3 inline-flex justify-center flex-items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isPending ? 'Saving...' : 'Save Workflow'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
