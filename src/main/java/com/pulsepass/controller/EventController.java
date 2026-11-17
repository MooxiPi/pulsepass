
package com.pulsepass.controller;

import com.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.dto.response.EventResponse;
import com.pulsepass.dto.response.EventSummaryResponse;
import com.pulsepass.service.EventService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // Crear un nuevo evento
    @PostMapping
    public ResponseEntity<EventResponse> create(
            @Valid @RequestBody CreateEventRequest request) {

        EventResponse response = eventService.create(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Consultar eventos publicados
    @GetMapping("/published")
    public ResponseEntity<List<EventSummaryResponse>> findPublishedEvents() {

        return ResponseEntity.ok(
                eventService.findPublishedEvents()
        );
    }

    // Buscar eventos por artista
    @GetMapping("/by-artist")
    public ResponseEntity<List<EventSummaryResponse>> findByArtist(
            @RequestParam String stageName) {

        return ResponseEntity.ok(
                eventService.findByArtist(stageName)
        );
    }

    // Consultar evento por código
    @GetMapping("/{eventCode}")
    public ResponseEntity<EventResponse> findByCode(
            @PathVariable String eventCode) {

        return ResponseEntity.ok(
                eventService.findByCode(eventCode)
        );
    }

    // Publicar un evento
    @PatchMapping("/{eventCode}/publish")
    public ResponseEntity<EventResponse> publish(
            @PathVariable String eventCode) {

        return ResponseEntity.ok(
                eventService.publish(eventCode)
        );
    }

    // Asociar un artista a un evento
    @PostMapping("/{eventCode}/artists/{artistId}")
    public ResponseEntity<EventResponse> addArtist(
            @PathVariable String eventCode,
            @PathVariable Long artistId) {

        return ResponseEntity.ok(
                eventService.addArtist(eventCode, artistId)
        );
    }
}
