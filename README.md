# Reggie

A Spring Boot sidecar service that provides a REST API gateway for publishing messages to Google Cloud Pub/Sub.

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

Set the GCP project ID via environment variable:

```bash
export GCP_PROJECT_ID=your-project-id
```

Or configure in `application.properties`:

```properties
gcp.project-id=your-project-id
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

## Architecture

```
src/main/java/com/foundation/reggie/
├── ReggieApplication.java          # Entry point
├── controller/
│   └── PublishController.java      # REST endpoint
├── service/
│   └── PubSubPublisher.java        # Pub/Sub publishing logic
├── registry/
│   └── MessageRegistry.java        # Message type registration
├── config/
│   ├── MessageRegistryConfig.java  # Registry setup
│   └── OpenApiConfig.java          # Swagger/OpenAPI config
├── dto/
│   └── PublishRequest.java         # Request model
├── messages/
│   └── OrderCreated.java           # Example message type
└── exception/
    └── GlobalExceptionHandler.java # Error handling
```

### Key Components

- **MessageRegistry**: Manages registered message types for dynamic deserialization
- **PubSubPublisher**: Handles publisher pooling and message publishing with graceful shutdown
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
- Google Cloud Pub/Sub (v26.72.0 BOM)
- Gradle 9.3.0
