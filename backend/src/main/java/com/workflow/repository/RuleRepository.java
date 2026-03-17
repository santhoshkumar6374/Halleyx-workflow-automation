package com.workflow.repository;

import com.workflow.entity.Rule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RuleRepository extends JpaRepository<Rule, Long> {
    List<Rule> findByStepIdOrderByPriorityAsc(Long stepId);
}
