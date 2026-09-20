package com.antaris.backend.exception;

public class MlProviderException extends RuntimeException {

    public MlProviderException(String message) {
        super(message);
    }

    public MlProviderException(String message, Throwable cause) {
        super(message, cause);
    }
}