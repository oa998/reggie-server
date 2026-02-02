package com.foundation.reggie.exception;

public class MessageDeserializationException extends RuntimeException {
    public MessageDeserializationException(String className, Throwable cause) {
        super("Failed to deserialize message as " + className, cause);
    }
}
