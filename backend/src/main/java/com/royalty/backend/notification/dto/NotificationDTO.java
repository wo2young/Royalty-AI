package com.royalty.backend.notification.dto;

import lombok.Getter;

@Getter
public class NotificationDTO {

    // ===== Notification =====
    private Long notificationId;
    private Boolean isRead;

    // ===== Brand =====
    private Long brandId;
    private String brandName;

    // ===== Detection Event =====
    private Long eventId;
    private String matchType;
    private Double imageSimilarity;
    private Double textSimilarity;

    // ===== Patent =====
    private Long patentId;
    private String trademarkName;
    private String applicationNumber;
}

