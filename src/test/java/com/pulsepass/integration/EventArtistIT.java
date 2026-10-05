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
class EventArtistIT extends PostgresIntegrationTest {

    @Autowired
    ArtistRepository artistRepository;

    @Autowired
    EventRepository eventRepository;

    @Autowired
    VenueRepository venueRepository;

    @Test
    void shouldPersistManyToManyArtistsAndSearchByStageNameWithoutDuplicates() {
        Venue venue = venueRepository.save(new Venue(
                "VEN-ART-01", "Venue", "Santa Marta", "Address", 5000, true
        ));

        Artist solarBeat = artistRepository.findByStageName("Solar Beat").orElseThrow();
        Artist neonWaves = artistRepository.findByStageName("Neon Waves").orElseThrow();
        Artist caribbeanSound = artistRepository.findByStageName("Caribbean Sound").orElseThrow();

        Event event = new Event(
                "CMF-ART-2026",
                "Caribbean Music Fest 2026",
                null,
                EventCategory.MUSIC,
                EventStatus.PUBLISHED,
                LocalDateTime.of(2026, 12, 15, 20, 0),
                14,
                venue
        );
        event.addArtist(solarBeat);
        event.addArtist(neonWaves);
        event.addArtist(caribbeanSound);
        event.addArtist(solarBeat);
        eventRepository.saveAndFlush(event);

        Event found = eventRepository.findByEventCode("CMF-ART-2026").orElseThrow();
        assertThat(found.getArtists()).hasSize(3);

        assertThat(eventRepository.findEventsByArtistStageName("Solar Beat"))
                .extracting(Event::getEventCode)
                .containsExactly("CMF-ART-2026");
    }
}
