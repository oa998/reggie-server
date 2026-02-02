package com.foundation.reggie.config;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;
import com.foundation.reggie.message.OrderCreated;
import com.foundation.reggie.registry.MessageRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MessageRegistryConfig {

    @Bean
    public ObjectMapper objectMapper() {
        return JsonMapper.builder().build();
    }

    @Bean
    public MessageRegistry messageRegistry(ObjectMapper objectMapper) {
        MessageRegistry registry = new MessageRegistry(objectMapper);
        registry.register("OrderCreated", OrderCreated.class);
        return registry;
    }
}
