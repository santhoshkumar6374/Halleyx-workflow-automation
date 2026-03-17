package com.workflow.controller;

import com.workflow.entity.Step;
import com.workflow.service.StepService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // For React frontend
public class StepController {

    private final StepService stepService;

    @PostMapping("/workflows/{workflowId}/steps")
    public ResponseEntity<Step> createStep(@PathVariable Long workflowId, @RequestBody Step step) {
        return new ResponseEntity<>(stepService.createStep(workflowId, step), HttpStatus.CREATED);
    }

    @GetMapping("/workflows/{workflowId}/steps")
    public ResponseEntity<List<Step>> getStepsByWorkflowId(@PathVariable Long workflowId) {
        return ResponseEntity.ok(stepService.getStepsByWorkflowId(workflowId));
    }

    @PutMapping("/steps/{id}")
    public ResponseEntity<Step> updateStep(@PathVariable Long id, @RequestBody Step step) {
        return ResponseEntity.ok(stepService.updateStep(id, step));
    }

    @DeleteMapping("/steps/{id}")
    public ResponseEntity<Void> deleteStep(@PathVariable Long id) {
        stepService.deleteStep(id);
        return ResponseEntity.noContent().build();
    }
}
