package com.royalty.backend.recommend.dto;

import com.royalty.backend.recommend.domain.StyleGuideVO;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StyleGuideDTO {

    private Long styleGuideId;
    private Long brandId;

    private String mainColor1;
    private String mainColor2;
    private String subColor1;

    public StyleGuideVO toVO() {
        return StyleGuideVO.builder()
                .styleId(styleGuideId)
                .brandId(brandId)
                .mainColor1(mainColor1)
                .mainColor2(mainColor2)
                .subColor1(subColor1)
                .build();
    }

    public static StyleGuideDTO of(StyleGuideVO vo) {
        return StyleGuideDTO.builder()
                .styleGuideId(vo.getStyleId())
                .brandId(vo.getBrandId())
                .mainColor1(vo.getMainColor1())
                .mainColor2(vo.getMainColor2())
                .subColor1(vo.getSubColor1())
                .build();
    }
}
