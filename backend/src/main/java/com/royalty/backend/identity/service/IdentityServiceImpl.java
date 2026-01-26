package com.royalty.backend.identity.service;

import com.royalty.backend.identity.ai.GptClient;
import com.royalty.backend.identity.domain.IdentityVO;
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

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional(readOnly = true)
    public IdentityVO getCurrent(Long brandId) {
        return identityMapper.findByBrandId(brandId);
    }

    @Override
    public IdentityVO analyze(Long brandId) {

        // 1) brand + identity JOIN 결과 조회
        IdentityVO current = identityMapper.findByBrandId(brandId);

        if (current == null) {
            throw new IllegalStateException("브랜드 정보가 존재하지 않습니다.");
        }

        // 2) 로고 / 상호 존재 여부 체크
        if (current.getLogoId() == null || current.getBrandName() == null) {
            throw new IllegalStateException("로고와 상호명이 모두 있어야 BI 분석이 가능합니다.");
        }

        // 3) 입력 변경 여부 판단
        boolean unchanged =
                current.getLastLogoId() != null
                && current.getLastBrandName() != null
                && current.getLogoId().equals(current.getLastLogoId())
                && current.getBrandName().equals(current.getLastBrandName());

        if (unchanged) {
            // 입력이 같으면 기존 BI 그대로 반환
            return current;
        }

        // 4) GPT 호출
        String prompt = """
        		다음 브랜드 정보로 브랜드 아이덴티티(BI)를 생성하라.

        		조건:
        		1. 반드시 JSON만 반환하라 (설명 문장 절대 포함 금지)
        		2. 모든 텍스트 필드는 반드시 한국어(KR)와 영어(EN)를 모두 포함하라
        		3. 구조는 아래 키를 정확히 지켜라

        		JSON 구조 예시:
        		{
        		  "core": {
        		    "kr": "...",
        		    "en": "..."
        		  },
        		  "language": {
        		    "kr": "...",
        		    "en": "..."
        		  },
        		  "brandKeywords": {
        		    "kr": ["...", "..."],
        		    "en": ["...", "..."]
        		  },
        		  "copyExamples": {
        		    "kr": ["...", "..."],
        		    "en": ["...", "..."]
        		  }
        		}

        		브랜드명: %s
        		로고ID: %d
        		""".formatted(current.getBrandName(), current.getLogoId());


        String gptJson = gptClient.call(prompt);

        // 5) GPT JSON 파싱
        Map<String, Object> payload;
        try {
            // JSON 부분만 추출
            int start = gptJson.indexOf("{");
            int end = gptJson.lastIndexOf("}");

            if (start == -1 || end == -1 || start > end) {
                throw new IllegalStateException("GPT 응답에 JSON이 없습니다: " + gptJson);
            }

            String jsonOnly = gptJson.substring(start, end + 1);

            payload = objectMapper.readValue(
                    jsonOnly,
                    new TypeReference<Map<String, Object>>() {}
            );
        } catch (Exception e) {
            throw new IllegalStateException("GPT 응답 JSON 파싱 실패", e);
        }


        // 6) 저장용 VO 구성
        IdentityVO saveVO = new IdentityVO();
        saveVO.setBrandId(brandId);
        saveVO.setLogoId(current.getLogoId());
        saveVO.setBrandName(current.getBrandName());
        saveVO.setIdentityPayload(payload);
        saveVO.setLastLogoId(current.getLogoId());
        saveVO.setLastBrandName(current.getBrandName());

        // 7) INSERT or UPDATE
        if (current.getLastLogoId() == null && current.getLastBrandName() == null) {
            identityMapper.insert(saveVO);
        } else {
            identityMapper.update(saveVO);
        }

        return saveVO;
    }
}
