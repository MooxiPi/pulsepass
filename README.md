# PulsePass

Implementación académica de la capa de persistencia definida en el PRD de PulsePass.

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

No incluye REST, Service, autenticación, pagos ni frontend, porque están fuera del alcance del PRD.

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
