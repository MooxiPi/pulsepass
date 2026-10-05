package com.pulsepass.service;

import com.pulsepass.domain.Artist;
import com.pulsepass.domain.Event;
import com.pulsepass.domain.Venue;
import com.pulsepass.domain.enums.EventCategory;
import com.pulsepass.domain.enums.EventStatus;
import com.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.dto.response.EventResponse;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.EventMapper;
import com.pulsepass.repository.ArtistRepository;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.VenueRepository;
import com.pulsepass.service.impl.EventServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventServiceImplTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private ArtistRepository artistRepository;

    @Mock
    private EventMapper eventMapper;

    @InjectMocks
    private EventServiceImpl eventService;

    @Test
    void findByCode_existingEvent_returnsDto() {

        // ARRANGE
        Venue venue = createActiveVenue();

        Event event = new Event(
                "CMF-2026",
                "Caribbean Music Fest",
                "Music festival",
                EventCategory.MUSIC,
                EventStatus.PUBLISHED,
                LocalDateTime.now().plusMonths(2),
                18,
                venue
        );

        EventResponse expected = new EventResponse(
                null,
                "CMF-2026",
                "Caribbean Music Fest",
                "Music festival",
                EventCategory.MUSIC,
                EventStatus.PUBLISHED,
                event.getEventDate(),
                18,
                "VEN-SMR-01",
                "Marina Convention Center",
                null
        );

        when(eventRepository.findByEventCode("CMF-2026"))
                .thenReturn(Optional.of(event));

        when(eventMapper.toResponse(event))
                .thenReturn(expected);

        // ACT
        EventResponse result =
                eventService.findByCode("CMF-2026");

        // ASSERT
        assertThat(result).isEqualTo(expected);

        verify(eventRepository)
                .findByEventCode("CMF-2026");

        verify(eventMapper)
                .toResponse(event);
    }

    @Test
    void findByCode_nonExistingEvent_throwsException() {

        // ARRANGE
        when(eventRepository.findByEventCode("NOT-FOUND"))
                .thenReturn(Optional.empty());

        // ACT + ASSERT
        assertThatThrownBy(() ->
                eventService.findByCode("NOT-FOUND")
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("NOT-FOUND");
    }

    @Test
    void create_validEvent_savesEvent() {

        // ARRANGE
        Venue venue = createActiveVenue();

        CreateEventRequest request =
                new CreateEventRequest(
                        "CMF-2026",
                        "Caribbean Music Fest",
                        "Music festival",
                        EventCategory.MUSIC,
                        LocalDateTime.now().plusMonths(2),
                        18,
                        "VEN-SMR-01"
                );

        when(eventRepository.existsByEventCode("CMF-2026"))
                .thenReturn(false);

        when(venueRepository.findByCode("VEN-SMR-01"))
                .thenReturn(Optional.of(venue));

        when(eventRepository.save(any(Event.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0)
                );

        // ACT
        eventService.create(request);

        // ASSERT
        verify(eventRepository)
                .save(any(Event.class));
    }

    @Test
    void create_nonExistingVenue_doesNotSaveEvent() {

        // ARRANGE
        CreateEventRequest request =
                new CreateEventRequest(
                        "CMF-2026",
                        "Caribbean Music Fest",
                        "Music festival",
                        EventCategory.MUSIC,
                        LocalDateTime.now().plusMonths(2),
                        18,
                        "INVALID"
                );

        when(eventRepository.existsByEventCode("CMF-2026"))
                .thenReturn(false);

        when(venueRepository.findByCode("INVALID"))
                .thenReturn(Optional.empty());

        // ACT + ASSERT
        assertThatThrownBy(() ->
                eventService.create(request)
        )
                .isInstanceOf(ResourceNotFoundException.class);

        verify(eventRepository, never())
                .save(any(Event.class));
    }

    @Test
    void create_inactiveVenue_throwsBusinessRuleException() {

        // ARRANGE
        Venue venue = new Venue(
                "VEN-SMR-01",
                "Marina Convention Center",
                "Santa Marta",
                "Marina",
                5000,
                false
        );

        CreateEventRequest request =
                new CreateEventRequest(
                        "CMF-2026",
                        "Caribbean Music Fest",
                        "Music festival",
                        EventCategory.MUSIC,
                        LocalDateTime.now().plusMonths(2),
                        18,
                        "VEN-SMR-01"
                );

        when(eventRepository.existsByEventCode("CMF-2026"))
                .thenReturn(false);

        when(venueRepository.findByCode("VEN-SMR-01"))
                .thenReturn(Optional.of(venue));

        // ACT + ASSERT
        assertThatThrownBy(() ->
                eventService.create(request)
        )
                .isInstanceOf(BusinessRuleException.class);

        verify(eventRepository, never())
                .save(any(Event.class));
    }

    @Test
    void create_pastDate_throwsBusinessRuleException() {

        // ARRANGE
        Venue venue = createActiveVenue();

        CreateEventRequest request =
                new CreateEventRequest(
                        "CMF-2026",
                        "Caribbean Music Fest",
                        "Music festival",
                        EventCategory.MUSIC,
                        LocalDateTime.now().minusDays(1),
                        18,
                        "VEN-SMR-01"
                );

        when(eventRepository.existsByEventCode("CMF-2026"))
                .thenReturn(false);

        when(venueRepository.findByCode("VEN-SMR-01"))
                .thenReturn(Optional.of(venue));

        // ACT + ASSERT
        assertThatThrownBy(() ->
                eventService.create(request)
        )
                .isInstanceOf(BusinessRuleException.class);

        verify(eventRepository, never())
                .save(any(Event.class));
    }

    @Test
    void publish_draftEvent_changesStatusToPublished() {

        // ARRANGE
        Venue venue = createActiveVenue();

        Event event = new Event(
                "CMF-2026",
                "Caribbean Music Fest",
                "Music festival",
                EventCategory.MUSIC,
                EventStatus.DRAFT,
                LocalDateTime.now().plusMonths(2),
                18,
                venue
        );

        when(eventRepository.findByEventCode("CMF-2026"))
                .thenReturn(Optional.of(event));

        when(eventRepository.save(event))
                .thenReturn(event);

        // ACT
        eventService.publish("CMF-2026");

        // ASSERT
        assertThat(event.getStatus())
                .isEqualTo(EventStatus.PUBLISHED);

        verify(eventRepository)
                .save(event);
    }

    @Test
    void publish_cancelledEvent_doesNotPersist() {

        // ARRANGE
        Venue venue = createActiveVenue();

        Event event = new Event(
                "CMF-2026",
                "Caribbean Music Fest",
                "Music festival",
                EventCategory.MUSIC,
                EventStatus.CANCELLED,
                LocalDateTime.now().plusMonths(2),
                18,
                venue
        );

        when(eventRepository.findByEventCode("CMF-2026"))
                .thenReturn(Optional.of(event));

        // ACT + ASSERT
        assertThatThrownBy(() ->
                eventService.publish("CMF-2026")
        )
                .isInstanceOf(BusinessRuleException.class);

        verify(eventRepository, never())
                .save(any(Event.class));
    }

    private Venue createActiveVenue() {

        return new Venue(
                "VEN-SMR-01",
                "Marina Convention Center",
                "Santa Marta",
                "Marina",
                5000,
                true
        );
    }
}