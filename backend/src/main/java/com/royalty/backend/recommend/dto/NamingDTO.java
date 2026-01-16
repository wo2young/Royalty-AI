package com.royalty.backend.recommend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class NamingDTO {

    // 입력
    private List<String> keywords;   // ex) ["커피", "따뜻한", "휴식"]

    // 출력
    private List<String> names;      // GPT가 추천한 이름들
}
