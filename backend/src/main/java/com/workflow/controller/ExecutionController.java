package com.workflow.controller;

import com.workflow.entity.Execution;
import com.workflow.engine.WorkflowEngineService;
import com.workflow.service.ExecutionService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExecutionController {

    private final WorkflowEngineService workflowEngineService;
    private final ExecutionService executionService;

    @PostMapping("/workflows/{workflowId}/execute")
    public ResponseEntity<Execution> executeWorkflow(@PathVariable Long workflowId, @RequestBody ExecutionRequest request) {
        Execution execution = workflowEngineService.startExecution(workflowId, request.getData(), request.getTriggeredBy());
        return new ResponseEntity<>(execution, HttpStatus.CREATED);
    }

    @GetMapping("/workflows/{workflowId}/executions")
    public ResponseEntity<List<Execution>> getExecutionsByWorkflowId(@PathVariable Long workflowId) {
        return ResponseEntity.ok(executionService.getExecutionsByWorkflowId(workflowId));
    }

    @GetMapping("/executions/{id}")
    public ResponseEntity<Execution> getExecutionById(@PathVariable Long id) {
        return ResponseEntity.ok(executionService.getExecutionById(id));
    }

    @GetMapping("/executions")
    public ResponseEntity<List<Execution>> getAllExecutions() {
        return ResponseEntity.ok(executionService.getAllExecutions());
    }

    @PostMapping("/executions/{id}/cancel")
    public ResponseEntity<Execution> cancelExecution(@PathVariable Long id) {
        return ResponseEntity.ok(workflowEngineService.cancelExecution(id));
    }

    @PostMapping("/executions/{id}/retry")
    public ResponseEntity<Execution> retryExecution(@PathVariable Long id) {
        return ResponseEntity.ok(workflowEngineService.retryExecution(id));
    }

    @Data
    public static class ExecutionRequest {
        private String data; // JSON string
        private String triggeredBy;
    }
}
