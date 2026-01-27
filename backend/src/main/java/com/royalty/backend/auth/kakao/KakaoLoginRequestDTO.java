package com.royalty.backend.auth.kakao;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class KakaoLoginRequestDTO {

    private String code;

}