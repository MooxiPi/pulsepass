package com.pulsepass.controller;

import com.pulsepass.domain.enums.TicketStatus;
import com.pulsepass.domain.enums.TicketType;
import com.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.dto.response.TicketResponse;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.GlobalExceptionHandler;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.service.TicketService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TicketController.class)
@Import({GlobalExceptionHandler.class, com.pulsepass.security.SecurityConfig.class,
    com.pulsepass.security.SecurityErrorWriter.class})
@org.springframework.security.test.context.support.WithMockUser(roles={"USER","STAFF","ADMIN"})
class TicketControllerTest {

    @MockitoBean private com.pulsepass.security.JwtService jwtService;
    @MockitoBean private com.pulsepass.security.CustomUserDetailsService userDetailsService;
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TicketService ticketService;

    private static final String VALID_REQUEST = """
            {
              "userEmail": "carlos@example.com",
              "eventCode": "CMF-2026",
              "type": "VIP"
            }
            """;

    private TicketResponse ticket(TicketStatus status) {
        return new TicketResponse(
                3L, "TCK-0001", TicketType.VIP,
                new BigDecimal("250000.00"), status,
                LocalDateTime.of(2026, 10, 11, 12, 0),
                "carlos@example.com", "CMF-2026", "Caribbean Music Fest 2026"
        );
    }

    @Test
    void purchase_validRequest_returns201() throws Exception {
        when(ticketService.purchase(any(PurchaseTicketRequest.class)))
                .thenReturn(ticket(TicketStatus.PAID));

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_REQUEST))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.ticketCode").value("TCK-0001"))
                .andExpect(jsonPath("$.status").value("PAID"));

        verify(ticketService).purchase(new PurchaseTicketRequest(
                "carlos@example.com", "CMF-2026", TicketType.VIP));
    }

    @Test
    void purchase_invalidRequest_returns400_withoutCallingService() throws Exception {
        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"userEmail":"correo-invalido","eventCode":"","type":null}
                            """))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.details.userEmail").exists())
                .andExpect(jsonPath("$.details.type").exists());

        verifyNoInteractions(ticketService);
    }

    @Test
    void purchase_missingUser_returns404() throws Exception {
        when(ticketService.purchase(any(PurchaseTicketRequest.class)))
                .thenThrow(new ResourceNotFoundException("User not found: carlos@example.com"));

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_REQUEST))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("User not found: carlos@example.com"));

        verify(ticketService).purchase(any(PurchaseTicketRequest.class));
    }

    @Test
    void purchase_businessRuleViolation_returns409() throws Exception {
        when(ticketService.purchase(any(PurchaseTicketRequest.class)))
                .thenThrow(new BusinessRuleException("User does not meet minimum age."));

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_REQUEST))
                .andExpect(status().isConflict())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"));

        verify(ticketService).purchase(any(PurchaseTicketRequest.class));
    }

    @Test
    void findByCode_returns200() throws Exception {
        when(ticketService.findByCode("TCK-0001"))
                .thenReturn(ticket(TicketStatus.PAID));

        mockMvc.perform(get("/api/tickets/TCK-0001"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.ticketCode").value("TCK-0001"));

        verify(ticketService).findByCode("TCK-0001");
    }

    @Test
    void findByUserEmail_returns200() throws Exception {
        when(ticketService.findByUserEmail("carlos@example.com"))
                .thenReturn(List.of(ticket(TicketStatus.PAID)));

        mockMvc.perform(get("/api/tickets/by-user")
                        .param("email", "carlos@example.com"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].userEmail").value("carlos@example.com"));

        verify(ticketService).findByUserEmail("carlos@example.com");
    }

    @Test
    void findPaidTicketsByEvent_returns200() throws Exception {
        when(ticketService.findPaidTicketsByEvent("CMF-2026"))
                .thenReturn(List.of(ticket(TicketStatus.PAID)));

        mockMvc.perform(get("/api/events/CMF-2026/tickets/paid"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].status").value("PAID"));

        verify(ticketService).findPaidTicketsByEvent("CMF-2026");
    }

    @Test
    void cancel_paidTicket_returns200() throws Exception {
        when(ticketService.cancel("TCK-0001"))
                .thenReturn(ticket(TicketStatus.CANCELLED));

        mockMvc.perform(patch("/api/tickets/TCK-0001/cancel"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        verify(ticketService).cancel("TCK-0001");
    }

    @Test
    void cancel_usedTicket_returns409() throws Exception {
        when(ticketService.cancel("TCK-0001"))
                .thenThrow(new BusinessRuleException("Only PAID tickets can be cancelled."));

        mockMvc.perform(patch("/api/tickets/TCK-0001/cancel"))
                .andExpect(status().isConflict())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(409));

        verify(ticketService).cancel("TCK-0001");
    }

    @Test
    void markAsUsed_paidTicket_returns200() throws Exception {
        when(ticketService.markAsUsed("TCK-0001"))
                .thenReturn(ticket(TicketStatus.USED));

        mockMvc.perform(patch("/api/tickets/TCK-0001/use"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("USED"));

        verify(ticketService).markAsUsed("TCK-0001");
    }

    @Test
    void markAsUsed_cancelledTicket_returns409() throws Exception {
        when(ticketService.markAsUsed("TCK-0001"))
                .thenThrow(new BusinessRuleException("Only PAID tickets can be marked as used."));

        mockMvc.perform(patch("/api/tickets/TCK-0001/use"))
                .andExpect(status().isConflict())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(409));

        verify(ticketService).markAsUsed("TCK-0001");
    }
}
