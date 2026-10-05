package com.pulsepass.repository;

import com.pulsepass.domain.Event;
import com.pulsepass.domain.enums.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    Optional<Event> findByEventCode(String eventCode);

    List<Event> findByStatusOrderByEventDateAsc(EventStatus status);

    List<Event> findByVenue_CodeOrderByEventDateAsc(String venueCode);

    @Query("""
            SELECT DISTINCT e
            FROM Event e
            JOIN e.artists a
            WHERE a.stageName = :stageName
            ORDER BY e.eventDate ASC
            """)
    List<Event> findEventsByArtistStageName(@Param("stageName") String stageName);

    @Query("""
            SELECT DISTINCT e
            FROM Event e
            JOIN e.artists a
            WHERE LOWER(e.venue.city) = LOWER(:city)
              AND a.stageName = :stageName
            ORDER BY e.eventDate ASC
            """)
    List<Event> findEventsByCityAndArtist(@Param("city") String city,
                                          @Param("stageName") String stageName);

    @Query("""
            SELECT DISTINCT e
            FROM Event e
            JOIN e.artists a
            WHERE e.status = com.pulsepass.domain.enums.EventStatus.PUBLISHED
              AND e.eventDate > :after
              AND LOWER(e.venue.city) = LOWER(:city)
              AND LOWER(a.stageName) LIKE LOWER(CONCAT('%', :artistText, '%'))
            ORDER BY e.eventDate ASC
            """)
    List<Event> findRecommendedEvents(@Param("after") LocalDateTime after,
                                      @Param("city") String city,
                                      @Param("artistText") String artistText);
}
