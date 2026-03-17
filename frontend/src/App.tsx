import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { DashboardLayout } from './components/layout/DashboardLayout';
import { WorkflowList } from './pages/WorkflowList';
import { CreateWorkflow } from './pages/CreateWorkflow';
import { WorkflowEditor } from './pages/WorkflowEditor';
import { RuleEditor } from './pages/RuleEditor';
import { ExecuteWorkflow } from './pages/ExecuteWorkflow';
import { ExecutionStatus } from './pages/ExecutionStatus';
import { AuditLogs } from './pages/AuditLogs';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<WorkflowList />} />
            <Route path="workflows" element={<WorkflowList />} />
            <Route path="workflows/create" element={<CreateWorkflow />} />
            <Route path="workflows/:id" element={<WorkflowEditor />} />
            <Route path="steps/:stepId/rules" element={<RuleEditor />} />
            <Route path="workflows/:id/execute" element={<ExecuteWorkflow />} />
            <Route path="executions/:id" element={<ExecutionStatus />} />
            <Route path="audit" element={<AuditLogs />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
