package com.pulsepass.service.impl;

import com.pulsepass.domain.Artist;
import com.pulsepass.domain.Event;
import com.pulsepass.domain.Venue;
import com.pulsepass.domain.enums.EventStatus;
import com.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.dto.response.EventResponse;
import com.pulsepass.dto.response.EventSummaryResponse;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.EventMapper;
import com.pulsepass.repository.ArtistRepository;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.VenueRepository;
import com.pulsepass.security.AuthorizationService;
import com.pulsepass.service.EventService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class EventServiceImpl implements EventService {

    /**
     * Estados visibles para cualquier visitante. Un evento SOLD_OUT sigue publicado: se muestra
     * en la cartelera y en su detalle, pero la compra la rechaza TicketService por aforo.
     */
    private static final Set<EventStatus> PUBLIC_STATUSES =
            Set.of(EventStatus.PUBLISHED, EventStatus.SOLD_OUT);

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final ArtistRepository artistRepository;
    private final EventMapper eventMapper;
    private final AuthorizationService authorizationService;

    public EventServiceImpl(
            EventRepository eventRepository,
            VenueRepository venueRepository,
            ArtistRepository artistRepository,
            EventMapper eventMapper,
            AuthorizationService authorizationService
    ) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.artistRepository = artistRepository;
        this.eventMapper = eventMapper;
        this.authorizationService = authorizationService;
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public EventResponse create(CreateEventRequest request) {

        if (eventRepository.existsByEventCode(request.eventCode())) {
            throw new DuplicateResourceException(
                    "Event code already exists: " + request.eventCode()
            );
        }

        Venue venue = venueRepository.findByCode(request.venueCode())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Venue not found: " + request.venueCode()
                        )
                );

        if (!venue.isActive()) {
            throw new BusinessRuleException(
                    "Cannot create event in an inactive venue."
            );
        }

        if (request.eventDate() == null
                || !request.eventDate().isAfter(LocalDateTime.now())) {

            throw new BusinessRuleException(
                    "Event date must be in the future."
            );
        }

        if (request.minimumAge() == null
                || request.minimumAge() < 0) {

            throw new BusinessRuleException(
                    "Minimum age cannot be negative."
            );
        }

        Event event = new Event(
                request.eventCode(),
                request.name(),
                request.description(),
                request.category(),
                EventStatus.DRAFT,
                request.eventDate(),
                request.minimumAge(),
                venue
        );

        Event savedEvent = eventRepository.save(event);

        return eventMapper.toResponse(savedEvent);
    }

    @Override
    public EventResponse findByCode(String eventCode) {

        Event event = findEventOrThrow(eventCode);

        // Los no publicados (DRAFT, CANCELLED, FINISHED) solo los ve STAFF/ADMIN;
        // al resto se le responde 404 para no revelar que existen.
        if (!isVisible(event)) {
            throw new ResourceNotFoundException("Event not found");
        }

        return eventMapper.toResponse(event);
    }

    @Override
    public List<EventSummaryResponse> findPublishedEvents() {

        return eventRepository
                .findByStatusInOrderByEventDateAsc(PUBLIC_STATUSES)
                .stream()
                .map(eventMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public EventResponse publish(String eventCode) {

        Event event = findEventOrThrow(eventCode);

        if (event.getStatus() != EventStatus.DRAFT) {
            throw new BusinessRuleException(
                    "Only DRAFT events can be published."
            );
        }

        if (event.getEventDate() == null
                || !event.getEventDate().isAfter(LocalDateTime.now())) {

            throw new BusinessRuleException(
                    "Cannot publish an event whose date is not in the future."
            );
        }

        if (!event.getVenue().isActive()) {
            throw new BusinessRuleException(
                    "Cannot publish an event with an inactive venue."
            );
        }

        event.setStatus(EventStatus.PUBLISHED);

        Event savedEvent = eventRepository.save(event);

        return eventMapper.toResponse(savedEvent);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public EventResponse addArtist(
            String eventCode,
            Long artistId
    ) {

        Event event = findEventOrThrow(eventCode);

        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Artist not found: " + artistId
                        )
                );

        if (event.getStatus() == EventStatus.CANCELLED
                || event.getStatus() == EventStatus.FINISHED) {

            throw new BusinessRuleException(
                    "Cannot add artists to a cancelled or finished event."
            );
        }

        boolean alreadyAssociated = event.getArtists()
                .stream()
                .anyMatch(existing ->
                        Objects.equals(existing.getId(), artistId)
                );

        if (alreadyAssociated) {
            throw new BusinessRuleException(
                    "Artist is already associated with this event."
            );
        }

        event.addArtist(artist);

        Event savedEvent = eventRepository.save(event);

        return eventMapper.toResponse(savedEvent);
    }

    @Override
    public List<EventSummaryResponse> findByArtist(
            String stageName
    ) {

        return eventRepository
                .findEventsByArtistStageName(stageName)
                .stream()
                .filter(this::isVisible)
                .map(eventMapper::toSummary)
                .toList();
    }

    private boolean isVisible(Event event) {

        return PUBLIC_STATUSES.contains(event.getStatus())
                || authorizationService.isOperator();
    }

    private Event findEventOrThrow(String eventCode) {

        return eventRepository
                .findByEventCode(eventCode)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Event not found: " + eventCode
                        )
                );
    }
}
