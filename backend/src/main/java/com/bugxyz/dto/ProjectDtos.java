package com.bugxyz.dto;

import com.bugxyz.entity.Project;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

public class ProjectDtos {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProjectDto {
        private Long id;
        private String name;
        private String key;
        private String description;
        private String ownerName;
        private Long ownerId;
        private Boolean isArchived;
        private int memberCount;
        private long bugCount;
        private LocalDateTime createdAt;

        public static ProjectDto from(Project p, int memberCount, long bugCount) {
            return ProjectDto.builder()
                    .id(p.getId()).name(p.getName()).key(p.getKey())
                    .description(p.getDescription())
                    .ownerName(p.getOwner().getFullName()).ownerId(p.getOwner().getId())
                    .isArchived(p.getIsArchived()).memberCount(memberCount).bugCount(bugCount)
                    .createdAt(p.getCreatedAt()).build();
        }
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CreateProjectRequest {
        @NotBlank private String name;
        @NotBlank @Size(max = 10) private String key;
        private String description;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class UpdateProjectRequest {
        private String name;
        private String description;
        private Boolean isArchived;
    }
}
