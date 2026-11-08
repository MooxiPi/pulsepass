# PulsePass

Implementación académica de una plataforma de gestión
de eventos, artistas, usuarios y entradas.

El proyecto utiliza una arquitectura por capas con
Spring Boot:

- Capa de persistencia: entidades JPA y repositories.
- Capa de servicios: lógica y reglas de negocio.
- Capa de controladores REST: endpoints HTTP,
  validación de solicitudes y manejo de errores.
- Capa de seguridad: autenticación JWT, roles y autorización
  por propietario.

Tecnologías principales: Java 21, Spring Boot 4.1.1,
Maven, PostgreSQL, Flyway, MapStruct, JUnit 5,
Mockito, MockMvc, Testcontainers, Spring Security y JJWT.

## Tecnologías

- Java 21
- Spring Boot 4.1.1
- Maven
- Spring Data JPA / Hibernate
- PostgreSQL
- Flyway
- Testcontainers
- JUnit 5 / AssertJ
- Spring Security / BCrypt
- JJWT (JWT HS256)
- Postman (recorrido E2E manual)

## Alcance

El proyecto implementa persistencia, servicios, API REST y
seguridad para el MVP:

- Venue 1:N Event
- Event N:M Artist
- User 1:1 UserProfile
- User 1:N Ticket
- Event 1:N Ticket
- Query Methods para búsquedas simples
- JPQL para JOIN, DISTINCT y COUNT
- Migraciones Flyway V1–V4, incluidas credenciales y roles
- 22 operaciones HTTP, entre ellas login y consulta de identidad
- JWT stateless, BCrypt y autorización por rol y propietario
- Pruebas unitarias y de integración contra PostgreSQL
- Colección Postman para verificación E2E manual

Pagos y frontend siguen fuera del alcance.

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

### V4__security_credentials_roles.sql

Agrega `user_credentials` (hash BCrypt) y `user_roles` (USER,
STAFF, ADMIN). Los usuarios existentes no reciben credenciales
predeterminadas.

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

### UserCredentialRepository

- Recuperar credenciales y roles por ID de usuario.

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

La conexión de base de datos se puede cambiar con `DB_URL`,
`DB_USERNAME` y `DB_PASSWORD`. Para iniciar la aplicación es
obligatorio `PULSEPASS_JWT_SECRET_BASE64`, que debe codificar
al menos 32 bytes aleatorios:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
PULSEPASS_JWT_SECRET_BASE64
```

## Ejecutar pruebas

Ejecutar la verificación completa, incluidas las clases `*IT`
mediante Failsafe:

```bash
mvn verify
```

Se necesita PostgreSQL accesible mediante Testcontainers o la
configuración de prueba aislada descrita en «Ejecutar en este equipo».
`mvn test` por sí solo no ejecuta las clases `*IT`.

## Abrir en IntelliJ IDEA

1. `File > Open`.
2. Seleccionar la carpeta `pulsepass`.
3. IntelliJ detectará `pom.xml`.
4. Seleccionar JDK 21.
5. Esperar a que Maven descargue las dependencias.
6. Iniciar Docker Desktop o preparar la base aislada descrita abajo.
7. Abrir la terminal del proyecto.
8. Ejecutar `mvn verify`.

## Notas de diseño

- Los enums se guardan con `EnumType.STRING`, nunca como ordinal.
- Los precios usan `BigDecimal` y PostgreSQL `NUMERIC(12,2)`.
- `Ticket` es una entidad propia porque contiene código, tipo, precio, estado y fecha de compra.
- La tabla `event_artists` usa PK compuesta `(event_id, artist_id)` para evitar asociaciones duplicadas.
- `user_profiles.user_id` es UNIQUE para garantizar la relación 1:1.
- Hibernate usa `ddl-auto=validate`; Flyway es el único responsable de crear/evolucionar el esquema.


## API REST

La aplicación expone 22 operaciones HTTP mediante seis controladores.

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

### Auth
- POST /api/auth/login
- GET /api/auth/me

## Validación y manejo de errores

Los Controllers utilizan Bean Validation y delegan
las reglas de negocio a los Services.

GlobalExceptionHandler centraliza las respuestas HTTP:

- 400: solicitud inválida
- 401: autenticación ausente o inválida
- 403: acceso denegado
- 404: recurso inexistente
- 409: duplicados y conflictos de negocio
- 500: error interno inesperado

Los errores siguen el contrato ErrorResponse.

## Pruebas automatizadas

El proyecto utiliza JUnit 5, Mockito, MockMvc y
Testcontainers.

Para ejecutar únicamente las pruebas HTTP:

    mvn '-Dtest=*ControllerTest' test

Para ejecutar pruebas unitarias e integración:

    mvn verify

Las clases `*IT` necesitan PostgreSQL de Testcontainers o la
base de prueba aislada. En la ejecución de `./scripts/Test.ps1`
del 8 de noviembre de 2026, con WSL activo, pasaron 121 de 121
pruebas automatizadas (`BUILD SUCCESS`). Este resultado no acredita
los casos manuales de Postman.


## Fases 4 y 5: seguridad y verificación

Se conservan los paquetes, las 20 operaciones de negocio y V1–V3. V4 añade `user_credentials` y `user_roles`. El registro público ahora exige `password` (mínimo 12 caracteres, máximo 72 bytes UTF-8), persiste BCrypt y USER en la misma transacción de UserService.register. Los usernames nuevos no pueden contener `@`; un email tampoco puede coincidir con un username legado. Esto evita identificadores ambiguos en el login. No acepta privilegios del cuerpo HTTP. Los usuarios legados no tienen password compartido ni pueden iniciar sesión hasta provisión individual controlada.

`POST /api/auth/login` recibe identifier (username o email) y password; devuelve accessToken, tokenType y expiresIn. `GET /api/auth/me` devuelve userId, username, email y roles actuales. JWT HS256 con sub/iss/iat/exp/jti y typ JWT; 900 segundos por defecto. Estado y roles se recargan desde PostgreSQL en cada request. Tokens solo mediante Authorization Bearer; no cookies ni query string. Bearer inválido incluso en rutas públicas devuelve 401.

Configurar PULSEPASS_JWT_SECRET_BASE64 con Base64 de al menos 32 bytes aleatorios; sin clave válida la aplicación no arranca. PULSEPASS_JWT_ISSUER, PULSEPASS_JWT_TTL_SECONDS y PULSEPASS_CORS_ALLOWED_ORIGINS (lista separada por comas, vacía por defecto) son opcionales. `.env.example` es una plantilla: Spring no carga automáticamente archivos .env. No subir secretos. HTTPS obligatorio fuera de localhost/laboratorio. CSRF está desactivado porque no se usa autenticación por cookies.

Políticas: catálogos públicos; eventos solo PUBLISHED salvo STAFF/ADMIN; borradores invisibles devuelven 404. Crear/publicar/asociar eventos requiere ADMIN. Comprar requiere USER y propietario comprobado por ID persistente. Usuario/tickets por email: propio o ADMIN. Ticket por código: dueño o STAFF/ADMIN. Cancelar: USER dueño o ADMIN. Usar/listar pagados: STAFF/ADMIN. Recursos ajenos devuelven 403 de forma fija. STAFF tiene alcance global operativo en este MVP; no existe asignación por evento. No hay refresh token, denylist/logout revocador, recuperación de password, rate limit ni rotación automática de claves.

Errores conservan los cinco campos reales `timestamp,status,error,message,details` (el texto del PRD que menciona seis es una errata; su record muestra cinco). Filtro y MVC usan la misma estructura. Se registran IDs aleatorios de petición y resultados de autenticación/denegación, sin cuerpos, emails, contraseñas ni JWT.

### Ejecutar en este equipo

Java 21 ya instalado: `scripts/Use-Java21.ps1` configura únicamente la terminal actual. Docker instalado presenta un error de arranque; la verificación usa PostgreSQL 18 en Ubuntu/WSL, clúster exclusivo `pulsepass`, puerto 55432, bases `pulsepass_test` y `pulsepass_e2e`. Mantener WSL activo durante la ejecución. No se modifica la base configurada originalmente en compose.yaml.

- `./scripts/Test.ps1`: ejecuta `mvn verify`, incluidas clases *IT mediante Failsafe. Si existe runtime.local.json usa la base aislada local; en otro equipo, sin ese archivo ni variables externas, utiliza Testcontainers PostgreSQL 17.
- `./scripts/Start-E2E.ps1`: inicia el JAR en http://localhost:18080 con la base E2E y la clave local no versionada. Compilar antes con `mvn package` o Test.ps1. Detener con Ctrl+C.
- `tests/e2e/README.md`: colección Postman v2.1, 88 peticiones manuales, fixtures, matriz, checklist y bitácora. Para ejecutar el recorrido hay que instalar Postman Desktop e importar la colección y el entorno; no se encontró `Postman.exe` en este equipo.
- `tests/e2e/postman/PulsePass-runtime.local.postman_environment.json`: ambiente privado de este equipo con passwords de laboratorio, sin JWT precargados. Importar solo localmente; no compartir. La plantilla compartible es PulsePass-local.postman_environment.json.

Las pruebas externas exigen PULSEPASS_TEST_DB_URL apuntando a localhost/127.0.0.1 y base pulsepass_test; PULSEPASS_TEST_DB_USERNAME/PASSWORD completan la conexión. Cada JVM crea un esquema aleatorio para aislar ejecuciones. Se preservan esos esquemas para diagnóstico; las pruebas HTTP limpian únicamente sus fixtures. Las pruebas Java no equivalen a la aceptación humana de Postman: los 88 casos manuales de `tests/e2e/registro-ejecucion-manual.md` permanecen NOT RUN hasta ejecutarse con Send y revisar cada respuesta.

Fuentes de compatibilidad: https://docs.spring.io/spring-security/reference/7.0/api/java/org/springframework/security/authentication/dao/DaoAuthenticationProvider.html y https://github.com/jwtk/jjwt .
