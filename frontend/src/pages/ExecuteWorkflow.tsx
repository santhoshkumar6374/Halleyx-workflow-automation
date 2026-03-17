import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, ArrowLeft, History } from 'lucide-react';
import { useWorkflow } from '../hooks/useWorkflows';
import { useStartExecution, useExecutions } from '../hooks/useExecutions';
import type { Execution } from '../types';

export function ExecuteWorkflow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: workflow, isLoading: isLoadingWf } = useWorkflow(id!);
  const { data: executions, isLoading: isLoadingExecs } = useExecutions(id!);
  const { mutateAsync: startExecution, isPending } = useStartExecution(id!);

  const [inputData, setInputData] = useState('{\n  \n}');
  const [triggeredBy, setTriggeredBy] = useState('user@example.com');

  const handleExecute = async () => {
    try {
      // Validate JSON
      JSON.parse(inputData);
      
      const execution = await startExecution({
        data: inputData,
        triggeredBy,
      });
      navigate(`/executions/${execution.id}`);
    } catch (error) {
      if (error instanceof SyntaxError) {
        alert('Invalid JSON input formatted data.');
      }
    }
  };

  if (isLoadingWf || isLoadingExecs) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!workflow) return <div className="p-8 text-center text-red-500">Workflow not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/workflows')}
            className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Execute: {workflow.name}</h1>
            <p className="mt-1 text-sm text-gray-500">Provide input data and trigger a new execution.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow sm:rounded-lg border border-gray-200 h-fit">
          <div className="px-4 py-5 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Triggered By / User ID</label>
              <input
                type="text"
                value={triggeredBy}
                onChange={(e) => setTriggeredBy(e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Data (JSON) based on schema
              </label>
              <div className="bg-gray-50 p-2 text-xs text-gray-500 border border-gray-200 rounded-t-md font-mono whitespace-pre-wrap">
                Schema: <br/>{workflow.inputSchema}
              </div>
              <textarea
                rows={10}
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-b-md p-2 border font-mono"
              />
            </div>

            <button
              onClick={handleExecute}
              disabled={isPending || !workflow.isActive}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400"
            >
              <Play className="h-4 w-4 mr-2" />
              {isPending ? 'Starting...' : 'Start Execution'}
            </button>
            {!workflow.isActive && (
              <p className="text-xs text-red-500 text-center mt-2">Workflow is currently inactive.</p>
            )}
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg border border-gray-200">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex items-center">
            <History className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Executions</h3>
          </div>
          <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {!executions?.length && (
              <li className="px-6 py-10 text-center text-gray-500 text-sm">No recent executions.</li>
            )}
            {executions?.map((exec: Execution) => (
              <li key={exec.id}>
                <a
                  href={`/executions/${exec.id}`}
                  className="block hover:bg-gray-50 px-4 py-4 sm:px-6 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      Execution #{exec.id}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${exec.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : ''}
                        ${exec.status === 'FAILED' ? 'bg-red-100 text-red-800' : ''}
                        ${exec.status === 'IN_PROGRESS' || exec.status === 'PENDING' ? 'bg-blue-100 text-blue-800' : ''}
                        ${exec.status === 'CANCELED' ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {exec.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Started: {new Date(exec.startedAt).toLocaleString()}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
