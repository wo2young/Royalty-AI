package com.royalty.backend.notification.fcm;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class FcmService {

    /**
     * 단일 토큰 푸시
     */
    public void send(
            String fcmToken,
            String title,
            String body
    ) {
        try {
        	Message message = Message.builder()
        		    .setToken(fcmToken)

        		    // ✅ data 메시지 (지연 방지 핵심)
        		    .putData("title", title)
        		    .putData("body", body)

        		    // ✅ Web Push 강제 즉시 전달
        		    .setWebpushConfig(
        		        com.google.firebase.messaging.WebpushConfig.builder()
        		            .putHeader("Urgency", "high")
        		            .build()
        		    )

        		    // ✅ Android도 HIGH priority
        		    .setAndroidConfig(
        		        com.google.firebase.messaging.AndroidConfig.builder()
        		            .setPriority(com.google.firebase.messaging.AndroidConfig.Priority.HIGH)
        		            .build()
        		    )

        		    .build();


            String response = FirebaseMessaging.getInstance().send(message);
            log.info("[FCM] 전송 성공 response={}", response);

        } catch (Exception e) {
            log.error("[FCM] 전송 실패", e);
        }
    }
}
