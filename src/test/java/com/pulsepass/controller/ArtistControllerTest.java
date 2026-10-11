package com.pulsepass.controller;

import com.pulsepass.dto.response.ArtistResponse;
import com.pulsepass.exception.GlobalExceptionHandler;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.service.ArtistService;
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

@WebMvcTest(ArtistController.class)
@Import(GlobalExceptionHandler.class)
class ArtistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ArtistService artistService;

    private ArtistResponse artist() {
        return new ArtistResponse(7L, "Solar Beat", "Colombia", "Electronic", true);
    }

    @Test
    void findById_existingArtist_returns200() throws Exception {
        when(artistService.findById(7L)).thenReturn(artist());

        mockMvc.perform(get("/api/artists/7"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.stageName").value("Solar Beat"));

        verify(artistService).findById(7L);
    }

    @Test
    void findById_missingArtist_returns404() throws Exception {
        when(artistService.findById(999L))
                .thenThrow(new ResourceNotFoundException("Artist not found: 999"));

        mockMvc.perform(get("/api/artists/999"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Artist not found: 999"));

        verify(artistService).findById(999L);
    }

    @Test
    void findByStageName_returns200() throws Exception {
        when(artistService.findByStageName("Solar Beat")).thenReturn(artist());

        mockMvc.perform(get("/api/artists/by-stage-name")
                        .param("stageName", "Solar Beat"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.stageName").value("Solar Beat"));

        verify(artistService).findByStageName("Solar Beat");
    }

    @Test
    void findActiveArtists_returns200() throws Exception {
        when(artistService.findActiveArtists()).thenReturn(List.of(artist()));

        mockMvc.perform(get("/api/artists/active"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].active").value(true))
                .andExpect(jsonPath("$[0].stageName").value("Solar Beat"));

        verify(artistService).findActiveArtists();
    }
}
