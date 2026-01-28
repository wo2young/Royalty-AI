package com.royalty.backend.auth.mail;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class EmailAuthStore {

    private static class CodeInfo {
        String code;
        LocalDateTime expiresAt;
    }

    private final Map<String, CodeInfo> store = new ConcurrentHashMap<>();

    public void save(String email, String code) {
        CodeInfo info = new CodeInfo();
        info.code = code;
        info.expiresAt = LocalDateTime.now().plusMinutes(10);
        store.put(email, info);
    }

    public boolean verify(String email, String code) {
        CodeInfo info = store.get(email);

        if (info == null) return false;
        if (LocalDateTime.now().isAfter(info.expiresAt)) {
            store.remove(email);
            return false;
        }

        boolean match = info.code.equals(code);
        if (match) {
            store.remove(email); // 인증 성공하면 제거
        }
        return match;
    }
}
