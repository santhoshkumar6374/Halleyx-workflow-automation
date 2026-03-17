package com.workflow.service;

import com.workflow.entity.Execution;
import com.workflow.exception.ResourceNotFoundException;
import com.workflow.repository.ExecutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExecutionService {

    private final ExecutionRepository executionRepository;

    public List<Execution> getAllExecutions() {
        return executionRepository.findAll();
    }

    public List<Execution> getExecutionsByWorkflowId(Long workflowId) {
        return executionRepository.findByWorkflowIdOrderByStartedAtDesc(workflowId);
    }

    public Execution getExecutionById(Long id) {
        return executionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found with id: " + id));
    }
}
