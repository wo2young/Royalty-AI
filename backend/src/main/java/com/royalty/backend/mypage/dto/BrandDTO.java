package com.royalty.backend.mypage.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BrandDTO {
    private Long brandId;
    private Long userId;          // 등록 시 필요
    private String brandName;     // 이름 (없을 수 있음 -> Nullable)
    private String category;      // 업종/분류
    private String description;   // 설명
    private String logoPath;      // 대표 로고 이미지 경로
    private boolean isNotificationEnabled; // 알림 설정 (true/false)
    private LocalDateTime createdAt;
}