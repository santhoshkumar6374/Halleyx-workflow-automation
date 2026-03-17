import { Link } from 'react-router-dom';
import { Plus, Play, Edit, Trash2 } from 'lucide-react';
import { useWorkflows, useDeleteWorkflow } from '../hooks/useWorkflows';

export function WorkflowList() {
  const { data: workflows, isLoading, error } = useWorkflows();
  const { mutateAsync: deleteWorkflow } = useDeleteWorkflow();

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this workflow? All associated executions and steps will be permanently deleted.')) {
      try {
        await deleteWorkflow(id);
      } catch (error) {
        console.error('Failed to delete workflow', error);
      }
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading workflows...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load workflows.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and orchestrate your business processes.</p>
        </div>
        <Link
          to="/workflows/create"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {!workflows?.length && (
            <li className="px-6 py-10 text-center text-gray-500">No workflows found. Create one to get started.</li>
          )}
          {workflows?.map((workflow) => (
            <li key={workflow.id}>
              <div className="px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-indigo-600 truncate">{workflow.name}</p>
                    <span
                      className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        workflow.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {workflow.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      v{workflow.version}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span className="truncate">Updated at {new Date(workflow.updatedAt || '').toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Link
                    to={`/workflows/${workflow.id}/execute`}
                    className="text-gray-400 hover:text-green-600 transition-colors"
                    title="Execute"
                  >
                    <Play className="h-5 w-5" />
                  </Link>
                  <Link
                    to={`/workflows/${workflow.id}`}
                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                    title="Edit Steps"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                  <button 
                    onClick={() => handleDelete(workflow.id!)}
                    className="text-gray-400 hover:text-red-600 transition-colors" 
                    title="Delete"
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
