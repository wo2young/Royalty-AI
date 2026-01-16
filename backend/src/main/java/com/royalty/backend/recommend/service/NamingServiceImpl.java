package com.royalty.backend.recommend.service;

import com.royalty.backend.recommend.ai.GptClient;
import com.royalty.backend.recommend.dto.NamingDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NamingServiceImpl implements NamingService {

    private final GptClient gptClient;

    @Override
    public NamingDTO recommend(NamingDTO request) {

        if (request.getKeywords() == null || request.getKeywords().isEmpty()) {
            throw new IllegalArgumentException("keywords는 필수입니다.");
        }

        // 1. 프롬프트 생성
        String prompt = buildPrompt(request.getKeywords());

        // 2. GPT 호출
        String gptResponse = gptClient.call(prompt);

        // 3. 결과 세팅 (임시: 줄 단위 파싱)
        NamingDTO response = new NamingDTO();
        response.setKeywords(request.getKeywords());
        response.setNames(parseNames(gptResponse));

        return response;
    }

    private String buildPrompt(List<String> keywords) {
        return """
            너는 브랜드 네이밍 전문가다.

            아래 키워드를 기반으로
            브랜드 이름 후보를 5~10개 추천해라.

            규칙:
            1. 한 줄에 하나의 이름만 출력
            2. 번호, 기호, 설명 없이 이름만 출력
            3. 한국어 또는 감각적인 영문 이름 허용

            키워드:
            %s
            """.formatted(String.join(", ", keywords));
    }

    private List<String> parseNames(String gptResponse) {
        return gptResponse.lines()
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
    }
}
