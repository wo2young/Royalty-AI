package com.royalty.backend.Analysis.TradeDTO;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class DhBrandSaveRequestDto {
    private String brandName;
    private String category;
    private int brandId;
    private int patentId;
    private String logoPath;
    private String aiSummary;
    
    // AI 상세 리포트 관련
    private String aiDetailedReport;
    private String aiSolution;
    private String riskLevel;
    private String analysisDetail;
    
    // 유사도 점수
    private float textSimilarity;
    private float imageSimilarity;
    
    // 파일 (이름은 프론트엔드의 formData.append("logoFile", ...)과 일치해야 함)
    private MultipartFile logoFile;
}