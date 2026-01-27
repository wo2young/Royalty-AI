package com.royalty.backend.auth.dto;

import com.royalty.backend.auth.domain.User;
import lombok.Getter;

@Getter
public class AuthResponseDTO {

    // 🔐 JWT
    private final String accessToken;
    private final String refreshToken;

    // 👤 사용자 정보 (프론트 호환용)
    private final UserResponse user;

    /* =========================
       ✅ AuthServiceImpl에서 사용하는 생성자
       ========================= */
    public AuthResponseDTO(
            String accessToken,
            String refreshToken,
            Long userId,
            String role
    ) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = new UserResponse(
                userId,
                null,
                null,
                role,
                null
        );
    }

    /* =========================
       ✅ User 객체 기반 생성자
       ========================= */
    public AuthResponseDTO(
            String accessToken,
            String refreshToken,
            User user
    ) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getProvider()
        );
    }

    /* =========================
       👤 내부 User DTO (프론트 계약)
       ========================= */
    @Getter
    public static class UserResponse {
        private final Long id;
        private final String username;
        private final String email;
        private final String role;
        private final String provider;

        public UserResponse(
                Long id,
                String username,
                String email,
                String role,
                String provider
        ) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.role = role;
            this.provider = provider;
        }
    }
}
