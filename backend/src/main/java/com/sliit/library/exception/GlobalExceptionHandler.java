package com.sliit.library.exception;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.sliit.library.dto.MessageResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<MessageResponse> handleRuntimeException(RuntimeException ex) {
        log.error("Runtime error: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(MessageResponse.builder()
                        .message(ex.getMessage())
                        .success(false)
                        .build());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<MessageResponse> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(MessageResponse.builder()
                        .message("Access denied: You don't have permission to perform this action")
                        .success(false)
                        .build());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<MessageResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        String combined = errors.entrySet().stream()
                .map(e -> e.getKey() + ": " + e.getValue())
                .collect(Collectors.joining("; "));
        log.warn("Validation failed: {}", combined);
        MessageResponse resp = MessageResponse.builder()
                .message("Please fix the following errors: " + combined)
                .success(false)
                .build();
        resp.setErrors(errors);
        return ResponseEntity.badRequest().body(resp);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<MessageResponse> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        String userMsg = "Invalid request format. Please check your input.";
        Throwable cause = ex.getMostSpecificCause();
        if (cause instanceof InvalidFormatException ife) {
            String field = ife.getPath().stream()
                    .map(JsonMappingException.Reference::getFieldName)
                    .reduce((a, b) -> b).orElse("field");
            String targetType = ife.getTargetType().getSimpleName();
            Object value = ife.getValue();
            userMsg = String.format("Invalid value '%s' for field '%s' (expected %s format).",
                    String.valueOf(value), field,
                    "LocalDate".equals(targetType) ? "YYYY-MM-DD date" :
                    "LocalTime".equals(targetType) ? "HH:MM time" : targetType);
        } else if (cause.getMessage() != null) {
            String cm = cause.getMessage();
            if (cm.contains("LocalDate") || cm.contains("date")) {
                userMsg = "Invalid date format. Please use YYYY-MM-DD (e.g., 2026-08-15).";
            } else if (cm.contains("LocalTime") || cm.contains("time")) {
                userMsg = "Invalid time format. Please use HH:MM (e.g., 14:30).";
            }
        }
        log.warn("HttpMessageNotReadable: {}", cause != null ? cause.getMessage() : ex.getMessage());
        return ResponseEntity.badRequest()
                .body(MessageResponse.builder()
                        .message(userMsg)
                        .success(false)
                        .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<MessageResponse> handleException(Exception ex) {
        log.error("Unexpected error: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(MessageResponse.builder()
                        .message("An unexpected error occurred. Please try again.")
                        .success(false)
                        .build());
    }
}
