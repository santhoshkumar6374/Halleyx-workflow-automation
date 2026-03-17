package com.workflow.engine;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.workflow.entity.*;
import com.workflow.exception.ResourceNotFoundException;
import com.workflow.repository.ExecutionRepository;
import com.workflow.repository.RuleRepository;
import com.workflow.repository.StepRepository;
import com.workflow.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowEngineService {

    private final WorkflowRepository workflowRepository;
    private final StepRepository stepRepository;
    private final RuleRepository ruleRepository;
    private final ExecutionRepository executionRepository;
    private final RuleEngine ruleEngine;
    private final ObjectMapper objectMapper;

    public Execution startExecution(Long workflowId, String inputData, String triggeredBy) {
        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found"));

        if (!workflow.getIsActive()) {
            throw new IllegalStateException("Workflow is not active");
        }

        Execution execution = new Execution();
        execution.setWorkflowId(workflow.getId());
        execution.setWorkflowVersion(workflow.getVersion());
        execution.setStatus(ExecutionStatus.PENDING);
        execution.setData(inputData);
        execution.setTriggeredBy(triggeredBy);
        execution.setLogs("[]");
        executionRepository.save(execution);

        // Start async logic or do synchronously for simplicity in this demo
        executeWorkflow(execution, workflow);

        return executionRepository.save(execution);
    }

    public Execution retryExecution(Long executionId) {
        Execution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found"));

        if (execution.getStatus() == ExecutionStatus.COMPLETED) {
            throw new IllegalStateException("Cannot retry a completed execution");
        }

        execution.setRetries(execution.getRetries() + 1);
        execution.setStatus(ExecutionStatus.IN_PROGRESS);
        executionRepository.save(execution);

        Workflow workflow = workflowRepository.findById(execution.getWorkflowId())
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found"));
        
        executeWorkflow(execution, workflow);

        return executionRepository.save(execution);
    }

    public Execution cancelExecution(Long executionId) {
        Execution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found"));
        
        if (execution.getStatus() == ExecutionStatus.COMPLETED || execution.getStatus() == ExecutionStatus.FAILED) {
            throw new IllegalStateException("Cannot cancel completed or failed execution");
        }

        execution.setStatus(ExecutionStatus.CANCELED);
        execution.setEndedAt(LocalDateTime.now());
        addLog(execution, "Execution canceled manually");
        return executionRepository.save(execution);
    }

    private void executeWorkflow(Execution execution, Workflow workflow) {
        execution.setStatus(ExecutionStatus.IN_PROGRESS);
        addLog(execution, "Workflow execution started.");

        Long currentStepId = execution.getCurrentStepId() != null ? execution.getCurrentStepId() : workflow.getStartStepId();

        if (currentStepId == null) {
            // Fallback for old workflows before StepService started tracking startStepId
            List<Step> steps = stepRepository.findByWorkflowIdOrderByStepOrderAsc(workflow.getId());
            if (!steps.isEmpty()) {
                currentStepId = steps.get(0).getId();
                workflow.setStartStepId(currentStepId);
                workflowRepository.save(workflow);
                addLog(execution, "Fallback: Found start step dynamically.");
            }
        }

        if (currentStepId == null) {
            execution.setStatus(ExecutionStatus.FAILED);
            addLog(execution, "Workflow has no start step configured.");
            execution.setEndedAt(LocalDateTime.now());
            return;
        }

        int stepsExecuted = 0;
        final int MAX_STEPS = 100; // Prevent infinite loops

        while (currentStepId != null && stepsExecuted < MAX_STEPS) {
            Optional<Step> stepOpt = stepRepository.findById(currentStepId);
            if (stepOpt.isEmpty()) {
                execution.setStatus(ExecutionStatus.FAILED);
                addLog(execution, "Step ID " + currentStepId + " not found.");
                break;
            }

            Step step = stepOpt.get();
            execution.setCurrentStepId(step.getId());
            addLog(execution, "Executing Step: " + step.getName() + " [" + step.getStepType() + "]");

            // Execute step logic based on step type
            boolean stepResult = executeStepLogic(step, execution);
            
            if (!stepResult) {
                execution.setStatus(ExecutionStatus.FAILED);
                addLog(execution, "Execution failed at step: " + step.getName());
                break;
            }

            // Evaluate Rules to find next step
            List<Rule> rules = ruleRepository.findByStepIdOrderByPriorityAsc(step.getId());
            
            if (rules.isEmpty()) {
                addLog(execution, "No rules defined for this step. Workflow completed natively.");
                execution.setStatus(ExecutionStatus.COMPLETED);
                currentStepId = null;
            } else {
                Optional<Rule> matchedRule = evaluateRules(rules, execution.getData());

                if (matchedRule.isPresent()) {
                    Long nextStepId = matchedRule.get().getNextStepId();
                    if (nextStepId == null) {
                        addLog(execution, "Reached end of workflow based on rule: " + matchedRule.get().getCondition());
                        execution.setStatus(ExecutionStatus.COMPLETED);
                        currentStepId = null;
                    } else {
                        addLog(execution, "Rule matched: " + matchedRule.get().getCondition() + ". Moving to next step ID: " + nextStepId);
                        currentStepId = nextStepId;
                    }
                } else {
                    addLog(execution, "No rule matched and no DEFAULT found. Completing workflow natively.");
                    execution.setStatus(ExecutionStatus.COMPLETED);
                    currentStepId = null;
                }
            }

            stepsExecuted++;
            executionRepository.save(execution);
        }

        if (stepsExecuted >= MAX_STEPS) {
            execution.setStatus(ExecutionStatus.FAILED);
            addLog(execution, "Max steps reached (" + MAX_STEPS + "). Potential infinite loop.");
        }

        if (execution.getStatus() == ExecutionStatus.IN_PROGRESS) {
            execution.setStatus(ExecutionStatus.COMPLETED);
        }

        execution.setEndedAt(LocalDateTime.now());
    }

    private boolean executeStepLogic(Step step, Execution execution) {
        // Here we simulate step execution
        switch (step.getStepType()) {
            case TASK:
                addLog(execution, "Task executed automatically.");
                return true;
            case APPROVAL:
                addLog(execution, "Waiting for approval (simulated auto-approve).");
                return true;
            case NOTIFICATION:
                addLog(execution, "Notification sent: " + step.getMetadata());
                return true;
            default:
                addLog(execution, "Unknown step type.");
                return false;
        }
    }

    private Optional<Rule> evaluateRules(List<Rule> rules, String jsonData) {
        for (Rule rule : rules) {
            if ("DEFAULT".equalsIgnoreCase(rule.getCondition().trim())) {
                return Optional.of(rule);
            }
            if (ruleEngine.evaluate(rule.getCondition(), jsonData)) {
                return Optional.of(rule);
            }
        }
        return Optional.empty();
    }

    private void addLog(Execution execution, String message) {
        try {
            List<String> logsList;
            if (execution.getLogs() == null || execution.getLogs().isBlank()) {
                logsList = new ArrayList<>();
            } else {
                logsList = objectMapper.readValue(execution.getLogs(), List.class);
            }
            logsList.add(LocalDateTime.now() + " : " + message);
            execution.setLogs(objectMapper.writeValueAsString(logsList));
            log.info("WorkflowExecution[{}] Log: {}", execution.getId(), message);
        } catch (JsonProcessingException e) {
            log.error("Failed to append log", e);
        }
    }
}
