# Reggie

A Spring Boot sidecar service that provides a REST API gateway for publishing messages to Google Cloud Pub/Sub, with Cloud Storage integration for persisting scenarios and message samples.

## Overview

Reggie accepts generic message payloads via REST API, deserializes them into registered message types, and publishes them to specified Pub/Sub topics with optional attributes.

## Quick Start

```bash
# Build
./gradlew build

# Run
./gradlew bootRun

# Run tests
./gradlew test
```

## Configuration

Set the GCP project ID and storage bucket via environment variables:

```bash
export GCP_PROJECT_ID=your-project-id
export GCP_STORAGE_BUCKET=your-bucket-name
```

Or configure in `application.properties`:

```properties
gcp.project-id=your-project-id
gcp.storage.bucket=your-bucket-name
```

## API

### POST /publish

Publish a message to a Pub/Sub topic.

**Request:**

```json
{
  "className": "OrderCreated",
  "topic": "orders-topic",
  "message": {
    "orderId": "123",
    "customerId": "456",
    "amount": 99.99
  },
  "attributes": {
    "key": "value"
  }
}
```

**Response (200 OK):**

```json
{
  "messageId": "1234567890",
  "payload": { ... }
}
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200  | Message published successfully |
| 400  | Unknown message type or deserialization error |
| 500  | Failed to publish to Pub/Sub |

### PUT /users/{userId}/scenarios

Upsert a scenario to Cloud Storage for a specific user.

**Request:**

```json
{
  "id": "scenario-1",
  "name": "Order Flow Test",
  "description": "Tests the complete order creation flow",
  "messages": [
    {
      "id": "msg-1",
      "column": 1,
      "payload": {
        "className": "OrderCreated",
        "topic": "orders-topic",
        "attributes": {},
        "message": { "orderId": "123" }
      }
    }
  ]
}
```

**Response (200 OK):** Returns the saved scenario.

### GET /users/{userId}/scenarios

Retrieve all scenarios for a specific user.

### DELETE /users/{userId}/scenarios/{id}

Delete a scenario by ID for a specific user.

### GET /users

List all user IDs that have scenarios stored.

### PUT /message-samples

Upsert a message sample to Cloud Storage.

**Request:**

```json
{
  "messageId": "sample-1",
  "className": "OrderCreated",
  "topic": "orders-topic",
  "attributes": { "env": "test" },
  "message": { "orderId": "123", "amount": 99.99 }
}
```

**Response (200 OK):** Returns the saved message sample.

### GET /message-samples

Retrieve all message samples from Cloud Storage.

### DELETE /message-samples/{messageId}

Delete a message sample by ID.

### GET /actuator/health

Health check endpoint (Spring Boot Actuator).

## Static Web UI

Place static files in `src/main/resources/static/` to serve a web UI at the root path `/`. The app forwards `/` to `index.html` for SPA support.

## Architecture

```
src/main/java/com/foundation/reggie/
├── ReggieApplication.java          # Entry point
├── controller/
│   ├── PublishController.java      # Pub/Sub publish endpoint
│   ├── StorageController.java      # Cloud Storage endpoints
│   └── StaticWebController.java    # Static UI routing
├── service/
│   ├── PubSubPublisher.java        # Pub/Sub publishing logic
│   └── CloudStorageService.java    # Cloud Storage operations
├── registry/
│   └── MessageRegistry.java        # Message type registration
├── config/
│   ├── MessageRegistryConfig.java  # Registry setup
│   ├── CloudStorageConfig.java     # Storage client config
│   ├── OpenApiConfig.java          # Swagger/OpenAPI config
│   └── StaticWebConfig.java        # Static resource handling
├── model/
│   ├── Scenario.java               # Scenario model
│   ├── ScenarioMessage.java        # Message within scenario
│   ├── PubSubPayload.java          # Pub/Sub payload model
│   └── MessageSample.java          # Message sample model
├── dto/
│   └── PublishRequest.java         # Request model
├── messages/
│   └── OrderCreated.java           # Example message type
└── exception/
    ├── GlobalExceptionHandler.java # Error handling
    └── StorageException.java       # Storage error type
```

### Key Components

- **MessageRegistry**: Manages registered message types for dynamic deserialization
- **PubSubPublisher**: Handles publisher pooling and message publishing with graceful shutdown
- **CloudStorageService**: Manages JSON blob storage for scenarios and message samples
- **GlobalExceptionHandler**: Provides consistent error responses

## Adding Message Types

Register new message types in `MessageRegistryConfig`:

```java
@Bean
public MessageRegistry messageRegistry(ObjectMapper objectMapper) {
    MessageRegistry registry = new MessageRegistry(objectMapper);
    registry.register("OrderCreated", OrderCreated.class);
    registry.register("YourNewMessage", YourNewMessage.class);
    return registry;
}
```

## Tech Stack

- Java 21
- Spring Boot 4.0.2
- Spring Boot Actuator (health endpoints)
- Google Cloud Pub/Sub (v26.72.0 BOM)
- Google Cloud Storage (v26.72.0 BOM)
- Gradle 9.3.0

## Cloud Storage Structure

Scenarios are stored per-user, message samples are global:

```
bucket/
├── {userId}/
│   └── scenarios/
│       ├── {scenarioId}.json
│       └── ...
└── message-samples/
    ├── {messageId}.json
    └── ...
```
