package com.royalty.backend.auth.kakao;

import com.royalty.backend.auth.dto.AuthResponseDTO;

public interface KakaoOAuthService {

    // 1️⃣ code → access_token
    String getAccessToken(String code);

    // 2️⃣ access_token → 사용자 정보
    KakaoUserInfo getUserInfo(String accessToken);
}
