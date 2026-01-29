package com.royalty.backend.identity.service;

import com.royalty.backend.identity.ai.GptClient;
import com.royalty.backend.identity.domain.IdentityVO;
import com.royalty.backend.identity.logo.LogoFeatureExtractor;
import com.royalty.backend.identity.mapper.IdentityMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class IdentityServiceImpl implements IdentityService {

    private final IdentityMapper identityMapper;
    private final GptClient gptClient;
    private final LogoFeatureExtractor logoFeatureExtractor;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional(readOnly = true)
    public IdentityVO getCurrent(Long brandId, Long userId) {
    	IdentityVO current = identityMapper.findByBrandId(brandId);
        if (current == null) {
            throw new IllegalStateException("브랜드 정보가 존재하지 않습니다.");
        }

        
        if (!current.getUserId().equals(userId)) {
            throw new SecurityException("접근 권한이 없습니다.");
        }

        return current;
    }

    @Override
    public IdentityVO analyze(Long brandId, Long userId) {

        // 1️ 현재 브랜드 + BI 조회
    	IdentityVO current = identityMapper.findByBrandId(brandId);
        if (current == null) {
            throw new IllegalStateException("브랜드 정보가 존재하지 않습니다.");
        }

        // 🔒 소유자 검증 (가장 중요)
        if (!current.getUserId().equals(userId)) {
            throw new SecurityException("접근 권한이 없습니다.");
        }

        // 2️ 입력 변경 여부 체크
        boolean unchanged =
                current.getLastLogoId() != null
                && current.getLastBrandName() != null
                && current.getLogoId().equals(current.getLastLogoId())
                && current.getBrandName().equals(current.getLastBrandName());

        if (unchanged) {
            return current;
        }

        // 3️ 로고 이미지 경로 조회
        String imagePath =
                identityMapper.findLogoImagePathByLogoId(current.getLogoId());

        if (imagePath == null) {
            throw new IllegalStateException("로고 이미지 경로를 찾을 수 없습니다.");
        }

        // 4️ 로고 이미지 기반 특징 추출
        Map<String, Object> logoFeatures =
                logoFeatureExtractor.extract(imagePath);

        // 5️ 로고 특징 JSON 변환
        String logoFeatureJson;
        try {
            logoFeatureJson = objectMapper.writeValueAsString(logoFeatures);
        } catch (Exception e) {
            throw new IllegalStateException("로고 특징 JSON 변환 실패", e);
        }

        // 6️ GPT 프롬프트
        String prompt = """
            너는 API 서버의 JSON 생성기다.

            [규칙]
            - JSON 외의 텍스트를 절대 출력하지 마라
            - 설명, 인사, 마크다운, ``` 절대 금지
            - UTF-8 인코딩
            - 키 이름 변경 금지

            [출력 JSON 스키마]
            {
              "core": { "kr": "", "en": "" },
              "language": { "kr": "", "en": "" },
              "brandKeywords": { "kr": [], "en": [] },
              "copyExamples": { "kr": [], "en": [] }
            }

            [입력]
            브랜드명: %s
            로고 특징:
            %s
            """.formatted(
                current.getBrandName(),
                logoFeatureJson
        );

        String gptResponse = gptClient.call(prompt);

        // 7️ GPT 응답에서 JSON만 추출 + 파싱
        Map<String, Object> payload;
        try {
            String pureJson = extractJsonOnly(gptResponse);

            payload = objectMapper.readValue(
                    pureJson,
                    new TypeReference<Map<String, Object>>() {}
            );

            validatePayload(payload);

        } catch (Exception e) {
            throw new IllegalStateException("GPT 응답 JSON 파싱 실패", e);
        }

        // 8️ 저장 VO 구성
        IdentityVO saveVO = new IdentityVO();
        saveVO.setBrandId(brandId);
        saveVO.setLogoId(current.getLogoId());
        saveVO.setBrandName(current.getBrandName());
        saveVO.setIdentityPayload(payload);
        saveVO.setLastLogoId(current.getLogoId());
        saveVO.setLastBrandName(current.getBrandName());

        // 9️⃣ INSERT or UPDATE
        if (current.getLastLogoId() == null && current.getLastBrandName() == null) {
            identityMapper.insert(saveVO);
        } else {
            identityMapper.update(saveVO);
        }

        return saveVO;
    }

    // =========================
    // 내부 유틸
    // =========================

    private String extractJsonOnly(String response) {
        int start = response.indexOf("{");
        int end = response.lastIndexOf("}");

        if (start == -1 || end == -1 || start >= end) {
            throw new IllegalStateException("GPT 응답에 JSON이 없습니다.");
        }

        return response.substring(start, end + 1);
    }

    private void validatePayload(Map<String, Object> payload) {
        if (!payload.containsKey("core")
            || !payload.containsKey("language")
            || !payload.containsKey("brandKeywords")
            || !payload.containsKey("copyExamples")) {
            throw new IllegalStateException("GPT JSON 필수 키 누락");
        }
    }
}
