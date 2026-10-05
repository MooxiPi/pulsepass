package com.pulsepass.integration;

import com.pulsepass.domain.Artist;
import com.pulsepass.domain.Event;
import com.pulsepass.domain.Venue;
import com.pulsepass.domain.enums.EventCategory;
import com.pulsepass.domain.enums.EventStatus;
import com.pulsepass.repository.ArtistRepository;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.VenueRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@Transactional
class EventSearchIT extends PostgresIntegrationTest {

    @Autowired
    VenueRepository venueRepository;

    @Autowired
    ArtistRepository artistRepository;

    @Autowired
    EventRepository eventRepository;

    @Test
    void shouldSearchByCityArtistAndRecommendationCriteria() {
        Venue santaMarta = venueRepository.save(new Venue(
                "VEN-SRC-SMR", "Venue SMR", "Santa Marta", "Address", 5000, true
        ));
        Venue bogota = venueRepository.save(new Venue(
                "VEN-SRC-BOG", "Venue BOG", "Bogota", "Address", 5000, true
        ));

        Artist solarBeat = artistRepository.findByStageName("Solar Beat").orElseThrow();

        Event recommended = new Event(
                "SRC-01", "Recommended", null, EventCategory.MUSIC, EventStatus.PUBLISHED,
                LocalDateTime.of(2026, 12, 10, 20, 0), 0, santaMarta
        );
        recommended.addArtist(solarBeat);

        Event wrongCity = new Event(
                "SRC-02", "Wrong city", null, EventCategory.MUSIC, EventStatus.PUBLISHED,
                LocalDateTime.of(2026, 12, 11, 20, 0), 0, bogota
        );
        wrongCity.addArtist(solarBeat);

        Event wrongStatus = new Event(
                "SRC-03", "Wrong status", null, EventCategory.MUSIC, EventStatus.DRAFT,
                LocalDateTime.of(2026, 12, 12, 20, 0), 0, santaMarta
        );
        wrongStatus.addArtist(solarBeat);

        eventRepository.save(recommended);
        eventRepository.save(wrongCity);
        eventRepository.save(wrongStatus);
        eventRepository.flush();

        assertThat(eventRepository.findEventsByCityAndArtist("santa marta", "Solar Beat"))
                .extracting(Event::getEventCode)
                .containsExactlyInAnyOrder("SRC-01", "SRC-03");

        assertThat(eventRepository.findRecommendedEvents(
                LocalDateTime.of(2026, 9, 21, 0, 0), "SANTA MARTA", "solar"))
                .extracting(Event::getEventCode)
                .containsExactly("SRC-01");
    }
}
