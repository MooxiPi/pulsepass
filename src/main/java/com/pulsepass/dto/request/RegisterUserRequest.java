package com.pulsepass.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.pulsepass.security.PasswordPolicy;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Los límites de {@code @Size} coinciden con las columnas de V1 (users, user_profiles):
 * un valor más largo se rechaza con 400 antes de llegar a la base de datos.
 */
public record RegisterUserRequest(

        @NotBlank(message = "Username is required")
        @Size(max = 80, message = "Username must be at most 80 characters")
        @Pattern(regexp = "[^@]*", message = "Username must not contain @")
        String username,

        @NotBlank(message = "Email is required")
        @Size(max = 200, message = "Email must be at most 200 characters")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "First name is required")
        @Size(max = 100, message = "First name must be at most 100 characters")
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(max = 100, message = "Last name must be at most 100 characters")
        String lastName,

        @Size(max = 30, message = "Phone must be at most 30 characters")
        String phone,

        @Size(max = 100, message = "City must be at most 100 characters")
        String city,

        @NotNull(message = "Birth date is required")
        LocalDate birthDate,

        @NotBlank(message = "Password is required")
        String password

) {

    @AssertTrue(message = "Password must contain at least 12 characters and at most 72 UTF-8 bytes")
    @JsonIgnore
    public boolean isPasswordValid() {
        return PasswordPolicy.valid(password);
    }

    @Override
    public String toString() {
        return "RegisterUserRequest[redacted]";
    }
}
