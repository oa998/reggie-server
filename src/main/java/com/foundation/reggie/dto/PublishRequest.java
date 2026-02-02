package com.foundation.reggie.dto;

import tools.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.Map;

@Data
@Schema(description = "Request to publish a message to Pub/Sub")
public class PublishRequest {
    @Schema(description = "Registered message class name", example = "OrderCreated", requiredMode = Schema.RequiredMode.REQUIRED)
    private String className;

    @Schema(description = "Pub/Sub topic name", example = "orders-topic", requiredMode = Schema.RequiredMode.REQUIRED)
    private String topic;

    @Schema(description = "Optional message attributes", example = "{\"key\": \"value\"}")
    private Map<String, String> attributes;

    @Schema(description = "Message payload (will be deserialized to className)",
            example = "{\"orderId\": \"123\", \"customerId\": \"456\", \"amount\": 99.99}",
            requiredMode = Schema.RequiredMode.REQUIRED)
    private JsonNode message;
}
