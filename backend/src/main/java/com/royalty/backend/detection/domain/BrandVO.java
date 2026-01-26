package com.royalty.backend.detection.domain;

import lombok.Getter;

@Getter
public class BrandVO {

    private Long brandId;
    private Long userId;
    private boolean isNotificationEnabled;

    private String brandName;

 
    private float[] textVector;

    private boolean hasLogo;

    /* =========================
       판별 메서드
       ========================= */

    public boolean hasText() {
        return textVector != null;
    }

    public boolean hasLogo() {
        return hasLogo;
    }

    public boolean isNotificationEnabled() {
        return isNotificationEnabled;
    }
}
