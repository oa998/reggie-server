package com.foundation.reggie.controller;

import com.foundation.reggie.model.MessageSample;
import com.foundation.reggie.model.Scenario;
import com.foundation.reggie.service.CloudStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class StorageController {
    private final CloudStorageService cloudStorageService;

    @PutMapping("/users/{userId}/scenarios")
    public Scenario upsertScenario(@PathVariable String userId, @RequestBody Scenario scenario) {
        return cloudStorageService.upsertScenario(userId, scenario);
    }

    @GetMapping("/users/{userId}/scenarios")
    public List<Scenario> getAllScenarios(@PathVariable String userId) {
        return cloudStorageService.getAllScenarios(userId);
    }

    @GetMapping("/users")
    public List<String> getAllUserIds() {
        return cloudStorageService.getAllUserIds();
    }

    @PutMapping("/message-samples")
    public MessageSample upsertMessageSample(@RequestBody MessageSample messageSample) {
        return cloudStorageService.upsertMessageSample(messageSample);
    }

    @GetMapping("/message-samples")
    public List<MessageSample> getAllMessageSamples() {
        return cloudStorageService.getAllMessageSamples();
    }

    @DeleteMapping("/users/{userId}/scenarios/{id}")
    public void deleteScenario(@PathVariable String userId, @PathVariable String id) {
        cloudStorageService.deleteScenario(userId, id);
    }

    @DeleteMapping("/message-samples/{messageId}")
    public void deleteMessageSample(@PathVariable String messageId) {
        cloudStorageService.deleteMessageSample(messageId);
    }
}
