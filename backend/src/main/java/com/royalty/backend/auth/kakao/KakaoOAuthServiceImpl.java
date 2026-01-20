package com.royalty.backend.auth.kakao;

import org.springframework.stereotype.Service;

@Service
public class KakaoOAuthServiceImpl implements KakaoOAuthService {

    @Override
    public KakaoUserInfo getUserInfo(String kakaoAccessToken) {

        // 🔥 지금은 서버 기동을 위한 더미 구현
        // 나중에 RestTemplate / WebClient로 실제 호출하면 됨

        return new KakaoUserInfo(
                123456789L,
                null,              // 이메일 동의 안 받았을 수도 있음
                "kakao_user"
        );
    }
}
