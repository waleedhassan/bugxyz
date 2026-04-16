package com.bugxyz.dto;

import com.bugxyz.entity.Comment;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;

public class CommentDtos {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CommentDto {
        private Long id;
        private Long bugId;
        private Long authorId;
        private String authorName;
        private String authorAvatarUrl;
        private String content;
        private Boolean isInternal;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static CommentDto from(Comment c) {
            return CommentDto.builder()
                    .id(c.getId()).bugId(c.getBug().getId())
                    .authorId(c.getAuthor().getId()).authorName(c.getAuthor().getFullName())
                    .authorAvatarUrl(c.getAuthor().getAvatarUrl())
                    .content(c.getContent()).isInternal(c.getIsInternal())
                    .createdAt(c.getCreatedAt()).updatedAt(c.getUpdatedAt()).build();
        }
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CreateCommentRequest {
        @NotBlank private String content;
        private Boolean isInternal;
    }
}
