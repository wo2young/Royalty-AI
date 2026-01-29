package com.royalty.backend.mypage.dto;

import lombok.Data;
import java.util.List;
import java.time.LocalDateTime;

@Data
public class BrandDetailDTO {
    // 1. 기본 정보
    private Long brandId;
    private String brandName;
    private String category;
    private String description;
    private String currentLogoPath;
    private boolean isNotificationEnabled; // 상세에서도 스위치 조작 가능
    private LocalDateTime createdAt;
    // 2. 포함된 리스트 정보
    private List<BrandHistoryDTO> historyList; // 로고 변경 이력
//    private List<ReportDTO> reportList;        // 분석 리포트 목록

}