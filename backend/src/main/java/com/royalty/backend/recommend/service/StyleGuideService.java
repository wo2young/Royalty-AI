package com.royalty.backend.recommend.service;

import com.royalty.backend.recommend.dto.StyleGuideDTO;

public interface StyleGuideService {

    /**
     * 스타일 가이드 생성
     * - AI 생성
     * - DB 저장
     * - 생성 결과 반환
     */
    StyleGuideDTO createStyleGuide(StyleGuideDTO dto);
}