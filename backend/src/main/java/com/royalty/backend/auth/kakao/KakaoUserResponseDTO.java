package com.royalty.backend.auth.kakao;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class KakaoUserResponseDTO {

    private Long id;
    private KakaoAccount kakaoAccount;
    private Properties properties;

    @Getter
    @NoArgsConstructor
    public static class KakaoAccount {
        private String email;
    }

    @Getter
    @NoArgsConstructor
    public static class Properties {
        private String nickname;
    }
}
