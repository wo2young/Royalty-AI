package com.royalty.backend.auth.mail;

public interface MailService {

    void sendUsernameMail(String to, String username);

    void sendPasswordResetMail(String to, String resetLink);

    /* =========================
       회원가입 이메일 인증 (추가)
       ========================= */

    // 인증번호 발송
    void sendSignupAuthCode(String to);

    // 인증번호 검증 (10분 제한)
    boolean verifySignupAuthCode(String email, String authCode);
}
