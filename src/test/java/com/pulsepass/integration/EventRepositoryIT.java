package com.pulsepass.integration;

import com.pulsepass.domain.Event;
import com.pulsepass.domain.Venue;
import com.pulsepass.domain.enums.EventCategory;
import com.pulsepass.domain.enums.EventStatus;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.VenueRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@Transactional
class EventRepositoryIT extends PostgresIntegrationTest {

    @Autowired
    VenueRepository venueRepository;

    @Autowired
    EventRepository eventRepository;

    @Test
    void shouldFindEventByCodeAndVenue() {
        Venue venue = venueRepository.save(new Venue(
                "VEN-SMR-EVT",
                "Marina Convention Center",
                "Santa Marta",
                "Marina",
                5000,
                true
        ));

        Event event = new Event(
                "CMF-2026",
                "Caribbean Music Fest 2026",
                "Festival principal",
                EventCategory.MUSIC,
                EventStatus.PUBLISHED,
                LocalDateTime.of(2026, 12, 15, 20, 0),
                14,
                venue
        );
        event.setStreamingUrl("https://stream.example/cmf-2026");
        eventRepository.saveAndFlush(event);

        Event found = eventRepository.findByEventCode("CMF-2026").orElseThrow();
        assertThat(found.getVenue().getCode()).isEqualTo("VEN-SMR-EVT");
        assertThat(found.getStreamingUrl()).hasSizeLessThanOrEqualTo(500);
    }

    @Test
    void shouldReturnOnlyPublishedEventsOrderedByDate() {
        Venue venue = venueRepository.save(new Venue(
                "VEN-SMR-ORDER", "Venue", "Santa Marta", "Address", 1000, true
        ));

        eventRepository.save(new Event("EVT-3", "Draft", null, EventCategory.MUSIC,
                EventStatus.DRAFT, LocalDateTime.of(2026, 10, 1, 20, 0), 0, venue));
        eventRepository.save(new Event("EVT-2", "Published later", null, EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 11, 1, 20, 0), 0, venue));
        eventRepository.save(new Event("EVT-1", "Published earlier", null, EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 9, 30, 20, 0), 0, venue));
        eventRepository.flush();

        List<Event> result = eventRepository.findByStatusOrderByEventDateAsc(EventStatus.PUBLISHED);

        assertThat(result).extracting(Event::getEventCode).containsExactly("EVT-1", "EVT-2");
    }

    @Test
    void shouldFindEventsByVenueCode() {
        Venue first = venueRepository.save(new Venue("VEN-A", "A", "Santa Marta", "A", 1000, true));
        Venue second = venueRepository.save(new Venue("VEN-B", "B", "Barranquilla", "B", 1000, true));

        eventRepository.save(new Event("A-1", "A1", null, EventCategory.CULTURE,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 10, 2, 18, 0), 0, first));
        eventRepository.save(new Event("B-1", "B1", null, EventCategory.CULTURE,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 10, 3, 18, 0), 0, second));
        eventRepository.flush();

        assertThat(eventRepository.findByVenue_CodeOrderByEventDateAsc("VEN-A"))
                .extracting(Event::getEventCode)
                .containsExactly("A-1");
    }
}
