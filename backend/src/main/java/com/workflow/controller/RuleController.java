package com.workflow.controller;

import com.workflow.entity.Rule;
import com.workflow.service.RuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RuleController {

    private final RuleService ruleService;

    @PostMapping("/steps/{stepId}/rules")
    public ResponseEntity<Rule> createRule(@PathVariable Long stepId, @RequestBody Rule rule) {
        return new ResponseEntity<>(ruleService.createRule(stepId, rule), HttpStatus.CREATED);
    }

    @GetMapping("/steps/{stepId}/rules")
    public ResponseEntity<List<Rule>> getRulesByStepId(@PathVariable Long stepId) {
        return ResponseEntity.ok(ruleService.getRulesByStepId(stepId));
    }

    @PutMapping("/rules/{id}")
    public ResponseEntity<Rule> updateRule(@PathVariable Long id, @RequestBody Rule rule) {
        return ResponseEntity.ok(ruleService.updateRule(id, rule));
    }

    @DeleteMapping("/rules/{id}")
    public ResponseEntity<Void> deleteRule(@PathVariable Long id) {
        ruleService.deleteRule(id);
        return ResponseEntity.noContent().build();
    }
}
