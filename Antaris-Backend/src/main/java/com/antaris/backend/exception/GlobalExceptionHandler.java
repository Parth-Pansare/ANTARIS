package com.antaris.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ============================================================
    // RESOURCE / HTTP STATUS ERRORS
    // ============================================================

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(
            ResponseStatusException exception
    ) {

        HttpStatus status =
                HttpStatus.valueOf(
                        exception.getStatusCode().value()
                );

        String message =
                exception.getReason() != null
                        ? exception.getReason()
                        : status.getReasonPhrase();

        return buildResponse(
                status,
                status.getReasonPhrase(),
                message
        );
    }

    // ============================================================
    // CLIENT VALIDATION ERRORS
    // ============================================================

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(
            IllegalArgumentException exception
    ) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "Bad Request",
                exception.getMessage()
        );
    }

    // ============================================================
    // ML PROVIDER ERRORS
    // ============================================================

    @ExceptionHandler(MlProviderException.class)
    public ResponseEntity<Map<String, Object>> handleMlProviderException(
            MlProviderException exception
    ) {

        return buildResponse(
                HttpStatus.BAD_GATEWAY,
                "ML Provider Error",
                exception.getMessage()
        );
    }

    // ============================================================
    // APPLICATION STATE ERRORS
    // ============================================================

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(
            IllegalStateException exception
    ) {

        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Application State Error",
                exception.getMessage()
        );
    }

    // ============================================================
    // INVALID JSON REQUEST
    // ============================================================

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidJson(
            HttpMessageNotReadableException exception
    ) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "Invalid Request Body",
                "Request body is missing or contains invalid JSON"
        );
    }

    // ============================================================
    // UNEXPECTED RUNTIME ERRORS
    // ============================================================

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException exception
    ) {

        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal Server Error",
                "An unexpected server error occurred"
        );
    }

    // ============================================================
    // UNEXPECTED ERRORS
    // ============================================================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(
            Exception exception
    ) {

        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal Server Error",
                "An unexpected server error occurred"
        );
    }

    // ============================================================
    // COMMON RESPONSE BUILDER
    // ============================================================

    private ResponseEntity<Map<String, Object>> buildResponse(
            HttpStatus status,
            String error,
            String message
    ) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "timestamp",
                LocalDateTime.now()
        );

        response.put(
                "status",
                status.value()
        );

        response.put(
                "error",
                error
        );

        response.put(
                "message",
                message
        );

        return ResponseEntity
                .status(status)
                .body(response);
    }
}