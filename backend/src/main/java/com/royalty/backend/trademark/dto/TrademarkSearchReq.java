package com.royalty.backend.trademark.dto;

import lombok.Data;

@Data
public class TrademarkSearchReq {
    private String category;  // 분류 (예: '09', '25')
    private String keyword;   // 검색어
    private String sort;      // 정렬 기준 (latest, old 등)
    
    // 페이징 (기본값 설정: 1페이지, 20개씩)
    private int page = 1;
    private int size = 20;
    
    // MyBatis에서 사용할 Offset 계산 메서드
    public int getOffset() {
        return (Math.max(1, page) - 1) * size;
    }
}