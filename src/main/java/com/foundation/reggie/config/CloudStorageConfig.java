package com.foundation.reggie.config;

import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudStorageConfig {

    @Bean
    public Storage storage(@Value("${gcp.project-id}") String projectId) {
        return StorageOptions.newBuilder()
                .setProjectId(projectId)
                .build()
                .getService();
    }

    @Bean("storageBucketName")
    public String bucketName(@Value("${gcp.storage.bucket}") String bucketName) {
        return bucketName;
    }
}
