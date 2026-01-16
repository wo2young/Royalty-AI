package com.royalty.backend.recommend.service;

import com.royalty.backend.recommend.dto.StyleGuideDTO;
import com.royalty.backend.recommend.ai.GptClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StyleGuideServiceImpl implements StyleGuideService {

    private final GptClient gptClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public StyleGuideDTO generateStyleGuide(StyleGuideDTO request) {

        if (request.getLogoImage() == null || request.getLogoImage().isBlank()) {
            throw new IllegalArgumentException("logoImage는 필수입니다.");
        }

        String prompt = buildPrompt(request.getLogoImage());
        String gptResponse = gptClient.call(prompt);

        try {
            String cleaned = gptResponse.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("```json|```", "").trim();
            }
            return objectMapper.readValue(cleaned, StyleGuideDTO.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse GPT style-guide response", e);
        }
    }

    /**
     * 브랜드 스타일 가이드용 GPT 프롬프트
     */
    private String buildPrompt(String logoImage) {
    	return """
    		    너는 전문 브랜드 디자이너다.

    		    제공된 브랜드 로고 이미지를 분석해서
    		    브랜드 컬러 스타일 가이드를 생성해라.

    		    반드시 아래 규칙을 지켜라:

    		    1. 응답은 JSON만 반환할 것
    		    2. JSON 외의 설명, 문장, 마크다운을 절대 포함하지 말 것
    		    3. mainColors는 정확히 3개
    		    4. subColors는 정확히 2개
    		    5. description은 반드시 자연스러운 한국어 한 문장일 것

    		    각 컬러는 아래 정보를 포함해야 한다:
    		    - hex (예: "#1A73E8")
    		    - rgb 객체 (r, g, b는 0~255 정수)

    		    JSON 형식:
    		    {
    		      "mainColors": [
    		        { "hex": "#000000", "rgb": { "r": 0, "g": 0, "b": 0 } }
    		      ],
    		      "subColors": [
    		        { "hex": "#FFFFFF", "rgb": { "r": 255, "g": 255, "b": 255 } }
    		      ],
    		      "description": "브랜드 컬러 조합에 대한 한국어 설명 한 문장"
    		    }

    		    로고 이미지:
    		    %s
    		    """.formatted(logoImage);
    }
}
