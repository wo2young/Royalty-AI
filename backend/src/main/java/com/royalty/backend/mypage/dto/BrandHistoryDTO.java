package com.royalty.backend.mypage.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BrandHistoryDTO {
    private String version;          // v1, v2 ...
    private String imagePath;        // 당시 로고
    private Double imageSimilarity;  // 당시 이미지 유사도
    private Double textSimilarity;   // 당시 텍스트 유사도
    private LocalDateTime createdAt; // 변경일
}