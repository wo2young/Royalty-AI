package com.royalty.backend.auth.service;

import com.royalty.backend.auth.domain.Role;
import com.royalty.backend.auth.domain.User;
import com.royalty.backend.auth.dto.AuthResponseDTO;
import com.royalty.backend.auth.dto.LoginRequestDTO;
import com.royalty.backend.auth.dto.SignupRequestDTO;
import com.royalty.backend.auth.dto.TokenResponseDTO;
import com.royalty.backend.auth.exception.AuthException;
import com.royalty.backend.auth.kakao.KakaoOAuthService;
import com.royalty.backend.auth.kakao.KakaoUserInfo;
import com.royalty.backend.auth.mail.MailService;
import com.royalty.backend.auth.mapper.UserMapper;
import com.royalty.backend.auth.token.RefreshTokenService;
import com.royalty.backend.config.Aes256Util;
import com.royalty.backend.config.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RefreshTokenService refreshTokenService;
    private final KakaoOAuthService kakaoOAuthService;
    private final MailService mailService;

    /* =========================
       일반 로그인
       ========================= */
    @Override
    public AuthResponseDTO login(LoginRequestDTO request) {

        User user = userMapper.findByUsername(request.getUsername())
                .orElseThrow(() -> new AuthException("존재하지 않는 사용자입니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthException("비밀번호가 올바르지 않습니다.");
        }

        return issueTokens(user);
    }

    /* =========================
       회원가입
       ========================= */
    @Override
    public AuthResponseDTO signup(SignupRequestDTO request) {

        // 1️⃣ 아이디 중복 체크 (아이디는 암호화 ❌)
        if (userMapper.existsByUsername(request.getUsername()) > 0) {
            throw new AuthException("이미 사용 중인 아이디입니다.");
        }

        // 2️⃣ 이메일 암호화
        String encryptedEmail = Aes256Util.encrypt(request.getEmail());

        // 3️⃣ 이메일 중복 체크 (암호화 기준)
        if (userMapper.existsByEmail(encryptedEmail) > 0) {
            throw new AuthException("이미 가입된 이메일입니다.");
        }

        // 4️⃣ 사용자 생성
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(encryptedEmail) // 🔐 암호화된 이메일 저장
                .role(Role.ROLE_USER)
                .provider("LOCAL")
                .build();

        // 5️⃣ 저장
        userMapper.save(user);

        // 6️⃣ 토큰 발급
        return issueTokens(user);
    }

    /* =========================
       아이디 찾기
       ========================= */
    @Override
    public void findUsernameByEmail(String email) {

        // 🔐 반드시 signup과 동일한 방식으로 암호화
        String encryptedEmail = Aes256Util.encrypt(email);

        List<User> users = userMapper.findAllByEmail(encryptedEmail);

        if (users.isEmpty()) {
            throw new AuthException("등록된 이메일이 없습니다.");
        }

        if (users.size() > 1) {
            throw new AuthException("중복된 이메일이 존재합니다.");
        }

        User user = users.get(0);

        // 📮 메일 전송은 평문 이메일
        mailService.sendUsernameMail(email, user.getUsername());
    }
    /* =========================
    비밀번호 찾기 요청 (JWT)
    ========================= */
 @Override
 public void requestPasswordReset(String email) {

     // 1️⃣ 이메일 암호화 (signup과 동일)
     String encryptedEmail = Aes256Util.encrypt(email);

     User user = userMapper.findByEmail(encryptedEmail)
             .orElseThrow(() -> new AuthException("등록된 이메일이 없습니다."));

     // 2️⃣ 비밀번호 재설정 전용 JWT 생성
     String resetToken =
             jwtProvider.createPasswordResetToken(user);

     // 3️⃣ 프론트 비밀번호 재설정 페이지 링크
     String resetLink =
             "http://localhost:5173/reset-password?token=" + resetToken;

     // 4️⃣ 메일 전송 (평문 이메일)
     mailService.sendPasswordResetMail(email, resetLink);
 }

 /* =========================
 비밀번호 재설정 (JWT)
 ========================= */
 @Override
 public void resetPassword(String token, String newPassword) {

     // 1️⃣ JWT 검증 + userId 추출
     Long userId = jwtProvider.validatePasswordResetToken(token);

     // 2️⃣ 사용자 존재 여부 확인
     userMapper.findById(userId)
             .orElseThrow(() -> new AuthException("사용자를 찾을 수 없습니다."));

     // 3️⃣ 새 비밀번호 암호화
     String encodedPassword = passwordEncoder.encode(newPassword);

     // 4️⃣ 비밀번호 업데이트용 User 객체
     User updateUser = User.builder()
             .id(userId)
             .password(encodedPassword)
             .build();

     userMapper.updatePassword(updateUser);
 }

 
 
    
    
    /* =========================
       토큰 재발급
       ========================= */
    @Override
    public TokenResponseDTO refresh(String refreshToken) {

        refreshTokenService.validate(refreshToken);

        Long userId = refreshTokenService.getUserId(refreshToken);
        User user = userMapper.findById(userId)
                .orElseThrow(() -> new AuthException("사용자를 찾을 수 없습니다."));

        String newAccessToken = jwtProvider.createAccessToken(user);
        String newRefreshToken = jwtProvider.createRefreshToken(user);

        refreshTokenService.rotate(userId, newRefreshToken);

        return new TokenResponseDTO(newAccessToken, newRefreshToken);
    }

    /* =========================
       로그아웃
       ========================= */
    @Override
    public void logout(String refreshToken) {
        refreshTokenService.validate(refreshToken);
        refreshTokenService.delete(refreshToken);
    }

    /* =========================
       카카오 로그인
       ========================= */
    @Override
    public AuthResponseDTO kakaoLogin(String code) {

        String accessToken = kakaoOAuthService.getAccessToken(code);
        KakaoUserInfo kakaoUser = kakaoOAuthService.getUserInfo(accessToken);

        User user = userMapper
                .findByProviderId("KAKAO", String.valueOf(kakaoUser.getId()))
                .orElseGet(() -> registerKakaoUser(kakaoUser));

        return issueTokens(user);
    }

    /* =========================
       공통 토큰 발급
       ========================= */
    private AuthResponseDTO issueTokens(User user) {

        String accessToken = jwtProvider.createAccessToken(user);
        String refreshToken = jwtProvider.createRefreshToken(user);

        refreshTokenService.save(user.getId(), refreshToken);

        return new AuthResponseDTO(
                accessToken,
                refreshToken,
                user
        );
    }

    /* =========================
       카카오 신규 유저 등록
       ========================= */
    private User registerKakaoUser(KakaoUserInfo kakaoUser) {

        String dummyPassword =
                passwordEncoder.encode(UUID.randomUUID().toString());

        User user = User.builder()
                .username("kakao_" + kakaoUser.getId())
                .password(dummyPassword)
                .email(
                	    kakaoUser.getEmail() != null
                	        ? Aes256Util.encrypt(kakaoUser.getEmail())
                	        : null
                	)
                .role(Role.ROLE_USER)
                .provider("KAKAO")
                .providerId(String.valueOf(kakaoUser.getId()))
                .build();

        userMapper.save(user);
        return user;
    }
}
