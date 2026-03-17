import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useExecution } from '../hooks/useExecutions';

export function ExecutionStatus() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: execution, isLoading, refetch } = useExecution(id!);

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading execution...</div>;
  if (!execution) return <div className="p-8 text-center text-red-500">Execution not found.</div>;

  let logs: string[] = [];
  try {
    logs = JSON.parse(execution.logs || '[]');
  } catch (e) {
    console.error('Failed to parse logs', e);
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'FAILED': return <XCircle className="h-6 w-6 text-red-500" />;
      case 'IN_PROGRESS': return <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />;
      case 'PENDING': return <Clock className="h-6 w-6 text-gray-500" />;
      default: return <AlertCircle className="h-6 w-6 text-yellow-500" />;
    }
  };

  const statusColors: Record<string, string> = {
    'COMPLETED': 'bg-green-100 text-green-800',
    'FAILED': 'bg-red-100 text-red-800',
    'IN_PROGRESS': 'bg-blue-100 text-blue-800',
    'PENDING': 'bg-gray-100 text-gray-800',
    'CANCELED': 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Execution ID: {execution.id}</h1>
            <p className="mt-1 text-sm text-gray-500">Workflow ID: {execution.workflowId} | Version: {execution.workflowVersion}</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {getStatusIcon(execution.status)}
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Status: <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${statusColors[execution.status]}`}>{execution.status}</span>
            </h3>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Triggered By</dt>
              <dd className="mt-1 text-sm text-gray-900">{execution.triggeredBy}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Current Step ID</dt>
              <dd className="mt-1 text-sm text-gray-900">{execution.currentStepId || 'None'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Started At</dt>
              <dd className="mt-1 text-sm text-gray-900">{new Date(execution.startedAt).toLocaleString()}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Ended At</dt>
              <dd className="mt-1 text-sm text-gray-900">{execution.endedAt ? new Date(execution.endedAt).toLocaleString() : '-'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Input Data</dt>
              <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-4 rounded-md font-mono whitespace-pre-wrap border border-gray-200">
                {execution.data}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200 mt-6">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-500" />
            Execution Timeline (Logs)
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6 bg-gray-900 text-green-400 font-mono text-xs sm:text-sm rounded-b-lg overflow-x-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 italic">No logs available.</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap border-b border-gray-800 pb-1 mb-1 last:border-0">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
