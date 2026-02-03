package com.royalty.backend.Analysis.TradeDTO;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class DhTradeSearchRequestDto {
    // 프론트엔드 FormData의 key값과 변수명이 일치해야 합니다.
    private String brandName;
    private String category; // 필요 시 추가
    private String logoUrl;  
    
    // 파일 업로드를 위한 필드 (필수)
    private MultipartFile logoFile;
}