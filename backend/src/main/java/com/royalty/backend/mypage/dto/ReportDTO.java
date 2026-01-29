package com.royalty.backend.mypage.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReportDTO {
    private Long reportId;
    private Long brandId;
    private String filePath;         // 리포트 파일 경로 (PDF 등)
    private LocalDateTime createdAt; // 생성일
}