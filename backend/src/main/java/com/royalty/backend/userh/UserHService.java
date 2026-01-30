package com.royalty.backend.userh;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.royalty.backend.auth.exception.AuthException;
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
     * - 기존 비밀번호 검증
     * - 새 비밀번호로 교체
     * - 모든 세션 로그아웃 처리
     */
    public void changePassword(Long userId, ChangePasswordRequestDTO dto) {

        String currentPassword =
                userHCommandMapper.findPasswordByUserId(userId);

        if (!passwordEncoder.matches(dto.getOldPassword(), currentPassword)) {
            throw new AuthException("INVALID_PASSWORD");
        }

        userHCommandMapper.updatePassword(
                userId,
                passwordEncoder.encode(dto.getNewPassword())
        );

        // 🔥 비밀번호 변경 시 전체 세션 로그아웃
        refreshTokenService.deleteByUserId(userId);
    }

    /**
     * 🗑 회원 탈퇴 (Hard Delete)
     * - 사용자 데이터 즉시 삭제
     * - 토큰 먼저 정리
     */
    public void withdraw(Long userId) {
        refreshTokenService.deleteByUserId(userId);
        userHCommandMapper.deleteByUserId(userId);
    }
}
