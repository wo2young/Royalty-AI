package com.royalty.backend.recommend.domain;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StyleGuideVO {

    private Long styleId;     // style_id
    private Long brandId;     // brand_id

    private String mainColor1; // main_color_1
    private String mainColor2; // main_color_2
    private String subColor1;  // sub_color_1
}
