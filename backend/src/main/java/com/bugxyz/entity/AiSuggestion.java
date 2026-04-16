package com.bugxyz.entity;

import com.bugxyz.enums.SuggestionType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "ai_suggestions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiSuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bug_id", nullable = false)
    private Bug bug;

    @Enumerated(EnumType.STRING)
    @Column(name = "suggestion_type", nullable = false, length = 50)
    private SuggestionType suggestionType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> suggestion;

    @Column(precision = 5, scale = 2)
    private BigDecimal confidence;

    @Column(name = "is_accepted")
    private Boolean isAccepted;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
