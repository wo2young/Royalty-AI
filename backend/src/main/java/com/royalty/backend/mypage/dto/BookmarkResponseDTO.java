package com.royalty.backend.mypage.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import java.time.LocalDateTime;

/**
 * [DTO] 내가 북마크한 상표 목록 응답 객체
 * 관련 테이블: bookmark (조인: patent)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookmarkResponseDTO {
    private Long bookmarkId;       // 북마크 고유 번호 (삭제 시 필요)
    private Long patentId;         // 외부 상표 원본 ID
    private String trademarkName;  // 상표명
    private String imageUrl;       // 상표 이미지 경로
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm", timezone = "Asia/Seoul")
    private LocalDateTime createdAt;
}