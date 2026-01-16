package com.royalty.backend.mypage.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class BookmarkResponseDTO {
    private Long patentId;            // DB의 PK 값 (상세조회 링크용)
    private String trademarkName;      // patent 테이블에서 조인해서 가져올 이름
    private String imageUrl;           // patent 테이블에서 조인해서 가져올 이미지
    private LocalDateTime createdAt;   // bookmark 테이블의 생성 시간
}