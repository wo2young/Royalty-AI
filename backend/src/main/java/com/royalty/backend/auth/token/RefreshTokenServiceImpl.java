package com.royalty.backend.auth.token;

import com.royalty.backend.auth.exception.AuthException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenMapper refreshTokenMapper;

    /* =========================
       저장 (로그인 / 회원가입)
       ========================= */
    @Override
    public void save(Long userId, String refreshToken) {
        refreshTokenMapper.deleteByUserId(userId);
        refreshTokenMapper.save(userId, refreshToken);
    }

    /* =========================
       유효성 검증
       ========================= */
    @Override
    public void validate(String refreshToken) {
        if (refreshTokenMapper.findUserIdByToken(refreshToken) == null) {
            throw new AuthException("유효하지 않은 Refresh Token입니다.");
        }
    }

    /* =========================
       userId 조회
       ========================= */
    @Override
    public Long getUserId(String refreshToken) {
        Long userId = refreshTokenMapper.findUserIdByToken(refreshToken);
        if (userId == null) {
            throw new AuthException("Refresh Token이 만료되었거나 존재하지 않습니다.");
        }
        return userId;
    }

    /* =========================
       토큰 재발급 (Rotate)
       ========================= */
    @Override
    public void rotate(Long userId, String newRefreshToken) {
        refreshTokenMapper.deleteByUserId(userId);
        refreshTokenMapper.save(userId, newRefreshToken);
    }

    /* =========================
       로그아웃
       ========================= */
    @Override
    public void delete(String refreshToken) {
        refreshTokenMapper.deleteByToken(refreshToken);
    }
}
