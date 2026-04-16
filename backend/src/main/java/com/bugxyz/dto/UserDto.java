package com.bugxyz.dto;

import com.bugxyz.entity.User;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserDto {
    private Long id;
    private String email;
    private String fullName;
    private String role;
    private String avatarUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public static UserDto from(User user) {
        return UserDto.builder()
                .id(user.getId()).email(user.getEmail()).fullName(user.getFullName())
                .role(user.getRole().name()).avatarUrl(user.getAvatarUrl())
                .isActive(user.getIsActive()).createdAt(user.getCreatedAt()).build();
    }
}
