package com.pulsepass.service.impl;

import com.pulsepass.domain.Event;
import com.pulsepass.domain.Ticket;
import com.pulsepass.domain.User;
import com.pulsepass.domain.UserProfile;
import com.pulsepass.domain.enums.EventStatus;
import com.pulsepass.domain.enums.TicketStatus;
import com.pulsepass.domain.enums.TicketType;
import com.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.dto.response.TicketResponse;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.TicketMapper;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.TicketRepository;
import com.pulsepass.repository.UserProfileRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.service.TicketService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final EventRepository eventRepository;
    private final TicketMapper ticketMapper;

    public TicketServiceImpl(
            TicketRepository ticketRepository,
            UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            EventRepository eventRepository,
            TicketMapper ticketMapper
    ) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.eventRepository = eventRepository;
        this.ticketMapper = ticketMapper;
    }

    @Override
    @Transactional
    public TicketResponse purchase(PurchaseTicketRequest request) {

        User user = userRepository
                .findByEmailIgnoreCase(request.userEmail())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found: " + request.userEmail()
                        )
                );

        if (!user.isActive()) {
            throw new BusinessRuleException(
                    "Inactive users cannot purchase tickets."
            );
        }

        Event event = eventRepository
                .findByEventCode(request.eventCode())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Event not found: " + request.eventCode()
                        )
                );

        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new BusinessRuleException(
                    "Tickets can only be purchased for published events."
            );
        }

        if (event.getEventDate() == null
                || !event.getEventDate().isAfter(LocalDateTime.now())) {

            throw new BusinessRuleException(
                    "Cannot purchase a ticket for an event that has already occurred."
            );
        }

        validateMinimumAge(user, event);

        long paidTickets =
                ticketRepository.countPaidTicketsByEventCode(
                        event.getEventCode()
                );

        int capacity = event.getVenue().getCapacity();

        if (paidTickets >= capacity) {
            throw new BusinessRuleException(
                    "Event has no available capacity."
            );
        }

        BigDecimal price = calculatePrice(request.type());

        if (price.signum() < 0) {
            throw new BusinessRuleException(
                    "Ticket price cannot be negative."
            );
        }

        String ticketCode = generateTicketCode();

        Ticket ticket = new Ticket(
                ticketCode,
                request.type(),
                price,
                TicketStatus.PAID,
                LocalDateTime.now(),
                user,
                event
        );

        Ticket savedTicket = ticketRepository.save(ticket);

        long newPaidTicketCount = paidTickets + 1;

        if (newPaidTicketCount == capacity) {
            event.setStatus(EventStatus.SOLD_OUT);
            eventRepository.save(event);
        }

        return ticketMapper.toResponse(savedTicket);
    }

    @Override
    public TicketResponse findByCode(String ticketCode) {

        Ticket ticket = findTicketOrThrow(ticketCode);

        return ticketMapper.toResponse(ticket);
    }

    @Override
    public List<TicketResponse> findByUserEmail(String email) {

        return ticketRepository
                .findByUser_EmailIgnoreCase(email)
                .stream()
                .sorted(
                        Comparator.comparing(
                                Ticket::getPurchaseDate
                        ).reversed()
                )
                .map(ticketMapper::toResponse)
                .toList();
    }

    @Override
    public List<TicketResponse> findPaidTicketsByEvent(
            String eventCode
    ) {

        return ticketRepository
                .findByEvent_EventCodeAndStatus(
                        eventCode,
                        TicketStatus.PAID
                )
                .stream()
                .map(ticketMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public TicketResponse cancel(String ticketCode) {

        Ticket ticket = findTicketOrThrow(ticketCode);

        if (ticket.getStatus() != TicketStatus.PAID) {
            throw new BusinessRuleException(
                    "Only PAID tickets can be cancelled."
            );
        }

        if (!ticket.getEvent()
                .getEventDate()
                .isAfter(LocalDateTime.now())) {

            throw new BusinessRuleException(
                    "Ticket cannot be cancelled after the event date."
            );
        }

        ticket.setStatus(TicketStatus.CANCELLED);

        Ticket savedTicket =
                ticketRepository.save(ticket);

        return ticketMapper.toResponse(savedTicket);
    }

    @Override
    @Transactional
    public TicketResponse markAsUsed(String ticketCode) {

        Ticket ticket = findTicketOrThrow(ticketCode);

        if (ticket.getStatus() != TicketStatus.PAID) {
            throw new BusinessRuleException(
                    "Only PAID tickets can be marked as used."
            );
        }

        ticket.setStatus(TicketStatus.USED);

        Ticket savedTicket =
                ticketRepository.save(ticket);

        return ticketMapper.toResponse(savedTicket);
    }

    private Ticket findTicketOrThrow(String ticketCode) {

        return ticketRepository
                .findByTicketCode(ticketCode)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Ticket not found: " + ticketCode
                        )
                );
    }

    private void validateMinimumAge(
            User user,
            Event event
    ) {

        if (event.getMinimumAge() == null
                || event.getMinimumAge() <= 0) {
            return;
        }

        UserProfile profile = userProfileRepository
                .findByUser_Id(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User profile not found: "
                                        + user.getEmail()
                        )
                );

        if (profile.getBirthDate() == null) {
            throw new BusinessRuleException(
                    "User birth date is required."
            );
        }

        int ageAtEvent = Period.between(
                profile.getBirthDate(),
                event.getEventDate().toLocalDate()
        ).getYears();

        if (ageAtEvent < event.getMinimumAge()) {
            throw new BusinessRuleException(
                    "User does not meet minimum age."
            );
        }
    }

    private BigDecimal calculatePrice(TicketType type) {

        if (type == null) {
            throw new BusinessRuleException(
                    "Ticket type is required."
            );
        }

        return switch (type) {
            case GENERAL ->
                    new BigDecimal("120000.00");

            case STUDENT ->
                    new BigDecimal("80000.00");

            case VIP ->
                    new BigDecimal("250000.00");

            case BACKSTAGE ->
                    new BigDecimal("400000.00");
        };
    }

    private String generateTicketCode() {

        return "TCK-" +
                UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase();
    }
}