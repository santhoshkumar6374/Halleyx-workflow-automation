package com.workflow.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "executions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Execution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long workflowId;

    @Column(nullable = false)
    private Integer workflowVersion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExecutionStatus status;

    @Column(columnDefinition = "TEXT")
    private String data; // JSON

    @Column(columnDefinition = "TEXT")
    private String logs; // JSON

    private Long currentStepId;

    private Integer retries = 0;

    private String triggeredBy;

    private LocalDateTime startedAt;

    private LocalDateTime endedAt;

    @PrePersist
    public void prePersist() {
        startedAt = LocalDateTime.now();
        if (status == null) {
            status = ExecutionStatus.PENDING;
        }
    }
}
