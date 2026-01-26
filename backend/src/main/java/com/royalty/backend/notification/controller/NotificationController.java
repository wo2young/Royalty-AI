package com.royalty.backend.notification.controller;

import com.royalty.backend.notification.domain.NotificationVO;
import com.royalty.backend.notification.dto.NotificationDTO;
import com.royalty.backend.notification.service.NotificationService;
//import com.royalty.backend.auth.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;
//import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users/notification")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    
    /**
     * 테스트용 알림 목록 조회
     * userId 하드코딩
     */
    @GetMapping
    public List<NotificationDTO> getNotifications() {
        Long testUserId = 1L; // 테스트용
        return notificationService.getMyNotifications(testUserId);
    }

    /**
     * 테스트용 알림 읽음 처리
     */
    @PostMapping("/read")
    public void readNotification(
            @RequestBody NotificationDTO request
    ) {
        notificationService.readNotification(request.getNotificationId());
    }
    
//    실제
//    /**
//     * 내 알림 목록 조회
//     */
//    @GetMapping
//    public List<NotificationDTO> getMyNotifications(
//            @AuthenticationPrincipal CustomUserDetails user
//    ) {
//        return notificationService.getMyNotifications(user.getUserId());
//    }
//
//    /**
//     * 알림 읽음 처리
//     */
//    @PostMapping("/read")
//    public void readNotification(@RequestParam Long notificationId) {
//        notificationService.readNotification(notificationId);
//    }
}
