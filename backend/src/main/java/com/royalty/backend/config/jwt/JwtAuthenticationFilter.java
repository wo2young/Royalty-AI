package com.royalty.backend.config.jwt;

import com.royalty.backend.auth.domain.Role;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    /* =========================
    🔥 JWT 필터 제외 경로
    ========================= */
 @Override
 protected boolean shouldNotFilter(HttpServletRequest request) {
     String path = request.getRequestURI();

     return path.equals("/api/auth/login")
         || path.equals("/api/auth/signup")
         || path.equals("/api/auth/refresh")
         || path.startsWith("/api/auth/kakao/")
         || path.startsWith("/oauth/")
         || path.equals("/api/auth/email/send") 
         || path.equals("/api/auth/find-username")  
         || path.startsWith("/api/auth/password/")
         || path.equals("/error");
        
 }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String token = resolveToken(request);

        try {
            if (token != null) {
                jwtProvider.validateToken(token);

                Long userId = jwtProvider.getUserId(token);
                Role role = jwtProvider.getRole(token);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role.name()))
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (JwtException e) {
            // 토큰 문제 발생 시 인증 정보 제거
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    /* =========================
       Authorization 헤더에서 토큰 추출
       ========================= */
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
