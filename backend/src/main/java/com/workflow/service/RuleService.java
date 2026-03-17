package com.workflow.service;

import com.workflow.entity.Rule;
import com.workflow.exception.ResourceNotFoundException;
import com.workflow.repository.RuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RuleService {

    private final RuleRepository ruleRepository;

    public List<Rule> getRulesByStepId(Long stepId) {
        return ruleRepository.findByStepIdOrderByPriorityAsc(stepId);
    }

    public Rule getRuleById(Long id) {
        return ruleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found with id: " + id));
    }

    public Rule createRule(Long stepId, Rule rule) {
        rule.setStepId(stepId);
        return ruleRepository.save(rule);
    }

    public Rule updateRule(Long id, Rule ruleDetails) {
        Rule rule = getRuleById(id);
        rule.setCondition(ruleDetails.getCondition());
        rule.setNextStepId(ruleDetails.getNextStepId());
        rule.setPriority(ruleDetails.getPriority());
        return ruleRepository.save(rule);
    }

    public void deleteRule(Long id) {
        Rule rule = getRuleById(id);
        ruleRepository.delete(rule);
    }
}
