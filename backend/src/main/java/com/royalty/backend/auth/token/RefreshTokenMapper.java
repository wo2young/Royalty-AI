package com.royalty.backend.auth.token;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface RefreshTokenMapper {

    /* =========================
       저장
       ========================= */
    void save(
            @Param("userId") Long userId,
            @Param("refreshToken") String refreshToken
    );

    /* =========================
       토큰 → userId 조회
       ========================= */
    Long findUserIdByToken(
            @Param("refreshToken") String refreshToken
    );

    /* =========================
       userId 기준 삭제
       ========================= */
    void deleteByUserId(
            @Param("userId") Long userId
    );

    /* =========================
       refreshToken 기준 삭제 (로그아웃)
       ========================= */
    void deleteByToken(
            @Param("refreshToken") String refreshToken
    );
}
