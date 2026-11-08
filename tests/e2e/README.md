# PulsePass: E2E manual en Postman

La colección no contiene scripts, event, pm.test ni captura automática. Cada solicitud se envía con Send. Las pruebas Java de seguridad son evidencia automatizada complementaria, no resultados manuales.

## Preparación
1. Usar Java 21 y Maven. Arrancar PostgreSQL en una base exclusiva `pulsepass_e2e`. Nunca usar datos reales. Docker/Testcontainers es opcional para las pruebas si se configura la base local aislada.
2. Configurar `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `PULSEPASS_JWT_SECRET_BASE64` y ejecutar `mvn spring-boot:run`. Generar el secreto con 32 bytes aleatorios; no usar la clave de pruebas de src/test. La aplicación falla si falta el secreto.
3. Aplicar los fixtures de fixtures/README.md después de Flyway. Elegir runId alfanumérico nuevo para cada ejecución. No borrar la base de uso habitual.
4. Importar los dos JSON de postman/ en Postman Desktop y seleccionar PulsePass-local. Cambiar baseUrl si el puerto es distinto.
5. Completar variables de usuarios, credenciales y fixtures localmente. Los JSON compartidos dejan contraseñas y tokens vacíos. Copiar artistId desde GET /artists/active; no asumir ID 1.

El registro exige usernames sin `@`. Además, el email nuevo no puede coincidir, ignorando mayúsculas, con el username de una cuenta legada; así el login por username o email conserva un identificador inequívoco. Elegir los valores de `runId`, `userAUsername`, `userBUsername` y correos de forma consistente antes de registrar.

## Secuencia con Send
A. Descubrimiento: PRE-01, carpeta 01, carpeta 02, E2E-EVT-03, E2E-EVT-02, E2E-EVT-06, TC-SEC-004/005. Comparar los datos públicos con fixtures.
B. Identidades: registrar A y B; login A/B/STAFF/ADMIN; copiar cada accessToken a su variable local y ejecutar los cuatro ME. Password de registro debe tener mínimo 12 caracteres y máximo 72 bytes UTF-8. Repetir login si pasan 15 minutos.
C. Catálogo: crear newEventCode único como ADMIN; copiar a eventToPublishCode; GET como ADMIN debe ser DRAFT; asociar artista; publicar; copiar eventToPublishCode a publishedEventCode; consultar público, listado y por artista.
D. Tickets: comprar dos tickets y copiar sus códigos a ticketCancelableCode y ticketUsableCode. Ejecutar consultas propias, consultas operativas y TODAS las pruebas IDOR/denegación con los tickets aún PAID. Volver a consultar después de cada denegación: deben seguir PAID. Comprobar que la compra para B no aumentó su lista. Cancelar el primero, releer CANCELLED; usar el segundo como STAFF, releer USED. Repeticiones deben dar 409; lista PAID debe excluir ambos.
E. Errores: carpetas 07 y 08. Ejecutar inactivación y revocación al final y restaurar después. Comparar los cinco campos ErrorResponse y ausencia de secretos. Repetir con rol ADMIN donde se permite acceso administrativo; STAFF no puede consultar datos personales ni cancelar tickets ajenos.

## JWT negativos
malformedToken contiene texto inválido. Para tamperedToken copiar token de A y cambiar un carácter de la firma (primero después del último punto). Para expiredToken conservar un token, esperar su expiresIn y volver a enviar. Alternativa: arrancar SOLO la instancia de pruebas con TTL de 2 segundos y luego restaurar 900; no modificar producción. wrongKeyToken/wrongIssuerToken se generan offline solo con clave efímera del entorno E2E; nunca guardar claves en la colección. La suite JwtServiceTest verifica estos casos criptográficamente y SecurityHttpIT verifica el filtro real.

## Comparación y evidencia
Cada request incluye actor, precondición, HTTP exacto y revisión manual. Ver Status, Content-Type application/json, Body y ausencia de JSESSIONID. Para errores, timestamp/status/error/message/details; status debe coincidir con HTTP. No basta observar 200. Completar registro-ejecucion-manual.md y checklist. Un caso sin fixture o revisión manual sigue BLOCKED, nunca PASS por inferencia.

DTOs: VenueResponse(id,code,name,city,address,capacity,active); ArtistResponse(id,stageName,country,genre,active); UserResponse(id,username,email,active,firstName,lastName,phone,city,birthDate); EventResponse(id,eventCode,name,description,category,status,eventDate,minimumAge,venueCode,venueName,artists); EventSummaryResponse(id,eventCode,name,category,status,eventDate,venueName); TicketResponse(id,ticketCode,type,price,status,purchaseDate,userEmail,eventCode,eventName); AuthResponse(accessToken,tokenType,expiresIn); AuthenticatedUserResponse(userId,username,email,roles).

## Repetir y limpiar
Usar otro runId y nuevos usuarios/códigos. No reutilizar tickets cancelados/usados. Mantener fixtures anteriores permite revisar evidencia; su eliminación es opcional y exclusivamente dentro de pulsepass_e2e, con copia previa si se necesita. No hay reset automático ni comandos destructivos incluidos. Exportar solo la plantilla limpia sin secretos.
