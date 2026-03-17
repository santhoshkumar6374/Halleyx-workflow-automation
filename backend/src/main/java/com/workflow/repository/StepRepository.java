package com.workflow.repository;

import com.workflow.entity.Step;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StepRepository extends JpaRepository<Step, Long> {
    List<Step> findByWorkflowIdOrderByStepOrderAsc(Long workflowId);
}
