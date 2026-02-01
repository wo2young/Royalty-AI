package com.royalty.backend.userh;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.royalty.backend.auth.token.RefreshTokenService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserHService {

    private final UserHCommandMapper userHCommandMapper;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;

    /**
     * 🔐 비밀번호 변경
     * - 새 비밀번호로 즉시 교체
     * - 로그아웃 ❌ (세션 유지)
     */
    public void changePassword(Long userId, ChangePasswordRequestDTO dto) {

        String encodedNewPassword =
                passwordEncoder.encode(dto.getNewPassword());

        userHCommandMapper.updatePassword(userId, encodedNewPassword);
    }

    /**
     * 🗑 회원 탈퇴 (Hard Delete)
     * - 토큰 삭제 → 로그아웃 처리
     * - 사용자 데이터 삭제
     */
    public void withdraw(Long userId) {

        // 1️⃣ 로그아웃 처리 (Refresh Token 무효화)
        refreshTokenService.deleteByUserId(userId);

        // 2️⃣ 사용자 삭제
        userHCommandMapper.deleteByUserId(userId);
    }
}
