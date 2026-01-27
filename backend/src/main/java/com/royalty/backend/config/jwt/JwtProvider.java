package com.royalty.backend.config.jwt;

import com.royalty.backend.auth.domain.Role;
import com.royalty.backend.auth.domain.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtProvider {

    /*
     * ⚠️ 실서비스에서는 반드시 환경변수 사용
     * application.yml / env:
     * jwt.secret: ROYALTY_JWT_SECRET_KEY_32BYTE_MINIMUM!!
     */
    @Value("${jwt.secret}")
    private String secretKey;

    // Access Token: 30분
    private static final long ACCESS_TOKEN_EXPIRE_TIME =
            1000L * 60 * 30;

    // Refresh Token: 14일
    private static final long REFRESH_TOKEN_EXPIRE_TIME =
            1000L * 60 * 60 * 24 * 14;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    /* =========================
       Access Token 생성
       ========================= */
    public String createAccessToken(User user) {
        return Jwts.builder()
                .setSubject(String.valueOf(user.getId()))
                .claim("role", user.getRole().name())
                .setIssuedAt(new Date())
                .setExpiration(expireAfter(ACCESS_TOKEN_EXPIRE_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /* =========================
       Refresh Token 생성
       ========================= */
    public String createRefreshToken(User user) {
        return Jwts.builder()
                .setSubject(String.valueOf(user.getId()))
                .setIssuedAt(new Date())
                .setExpiration(expireAfter(REFRESH_TOKEN_EXPIRE_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    // =========================
    		// 🔐 비밀번호 재설정 전용 JWT
    		// =========================
    public String createPasswordResetToken(User user) {
        return Jwts.builder()
                // JWT subject → 사용자 식별자
                .setSubject(String.valueOf(user.getId()))

                // 이 토큰의 목적을 명확히 구분
                .claim("type", "RESET_PASSWORD")

                .setIssuedAt(new Date())

                // ⏰ 15분 후 만료
                .setExpiration(
                    new Date(System.currentTimeMillis() + 1000L * 60 * 15)
                )

                // 기존 Access/Refresh와 동일한 서명 키 사용
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)

                .compact();
    }

    /* =========================
    🔐 비밀번호 재설정 JWT 검증
    ========================= */
 public Long validatePasswordResetToken(String token) {

     try {
         Claims claims = Jwts.parserBuilder()
                 .setSigningKey(getSigningKey())
                 .build()
                 .parseClaimsJws(token)
                 .getBody();

         // 1️⃣ 토큰 목적 확인
         String type = claims.get("type", String.class);
         if (!"RESET_PASSWORD".equals(type)) {
             throw new JwtException("비밀번호 재설정용 토큰이 아닙니다.");
         }

         // 2️⃣ userId 반환
         return Long.parseLong(claims.getSubject());

     } catch (ExpiredJwtException e) {
         throw new JwtException("비밀번호 재설정 토큰이 만료되었습니다.");
     } catch (JwtException e) {
         throw e;
     } catch (Exception e) {
         throw new JwtException("유효하지 않은 토큰입니다.");
     }
 }


    /* =========================
       토큰 유효성 검증
       ========================= */
    public void validateToken(String token) {
        try {
            parseClaims(token);
        } catch (ExpiredJwtException e) {
            throw new JwtException("토큰이 만료되었습니다.");
        } catch (UnsupportedJwtException | MalformedJwtException e) {
            throw new JwtException("지원되지 않는 토큰 형식입니다.");
        } catch (SecurityException | IllegalArgumentException e) {
            throw new JwtException("토큰이 유효하지 않습니다.");
        }
    }

    /* =========================
       userId 추출
       ========================= */
    public Long getUserId(String token) {
        return Long.parseLong(parseClaims(token).getSubject());
    }

    /* =========================
       role 추출
       ========================= */
    public Role getRole(String token) {
        String role = parseClaims(token).get("role", String.class);
        return Role.valueOf(role);
    }

    /* =========================
       만료 시간 계산
       ========================= */
    private Date expireAfter(long millis) {
        return new Date(System.currentTimeMillis() + millis);
    }

    /* =========================
       Claims 파싱 (공통)
       ========================= */
    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
