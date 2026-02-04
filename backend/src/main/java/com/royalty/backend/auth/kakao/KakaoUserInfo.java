package com.royalty.backend.auth.kakao;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class KakaoUserInfo {

    private Long id;
    private String email;
    private String nickname;
}
