package com.foundation.reggie.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Reggie API")
                        .description("Sidecar service for publishing messages to Google Cloud Pub/Sub")
                        .version("0.0.1"));
    }
}
