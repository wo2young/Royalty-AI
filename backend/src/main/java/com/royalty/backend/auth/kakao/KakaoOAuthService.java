package com.royalty.backend.auth.kakao;

public interface KakaoOAuthService {

    KakaoUserInfo getUserInfo(String kakaoAccessToken);
}
