package com.workflow.service;

import com.workflow.entity.Step;
import com.workflow.entity.Workflow;
import com.workflow.exception.ResourceNotFoundException;
import com.workflow.repository.StepRepository;
import com.workflow.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StepService {

    private final StepRepository stepRepository;
    private final WorkflowRepository workflowRepository;

    public List<Step> getStepsByWorkflowId(Long workflowId) {
        return stepRepository.findByWorkflowIdOrderByStepOrderAsc(workflowId);
    }

    public Step getStepById(Long id) {
        return stepRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Step not found with id: " + id));
    }

    public Step createStep(Long workflowId, Step step) {
        step.setWorkflowId(workflowId);
        Step savedStep = stepRepository.save(step);
        
        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found with id: " + workflowId));
                
        if (workflow.getStartStepId() == null || (step.getStepOrder() != null && step.getStepOrder() == 1)) {
            workflow.setStartStepId(savedStep.getId());
            workflowRepository.save(workflow);
        }
        
        return savedStep;
    }

    public Step updateStep(Long id, Step stepDetails) {
        Step step = getStepById(id);
        step.setName(stepDetails.getName());
        step.setStepType(stepDetails.getStepType());
        step.setStepOrder(stepDetails.getStepOrder());
        step.setMetadata(stepDetails.getMetadata());
        return stepRepository.save(step);
    }

    public void deleteStep(Long id) {
        Step step = getStepById(id);
        stepRepository.delete(step);
    }
}
