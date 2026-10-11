# PulsePass

Implementación académica de una plataforma de gestión
de eventos, artistas, usuarios y entradas.

El proyecto utiliza una arquitectura por capas con
Spring Boot:

- Capa de persistencia: entidades JPA y repositories.
- Capa de servicios: lógica y reglas de negocio.
- Capa de controladores REST: endpoints HTTP,
  validación de solicitudes y manejo de errores.

Tecnologías principales: Java 21, Spring Boot 4.1.1,
Maven, PostgreSQL, Flyway, MapStruct, JUnit 5,
Mockito, MockMvc y Testcontainers.

## Tecnologías

- Java 21
- Spring Boot 4.1.1
- Maven
- Spring Data JPA / Hibernate
- PostgreSQL
- Flyway
- Testcontainers
- JUnit 5 / AssertJ

## Alcance

Este proyecto implementa únicamente el dominio y la persistencia del MVP:

- Venue 1:N Event
- Event N:M Artist
- User 1:1 UserProfile
- User 1:N Ticket
- Event 1:N Ticket
- Query Methods para búsquedas simples
- JPQL para JOIN, DISTINCT y COUNT
- Migraciones Flyway V1, V2 y V3
- Pruebas de integración contra PostgreSQL real mediante Testcontainers

No incluye  autenticación, pagos ni frontend, porque están fuera del alcance del PRD.

## Migraciones

### V1__create_schema.sql

Crea:

- `venues`
- `events`
- `artists`
- `event_artists`
- `users`
- `user_profiles`
- `tickets`

También agrega PK, FK, UNIQUE, CHECK e índices relevantes.

### V2__insert_initial_artists.sql

Inserta:

- Solar Beat
- Neon Waves
- Caribbean Sound
- Ocean Drive
- Digital Pulse

### V3__add_streaming_url_to_event.sql

Agrega `streaming_url VARCHAR(500)` nullable a `events`.

## Repositories

### VenueRepository
- Buscar venue por `code`.

### ArtistRepository
- Buscar artista por `stageName`.

### UserRepository
- Buscar usuario por `username`.
- Buscar usuario por email ignorando mayúsculas/minúsculas.

### UserProfileRepository
- Buscar perfil por usuario.

### EventRepository
- Buscar por `eventCode`.
- Eventos publicados ordenados por fecha.
- Eventos por `venue.code`.
- Eventos por artista con JPQL.
- Eventos por ciudad + artista.
- Eventos recomendados con estado PUBLISHED, fecha, ciudad y texto de artista.

### TicketRepository
- Buscar por `ticketCode`.
- Tickets por email.
- Tickets por email + estado.
- Tickets por `eventCode` + estado.
- Contar tickets PAID de un evento mediante JPQL.
- Tickets asociados a eventos futuros.

## Configuración local opcional

Las pruebas NO requieren un PostgreSQL instalado manualmente: Testcontainers crea uno temporal automáticamente.

Para ejecutar la aplicación fuera de las pruebas puedes iniciar PostgreSQL con:

```bash
docker compose up -d
```

La configuración por defecto es:

```text
DB: pulsepass
Usuario: pulsepass
Password: pulsepass
Puerto: 5432
```

También puedes usar variables de entorno:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
```

## Ejecutar pruebas

Docker debe estar iniciado porque Testcontainers lo utiliza.

```bash
mvn clean test
```

El resultado esperado es:

```text
BUILD SUCCESS
```

## Abrir en IntelliJ IDEA

1. `File > Open`.
2. Seleccionar la carpeta `pulsepass`.
3. IntelliJ detectará `pom.xml`.
4. Seleccionar JDK 21.
5. Esperar a que Maven descargue las dependencias.
6. Iniciar Docker Desktop.
7. Abrir la terminal del proyecto.
8. Ejecutar `mvn clean test`.

## Notas de diseño

- Los enums se guardan con `EnumType.STRING`, nunca como ordinal.
- Los precios usan `BigDecimal` y PostgreSQL `NUMERIC(12,2)`.
- `Ticket` es una entidad propia porque contiene código, tipo, precio, estado y fecha de compra.
- La tabla `event_artists` usa PK compuesta `(event_id, artist_id)` para evitar asociaciones duplicadas.
- `user_profiles.user_id` es UNIQUE para garantizar la relación 1:1.
- Hibernate usa `ddl-auto=validate`; Flyway es el único responsable de crear/evolucionar el esquema.


## API REST

La aplicación expone 20 operaciones HTTP mediante cinco controladores.

### Venues
- GET /api/venues/{code}
- GET /api/venues/active

### Events
- POST /api/events
- GET /api/events/{eventCode}
- GET /api/events/published
- PATCH /api/events/{eventCode}/publish
- POST /api/events/{eventCode}/artists/{artistId}
- GET /api/events/by-artist?stageName=...

### Artists
- GET /api/artists/{id}
- GET /api/artists/by-stage-name?stageName=...
- GET /api/artists/active

### Users
- POST /api/users
- GET /api/users/by-email?email=...
- GET /api/users/by-username?username=...

### Tickets
- POST /api/tickets
- GET /api/tickets/{ticketCode}
- GET /api/tickets/by-user?email=...
- GET /api/events/{eventCode}/tickets/paid
- PATCH /api/tickets/{ticketCode}/cancel
- PATCH /api/tickets/{ticketCode}/use

## Validación y manejo de errores

Los Controllers utilizan Bean Validation y delegan
las reglas de negocio a los Services.

GlobalExceptionHandler centraliza las respuestas HTTP:

- 400: solicitud inválida
- 404: recurso inexistente
- 409: duplicados y conflictos de negocio
- 500: error interno inesperado

Los errores siguen el contrato ErrorResponse.

## Pruebas automatizadas

El proyecto utiliza JUnit 5, Mockito, MockMvc y
Testcontainers.

Para ejecutar únicamente las pruebas HTTP:

    mvn '-Dtest=*ControllerTest' test

Para ejecutar todas las pruebas:

    mvn clean test

Docker Desktop debe estar funcionando para las
pruebas de persistencia con Testcontainers.

Última ejecución verificada:
59 pruebas, 0 fallidas, 0 errores.
BUILD SUCCESS.
