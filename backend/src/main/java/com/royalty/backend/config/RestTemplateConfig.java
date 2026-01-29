package com.royalty.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * 공용 HTTP 클라이언트 설정 클래스
 * - Spring Boot는 RestTemplate을 자동으로 Bean 등록해주지 않는다.
 * - GptClient에서 생성자 주입(DI) 방식으로 RestTemplate을 사용하기 때문에
 *   반드시 Spring 컨테이너에 Bean으로 등록되어 있어야 한다.
 */
@Configuration
public class RestTemplateConfig {

    /**
     * RestTemplate Bean 등록
     *
     * - GptClient, 외부 API 호출 클래스 등에서
     *   생성자 주입으로 사용된다.
     * - 하나의 인스턴스를 공용으로 관리함으로써
     *   설정 통합 및 유지보수가 쉬워진다.
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
