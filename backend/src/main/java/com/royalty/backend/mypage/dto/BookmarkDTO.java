package com.royalty.backend.mypage.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookmarkDTO {
    private Long bookmarkId;       // 북마크 PK
    private Long patentId;         // 원본 특허 PK (상세 이동용)
    
    private String trademarkName;  // 상표명
    private String imageUrl;       // 상표 이미지
    private String applicationNumber; // 출원번호
    private String category;       // 분류
    private String applicant;      // 출원인
    // private String status;      // (추후 데이터 생기면 주석 해제)
    
    private LocalDateTime createdAt; // 북마크한 시간
}