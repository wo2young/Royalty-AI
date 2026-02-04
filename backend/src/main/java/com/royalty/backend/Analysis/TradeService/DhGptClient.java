package com.royalty.backend.Analysis.TradeService;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class DhGptClient {

    private final RestTemplate restTemplate = new RestTemplate(); // 빈으로 등록되어 있다면 주입받는 것을 권장
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${OPENAI_API_KEY}") // application.properties에서 키 주입
    private String apiKey;

    private final String GPT_URL = "https://api.openai.com/v1/chat/completions";

    public Map<String, Object> getAnalysisReport(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-4-turbo-preview");
            requestBody.put("messages", List.of(
                Map.of("role", "system", "content", 
                    "너는 상표권 전문 변리사야. " +
                    "모든 분석 내용은 한국어로 작성해줘. " +
                    "반드시 응답은 **json** 형식으로 출력해야 해.") // [핵심] 'json' 단어를 명시적으로 추가
                , Map.of("role", "user", "content", prompt)
            ));
            
            // 이 설정이 켜져 있으면 위 messages에 반드시 'json' 글자가 있어야 합니다.
            requestBody.put("response_format", Map.of("type", "json_object"));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // 통신 수행
            Map<String, Object> response = restTemplate.postForObject(GPT_URL, entity, Map.class);

            // 응답 파싱
            if (response == null || !response.containsKey("choices")) {
                throw new RuntimeException("GPT 응답이 비어있습니다.");
            }
            
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            String jsonContent = (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");
            
            return objectMapper.readValue(jsonContent, Map.class);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("GPT 분석 요청 중 오류 발생: " + e.getMessage());
        }
    }
}
