package com.foundation.reggie.controller;

import com.foundation.reggie.dto.PublishRequest;
import com.foundation.reggie.registry.MessageRegistry;
import com.foundation.reggie.service.PubSubPublisher;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.Arrays;
import java.util.Map;

import static java.util.stream.Collectors.toMap;

@RestController
@Tag(name = "Publish", description = "Pub/Sub message publishing API")
@RequiredArgsConstructor
public class PublishController {
    private final MessageRegistry messageRegistry;
    private final PubSubPublisher pubSubPublisher;
    private final ObjectMapper objectMapper;

    @Operation(summary = "Publish a message to Pub/Sub",
            description = "Deserializes the message into a registered class type and publishes to the specified topic")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Message published successfully",
                    content = @Content(schema = @Schema(implementation = PublishResponse.class))),
            @ApiResponse(responseCode = "400", description = "Unknown message type or deserialization error"),
            @ApiResponse(responseCode = "500", description = "Failed to publish to Pub/Sub")
    })
    @PostMapping("/publish")
    public ResponseEntity<Map<String, Object>> publish(@RequestBody PublishRequest request) {
        Object message = messageRegistry.deserialize(request.getClassName(), request.getMessage());
        String jsonMessage = objectMapper.writeValueAsString(message);
        JsonNode payload = objectMapper.readTree(jsonMessage);
        String messageId = pubSubPublisher.publish(request.getTopic(), jsonMessage, request.getAttributes());
        return ResponseEntity.ok(Map.of(
                "messageId", messageId,
                "payload", payload,
                message.getClass().getSimpleName(), Arrays.stream(message.getClass().getDeclaredFields())
                        .flatMap((f) -> Map.of(f.getName(), f.getType().getSimpleName()).entrySet().stream())
                        .collect(toMap(Map.Entry::getKey, Map.Entry::getValue))
        ));
    }

    @Schema(description = "Publish response")
    record PublishResponse(
            @Schema(description = "The Pub/Sub message ID", example = "1234567890")
            String messageId
    ) {
    }
}
