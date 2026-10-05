package com.pulsepass.integration;

import com.pulsepass.domain.Event;
import com.pulsepass.domain.Ticket;
import com.pulsepass.domain.User;
import com.pulsepass.domain.Venue;
import com.pulsepass.domain.enums.EventCategory;
import com.pulsepass.domain.enums.EventStatus;
import com.pulsepass.domain.enums.TicketStatus;
import com.pulsepass.domain.enums.TicketType;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.TicketRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.repository.VenueRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Transactional
class TicketRepositoryIT extends PostgresIntegrationTest {

    @Autowired
    VenueRepository venueRepository;

    @Autowired
    EventRepository eventRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    TicketRepository ticketRepository;

    @Test
    void shouldQueryTicketsByUserEventAndStatusAndCountPaidSales() {
        Venue venue = venueRepository.save(new Venue(
                "VEN-TKT-01", "Marina Convention Center", "Santa Marta", "Marina", 5000, true
        ));
        Event event = eventRepository.save(new Event(
                "CMF-TKT-2026", "Caribbean Music Fest 2026", null, EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 12, 15, 20, 0), 14, venue
        ));

        User andrea = userRepository.save(new User("andrea_t", "andrea.t@example.com", true));
        User carlos = userRepository.save(new User("carlos_t", "carlos.t@example.com", true));
        User laura = userRepository.save(new User("laura_t", "laura.t@example.com", true));
        User miguel = userRepository.save(new User("miguel_t", "miguel.t@example.com", true));

        LocalDateTime purchaseDate = LocalDateTime.of(2026, 9, 20, 10, 0);
        ticketRepository.save(new Ticket("TCK-0001", TicketType.VIP, new BigDecimal("250000.00"),
                TicketStatus.PAID, purchaseDate, andrea, event));
        ticketRepository.save(new Ticket("TCK-0002", TicketType.GENERAL, new BigDecimal("120000.00"),
                TicketStatus.PAID, purchaseDate, carlos, event));
        ticketRepository.save(new Ticket("TCK-0003", TicketType.GENERAL, new BigDecimal("120000.00"),
                TicketStatus.RESERVED, purchaseDate, laura, event));
        ticketRepository.save(new Ticket("TCK-0004", TicketType.VIP, new BigDecimal("250000.00"),
                TicketStatus.CANCELLED, purchaseDate, miguel, event));
        ticketRepository.flush();

        assertThat(ticketRepository.findByUser_EmailIgnoreCase("ANDREA.T@EXAMPLE.COM"))
                .extracting(Ticket::getTicketCode)
                .containsExactly("TCK-0001");

        assertThat(ticketRepository.findByUser_EmailIgnoreCaseAndStatus("andrea.t@example.com", TicketStatus.PAID))
                .hasSize(1);

        assertThat(ticketRepository.findByEvent_EventCodeAndStatus("CMF-TKT-2026", TicketStatus.PAID))
                .hasSize(2);

        assertThat(ticketRepository.countPaidTicketsByEventCode("CMF-TKT-2026"))
                .isEqualTo(2);
    }

    @Test
    void shouldRejectDuplicateTicketCode() {
        Venue venue = venueRepository.save(new Venue("VEN-TKT-02", "Venue", "Santa Marta", "Address", 1000, true));
        Event event = eventRepository.save(new Event("EVT-TKT-02", "Event", null, EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2027, 1, 1, 20, 0), 0, venue));
        User user = userRepository.save(new User("ticket_user", "ticket.user@example.com", true));

        ticketRepository.saveAndFlush(new Ticket("TCK-DUP", TicketType.GENERAL, new BigDecimal("10.00"),
                TicketStatus.PAID, LocalDateTime.now(), user, event));

        assertThatThrownBy(() -> ticketRepository.saveAndFlush(new Ticket(
                "TCK-DUP", TicketType.VIP, new BigDecimal("20.00"), TicketStatus.PAID,
                LocalDateTime.now(), user, event
        ))).isInstanceOf(DataIntegrityViolationException.class);
    }
    @Test
    void shouldRejectNegativePrice() {
        Venue venue = venueRepository.save(new Venue("VEN-TKT-NEG", "Venue", "Santa Marta", "Address", 1000, true));
        Event event = eventRepository.save(new Event("EVT-TKT-NEG", "Event", null, EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2027, 2, 1, 20, 0), 0, venue));
        User user = userRepository.save(new User("negative_price_user", "negative.price@example.com", true));

        assertThatThrownBy(() -> ticketRepository.saveAndFlush(new Ticket(
                "TCK-NEG", TicketType.GENERAL, new BigDecimal("-1.00"), TicketStatus.PAID,
                LocalDateTime.now(), user, event
        ))).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void shouldReturnTicketsForFutureEventsOrderedChronologically() {
        Venue venue = venueRepository.save(new Venue("VEN-TKT-FUT", "Venue", "Santa Marta", "Address", 1000, true));
        User user = userRepository.save(new User("future_user", "future.user@example.com", true));

        Event earlier = eventRepository.save(new Event("EVT-FUT-1", "Earlier", null, EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 10, 1, 20, 0), 0, venue));
        Event later = eventRepository.save(new Event("EVT-FUT-2", "Later", null, EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 11, 1, 20, 0), 0, venue));

        ticketRepository.save(new Ticket("TCK-FUT-2", TicketType.GENERAL, new BigDecimal("20.00"),
                TicketStatus.PAID, LocalDateTime.now(), user, later));
        ticketRepository.save(new Ticket("TCK-FUT-1", TicketType.GENERAL, new BigDecimal("10.00"),
                TicketStatus.PAID, LocalDateTime.now(), user, earlier));
        ticketRepository.flush();

        assertThat(ticketRepository.findTicketsForFutureEvents(LocalDateTime.of(2026, 9, 21, 0, 0)))
                .extracting(Ticket::getTicketCode)
                .containsExactly("TCK-FUT-1", "TCK-FUT-2");
    }

}
