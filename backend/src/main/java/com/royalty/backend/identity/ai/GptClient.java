package com.royalty.backend.identity.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import jakarta.annotation.PostConstruct;


import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class GptClient {

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.url}")
    private String apiUrl;

    @Value("${openai.model}")
    private String model;
    
    @PostConstruct
    public void checkKey() {
        System.out.println("OPENAI KEY LOADED = " + apiKey.substring(0, 10));
    }

    private final RestTemplate restTemplate;

    public String call(String prompt) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = Map.of(
            "model", model,
            "messages", List.of(
                Map.of(
                    "role", "user",
                    "content", prompt
                )
            )
        );

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(body, headers);

        ResponseEntity<Map> response =
                restTemplate.postForEntity(apiUrl, request, Map.class);

        Map responseBody = response.getBody();
        if (responseBody == null) {
            throw new RuntimeException("OpenAI 응답이 null입니다.");
        }

        Map choice =
                (Map) ((List) responseBody.get("choices")).get(0);

        Map message =
                (Map) choice.get("message");

        return (String) message.get("content");
    }

}
