package com.royalty.backend.notification.service;

import com.royalty.backend.notification.dto.NotificationDTO;

import java.util.List;

public interface NotificationService {

    void readNotification(Long notificationId);
    
    List<NotificationDTO> getMyNotifications(Long userId);
 
}
