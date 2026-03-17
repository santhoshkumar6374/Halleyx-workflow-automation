package com.workflow.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long stepId;

    @Column(name = "condition_str", nullable = false)
    private String condition; // e.g. "amount > 100 && country == 'US' && priority == 'High'" or "DEFAULT"

    private Long nextStepId;

    @Column(nullable = false)
    private Integer priority;
}
