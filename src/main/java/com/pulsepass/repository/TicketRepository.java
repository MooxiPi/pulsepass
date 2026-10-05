package com.pulsepass.repository;

import com.pulsepass.domain.Ticket;
import com.pulsepass.domain.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Optional<Ticket> findByTicketCode(String ticketCode);

    List<Ticket> findByUser_EmailIgnoreCase(String email);

    List<Ticket> findByUser_EmailIgnoreCaseAndStatus(String email, TicketStatus status);

    List<Ticket> findByEvent_EventCodeAndStatus(String eventCode, TicketStatus status);

    @Query("""
            SELECT COUNT(t)
            FROM Ticket t
            WHERE t.event.eventCode = :eventCode
              AND t.status = com.pulsepass.domain.enums.TicketStatus.PAID
            """)
    long countPaidTicketsByEventCode(@Param("eventCode") String eventCode);

    @Query("""
            SELECT t
            FROM Ticket t
            WHERE t.event.eventDate > :after
            ORDER BY t.event.eventDate ASC
            """)
    List<Ticket> findTicketsForFutureEvents(@Param("after") LocalDateTime after);
}
