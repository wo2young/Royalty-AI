package com.royalty.backend.auth.service;

import com.royalty.backend.auth.dto.AuthResponseDTO;
import com.royalty.backend.auth.dto.LoginRequestDTO;
import com.royalty.backend.auth.dto.SignupRequestDTO;
import com.royalty.backend.auth.dto.TokenResponseDTO;

public interface AuthService {

    AuthResponseDTO login(LoginRequestDTO request);

    AuthResponseDTO signup(SignupRequestDTO request);

    TokenResponseDTO refresh(String refreshToken);

    void logout(String refreshToken);

    AuthResponseDTO kakaoLogin(String kakaoAccessToken);
    
    void findUsernameByEmail(String email);
    
    void requestPasswordReset(SignupRequestDTO request);
    void resetPassword(String token, String newPassword);
    
    
    
    
}
