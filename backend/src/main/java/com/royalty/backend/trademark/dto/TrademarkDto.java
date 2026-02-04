package com.royalty.backend.trademark.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TrademarkDto {
    // 1. DB 컬럼 매핑 (patent 테이블)
    private Long patentId;            // patent_id
    private String applicationNumber; // application_number
    private String trademarkName;     // trademark_name
    private String imageUrl;          // image_url
    private String applicant;         // applicant
    private String category;          // category
    private LocalDate applicationDate;// application_date
    private LocalDate registeredDate; // registered_date

    // 2. 프론트엔드 표기용 추가 필드
    private boolean isBookmarked;     // boolean 필드는 Jackson 변환 시 주의
    
//    private LocalDate expirationDate; // 만료 예정일 (등록일 + 10년)
//    private long daysLeft;            // 소멸까지 남은 일수 (D-Day)
}