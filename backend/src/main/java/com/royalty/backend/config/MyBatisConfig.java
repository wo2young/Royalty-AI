package com.royalty.backend.config;

import org.mybatis.spring.boot.autoconfigure.ConfigurationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MyBatisConfig {
    @Bean
    public ConfigurationCustomizer mybatisConfigurationCustomizer() {
        return configuration -> {
            // 같은 패키지에 있으므로 간단히 등록 가능
            configuration.getTypeHandlerRegistry().register(VectorTypeHandler.class);
        };
    }
}