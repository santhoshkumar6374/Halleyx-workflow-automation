package com.workflow.controller;

import com.workflow.entity.Workflow;
import com.workflow.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workflows")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // For React frontend
public class WorkflowController {

    private final WorkflowService workflowService;

    @PostMapping
    public ResponseEntity<Workflow> createWorkflow(@RequestBody Workflow workflow) {
        return new ResponseEntity<>(workflowService.createWorkflow(workflow), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Workflow>> getAllWorkflows() {
        return ResponseEntity.ok(workflowService.getAllWorkflows());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Workflow> getWorkflowById(@PathVariable Long id) {
        return ResponseEntity.ok(workflowService.getWorkflowById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Workflow> updateWorkflow(@PathVariable Long id, @RequestBody Workflow workflow) {
        return ResponseEntity.ok(workflowService.updateWorkflow(id, workflow));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable Long id) {
        workflowService.deleteWorkflow(id);
        return ResponseEntity.noContent().build();
    }
}
