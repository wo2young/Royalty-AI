package com.royalty.backend.userh;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.royalty.backend.auth.domain.User;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/userh")
public class UserHController {

    private final UserHService userHService;

    /**
     * 🔐 비밀번호 변경
     *
     * - 인증된 사용자만 접근 가능
     * - 현재 비밀번호 검증 후 새 비밀번호로 변경
     * - 변경 성공 시 모든 토큰 만료 처리 (재로그인 필요)
     *
     * @param user 인증된 사용자 정보 (JWT에서 추출)
     * @param dto  현재 비밀번호 / 새 비밀번호 정보
     */
    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal User user,
            @RequestBody ChangePasswordRequestDTO dto) {

        // 사용자 ID 기준으로 비밀번호 변경 처리
        userHService.changePassword(user.getId(), dto);
        return ResponseEntity.ok().build();
    }

    /**
     * 🗑 회원 탈퇴
     *
     * - 인증된 사용자만 접근 가능
     * - 사용자 계정을 DB에서 즉시 하드 삭제
     * - 관련 토큰은 모두 제거됨
     *
     * @param user 인증된 사용자 정보 (JWT에서 추출)
     */
    @DeleteMapping("/me")
    public ResponseEntity<Void> withdraw(
            @AuthenticationPrincipal User user) {

        // 사용자 ID 기준으로 회원 탈퇴 처리
        userHService.withdraw(user.getId());
        return ResponseEntity.ok().build();
    }
}
