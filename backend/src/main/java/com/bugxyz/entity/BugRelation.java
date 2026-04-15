package com.bugxyz.entity;

import com.bugxyz.enums.RelationType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "bug_relations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BugRelation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_bug_id", nullable = false)
    private Bug sourceBug;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_bug_id", nullable = false)
    private Bug targetBug;

    @Enumerated(EnumType.STRING)
    @Column(name = "relation_type", nullable = false)
    private RelationType relationType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
