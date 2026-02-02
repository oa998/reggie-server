package com.foundation.reggie.exception;

public class UnknownMessageTypeException extends RuntimeException {
    public UnknownMessageTypeException(String className) {
        super("Unknown message type: " + className);
    }
}
