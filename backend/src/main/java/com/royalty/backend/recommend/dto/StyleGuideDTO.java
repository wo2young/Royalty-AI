package com.royalty.backend.recommend.dto;

import lombok.*;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StyleGuideDTO {

    /* ======================
       Request 영역
       ====================== */

    /**
     * 로고 이미지 (URL 또는 Base64)
     */
    private String logoImage;


    /* ======================
       Response 영역
       ====================== */

    private List<Color> mainColors;
    private List<Color> subColors;
    private String description;


    /* ======================
       내부 서브 DTO
       ====================== */

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Color {
        private String hex;
        private Rgb rgb;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Rgb {
        private int r;
        private int g;
        private int b;
    }
}
