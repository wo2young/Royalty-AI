package com.royalty.backend.auth.controller;

import com.royalty.backend.auth.dto.AuthResponseDTO;
import com.royalty.backend.auth.dto.LoginRequestDTO;
import com.royalty.backend.auth.dto.SignupRequestDTO;
import com.royalty.backend.auth.dto.TokenResponseDTO;
import com.royalty.backend.auth.exception.AuthException;
import com.royalty.backend.auth.service.AuthService;
import com.royalty.backend.config.Aes256Util;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.royalty.backend.auth.kakao.KakaoLoginRequestDTO;
import com.royalty.backend.auth.dto.FindUsernameRequestDTO;
import com.royalty.backend.auth.mail.MailService;
import com.royalty.backend.auth.mapper.UserMapper;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final MailService mailService;
    private final UserMapper userMapper;


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
    회원가입 이메일 인증번호 발송
    ========================= */
    @PostMapping("/email/send")
    public ResponseEntity<Void> sendSignupAuthCode(
            @RequestBody SignupRequestDTO request
    ) {
        String email = request.getEmail();

        // 🔐 이메일 암호화 (signup과 동일)
        String encryptedEmail = Aes256Util.encrypt(email);

        // ❌ 이미 가입된 이메일이면 차단
        if (userMapper.existsByEmail(encryptedEmail) > 0) {
            throw new AuthException("이미 가입된 이메일입니다.");
        }

        // ✅ 신규 이메일만 인증번호 발송
        mailService.sendSignupAuthCode(email);
        return ResponseEntity.ok().build();
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
            @RequestBody KakaoLoginRequestDTO request
    ) {
        return ResponseEntity.ok(authService.kakaoLogin(request.getCode()));
    }
    
    
    /* =========================
    아이디 찾기
    ========================= */
	 @PostMapping("/find-username")
	 public ResponseEntity<Void> findUsername(
	         @RequestBody FindUsernameRequestDTO request
	 ) {
	     authService.findUsernameByEmail(request.getEmail());
	     return ResponseEntity.ok().build();
	 }
	 
	 /* =========================
	   비밀번호 재설정 요청 (메일 발송)
	   ========================= */
	 /* =========================
	   비밀번호 재설정 요청 (메일 발송)
	   ========================= */
	 @PostMapping("/password/reset-request")
	 public ResponseEntity<Void> requestPasswordReset(
	         @RequestBody SignupRequestDTO request
	 ) {
	     authService.requestPasswordReset(request);
	     return ResponseEntity.ok().build();
	 }

	
	/* =========================
	   비밀번호 재설정 (JWT)
	   ========================= */
	@PostMapping("/password/reset")
	public ResponseEntity<Void> resetPassword(
	        @RequestParam String token,
	        @RequestParam String newPassword
	) {
	    authService.resetPassword(token, newPassword);
	    return ResponseEntity.ok().build();
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
