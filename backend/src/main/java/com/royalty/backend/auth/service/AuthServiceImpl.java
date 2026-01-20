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
import com.royalty.backend.auth.mapper.UserMapper;
import com.royalty.backend.auth.token.RefreshTokenService;
import com.royalty.backend.config.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
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

    /* =========================
       일반 로그인 (username)
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

        if (userMapper.existsByUsername(request.getUsername()) > 0) {
            throw new AuthException("이미 사용 중인 아이디입니다.");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .role(Role.ROLE_USER)
                .provider("LOCAL")
                .build();

        userMapper.save(user);

        return issueTokens(user);
    }

    /* =========================
       토큰 재발급 (Rotate)
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
    public AuthResponseDTO kakaoLogin(String kakaoAccessToken) {

        KakaoUserInfo kakaoUser = kakaoOAuthService.getUserInfo(kakaoAccessToken);

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
                user.getId(),
                user.getRole().name()
        );
    }

    /* =========================
       카카오 신규 유저 등록
       ========================= */
    private User registerKakaoUser(KakaoUserInfo kakaoUser) {

        User user = User.builder()
                .username("kakao_" + kakaoUser.getId())
                .email(kakaoUser.getEmail()) // 없으면 null
                .role(Role.ROLE_USER)
                .provider("KAKAO")
                .providerId(String.valueOf(kakaoUser.getId()))
                .build();

        userMapper.save(user);
        return user;
        
    }
    
    
}
