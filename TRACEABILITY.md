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
| NFR-002 / 003 | Flyway V1–V4 | `FlywayMigrationIT` |
| NFR-004 / 005 | PostgreSQL Testcontainers | `PostgresIntegrationTest` y todos los IT |
| NFR-007 | Query Methods simples + JPQL complejas | Repositories |
| NFR-008 / BR-007 | `BigDecimal` + `NUMERIC(12,2)` | `Ticket` / V1 |

## Fase 4: seguridad

| Requisito | Implementación | Verificación automatizada |
|---|---|---|
| Credenciales y roles sin contraseña predeterminada para usuarios legados | V4, `UserCredential`, `UserCredentialRepository` | `FlywayMigrationIT.upgradesV3WithoutChangingLegacyUsers` |
| Registro público con contraseña válida, BCrypt y rol USER, sin elevación desde el cuerpo | `RegisterUserRequest`, `PasswordPolicy`, `UserServiceImpl.register` | `SecurityHttpIT.fixtures`, `SecurityHttpIT.validationConflictsAndAtomicRegistration`, `JwtServiceTest.validatesPasswordUtf8Bytes` |
| Login por usuario o email y respuesta Bearer | `AuthController.login`, `AuthService`, `CustomUserDetailsService` | `SecurityHttpIT.fixtures`, `SecurityHttpIT.loginErrorsAndInvalidTokens` |
| Identificadores de login sin colisión entre username y email | `RegisterUserRequest`, `UserServiceImpl.register`, `UserRepository.existsByUsernameIgnoreCase` | `SecurityHttpIT.validationConflictsAndAtomicRegistration` |
| JWT HS256 firmado, con emisor, vencimiento y claims requeridos | `JwtService`, `JwtAuthenticationFilter` | `JwtServiceTest`, `SecurityHttpIT.invalidSignedTokensRejectedOverHttp` |
| Sesión stateless, sin autenticación por cookie o query string | `SecurityConfig`, `JwtAuthenticationFilter` | `SecurityHttpIT.duplicateHeadersAndSessionsCannotAuthenticate`, `SecurityHttpIT.loginErrorsAndInvalidTokens` |
| Catálogos públicos y borradores ocultos para usuarios no operadores | `SecurityConfig`, `EventServiceImpl` | `SecurityHttpIT.publicCatalogAndDraftPrivacy` |
| Permisos por rol y propietario para eventos, usuarios y tickets | `SecurityConfig`, `AuthorizationService`, `*ServiceImpl` | `SecurityHttpIT.anonymousProtectedMatrix`, `SecurityHttpIT.userForbiddenMatrix`, `SecurityHttpIT.ownershipAndTicketLifecycle` |
| Estado y roles recargados en cada solicitud | `CustomUserDetailsService`, `JwtAuthenticationFilter` | `SecurityHttpIT.stateAndRolesReloaded` |
| Respuestas 401/403 y contrato de error uniforme | `SecurityErrorWriter`, `GlobalExceptionHandler` | `SecurityHttpIT` |

## Fase 5: E2E manual en Postman

La colección `tests/e2e/postman/PulsePass-Manual-E2E.postman_collection.json`
contiene 88 solicitudes sin scripts ni aserciones automáticas. Su plantilla
de entorno está en `tests/e2e/postman/PulsePass-local.postman_environment.json`;
los datos aislados están en `tests/e2e/fixtures/seed-e2e.sql` y la secuencia
en `tests/e2e/README.md` y `tests/e2e/checklist-e2e-manual.md`.
`tests/e2e/matriz-cobertura.md` conecta los casos con las 22 operaciones HTTP.
Los 88 casos de `tests/e2e/registro-ejecucion-manual.md` siguen **NOT RUN**
hasta enviarse individualmente con Postman Send y revisarse las respuestas.
Las pruebas Java no reemplazan esa evidencia manual.
