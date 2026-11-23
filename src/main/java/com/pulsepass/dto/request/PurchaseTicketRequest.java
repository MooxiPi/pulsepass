package com.pulsepass.dto.request;

import com.pulsepass.domain.enums.TicketType;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PurchaseTicketRequest(

        @NotBlank(message = "User email is required")
        @Size(max = 200, message = "User email must be at most 200 characters")
        @Email(message = "Invalid email format")
        String userEmail,

        @NotBlank(message = "Event code is required")
        @Size(max = 80, message = "Event code must be at most 80 characters")
        String eventCode,

        @NotNull(message = "Ticket type is required")
        TicketType type

) {
}
