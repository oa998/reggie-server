package com.foundation.reggie.model;

import com.foundation.reggie.dto.PublishRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;
import tools.jackson.databind.JsonNode;

import java.util.Map;

@Data
@EqualsAndHashCode(callSuper = true)
public class MessageSample extends PublishRequest {
    private String messageId;
}
