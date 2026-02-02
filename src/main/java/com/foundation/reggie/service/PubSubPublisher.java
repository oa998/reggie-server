package com.foundation.reggie.service;

import tools.jackson.databind.ObjectMapper;
import com.foundation.reggie.exception.PublishException;
import com.google.api.core.ApiFuture;
import com.google.cloud.pubsub.v1.Publisher;
import com.google.protobuf.ByteString;
import com.google.pubsub.v1.PubsubMessage;
import com.google.pubsub.v1.TopicName;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class PubSubPublisher {
    private final String projectId;

    private final Map<String, Publisher> publishers = new ConcurrentHashMap<>();

    public PubSubPublisher(
            @Value("${gcp.project-id}") String projectId,
            ObjectMapper objectMapper) {
        this.projectId = projectId;
    }

    public String publish(String topic, String jsonMessage, Map<String, String> attributes) {
        try {
            Publisher publisher = getOrCreatePublisher(topic);

            PubsubMessage.Builder messageBuilder = PubsubMessage.newBuilder()
                    .setData(ByteString.copyFromUtf8(jsonMessage));

            if (attributes != null) {
                messageBuilder.putAllAttributes(attributes);
            }

            ApiFuture<String> future = publisher.publish(messageBuilder.build());
            return future.get();
        } catch (Exception e) {
            throw new PublishException("Failed to publish message to topic: " + topic, e);
        }
    }

    private Publisher getOrCreatePublisher(String topic) {
        return publishers.computeIfAbsent(topic, t -> {
            try {
                TopicName topicName = TopicName.of(projectId, t);
                return Publisher.newBuilder(topicName).build();
            } catch (Exception e) {
                throw new PublishException("Failed to create publisher for topic: " + t, e);
            }
        });
    }

    @PreDestroy
    public void shutdown() {
        publishers.values().forEach(publisher -> {
            try {
                publisher.shutdown();
                publisher.awaitTermination(30, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
    }
}
