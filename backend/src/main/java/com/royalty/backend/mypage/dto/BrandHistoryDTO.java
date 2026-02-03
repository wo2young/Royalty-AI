package com.royalty.backend.mypage.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Data;

@Data
public class BrandHistoryDTO {
    private String version;          // v1, v2 ...
    private String imagePath;        // 당시 로고
    private Float imageSimilarity; // 이미지 유사도 (%)
    private Float textSimilarity;  // 텍스트 유사도 (%)
    private LocalDateTime createdAt; // 변경일
    
    private String aiSummary;       // ai_summary (TEXT)
    
    @JsonIgnore
    private String analysisDetail;  // analysis_detail (TEXT)
    private Long patentId;          // patent_id (BIGINT)
    
    private String aiAnalysisSummary;
    private String aiDetailedReport;
    private String aiSolution;
}