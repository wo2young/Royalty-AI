package com.royalty.backend.identity.domain;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class IdentityVO {

    // 브랜드 ID (PK)
    private Long brandId;

    // 현재 연결된 로고 ID (brand 테이블 기준)
    private Long logoId;
    
    //brand.user_id
    private Long userId;
    
    //로고 이미지 경로 (brand_logo.image_path)
    private String logoImagePath;

    // 현재 상호명 (brand 테이블 기준)
    private String brandName;

    // GPT가 생성한 브랜드 아이덴티티 JSON
    private Map<String, Object> identityPayload;

    // 마지막 BI 생성에 사용된 로고 ID
    private Long lastLogoId;

    // 마지막 BI 생성에 사용된 상호명
    private String lastBrandName;
}
