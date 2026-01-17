package com.royalty.backend.mypage.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BrandHistoryDTO {
    private String version;     // v1, v2...
    private String imagePath;   // 해당 버전의 로고 경로
    private LocalDateTime createdAt; // 수정일
}
