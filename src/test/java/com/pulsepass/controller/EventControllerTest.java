package com.pulsepass.controller;

import com.pulsepass.domain.enums.EventCategory;
import com.pulsepass.domain.enums.EventStatus;
import com.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.dto.response.ArtistResponse;
import com.pulsepass.dto.response.EventResponse;
import com.pulsepass.dto.response.EventSummaryResponse;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.GlobalExceptionHandler;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.service.EventService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EventController.class)
@Import({GlobalExceptionHandler.class, com.pulsepass.security.SecurityConfig.class,
    com.pulsepass.security.SecurityErrorWriter.class})
@org.springframework.security.test.context.support.WithMockUser(roles={"USER","STAFF","ADMIN"})
class EventControllerTest {

    @MockitoBean private com.pulsepass.security.JwtService jwtService;
    @MockitoBean private com.pulsepass.security.CustomUserDetailsService userDetailsService;
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EventService eventService;

    private static final LocalDateTime DATE = LocalDateTime.of(2026, 12, 15, 19, 0);

    private EventResponse event(EventStatus status) {
        return new EventResponse(
                1L, "CMF-2026", "Caribbean Music Fest 2026",
                "Concierto", EventCategory.MUSIC, status, DATE, 18,
                "VEN-SMR-01", "Marina Convention Center", List.of()
        );
    }

    private EventSummaryResponse summary() {
        return new EventSummaryResponse(
                1L, "CMF-2026", "Caribbean Music Fest 2026",
                EventCategory.MUSIC, EventStatus.PUBLISHED, DATE,
                "Marina Convention Center"
        );
    }

    @Test
    void create_validRequest_returns201() throws Exception {
        when(eventService.create(any(CreateEventRequest.class)))
                .thenReturn(event(EventStatus.DRAFT));

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "eventCode": "CMF-2026",
                              "name": "Caribbean Music Fest 2026",
                              "description": "Concierto",
                              "category": "MUSIC",
                              "eventDate": "2026-12-15T19:00:00",
                              "minimumAge": 18,
                              "venueCode": "VEN-SMR-01"
                            }
                            """))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.eventCode").value("CMF-2026"))
                .andExpect(jsonPath("$.status").value("DRAFT"));

        verify(eventService).create(new CreateEventRequest(
                "CMF-2026", "Caribbean Music Fest 2026", "Concierto",
                EventCategory.MUSIC, DATE, 18, "VEN-SMR-01"));
    }

    @Test
    void create_invalidRequest_returns400_withoutCallingService() throws Exception {
        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "eventCode": "",
                              "name": "",
                              "category": "MUSIC",
                              "eventDate": "2026-12-15T19:00:00",
                              "minimumAge": -1,
                              "venueCode": ""
                            }
                            """))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.details.eventCode").exists())
                .andExpect(jsonPath("$.details.minimumAge").exists());

        verifyNoInteractions(eventService);
    }

    @Test
    void findByCode_existingEvent_returns200() throws Exception {
        when(eventService.findByCode("CMF-2026"))
                .thenReturn(event(EventStatus.DRAFT));

        mockMvc.perform(get("/api/events/CMF-2026"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name").value("Caribbean Music Fest 2026"));

        verify(eventService).findByCode("CMF-2026");
    }

    @Test
    void findByCode_missingEvent_returns404() throws Exception {
        when(eventService.findByCode("NOT-FOUND"))
                .thenThrow(new ResourceNotFoundException("Event not found: NOT-FOUND"));

        mockMvc.perform(get("/api/events/NOT-FOUND"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Event not found: NOT-FOUND"));

        verify(eventService).findByCode("NOT-FOUND");
    }

    @Test
    void findPublishedEvents_returns200() throws Exception {
        when(eventService.findPublishedEvents()).thenReturn(List.of(summary()));

        mockMvc.perform(get("/api/events/published"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].eventCode").value("CMF-2026"))
                .andExpect(jsonPath("$[0].status").value("PUBLISHED"));

        verify(eventService).findPublishedEvents();
    }

    @Test
    void publish_validTransition_returns200() throws Exception {
        when(eventService.publish("CMF-2026"))
                .thenReturn(event(EventStatus.PUBLISHED));

        mockMvc.perform(patch("/api/events/CMF-2026/publish"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("PUBLISHED"));

        verify(eventService).publish("CMF-2026");
    }

    @Test
    void publish_invalidTransition_returns409() throws Exception {
        when(eventService.publish("CMF-2026"))
                .thenThrow(new BusinessRuleException("Only DRAFT events can be published."));

        mockMvc.perform(patch("/api/events/CMF-2026/publish"))
                .andExpect(status().isConflict())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"));

        verify(eventService).publish("CMF-2026");
    }

    @Test
    void addArtist_returns200() throws Exception {
        ArtistResponse artist = new ArtistResponse(7L, "Solar Beat", "Colombia", "Electronic", true);
        EventResponse eventWithArtist = new EventResponse(
                1L, "CMF-2026", "Caribbean Music Fest 2026",
                "Concierto", EventCategory.MUSIC, EventStatus.DRAFT, DATE,
                18, "VEN-SMR-01", "Marina Convention Center", List.of(artist));
        when(eventService.addArtist("CMF-2026", 7L)).thenReturn(eventWithArtist);

        mockMvc.perform(post("/api/events/CMF-2026/artists/7"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.artists[0].stageName").value("Solar Beat"));

        verify(eventService).addArtist("CMF-2026", 7L);
    }

    @Test
    void findByArtist_returns200() throws Exception {
        when(eventService.findByArtist("Solar Beat")).thenReturn(List.of(summary()));

        mockMvc.perform(get("/api/events/by-artist")
                        .param("stageName", "Solar Beat"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].eventCode").value("CMF-2026"));

        verify(eventService).findByArtist("Solar Beat");
    }
}
