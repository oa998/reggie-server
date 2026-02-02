package com.foundation.reggie.registry;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.foundation.reggie.exception.MessageDeserializationException;
import com.foundation.reggie.exception.UnknownMessageTypeException;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
public class MessageRegistry {
    private final Map<String, Class<?>> registry = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public MessageRegistry(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void register(String name, Class<?> clazz) {
        registry.put(name, clazz);
    }

    public Optional<Class<?>> getClass(String name) {
        return Optional.ofNullable(registry.get(name));
    }

    public Object deserialize(String name, JsonNode node) {
        log.info("a\n\n{}",node);
        Class<?> clazz = registry.get(name);
        if (clazz == null) {
            throw new UnknownMessageTypeException(name);
        }
        try {
            return objectMapper.treeToValue(node, clazz);
        } catch (Exception e) {
            throw new MessageDeserializationException(name, e);
        }
    }
}
