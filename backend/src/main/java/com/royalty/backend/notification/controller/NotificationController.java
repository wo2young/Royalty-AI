package com.royalty.backend.notification.controller;

import com.royalty.backend.notification.dto.NotificationDTO;
import com.royalty.backend.notification.service.NotificationService;


import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/users/notification")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    
    /**
     * 내 알림 목록 조회
     */
    @GetMapping
    public List<NotificationDTO> getMyNotifications(
            @AuthenticationPrincipal Long userId
    ) {
    	if (userId == null ) {
    		throw new RuntimeException("로그인이 필요합니다.");
    	}
        return notificationService.getMyNotifications(userId);
    }

    /**
     * 알림 읽음 처리
     */
    @PostMapping("/read")
    public void readNotification(@RequestParam Long notificationId) {
        notificationService.readNotification(notificationId);
    }
}
