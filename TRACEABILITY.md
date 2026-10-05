# Matriz de trazabilidad de implementación

Esta matriz conecta los requisitos principales del PRD con el código y las pruebas del proyecto.

| Requisito | Implementación | Prueba |
|---|---|---|
| FR-VEN-001 / AC-001 | `Venue`, `VenueRepository.findByCode` | `VenuePersistenceTest.shouldPersistAndFindVenueByCode` |
| FR-VEN-002 | `UNIQUE venues.code` en V1 | `VenuePersistenceTest.shouldRejectDuplicateVenueCode` |
| FR-VEN-003 | `CHECK capacity > 0` en V1 | `VenuePersistenceTest.shouldRejectNonPositiveCapacity` |
| FR-VEN-004 | `EventRepository.findByVenue_CodeOrderByEventDateAsc` | `EventRepositoryIT.shouldFindEventsByVenueCode` |
| FR-EVT-001 / AC-002 | `Event`, relación `ManyToOne` con `Venue` | `EventRepositoryIT.shouldFindEventByCodeAndVenue` |
| FR-EVT-003 / 004 | `EnumType.STRING` + CHECK de estado/categoría | Cubierto al iniciar Hibernate con `ddl-auto=validate` y pruebas de Event |
| FR-EVT-005 / AC-006 | `findByStatusOrderByEventDateAsc` | `EventRepositoryIT.shouldReturnOnlyPublishedEventsOrderedByDate` |
| FR-EVT-006 | V3 + `Event.streamingUrl` | `EventRepositoryIT.shouldFindEventByCodeAndVenue` |
| FR-ART-001 / 002 | `Artist`, `ArtistRepository` + UNIQUE | Uso de artistas V2 en `EventArtistIT` |
| FR-ART-003 / AC-003 | `Event.artists` + `event_artists` PK compuesta | `EventArtistIT` |
| FR-ART-004 / FR-SRC-001 / AC-007 | JPQL `findEventsByArtistStageName` | `EventArtistIT` |
| FR-USR-001 / 002 | `User`, `UserRepository` + UNIQUE | `UserProfileIT` |
| FR-USR-003 / AC-004 | `UserProfile.user` + UNIQUE(user_id) | `UserProfileIT.shouldRejectSecondProfileForSameUser` |
| FR-TKT-001 | FKs NOT NULL `ticket.user_id`, `ticket.event_id` | `TicketRepositoryIT` |
| FR-TKT-002 / AC-005 | UNIQUE `ticket_code` | `TicketRepositoryIT.shouldRejectDuplicateTicketCode` |
| FR-TKT-003 | CHECK `price >= 0` | `TicketRepositoryIT.shouldRejectNegativePrice` |
| FR-TKT-004 / 005 | Enums STRING + CHECK | `TicketRepositoryIT` |
| FR-TKT-006 | Query Methods por `user.email` y status | `TicketRepositoryIT.shouldQueryTicketsByUserEventAndStatusAndCountPaidSales` |
| FR-TKT-007 | Query Method `event.eventCode + status` | `TicketRepositoryIT.shouldQueryTicketsByUserEventAndStatusAndCountPaidSales` |
| FR-TKT-008 / AC-008 | JPQL `COUNT` de PAID | `TicketRepositoryIT.shouldQueryTicketsByUserEventAndStatusAndCountPaidSales` |
| FR-SRC-002 | JPQL ciudad + artista | `EventSearchIT` |
| FR-SRC-003 | JPQL PUBLISHED + fecha + ciudad + texto de artista + DISTINCT + orden | `EventSearchIT` |
| FR-SRC-004 | JPQL tickets por fecha futura + orden | `TicketRepositoryIT.shouldReturnTicketsForFutureEventsOrderedChronologically` |
| NFR-002 / 003 | Flyway V1, V2, V3 | `FlywayMigrationIT` |
| NFR-004 / 005 | PostgreSQL Testcontainers | `PostgresIntegrationTest` y todos los IT |
| NFR-007 | Query Methods simples + JPQL complejas | Repositories |
| NFR-008 / BR-007 | `BigDecimal` + `NUMERIC(12,2)` | `Ticket` / V1 |
