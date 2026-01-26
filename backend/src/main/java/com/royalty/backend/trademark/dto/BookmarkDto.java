package com.royalty.backend.trademark.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BookmarkDto {
    // 1. Bookmark 테이블 고유 정보
    private Long bookmarkId;         // bookmark_id
    private Long userId;             // user_id
    private String application_number;           // patent_id
    private LocalDateTime createdAt; // created_at

    // 2. Patent 테이블 정보 (화면 표시용)
    private String trademarkName;    
    private String imageUrl;         
    private String applicationNumber;
    private String applicant;        
    private String category;         
    private String status;           
    private LocalDate applicationDate;
}