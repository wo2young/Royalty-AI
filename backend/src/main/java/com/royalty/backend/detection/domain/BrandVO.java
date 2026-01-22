package com.royalty.backend.detection.domain;

import lombok.Getter;

@Getter
public class BrandVO {

    private Long brandId;

    // 상호명 관련
    private String brandName;        // 상호명
    private float[] textVector;      // 텍스트 벡터 (nullable)

    // 로고 관련
    private boolean hasLogo;          // 로고 존재 여부 (JOIN 결과)

    /* =========================
       판별 메서드 (핵심)
       ========================= */

    public boolean hasText() {
        return textVector != null;
    }

    public boolean hasLogo() {
        return hasLogo;
    }
}
