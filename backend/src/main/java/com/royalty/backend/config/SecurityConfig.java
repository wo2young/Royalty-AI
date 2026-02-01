package com.royalty.backend.config;

import com.royalty.backend.config.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /* =========================
       Security Filter Chain
       ========================= */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            // 🔹 CSRF 비활성화 (JWT 사용)
            .csrf(csrf -> csrf.disable())

            // 🔹 CORS 설정 적용
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 🔹 세션 사용 안 함
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // 🔹 URL 권한 설정
            .authorizeHttpRequests(auth -> auth
                    
                    // 인증 없이 접근 허용
                    .requestMatchers(
                    		"/api/auth/login",
                            "/api/auth/signup",
                            "/api/auth/kakao/**",
                            "/oauth/**",
                            "/api/auth/email/send",
                            "/api/auth/email/verify",
                            "/api/auth/username/check", 
                            "/api/auth/password/**",  
                            "/auth/**",
                            "/api/auth/find-username",
                            "/error"
                            
                    ).permitAll()

                    

                    // 나머지는 인증 필요
                    .anyRequest().authenticated()
                    
                    
                    
            )

            // 🔹 JWT 필터 등록
            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    /* =========================
       PasswordEncoder
       ========================= */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /* =========================
       CORS 설정
       ========================= */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:5173"
        ));

        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE","PATCH", "OPTIONS"
        ));

        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
