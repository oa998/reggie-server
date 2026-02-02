# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reggie is a Spring Boot sidecar service written in Java 21. It integrates with Google Cloud Pub/Sub for message streaming.

## Build Commands

```bash
./gradlew build          # Full build
./gradlew test           # Run tests
./gradlew bootRun        # Run the application
./gradlew clean          # Clean build directory
```

## Tech Stack

- Java 21 with Spring Boot 4.0.2
- Spring Web MVC for REST APIs
- Google Cloud Pub/Sub (v26.72.0 BOM)
- Lombok for reducing boilerplate
- JUnit 5 for testing
- Gradle 9.3.0 (via wrapper)

## Architecture

- **Entry point**: `src/main/java/com/foundation/reggie/ReggieApplication.java`
- **Package**: `com.foundation.reggie`
- **Configuration**: `src/main/resources/application.properties`
- Standard Spring Boot layered architecture with `static/` and `templates/` directories for web content
