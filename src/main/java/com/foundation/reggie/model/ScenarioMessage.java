package com.foundation.reggie.model;

import lombok.Data;

@Data
public class ScenarioMessage {
    private String id;
    private int column;  // 1-30
    private PubSubPayload payload;
}
