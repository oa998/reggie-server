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

    @PutMapping("/scenarios")
    public Scenario upsertScenario(@RequestBody Scenario scenario) {
        return cloudStorageService.upsertScenario(scenario);
    }

    @GetMapping("/scenarios")
    public List<Scenario> getAllScenarios() {
        return cloudStorageService.getAllScenarios();
    }

    @PutMapping("/message-samples")
    public MessageSample upsertMessageSample(@RequestBody MessageSample messageSample) {
        return cloudStorageService.upsertMessageSample(messageSample);
    }

    @GetMapping("/message-samples")
    public List<MessageSample> getAllMessageSamples() {
        return cloudStorageService.getAllMessageSamples();
    }

    @DeleteMapping("/scenarios/{id}")
    public void deleteScenario(@PathVariable String id) {
        cloudStorageService.deleteScenario(id);
    }

    @DeleteMapping("/message-samples/{messageId}")
    public void deleteMessageSample(@PathVariable String messageId) {
        cloudStorageService.deleteMessageSample(messageId);
    }
}
