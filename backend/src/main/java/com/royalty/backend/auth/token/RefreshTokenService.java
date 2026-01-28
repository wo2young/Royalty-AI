package com.royalty.backend.auth.token;

public interface RefreshTokenService {

    /* 로그인 / 회원가입 */
    void save(Long userId, String refreshToken);

    /* refresh token 유효성 검증 */
    void validate(String refreshToken);

    /* refresh token → userId 조회 */
    Long getUserId(String refreshToken);

    /* 토큰 재발급 (Rotate) */
    void rotate(Long userId, String newRefreshToken);

    /* 로그아웃 */
    void delete(String refreshToken);
}
