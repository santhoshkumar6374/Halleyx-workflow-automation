package com.workflow.service;

import com.workflow.entity.Workflow;
import com.workflow.exception.ResourceNotFoundException;
import com.workflow.repository.ExecutionRepository;
import com.workflow.repository.RuleRepository;
import com.workflow.repository.StepRepository;
import com.workflow.repository.WorkflowRepository;
import com.workflow.entity.Step;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final StepRepository stepRepository;
    private final ExecutionRepository executionRepository;
    private final RuleRepository ruleRepository;

    public List<Workflow> getAllWorkflows() {
        return workflowRepository.findAll();
    }

    public Workflow getWorkflowById(Long id) {
        return workflowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found with id: " + id));
    }

    public Workflow createWorkflow(Workflow workflow) {
        return workflowRepository.save(workflow);
    }

    public Workflow updateWorkflow(Long id, Workflow workflowDetails) {
        Workflow workflow = getWorkflowById(id);
        workflow.setName(workflowDetails.getName());
        workflow.setVersion(workflowDetails.getVersion());
        workflow.setIsActive(workflowDetails.getIsActive());
        workflow.setInputSchema(workflowDetails.getInputSchema());
        workflow.setStartStepId(workflowDetails.getStartStepId());
        return workflowRepository.save(workflow);
    }

    @Transactional
    public void deleteWorkflow(Long id) {
        Workflow workflow = getWorkflowById(id);
        
        // Delete all dependent executions
        executionRepository.deleteByWorkflowId(id);
        
        // Delete rules attached to steps, then the steps
        List<Step> steps = stepRepository.findByWorkflowIdOrderByStepOrderAsc(id);
        for (Step step : steps) {
            ruleRepository.deleteByStepId(step.getId());
        }
        stepRepository.deleteByWorkflowId(id);
        
        workflowRepository.delete(workflow);
    }
}
