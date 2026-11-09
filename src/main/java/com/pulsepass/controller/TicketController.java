
package com.pulsepass.controller;

import com.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.dto.response.TicketResponse;
import com.pulsepass.service.TicketService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    // Comprar un ticket
    @PostMapping("/tickets")
    public ResponseEntity<TicketResponse> purchase(
            @Valid @RequestBody PurchaseTicketRequest request) {

        TicketResponse response = ticketService.purchase(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Consultar tickets de un usuario
    @GetMapping("/tickets/by-user")
    public ResponseEntity<List<TicketResponse>> findByUserEmail(
            @RequestParam String email) {

        return ResponseEntity.ok(
                ticketService.findByUserEmail(email)
        );
    }

    // Consultar ticket por código
    @GetMapping("/tickets/{ticketCode}")
    public ResponseEntity<TicketResponse> findByCode(
            @PathVariable String ticketCode) {

        return ResponseEntity.ok(
                ticketService.findByCode(ticketCode)
        );
    }

    // Consultar tickets pagados de un evento
    @GetMapping("/events/{eventCode}/tickets/paid")
    public ResponseEntity<List<TicketResponse>> findPaidTicketsByEvent(
            @PathVariable String eventCode) {

        return ResponseEntity.ok(
                ticketService.findPaidTicketsByEvent(eventCode)
        );
    }

    // Cancelar un ticket
    @PatchMapping("/tickets/{ticketCode}/cancel")
    public ResponseEntity<TicketResponse> cancel(
            @PathVariable String ticketCode) {

        return ResponseEntity.ok(
                ticketService.cancel(ticketCode)
        );
    }

    // Marcar ticket como usado
    @PatchMapping("/tickets/{ticketCode}/use")
    public ResponseEntity<TicketResponse> markAsUsed(
            @PathVariable String ticketCode) {

        return ResponseEntity.ok(
                ticketService.markAsUsed(ticketCode)
        );
    }
}
