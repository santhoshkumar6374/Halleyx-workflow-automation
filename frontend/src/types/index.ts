export interface Workflow {
  id: number;
  name: string;
  version: number;
  isActive: boolean;
  inputSchema: string;
  startStepId: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export type StepType = 'TASK' | 'APPROVAL' | 'NOTIFICATION';

export interface Step {
  id?: number;
  workflowId: number;
  name: string;
  stepType: StepType;
  stepOrder: number;
  metadata: string;
}

export interface Rule {
  id?: number;
  stepId: number;
  condition: string;
  nextStepId: number | null;
  priority: number;
}

export type ExecutionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELED';

export interface Execution {
  id: number;
  workflowId: number;
  workflowVersion: number;
  status: ExecutionStatus;
  data: string;
  logs: string;
  currentStepId: number | null;
  retries: number;
  triggeredBy: string;
  startedAt: string;
  endedAt: string | null;
}
