package com.royalty.backend.mypage.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class BrandDetailDTO {
    // 1. 브랜드 기본 정보
    private Long brandId;
    private String brandName;
    private String currentImagePath;
    private LocalDateTime createdAt;

    // 2. 현재 분석 결과 (리스크 등)
    private String riskLevel;
    private Double similarityScore; // 유사도 점수 등 필요 시 추가

    // 3. 버전 히스토리 목록 (v1, v2, v3...)
    private List<BrandHistoryDTO> historyList;
}

