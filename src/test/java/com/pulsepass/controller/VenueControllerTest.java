
package com.pulsepass.controller;

import com.pulsepass.dto.response.VenueResponse;
import com.pulsepass.exception.GlobalExceptionHandler;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.service.VenueService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(VenueController.class)
@Import({GlobalExceptionHandler.class, com.pulsepass.security.SecurityConfig.class,
    com.pulsepass.security.SecurityErrorWriter.class})
@org.springframework.security.test.context.support.WithMockUser(roles={"USER","STAFF","ADMIN"})
class VenueControllerTest {

    @MockitoBean private com.pulsepass.security.JwtService jwtService;
    @MockitoBean private com.pulsepass.security.CustomUserDetailsService userDetailsService;
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private VenueService venueService;


    @Test
    void findByCode_whenVenueExists_returns200() throws Exception {

        VenueResponse venue = new VenueResponse(
                1L,
                "VEN-SMR-01",
                "Marina Convention Center",
                "Santa Marta",
                "Santa Marta, Colombia",
                3,
                true
        );

        when(venueService.findByCode("VEN-SMR-01"))
                .thenReturn(venue);

        mockMvc.perform(get("/api/venues/VEN-SMR-01"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.code").value("VEN-SMR-01"))
                .andExpect(jsonPath("$.name")
                        .value("Marina Convention Center"))
                .andExpect(jsonPath("$.city").value("Santa Marta"))
                .andExpect(jsonPath("$.capacity").value(3))
                .andExpect(jsonPath("$.active").value(true));

        verify(venueService).findByCode("VEN-SMR-01");
    }


    @Test
    void findByCode_whenVenueDoesNotExist_returns404() throws Exception {

        when(venueService.findByCode("NOT-FOUND"))
                .thenThrow(new ResourceNotFoundException(
                        "Venue not found: NOT-FOUND"));

        mockMvc.perform(get("/api/venues/NOT-FOUND"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message")
                        .value("Venue not found: NOT-FOUND"));

        verify(venueService).findByCode("NOT-FOUND");
    }

    @Test
    void findActiveVenues_returns200() throws Exception {

        when(venueService.findActiveVenues())
                .thenReturn(List.of());

        mockMvc.perform(get("/api/venues/active"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(0));

        verify(venueService).findActiveVenues();
    }
}
