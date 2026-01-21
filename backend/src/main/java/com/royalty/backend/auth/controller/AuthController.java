package com.royalty.backend.auth.controller;

import com.royalty.backend.auth.dto.AuthResponseDTO;
import com.royalty.backend.auth.dto.LoginRequestDTO;
import com.royalty.backend.auth.dto.SignupRequestDTO;
import com.royalty.backend.auth.dto.TokenResponseDTO;
import com.royalty.backend.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    /* =========================
       일반 로그인
       ========================= */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(
            @RequestBody LoginRequestDTO request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }

    /* =========================
       회원가입
       ========================= */
    @PostMapping("/signup")
    public ResponseEntity<AuthResponseDTO> signup(
            @RequestBody SignupRequestDTO request
    ) {
        return ResponseEntity.ok(authService.signup(request));
    }

    /* =========================
       토큰 재발급
       ========================= */
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponseDTO> refresh(
            HttpServletRequest request
    ) {
        String refreshToken = extractBearerToken(request);
        return ResponseEntity.ok(authService.refresh(refreshToken));
    }

    /* =========================
       로그아웃
       ========================= */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest request
    ) {
        String refreshToken = extractBearerToken(request);
        authService.logout(refreshToken);
        return ResponseEntity.ok().build();
    }

    /* =========================
       ✅ 카카오 로그인 (인가 코드 방식)
       ========================= */
    @PostMapping("/kakao/login")
    public ResponseEntity<AuthResponseDTO> kakaoLogin(
            @RequestParam("code") String code
    ) {
        return ResponseEntity.ok(authService.kakaoLogin(code));
    }

    /* =========================
       Bearer 토큰 공통 처리
       ========================= */
    private String extractBearerToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        return removeBearerPrefix(bearerToken);
    }

    private String removeBearerPrefix(String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Authorization 헤더가 없거나 올바르지 않습니다.");
        }
        return bearerToken.substring(7);
    }
}
