package com.royalty.backend.mypage.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import java.time.LocalDateTime;

/**
 * [DTO] 사용자 알림 센터 응답 객체
 * 관련 테이블: notification
 * 수정사항: 불필요한 type 필드 제거 (심플하게 리스트만 노출)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {

    private Long notificationId;   // PK
    private Long userId;           // 수신자 ID
    private String message;        // 알림 내용
    private boolean isRead;        // 읽음 여부 (핵심)
    private Long relatedBrandId;   // 클릭 시 이동할 브랜드 ID

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm", timezone = "Asia/Seoul")
    private LocalDateTime createdAt;
}