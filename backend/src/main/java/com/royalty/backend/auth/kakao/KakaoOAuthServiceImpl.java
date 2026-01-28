package com.royalty.backend.auth.kakao;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class KakaoOAuthServiceImpl implements KakaoOAuthService {

    private static final String KAKAO_TOKEN_URL =
            "https://kauth.kakao.com/oauth/token";

    private static final String KAKAO_USER_INFO_URL =
            "https://kapi.kakao.com/v2/user/me";

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${kakao.client-id}")
    private String clientId;

    @Value("${kakao.redirect-uri}")
    private String redirectUri;

    /**
     * ✅ 1️⃣ 인가 코드 → access_token
     */
    @Override
    public String getAccessToken(String code) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("client_id", clientId);
        body.add("redirect_uri", redirectUri);
        body.add("code", code);

        HttpEntity<MultiValueMap<String, String>> request =
                new HttpEntity<>(body, headers);

        ResponseEntity<KakaoTokenResponseDTO> response =
                restTemplate.postForEntity(
                        KAKAO_TOKEN_URL,
                        request,
                        KakaoTokenResponseDTO.class
                );

        KakaoTokenResponseDTO token = response.getBody();

        if (token == null || token.getAccess_token() == null) {
            throw new RuntimeException("카카오 access_token 발급 실패");
        }

        return token.getAccess_token();
    }

    /**
     * ✅ 2️⃣ access_token → 사용자 정보
     */
    @Override
    public KakaoUserInfo getUserInfo(String accessToken) {

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<KakaoUserResponseDTO> response =
                restTemplate.exchange(
                        KAKAO_USER_INFO_URL,
                        HttpMethod.POST,
                        request,
                        KakaoUserResponseDTO.class
                );

        KakaoUserResponseDTO body = response.getBody();
        if (body == null) {
            throw new RuntimeException("카카오 사용자 정보 응답 없음");
        }

        Long id = body.getId();
        String email = body.getKakaoAccount() != null
                ? body.getKakaoAccount().getEmail()
                : null;

        String nickname = body.getProperties() != null
                ? body.getProperties().getNickname()
                : null;

        return new KakaoUserInfo(id, email, nickname);
    }
}
