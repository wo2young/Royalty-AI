package com.royalty.backend.mypage.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BrandHistoryDTO {
    private String version;          // v1, v2 ...
    private String imagePath;        // 당시 로고
    private Float imageSimilarity; // 이미지 유사도 (%)
    private Float textSimilarity;  // 텍스트 유사도 (%)
    private LocalDateTime createdAt; // 변경일
}