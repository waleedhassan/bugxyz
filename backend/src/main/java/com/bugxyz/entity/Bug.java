package com.bugxyz.entity;

import com.bugxyz.enums.BugPriority;
import com.bugxyz.enums.BugSeverity;
import com.bugxyz.enums.BugStatus;
import com.bugxyz.enums.BugType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bugs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bug {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BugStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BugSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BugPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(name = "bug_type", nullable = false)
    private BugType bugType;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private String[] tags;

    @Column(name = "steps_to_reproduce", columnDefinition = "TEXT")
    private String stepsToReproduce;

    @Column(name = "expected_behavior", columnDefinition = "TEXT")
    private String expectedBehavior;

    @Column(name = "actual_behavior", columnDefinition = "TEXT")
    private String actualBehavior;

    @Column(name = "affected_version", length = 50)
    private String affectedVersion;

    @Column(name = "fixed_version", length = 50)
    private String fixedVersion;

    @Column(name = "reproducibility_score", precision = 5, scale = 2)
    private BigDecimal reproducibilityScore;

    @Column(name = "predicted_severity", length = 20)
    private String predictedSeverity;

    @Column(name = "predicted_fix_hours", precision = 6, scale = 2)
    private BigDecimal predictedFixHours;

    @Column(name = "is_stale", nullable = false)
    private Boolean isStale;

    @Column(name = "stale_since")
    private LocalDateTime staleSince;

    @Column(name = "technical_debt", nullable = false)
    private Boolean technicalDebt;

    @Column(name = "debt_category", length = 50)
    private String debtCategory;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;
}
