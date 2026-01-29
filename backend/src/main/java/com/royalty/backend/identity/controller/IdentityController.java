package com.royalty.backend.identity.controller;

import com.royalty.backend.identity.domain.IdentityVO;
import com.royalty.backend.identity.service.IdentityService;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/identity")
@RequiredArgsConstructor
public class IdentityController {

    private final IdentityService identityService;

    // BI 조회
    @GetMapping("/{brandId}")
    public IdentityVO getIdentity(
            @PathVariable Long brandId,
            @AuthenticationPrincipal Long userId
    ) {
        if (userId == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        return identityService.getCurrent(brandId, userId);
    }

    // BI 분석
    @PostMapping("/{brandId}/analyze")
    public IdentityVO analyzeIdentity(
            @PathVariable Long brandId,
            @AuthenticationPrincipal Long userId
    ) {
        if (userId == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        return identityService.analyze(brandId, userId);
    }
}
