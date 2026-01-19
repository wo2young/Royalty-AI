package com.royalty.backend.mypage.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import java.time.LocalDateTime;

/**
 * [DTO] 생성된 PDF 리포트 목록 응답 객체
 * 용도: 마이페이지 리포트 관리 및 다운로드 목록 UI
 * 테이블: report (JOIN: brand 테이블을 통해 brandName 확보)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDTO {

    /** 리포트 데이터 고유 식별 번호 (PK) */
    private Long reportId;

    /** 리포트가 소속된 브랜드의 고유 ID (FK) */
    private Long brandId;

    /** [JOIN 필드] 브랜드 식별을 위해 brand 테이블에서 가져온 브랜드 명 */
    private String brandName;

    /** PDF 파일이 저장된 스토리지(S3 등)의 경로 또는 접근 URL */
    private String filePath;
    
    /** 리포트 생성 완료 일시 (출력 포맷: 2026-01-19 15:30) */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm", timezone = "Asia/Seoul")
    private LocalDateTime createdAt;
}