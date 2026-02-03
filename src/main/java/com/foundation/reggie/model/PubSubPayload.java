package com.foundation.reggie.model;

import lombok.Data;

import java.util.Map;

@Data
public class PubSubPayload {
    private String className;
    private String topic;
    private Map<String, String> attributes;
    private Map<String, Object> message;
}
