package com.foundation.reggie.service;

import tools.jackson.databind.ObjectMapper;
import com.foundation.reggie.exception.StorageException;
import com.foundation.reggie.model.MessageSample;
import com.foundation.reggie.model.Scenario;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class CloudStorageService {

    private static final String SCENARIOS_SUFFIX = "/scenarios/";
    private static final String MESSAGE_SAMPLES_PREFIX = "message-samples/";
    private static final String JSON_CONTENT_TYPE = "application/json";

    private final Storage storage;
    private final String bucketName;
    private final ObjectMapper objectMapper;

    public CloudStorageService(
            Storage storage,
            @Qualifier("storageBucketName") String bucketName,
            ObjectMapper objectMapper) {
        this.storage = storage;
        this.bucketName = bucketName;
        this.objectMapper = objectMapper;
    }

    public Scenario upsertScenario(String userId, Scenario scenario) {
        String blobName = userId + SCENARIOS_SUFFIX + scenario.getId() + ".json";
        writeJson(blobName, scenario);
        return scenario;
    }

    public List<Scenario> getAllScenarios(String userId) {
        return readAllFromPrefix(userId + SCENARIOS_SUFFIX, Scenario.class);
    }

    public List<String> getAllUserIds() {
        List<String> userIds = new ArrayList<>();
        try {
            var page = storage.list(bucketName, Storage.BlobListOption.delimiter("/"));
            for (Blob blob : page.iterateAll()) {
                String name = blob.getName();
                // Skip message-samples directory
                if (name.endsWith("/") && !name.startsWith("message-samples")) {
                    userIds.add(name.substring(0, name.length() - 1));
                }
            }
        } catch (Exception e) {
            throw new StorageException("Failed to list user IDs from Cloud Storage", e);
        }
        return userIds;
    }

    public MessageSample upsertMessageSample(MessageSample messageSample) {
        String blobName = MESSAGE_SAMPLES_PREFIX + messageSample.getMessageId() + ".json";
        writeJson(blobName, messageSample);
        return messageSample;
    }

    public List<MessageSample> getAllMessageSamples() {
        return readAllFromPrefix(MESSAGE_SAMPLES_PREFIX, MessageSample.class);
    }

    public void deleteScenario(String userId, String id) {
        String blobName = userId + SCENARIOS_SUFFIX + id + ".json";
        deleteBlob(blobName);
    }

    public void deleteMessageSample(String messageId) {
        String blobName = MESSAGE_SAMPLES_PREFIX + messageId + ".json";
        deleteBlob(blobName);
    }

    private void deleteBlob(String blobName) {
        try {
            BlobId blobId = BlobId.of(bucketName, blobName);
            boolean deleted = storage.delete(blobId);
            if (!deleted) {
                throw new StorageException("Blob not found: " + blobName, null);
            }
        } catch (StorageException e) {
            throw e;
        } catch (Exception e) {
            throw new StorageException("Failed to delete from Cloud Storage: " + blobName, e);
        }
    }

    private void writeJson(String blobName, Object obj) {
        try {
            String json = objectMapper.writeValueAsString(obj);
            BlobId blobId = BlobId.of(bucketName, blobName);
            BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                    .setContentType(JSON_CONTENT_TYPE)
                    .build();
            storage.create(blobInfo, json.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new StorageException("Failed to write to Cloud Storage: " + blobName, e);
        }
    }

    private <T> List<T> readAllFromPrefix(String prefix, Class<T> type) {
        List<T> results = new ArrayList<>();
        try {
            Iterable<Blob> blobs = storage.list(bucketName, Storage.BlobListOption.prefix(prefix)).iterateAll();
            for (Blob blob : blobs) {
                if (blob.getName().endsWith(".json")) {
                    byte[] content = blob.getContent();
                    T obj = objectMapper.readValue(content, type);
                    results.add(obj);
                }
            }
        } catch (Exception e) {
            throw new StorageException("Failed to read from Cloud Storage with prefix: " + prefix, e);
        }
        return results;
    }
}
