package com.royalty.backend.auth.mail;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService {

    private final JavaMailSender mailSender;

    /* =========================
       이메일 인증번호 (메모리)
       ========================= */
    private static class AuthCodeInfo {
        private final String code;
        private final LocalDateTime expiresAt;

        private AuthCodeInfo(String code, LocalDateTime expiresAt) {
            this.code = code;
            this.expiresAt = expiresAt;
        }
    }

    // email -> 인증정보
    private final Map<String, AuthCodeInfo> authCodeStore = new ConcurrentHashMap<>();

    /* =========================
       기존 기능 (절대 수정 X)
       ========================= */
    @Override
    public void sendUsernameMail(String to, String username) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("[Royalty-AI] 아이디 안내");
        message.setText(
            "안녕하세요.\n\n" +
            "요청하신 아이디는 아래와 같습니다.\n\n" +
            "아이디: " + username + "\n\n" +
            "감사합니다.\nRoyalty-AI"
        );
        mailSender.send(message);
    }

    @Override
    public void sendPasswordResetMail(String to, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("[Royalty-AI] 비밀번호 재설정");
        message.setText(
            "비밀번호 재설정을 원하시면 아래 링크를 클릭하세요.\n\n" +
            resetLink + "\n\n" +
            "이 링크는 일정 시간 후 만료됩니다."
        );
        mailSender.send(message);
    }

    /* =========================
    🔥 회원가입 이메일 인증 (추가)
    ========================= */

 // 인증번호 발송 (10분 유효)
 @Override
 public void sendSignupAuthCode(String to) {
     String code = generateCode();
     LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

     authCodeStore.put(to, new AuthCodeInfo(code, expiresAt));

     SimpleMailMessage message = new SimpleMailMessage();
     message.setTo(to);
     message.setSubject("[Royalty-AI] 회원가입 이메일 인증");
     message.setText(
         "회원가입을 위한 이메일 인증번호입니다.\n\n" +
         "인증번호: " + code + "\n\n" +
         "이 인증번호는 10분 후 만료됩니다.\n\n" +
         "감사합니다.\nRoyalty-AI"
     );

     mailSender.send(message);
 }

 // 인증번호 검증
 @Override
 public boolean verifySignupAuthCode(String email, String inputCode) {
     AuthCodeInfo info = authCodeStore.get(email);

     if (info == null) {
         return false;
     }

     if (LocalDateTime.now().isAfter(info.expiresAt)) {
         authCodeStore.remove(email);
         return false;
     }

     if (!info.code.equals(inputCode)) {
         return false;
     }

     authCodeStore.remove(email);
     return true;
 }

    /* =========================
       내부 유틸
       ========================= */
    private String generateCode() {
        return String.valueOf((int) (Math.random() * 900000) + 100000);
    }
}
