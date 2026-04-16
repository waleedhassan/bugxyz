package com.bugxyz.dto;

import jakarta.validation.constraints.*;
import lombok.*;

public class AuthDtos {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank private String email;
        @NotBlank private String password;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank @Email private String email;
        @NotBlank @Size(min = 6) private String password;
        @NotBlank private String fullName;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private UserDto user;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class UpdateUserRequest {
        private String fullName;
        private String avatarUrl;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ChangeRoleRequest {
        @NotBlank private String role;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RefreshRequest {
        @NotBlank private String refreshToken;
    }
}
