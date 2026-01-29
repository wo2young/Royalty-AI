package com.royalty.backend.identity.service;

import com.royalty.backend.identity.domain.IdentityVO;

public interface IdentityService {

    // 현재 BI 조회 (그대로 반환)
    IdentityVO getCurrent(Long brandId, Long userId);

    // BI 분석 버튼 클릭
    // - 로고/상호 둘 다 있을 때만 동작
    // - 입력이 안 바뀌었으면 기존 BI 반환
    // - 입력이 바뀌었으면 BI 재생성
    IdentityVO analyze(Long brandId, Long userId);
}
