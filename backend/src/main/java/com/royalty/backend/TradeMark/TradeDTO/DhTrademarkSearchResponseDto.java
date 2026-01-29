package com.royalty.backend.TradeMark.TradeDTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class DhTrademarkSearchResponseDto {
    // 1. 기본 식별자
    @JsonProperty("id")
    private int patentId;
    private int brandId;
    private Long userId;

    // 2. 상표 정보
    @JsonProperty("trademark_name") 
    private String trademarkName;
    
    private String brandName; // 내 브랜드 이름
    private String applicant; 
    private String category;
    private String imageUrl;  // 타 상표 이미지 URL
    private String logoPath;  // 내 로고 이미지 경로

    // 3. 유사도 및 점수
    private float textSimilarity;
    private float imageSimilarity;
    private float soundSimilarity;
    private float combinedSimilarity;

    // 4. 분석 결과 (AI)
    private String riskLevel;
    private boolean isAiTarget;
    
    // [중요] aiAnalysisSummary와 aiSummary를 연결
    @JsonProperty("aiAnalysisSummary")
    private String aiAnalysisSummary; 

    private String aiSummary; // DB 매핑용 (ai_summary)

    // 에러 해결을 위한 세터 메서드
    public void setAiSummary(String aiSummary) {
        this.aiSummary = aiSummary;
        this.aiAnalysisSummary = aiSummary; // 두 곳 모두 저장
    }

    @JsonProperty("aiDetailedReport")
    private String aiDetailedReport;
    
    private String analysisDetail; // DB 매핑용 (analysis_detail)
    private String aiSolution;

    // 5. 검색 필터 및 추가 파라미터
    private String keyword;
    private Float minTextSimilarity;
    private Float minImageSimilarity;
    private String expirationStatus;

    // HTML 호환용
    @JsonProperty("name")
    public String getName() {
        return trademarkName;
    }
}