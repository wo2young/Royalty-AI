package com.royalty.backend.auth.mail;

public interface MailService {

    void sendUsernameMail(String to, String username);

    void sendPasswordResetMail(String to, String resetLink);
}