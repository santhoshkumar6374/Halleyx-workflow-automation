import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Execution } from '../types';
import { ScrollText, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AuditLogs() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // We fetch all executions by bypassing workflowId if we create a global endpoint,
    // For this demo, we'll assume we can't easily get ALL executions globally without a new endpoint.
    // Let's create a generic fetcher that gets recent workflows and their executions or just display a message 
    // that this requires a global generic endpoint.
    // For now: we'll implement a mock global fetch since the backend ExecutionRepository 
    // doesn't have a findAll() exposed without workflowId currently in the controller.
    
    // To fix this properly, let's just make a call to a hypothetical `/executions` 
    // or we'll add it to the backend next. For now, we will add the endpoint in backend and call it.
    const fetchAll = async () => {
      try {
        const { data } = await api.get<Execution[]>('/executions');
        setExecutions(data);
      } catch (e) {
        console.error("Failed to fetch all executions", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <ScrollText className="h-6 w-6 text-gray-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-1 text-sm text-gray-500">Global execution history and system trails.</p>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {isLoading && <li className="px-6 py-10 text-center text-gray-500">Loading audit logs...</li>}
          {!isLoading && executions.length === 0 && (
            <li className="px-6 py-10 text-center text-gray-500">No execution logs found in the system.</li>
          )}
          {executions.map((exec) => (
            <li key={exec.id}>
              <div className="px-6 py-5 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 truncate mr-3">
                      Execution #{exec.id}
                    </span>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${exec.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : ''}
                        ${exec.status === 'FAILED' ? 'bg-red-100 text-red-800' : ''}
                        ${exec.status === 'IN_PROGRESS' || exec.status === 'PENDING' ? 'bg-blue-100 text-blue-800' : ''}
                        ${exec.status === 'CANCELED' ? 'bg-gray-100 text-gray-800' : ''}
                      `}
                    >
                      {exec.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                    Workflow {exec.workflowId} • Triggered by {exec.triggeredBy} • {new Date(exec.startedAt).toLocaleString()}
                  </div>
                </div>
                <div className="ml-5 flex-shrink-0">
                  <Link
                    to={`/executions/${exec.id}`}
                    className="text-indigo-600 hover:text-indigo-900 flex items-center"
                  >
                    View <ExternalLink className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
