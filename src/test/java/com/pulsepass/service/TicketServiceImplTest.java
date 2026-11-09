package com.pulsepass.service;

import com.pulsepass.domain.Event;
import com.pulsepass.domain.Ticket;
import com.pulsepass.domain.User;
import com.pulsepass.domain.UserProfile;
import com.pulsepass.domain.Venue;
import com.pulsepass.domain.enums.EventCategory;
import com.pulsepass.domain.enums.EventStatus;
import com.pulsepass.domain.enums.TicketStatus;
import com.pulsepass.domain.enums.TicketType;
import com.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.TicketMapper;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.TicketRepository;
import com.pulsepass.repository.UserProfileRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.service.impl.TicketServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TicketServiceImplTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private TicketMapper ticketMapper;

    @InjectMocks
    private TicketServiceImpl ticketService;

    @Test
    void purchase_validPurchase_createsPaidTicket() {

        User user = createUser(true);
        Event event = createEvent(EventStatus.PUBLISHED, 0, 3);

        PurchaseTicketRequest request =
                new PurchaseTicketRequest(
                        "andrea@email.com",
                        "CMF-2026",
                        TicketType.GENERAL
                );

        when(userRepository.findByEmailIgnoreCase("andrea@email.com"))
                .thenReturn(Optional.of(user));

        when(eventRepository.findByEventCode("CMF-2026"))
                .thenReturn(Optional.of(event));

        when(ticketRepository.countPaidTicketsByEventCode("CMF-2026"))
                .thenReturn(0L);

        when(ticketRepository.save(any(Ticket.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ticketService.purchase(request);

        ArgumentCaptor<Ticket> captor =
                ArgumentCaptor.forClass(Ticket.class);

        verify(ticketRepository).save(captor.capture());

        Ticket savedTicket = captor.getValue();

        assertThat(savedTicket.getStatus())
                .isEqualTo(TicketStatus.PAID);

        assertThat(savedTicket.getType())
                .isEqualTo(TicketType.GENERAL);

        assertThat(savedTicket.getPrice())
                .isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    void purchase_nonExistingUser_throwsResourceNotFoundException() {

        PurchaseTicketRequest request =
                new PurchaseTicketRequest(
                        "missing@email.com",
                        "CMF-2026",
                        TicketType.GENERAL
                );

        when(userRepository.findByEmailIgnoreCase("missing@email.com"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                ticketService.purchase(request)
        )
                .isInstanceOf(ResourceNotFoundException.class);

        verify(ticketRepository, never())
                .save(any(Ticket.class));
    }

    @Test
    void purchase_inactiveUser_throwsBusinessRuleException() {

        User user = createUser(false);

        PurchaseTicketRequest request =
                new PurchaseTicketRequest(
                        "andrea@email.com",
                        "CMF-2026",
                        TicketType.GENERAL
                );

        when(userRepository.findByEmailIgnoreCase("andrea@email.com"))
                .thenReturn(Optional.of(user));

        assertThatThrownBy(() ->
                ticketService.purchase(request)
        )
                .isInstanceOf(BusinessRuleException.class);

        verify(ticketRepository, never())
                .save(any(Ticket.class));
    }

    @Test
    void purchase_draftEvent_throwsBusinessRuleException() {

        User user = createUser(true);
        Event event = createEvent(EventStatus.DRAFT, 0, 3);

        PurchaseTicketRequest request =
                new PurchaseTicketRequest(
                        "andrea@email.com",
                        "CMF-2026",
                        TicketType.GENERAL
                );

        when(userRepository.findByEmailIgnoreCase("andrea@email.com"))
                .thenReturn(Optional.of(user));

        when(eventRepository.findByEventCode("CMF-2026"))
                .thenReturn(Optional.of(event));

        assertThatThrownBy(() ->
                ticketService.purchase(request)
        )
                .isInstanceOf(BusinessRuleException.class);

        verify(ticketRepository, never())
                .save(any(Ticket.class));
    }

    @Test
    void purchase_cancelledEvent_throwsBusinessRuleException() {

        User user = createUser(true);
        Event event = createEvent(EventStatus.CANCELLED, 0, 3);

        PurchaseTicketRequest request =
                new PurchaseTicketRequest(
                        "andrea@email.com",
                        "CMF-2026",
                        TicketType.GENERAL
                );

        when(userRepository.findByEmailIgnoreCase("andrea@email.com"))
                .thenReturn(Optional.of(user));

        when(eventRepository.findByEventCode("CMF-2026"))
                .thenReturn(Optional.of(event));

        assertThatThrownBy(() ->
                ticketService.purchase(request)
        )
                .isInstanceOf(BusinessRuleException.class);

        verify(ticketRepository, never())
                .save(any(Ticket.class));
    }

    @Test
    void purchase_underageUser_throwsBusinessRuleException() {

        User user = createUser(true);

        Event event = createEvent(
                EventStatus.PUBLISHED,
                18,
                3
        );

        UserProfile profile =
                new UserProfile(
                        "Laura",
                        "Lopez",
                        null,
                        "Santa Marta",
                        LocalDate.now().minusYears(16),
                        user
                );

        PurchaseTicketRequest request =
                new PurchaseTicketRequest(
                        "andrea@email.com",
                        "CMF-2026",
                        TicketType.GENERAL
                );

        when(userRepository.findByEmailIgnoreCase("andrea@email.com"))
                .thenReturn(Optional.of(user));

        when(eventRepository.findByEventCode("CMF-2026"))
                .thenReturn(Optional.of(event));

        when(userProfileRepository.findByUser_Id(null))
                .thenReturn(Optional.of(profile));

        assertThatThrownBy(() ->
                ticketService.purchase(request)
        )
                .isInstanceOf(BusinessRuleException.class);

        verify(ticketRepository, never())
                .save(any(Ticket.class));
    }

    @Test
    void purchase_eventWithoutCapacity_throwsBusinessRuleException() {

        User user = createUser(true);
        Event event = createEvent(EventStatus.PUBLISHED, 0, 3);

        PurchaseTicketRequest request =
                new PurchaseTicketRequest(
                        "andrea@email.com",
                        "CMF-2026",
                        TicketType.GENERAL
                );

        when(userRepository.findByEmailIgnoreCase("andrea@email.com"))
                .thenReturn(Optional.of(user));

        when(eventRepository.findByEventCode("CMF-2026"))
                .thenReturn(Optional.of(event));

        when(ticketRepository.countPaidTicketsByEventCode("CMF-2026"))
                .thenReturn(3L);

        assertThatThrownBy(() ->
                ticketService.purchase(request)
        )
                .isInstanceOf(BusinessRuleException.class);

        verify(ticketRepository, never())
                .save(any(Ticket.class));
    }

    @Test
    void purchase_lastAvailableTicket_marksEventSoldOut() {

        User user = createUser(true);
        Event event = createEvent(EventStatus.PUBLISHED, 0, 3);

        PurchaseTicketRequest request =
                new PurchaseTicketRequest(
                        "andrea@email.com",
                        "CMF-2026",
                        TicketType.VIP
                );

        when(userRepository.findByEmailIgnoreCase("andrea@email.com"))
                .thenReturn(Optional.of(user));

        when(eventRepository.findByEventCode("CMF-2026"))
                .thenReturn(Optional.of(event));

        when(ticketRepository.countPaidTicketsByEventCode("CMF-2026"))
                .thenReturn(2L);

        when(ticketRepository.save(any(Ticket.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ticketService.purchase(request);

        assertThat(event.getStatus())
                .isEqualTo(EventStatus.SOLD_OUT);

        verify(ticketRepository)
                .save(any(Ticket.class));

        verify(eventRepository)
                .save(event);
    }

    @Test
    void cancel_paidTicket_changesStatusToCancelled() {

        User user = createUser(true);
        Event event = createEvent(EventStatus.PUBLISHED, 0, 3);

        Ticket ticket = createTicket(
                TicketStatus.PAID,
                user,
                event
        );

        when(ticketRepository.findByTicketCode("TCK-001"))
                .thenReturn(Optional.of(ticket));

        when(ticketRepository.save(ticket))
                .thenReturn(ticket);

        ticketService.cancel("TCK-001");

        assertThat(ticket.getStatus())
                .isEqualTo(TicketStatus.CANCELLED);

        verify(ticketRepository)
                .save(ticket);
    }

    @Test
    void cancel_usedTicket_throwsBusinessRuleException() {

        User user = createUser(true);
        Event event = createEvent(EventStatus.PUBLISHED, 0, 3);

        Ticket ticket = createTicket(
                TicketStatus.USED,
                user,
                event
        );

        when(ticketRepository.findByTicketCode("TCK-001"))
                .thenReturn(Optional.of(ticket));

        assertThatThrownBy(() ->
                ticketService.cancel("TCK-001")
        )
                .isInstanceOf(BusinessRuleException.class);

        verify(ticketRepository, never())
                .save(any(Ticket.class));
    }

    @Test
    void markAsUsed_paidTicket_changesStatusToUsed() {

        User user = createUser(true);
        Event event = createEvent(EventStatus.PUBLISHED, 0, 3);

        Ticket ticket = createTicket(
                TicketStatus.PAID,
                user,
                event
        );

        when(ticketRepository.findByTicketCode("TCK-001"))
                .thenReturn(Optional.of(ticket));

        when(ticketRepository.save(ticket))
                .thenReturn(ticket);

        ticketService.markAsUsed("TCK-001");

        assertThat(ticket.getStatus())
                .isEqualTo(TicketStatus.USED);

        verify(ticketRepository)
                .save(ticket);
    }

    @Test
    void markAsUsed_cancelledTicket_throwsBusinessRuleException() {

        User user = createUser(true);
        Event event = createEvent(EventStatus.PUBLISHED, 0, 3);

        Ticket ticket = createTicket(
                TicketStatus.CANCELLED,
                user,
                event
        );

        when(ticketRepository.findByTicketCode("TCK-001"))
                .thenReturn(Optional.of(ticket));

        assertThatThrownBy(() ->
                ticketService.markAsUsed("TCK-001")
        )
                .isInstanceOf(BusinessRuleException.class);

        verify(ticketRepository, never())
                .save(any(Ticket.class));
    }

    private User createUser(boolean active) {

        return new User(
                "andrea",
                "andrea@email.com",
                active
        );
    }

    private Event createEvent(
            EventStatus status,
            int minimumAge,
            int capacity
    ) {

        Venue venue = new Venue(
                "VEN-SMR-01",
                "Marina Convention Center",
                "Santa Marta",
                "Marina",
                capacity,
                true
        );

        return new Event(
                "CMF-2026",
                "Caribbean Music Fest",
                "Music festival",
                EventCategory.MUSIC,
                status,
                LocalDateTime.now().plusMonths(3),
                minimumAge,
                venue
        );
    }

    private Ticket createTicket(
            TicketStatus status,
            User user,
            Event event
    ) {

        return new Ticket(
                "TCK-001",
                TicketType.GENERAL,
                new BigDecimal("120000.00"),
                status,
                LocalDateTime.now(),
                user,
                event
        );
    }
}