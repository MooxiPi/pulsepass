package com.pulsepass.integration;

import com.pulsepass.domain.Venue;
import com.pulsepass.repository.VenueRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Transactional
class VenuePersistenceTest extends PostgresIntegrationTest {

    @Autowired
    VenueRepository venueRepository;

    @Test
    void shouldPersistAndFindVenueByCode() {
        Venue venue = new Venue(
                "VEN-SMR-01",
                "Marina Convention Center",
                "Santa Marta",
                "Marina de Santa Marta",
                5000,
                true
        );

        venueRepository.saveAndFlush(venue);

        Venue found = venueRepository.findByCode("VEN-SMR-01").orElseThrow();
        assertThat(found.getName()).isEqualTo("Marina Convention Center");
        assertThat(found.getCapacity()).isGreaterThan(0);
    }

    @Test
    void shouldRejectDuplicateVenueCode() {
        venueRepository.saveAndFlush(new Venue("VEN-DUP-01", "Venue A", "Santa Marta", "Address A", 100, true));

        assertThatThrownBy(() -> venueRepository.saveAndFlush(
                new Venue("VEN-DUP-01", "Venue B", "Santa Marta", "Address B", 200, true)
        )).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void shouldRejectNonPositiveCapacity() {
        assertThatThrownBy(() -> venueRepository.saveAndFlush(
                new Venue("VEN-BAD-01", "Invalid Venue", "Santa Marta", "Address", 0, true)
        )).isInstanceOf(DataIntegrityViolationException.class);
    }
}
