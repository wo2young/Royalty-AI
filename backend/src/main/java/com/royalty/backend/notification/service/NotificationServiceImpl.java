package com.royalty.backend.notification.service;

import com.royalty.backend.notification.dto.NotificationDTO;
import com.royalty.backend.notification.mapper.NotificationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationMapper notificationMapper;

    @Override
    public List<NotificationDTO> getMyNotifications(Long userId) {
        return notificationMapper.findMyNotifications(userId);
    }

    @Override
    public void readNotification(Long notificationId) {
        notificationMapper.markAsRead(notificationId);
    }
}
