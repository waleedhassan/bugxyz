package com.bugxyz.dto;

import com.bugxyz.entity.Bug;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BugDtos {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class BugDto {
        private Long id;
        private Long projectId;
        private String projectName;
        private String projectKey;
        private Long reporterId;
        private String reporterName;
        private Long assigneeId;
        private String assigneeName;
        private String title;
        private String description;
        private String status;
        private String severity;
        private String priority;
        private String bugType;
        private String[] tags;
        private String stepsToReproduce;
        private String expectedBehavior;
        private String actualBehavior;
        private String affectedVersion;
        private String fixedVersion;
        private BigDecimal reproducibilityScore;
        private String predictedSeverity;
        private BigDecimal predictedFixHours;
        private Boolean isStale;
        private LocalDateTime staleSince;
        private Boolean technicalDebt;
        private String debtCategory;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime closedAt;

        public static BugDto from(Bug b) {
            return BugDto.builder()
                    .id(b.getId())
                    .projectId(b.getProject().getId())
                    .projectName(b.getProject().getName())
                    .projectKey(b.getProject().getKey())
                    .reporterId(b.getReporter().getId())
                    .reporterName(b.getReporter().getFullName())
                    .assigneeId(b.getAssignee() != null ? b.getAssignee().getId() : null)
                    .assigneeName(b.getAssignee() != null ? b.getAssignee().getFullName() : null)
                    .title(b.getTitle()).description(b.getDescription())
                    .status(b.getStatus().name()).severity(b.getSeverity().name())
                    .priority(b.getPriority().name()).bugType(b.getBugType().name())
                    .tags(b.getTags()).stepsToReproduce(b.getStepsToReproduce())
                    .expectedBehavior(b.getExpectedBehavior()).actualBehavior(b.getActualBehavior())
                    .affectedVersion(b.getAffectedVersion()).fixedVersion(b.getFixedVersion())
                    .reproducibilityScore(b.getReproducibilityScore())
                    .predictedSeverity(b.getPredictedSeverity())
                    .predictedFixHours(b.getPredictedFixHours())
                    .isStale(b.getIsStale()).staleSince(b.getStaleSince())
                    .technicalDebt(b.getTechnicalDebt()).debtCategory(b.getDebtCategory())
                    .createdAt(b.getCreatedAt()).updatedAt(b.getUpdatedAt()).closedAt(b.getClosedAt())
                    .build();
        }
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CreateBugRequest {
        @NotNull private Long projectId;
        @NotBlank @Size(max = 500) private String title;
        private String description;
        private String severity;
        private String priority;
        private String bugType;
        private Long assigneeId;
        private String[] tags;
        private String stepsToReproduce;
        private String expectedBehavior;
        private String actualBehavior;
        private String affectedVersion;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class UpdateBugRequest {
        private String title;
        private String description;
        private String severity;
        private String priority;
        private String bugType;
        private Long assigneeId;
        private String[] tags;
        private String stepsToReproduce;
        private String expectedBehavior;
        private String actualBehavior;
        private String affectedVersion;
        private String fixedVersion;
        private Boolean technicalDebt;
        private String debtCategory;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class BugStatusUpdateRequest {
        @NotBlank private String status;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class AssignBugRequest {
        private Long assigneeId;
    }
}
