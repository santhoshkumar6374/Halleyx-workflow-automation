package com.workflow.service;

import com.workflow.entity.Workflow;
import com.workflow.exception.ResourceNotFoundException;
import com.workflow.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final WorkflowRepository workflowRepository;

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

    public void deleteWorkflow(Long id) {
        Workflow workflow = getWorkflowById(id);
        workflowRepository.delete(workflow);
    }
}
