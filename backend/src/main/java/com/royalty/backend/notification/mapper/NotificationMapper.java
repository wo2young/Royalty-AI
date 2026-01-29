package com.royalty.backend.notification.mapper;

import com.royalty.backend.notification.domain.NotificationVO;
import com.royalty.backend.notification.dto.NotificationDTO;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface NotificationMapper {

    void markAsRead(Long notificationId);

    int insertNotification(NotificationVO notification);

    List<NotificationDTO> findMyNotifications(Long userId);
}

