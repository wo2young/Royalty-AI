package com.royalty.backend.userh;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.royalty.backend.auth.domain.CustomUserDetails;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/userh")
public class UserHController {

    private final UserHService userHService;

    /**
     * 🔐 비밀번호 변경
     */
    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @RequestBody ChangePasswordRequestDTO dto) {

        Long userId = Long.valueOf(authentication.getName());
        userHService.changePassword(userId, dto);
        return ResponseEntity.ok().build();
    }

    /**
     * 🗑 회원 탈퇴
     */
    @DeleteMapping("/me")
    public ResponseEntity<Void> withdraw(Authentication authentication) {

        Long userId = Long.valueOf(authentication.getName());
        userHService.withdraw(userId);
        return ResponseEntity.ok().build();
    }
}
