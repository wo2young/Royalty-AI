package com.royalty.backend.notification.domain;

import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
public class NotificationVO {

    private Long notificationId;
    private Long userId;
    private Long brandId;
    private Long eventId;
    private String message;
    private Boolean isRead;
}
