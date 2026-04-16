package com.bugxyz.dto;

import com.bugxyz.entity.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class OtherDtos {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AttachmentDto {
        private Long id; private Long bugId; private Long uploaderId; private String uploaderName;
        private String fileName; private String filePath; private Long fileSize; private String contentType;
        private LocalDateTime createdAt;
        public static AttachmentDto from(Attachment a) {
            return AttachmentDto.builder().id(a.getId()).bugId(a.getBug().getId())
                    .uploaderId(a.getUploader().getId()).uploaderName(a.getUploader().getFullName())
                    .fileName(a.getFileName()).filePath(a.getFilePath())
                    .fileSize(a.getFileSize()).contentType(a.getContentType())
                    .createdAt(a.getCreatedAt()).build();
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ActivityLogDto {
        private Long id; private Long bugId; private Long projectId; private Long userId;
        private String userName; private String action; private String fieldName;
        private String oldValue; private String newValue; private LocalDateTime createdAt;
        public static ActivityLogDto from(ActivityLog a) {
            return ActivityLogDto.builder().id(a.getId())
                    .bugId(a.getBug() != null ? a.getBug().getId() : null)
                    .projectId(a.getProject().getId()).userId(a.getUser().getId())
                    .userName(a.getUser().getFullName()).action(a.getAction().name())
                    .fieldName(a.getFieldName()).oldValue(a.getOldValue()).newValue(a.getNewValue())
                    .createdAt(a.getCreatedAt()).build();
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class BugRelationDto {
        private Long id; private Long sourceBugId; private String sourceBugTitle;
        private Long targetBugId; private String targetBugTitle; private String relationType;
        private String createdByName; private LocalDateTime createdAt;
        public static BugRelationDto from(BugRelation r) {
            return BugRelationDto.builder().id(r.getId())
                    .sourceBugId(r.getSourceBug().getId()).sourceBugTitle(r.getSourceBug().getTitle())
                    .targetBugId(r.getTargetBug().getId()).targetBugTitle(r.getTargetBug().getTitle())
                    .relationType(r.getRelationType().name())
                    .createdByName(r.getCreatedBy().getFullName()).createdAt(r.getCreatedAt()).build();
        }
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CreateBugRelationRequest {
        @NotNull private Long targetBugId;
        @NotBlank private String relationType;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class EnvironmentSnapshotDto {
        private Long id; private Long bugId; private String os; private String osVersion;
        private String browser; private String browserVersion; private String deviceType;
        private String screenResolution; private String appVersion;
        private Map<String, Object> additionalInfo; private LocalDateTime createdAt;
        public static EnvironmentSnapshotDto from(EnvironmentSnapshot e) {
            return EnvironmentSnapshotDto.builder().id(e.getId()).bugId(e.getBug().getId())
                    .os(e.getOs()).osVersion(e.getOsVersion()).browser(e.getBrowser())
                    .browserVersion(e.getBrowserVersion()).deviceType(e.getDeviceType())
                    .screenResolution(e.getScreenResolution()).appVersion(e.getAppVersion())
                    .additionalInfo(e.getAdditionalInfo()).createdAt(e.getCreatedAt()).build();
        }
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CreateEnvironmentSnapshotRequest {
        private String os; private String osVersion; private String browser; private String browserVersion;
        private String deviceType; private String screenResolution; private String appVersion;
        private Map<String, Object> additionalInfo;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class BugConfirmationDto {
        private Long id; private Long bugId; private Long userId; private String userName;
        private Boolean confirmed; private Long environmentId; private String notes;
        private LocalDateTime createdAt;
        public static BugConfirmationDto from(BugConfirmation c) {
            return BugConfirmationDto.builder().id(c.getId()).bugId(c.getBug().getId())
                    .userId(c.getUser().getId()).userName(c.getUser().getFullName())
                    .confirmed(c.getConfirmed())
                    .environmentId(c.getEnvironment() != null ? c.getEnvironment().getId() : null)
                    .notes(c.getNotes()).createdAt(c.getCreatedAt()).build();
        }
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CreateBugConfirmationRequest {
        @NotNull private Boolean confirmed;
        private Long environmentId;
        private String notes;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PageResponse<T> {
        private List<T> content;
        private int page; private int size; private long totalElements; private int totalPages; private boolean last;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DashboardDto {
        private long totalBugs; private long openBugs; private long resolvedToday; private long myAssignedBugs;
        private Map<String, Long> bugsByStatus; private Map<String, Long> bugsBySeverity;
        private Map<String, Long> bugsByProject;
        private List<BugDtos.BugDto> recentBugs; private List<ActivityLogDto> recentActivity;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MttfData {
        private String category; private double averageHours; private int sampleSize;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ThroughputData {
        private String period; private long resolved; private long opened;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DeveloperStatsDto {
        private Long userId; private String userName; private long openBugs;
        private long resolvedBugs; private double avgFixTimeHours; private long reopenedBugs;
    }
}
