package com.pulsepass.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(

        @NotBlank(message = "Identifier is required")
        @Size(max = 200, message = "Identifier must be at most 200 characters")
        String identifier,

        @NotBlank(message = "Password is required")
        @Size(max = 200, message = "Password must be at most 200 characters")
        String password

) {

    @Override
    public String toString() {
        return "LoginRequest[redacted]";
    }
}
