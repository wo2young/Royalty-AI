package com.royalty.backend.auth.mail;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService {

    private final JavaMailSender mailSender;

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
}
