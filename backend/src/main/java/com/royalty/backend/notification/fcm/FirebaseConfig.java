package com.royalty.backend.notification.fcm;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    // 환경 변수로부터 경로를 주입받거나 기본값을 사용합니다.
    @Value("${FIREBASE_CONFIG_PATH:/app/firebase-key.json}")
    private String firebaseConfigPath;

    @PostConstruct
    public void init() {
        try {
            // 외부 경로(파일 시스템)에서 JSON 키 파일을 읽어옵니다.
            InputStream serviceAccount = new FileInputStream(firebaseConfigPath);

            FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }
        } catch (Exception e) {
            throw new RuntimeException("Firebase 초기화 실패: " + e.getMessage(), e);
        }
    }
}
