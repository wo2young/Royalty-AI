package com.royalty.backend.auth.dto;

import com.royalty.backend.auth.domain.User;
import lombok.Getter;

@Getter
public class AuthResponseDTO {

    // 🔐 JWT
    private final String accessToken;
    private final String refreshToken;

    // 👤 사용자 정보
    private final Long userId;
    private final String role;

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
        this.userId = userId;
        this.role = role;
    }

    /* =========================
       (선택) User 객체 기반 생성자
       ========================= */
    public AuthResponseDTO(
            String accessToken,
            String refreshToken,
            User user
    ) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.userId = user.getId();
        this.role = user.getRole().name();
    }
}
