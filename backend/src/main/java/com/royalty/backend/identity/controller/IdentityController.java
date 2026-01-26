package com.royalty.backend.identity.controller;

import com.royalty.backend.identity.domain.IdentityVO;
import com.royalty.backend.identity.service.IdentityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/identity")
@RequiredArgsConstructor
public class IdentityController {

    private final IdentityService identityService;

    // BI 조회 (현재 저장된 BI 그대로 반환)
    @GetMapping("/{brandId}")
    public IdentityVO getIdentity(@PathVariable Long brandId) {
        return identityService.getCurrent(brandId);
    }

    // BI 분석 버튼 클릭
    @PostMapping("/{brandId}/analyze")
    public IdentityVO analyzeIdentity(@PathVariable Long brandId) {
        return identityService.analyze(brandId);
    }
}
