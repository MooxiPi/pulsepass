
package com.pulsepass.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record RegisterUserRequest(

        @NotBlank(message = "Username is required")
        @Pattern(regexp = "[^@]+", message = "Username must not contain @")
        String username,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "First name is required")
        String firstName,

        @NotBlank(message = "Last name is required")
        String lastName,

        String phone,

        String city,

        @NotNull(message = "Birth date is required")
        LocalDate birthDate,

        @NotBlank String password

) {
    @jakarta.validation.constraints.AssertTrue(message = "Password must contain at least 12 characters and at most 72 UTF-8 bytes")
    @com.fasterxml.jackson.annotation.JsonIgnore
    public boolean isPasswordValid() { return com.pulsepass.security.PasswordPolicy.valid(password); }
    @Override public String toString() { return "RegisterUserRequest[redacted]"; }
}
