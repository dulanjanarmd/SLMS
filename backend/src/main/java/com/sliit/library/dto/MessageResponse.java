package com.sliit.library.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {

    private String message;
    private Boolean success;
    private Map<String, String> errors;

    public MessageResponse(String message) {
        this.message = message;
        this.success = true;
    }
}
