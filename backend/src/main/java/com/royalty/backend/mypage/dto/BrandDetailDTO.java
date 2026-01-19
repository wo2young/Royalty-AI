package com.royalty.backend.mypage.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * [DTO] 내 브랜드 정보 응답 객체 (목록 및 상세 공용)
 * 관련 테이블: brand, brand_logo, brand_analysis
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandDetailDTO {
    private Long brandId;
    private String brandName;
    private String currentImagePath; // 현재 서비스 중인 최신 로고
    private String riskLevel;        // 최신 분석 등급
    private Double similarityScore;  // 최신 유사도 점수
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd", timezone = "Asia/Seoul")
    private LocalDateTime createdAt;

    @Builder.Default 
    private List<BrandHistoryDTO> historyList = new ArrayList<>(); // 버전 관리 및 차트 통합 데이터
}