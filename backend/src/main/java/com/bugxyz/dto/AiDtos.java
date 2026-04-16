package com.bugxyz.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;

public class AiDtos {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class DuplicateDetectionRequest {
        @NotBlank private String title;
        private String description;
        private Long projectId;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DuplicateDetectionResponse {
        private Long bugId; private String bugTitle; private double similarityScore; private String status;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class SeverityPredictionRequest {
        @NotBlank private String title;
        private String description;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SeverityPredictionResponse {
        private String predictedSeverity; private String predictedPriority;
        private double confidence; private List<String> matchedKeywords;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class FixTimePredictionResponse {
        private double predictedHours; private double confidence; private int sampleSize; private String basedOn;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AssigneeSuggestionResponse {
        private Long userId; private String userName; private double score;
        private int currentOpenBugs; private int resolvedInProject; private double avgFixTimeHours;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class NaturalLanguageParseRequest {
        @NotBlank private String text;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class NaturalLanguageParseResponse {
        private String title; private String description; private String severity; private String priority;
        private String bugType; private String[] tags; private String os; private String browser;
        private String stepsToReproduce;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ReleaseNotesResponse {
        private String projectName; private String version; private String generatedAt;
        private String markdownContent; private List<BugEntry> bugs;

        @Data @Builder @NoArgsConstructor @AllArgsConstructor
        public static class BugEntry {
            private Long bugId; private String title; private String severity; private String bugType;
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class FixImpactResponse {
        private int affectedBugsCount; private String highestSeverityInChain;
        private double regressionRiskPercent; private List<Long> blockedBugIds;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TechDebtResponse {
        private String module; private int recurringBugCount; private int totalBugs;
        private double reopenRate; private String debtCategory;
    }
}
