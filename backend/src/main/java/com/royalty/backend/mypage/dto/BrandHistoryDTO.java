package com.royalty.backend.mypage.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import java.time.LocalDateTime;

/**
 * [DTO] 브랜드 로고 버전 이력 및 차트 데이터 객체
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandHistoryDTO {

    private String version;      // "v1", "v2"
    private String imagePath;

    // 차트의 다중 데이터 표현을 위해 분리
    private Double imageScore;   // 이미지 유사도 점수 (그래프 1)
    private Double textScore;    // 텍스트 유사도 점수 (그래프 2)

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd", timezone = "Asia/Seoul")
    private LocalDateTime createdAt;
}