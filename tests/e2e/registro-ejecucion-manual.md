# Bitácora manual de Postman

Completar después de cada Send y revisión humana. Estado inicial **NOT RUN** significa que aún no se ha enviado la petición; usar **BLOCKED** únicamente si una precondición concreta impide ejecutarla, e indicar cuál en Observación. PASS requiere HTTP, JSON y estado de negocio verificados; FAIL indica discrepancia. No registrar contraseñas ni JWT.

| ID | Fecha/hora | Actor | Método y ruta | Datos clave (sin secretos) | HTTP esperado | HTTP real | JSON/estado observado | Resultado | Evidencia | Observación |
|---|---|---|---|---|---|---|---|---|---|---|
| PRE-01 | — | ANONYMOUS | `GET /api/venues/active` | fixture E2E | 200 | — | — | NOT RUN | — | — |
| E2E-VEN-02 | — | ANONYMOUS | `GET /api/venues/active` | fixture E2E | 200 | — | — | NOT RUN | — | — |
| E2E-VEN-01 | — | ANONYMOUS | `GET /api/venues/{{venueActiveCode}}` | {{venueActiveCode}} | 200 | — | — | NOT RUN | — | — |
| E2E-ART-03 | — | ANONYMOUS | `GET /api/artists/active` | fixture E2E | 200 | — | — | NOT RUN | — | — |
| E2E-ART-01 | — | ANONYMOUS | `GET /api/artists/{{artistId}}` | {{artistId}} | 200 | — | — | NOT RUN | — | — |
| E2E-ART-02 | — | ANONYMOUS | `GET /api/artists/by-stage-name?stageName={{artistStageName}}` | {{artistStageName}} | 200 | — | — | NOT RUN | — | — |
| E2E-EVT-03 | — | ANONYMOUS | `GET /api/events/published` | fixture E2E | 200 | — | — | NOT RUN | — | — |
| E2E-EVT-02 | — | ANONYMOUS | `GET /api/events/{{publishedEventCode}}` | {{publishedEventCode}} | 200 | — | — | NOT RUN | — | — |
| E2E-EVT-06 | — | ANONYMOUS | `GET /api/events/by-artist?stageName={{artistStageName}}` | {{artistStageName}} | 200 | — | — | NOT RUN | — | — |
| TC-SEC-004 | — | ANONYMOUS | `GET /api/events/{{draftEventCode}}` | {{draftEventCode}} | 404 | — | — | NOT RUN | — | — |
| TC-SEC-005 | — | ANONYMOUS | `GET /api/events/by-artist?stageName={{artistStageName}}` | {{artistStageName}} | 200 | — | — | NOT RUN | — | — |
| TC-AUTH-001-userA | — | ANONYMOUS | `POST /api/users` | {{userAUsername}}, {{userAEmail}} | 201 | — | — | NOT RUN | — | — |
| TC-AUTH-001-userB | — | ANONYMOUS | `POST /api/users` | {{userBUsername}}, {{userBEmail}} | 201 | — | — | NOT RUN | — | — |
| LOGIN-userA | — | ANONYMOUS | `POST /api/auth/login` | {{userAUsername}} | 200 | — | — | NOT RUN | — | — |
| LOGIN-userB | — | ANONYMOUS | `POST /api/auth/login` | {{userBUsername}} | 200 | — | — | NOT RUN | — | — |
| LOGIN-staff | — | ANONYMOUS | `POST /api/auth/login` | identidad/JWT de prueba (valor omitido) | 200 | — | — | NOT RUN | — | — |
| LOGIN-admin | — | ANONYMOUS | `POST /api/auth/login` | identidad/JWT de prueba (valor omitido) | 200 | — | — | NOT RUN | — | — |
| LOGIN-inactive | — | ANONYMOUS | `POST /api/auth/login` | identidad/JWT de prueba (valor omitido) | 401 | — | — | NOT RUN | — | — |
| ME-userA | — | userA | `GET /api/auth/me` | identidad/JWT de prueba (valor omitido) | 200 | — | — | NOT RUN | — | — |
| ME-userB | — | userB | `GET /api/auth/me` | identidad/JWT de prueba (valor omitido) | 200 | — | — | NOT RUN | — | — |
| ME-staff | — | staff | `GET /api/auth/me` | identidad/JWT de prueba (valor omitido) | 200 | — | — | NOT RUN | — | — |
| ME-admin | — | admin | `GET /api/auth/me` | identidad/JWT de prueba (valor omitido) | 200 | — | — | NOT RUN | — | — |
| TC-AUTH-003 | — | ANONYMOUS | `POST /api/auth/login` | {{userAEmail}} | 200 | — | — | NOT RUN | — | — |
| E2E-USR-02 | — | userA | `GET /api/users/by-email?email={{userAEmail}}` | {{userAEmail}} | 200 | — | — | NOT RUN | — | — |
| E2E-USR-03 | — | userA | `GET /api/users/by-username?username={{userAUsername}}` | {{userAUsername}} | 200 | — | — | NOT RUN | — | — |
| E2E-EVT-01 | — | admin | `POST /api/events` | {{newEventCode}}, {{runId}}, {{futureEventDate}}, {{venueActiveCode}} | 201 | — | — | NOT RUN | — | — |
| E2E-EVT-02-OPS | — | admin | `GET /api/events/{{eventToPublishCode}}` | {{eventToPublishCode}} | 200 | — | — | NOT RUN | — | — |
| TC-SEC-015 | — | admin | `GET /api/events/{{draftEventCode}}` | {{draftEventCode}} | 200 | — | — | NOT RUN | — | — |
| TC-SEC-001 | — | userA | `POST /api/events` | {{runId}}, {{futureEventDate}}, {{venueActiveCode}} | 403 | — | — | NOT RUN | — | — |
| TC-SEC-002 | — | userA | `PATCH /api/events/{{draftEventCode}}/publish` | {{draftEventCode}} | 403 | — | — | NOT RUN | — | — |
| TC-SEC-002-STAFF | — | staff | `PATCH /api/events/{{draftEventCode}}/publish` | {{draftEventCode}} | 403 | — | — | NOT RUN | — | — |
| TC-SEC-003 | — | userA | `POST /api/events/{{eventToPublishCode}}/artists/{{artistId}}` | {{eventToPublishCode}}, {{artistId}} | 403 | — | — | NOT RUN | — | — |
| E2E-EVT-05 | — | admin | `POST /api/events/{{eventToPublishCode}}/artists/{{artistId}}` | {{eventToPublishCode}}, {{artistId}} | 200 | — | — | NOT RUN | — | — |
| E2E-EVT-04 | — | admin | `PATCH /api/events/{{eventToPublishCode}}/publish` | {{eventToPublishCode}} | 200 | — | — | NOT RUN | — | — |
| E2E-TKT-01-Cancelable | — | userA | `POST /api/tickets` | {{userAEmail}}, {{publishedEventCode}} | 201 | — | — | NOT RUN | — | — |
| E2E-TKT-01-Usable | — | userA | `POST /api/tickets` | {{userAEmail}}, {{publishedEventCode}} | 201 | — | — | NOT RUN | — | — |
| E2E-TKT-02 | — | userA | `GET /api/tickets/{{ticketCancelableCode}}` | {{ticketCancelableCode}} | 200 | — | — | NOT RUN | — | — |
| E2E-TKT-03 | — | userA | `GET /api/tickets/by-user?email={{userAEmail}}` | {{userAEmail}} | 200 | — | — | NOT RUN | — | — |
| E2E-TKT-04 | — | staff | `GET /api/events/{{publishedEventCode}}/tickets/paid` | {{publishedEventCode}} | 200 | — | — | NOT RUN | — | — |
| NOAUTH-06 | — | ANONYMOUS | `POST /api/tickets` | {{userAEmail}}, {{publishedEventCode}} | 401 | — | — | NOT RUN | — | — |
| NOAUTH-07 | — | ANONYMOUS | `GET /api/tickets/{{ticketCancelableCode}}` | {{ticketCancelableCode}} | 401 | — | — | NOT RUN | — | — |
| NOAUTH-08 | — | ANONYMOUS | `GET /api/tickets/by-user?email={{userAEmail}}` | {{userAEmail}} | 401 | — | — | NOT RUN | — | — |
| NOAUTH-09 | — | ANONYMOUS | `GET /api/events/{{publishedEventCode}}/tickets/paid` | {{publishedEventCode}} | 401 | — | — | NOT RUN | — | — |
| NOAUTH-10 | — | ANONYMOUS | `PATCH /api/tickets/{{ticketCancelableCode}}/cancel` | {{ticketCancelableCode}} | 401 | — | — | NOT RUN | — | — |
| NOAUTH-11 | — | ANONYMOUS | `PATCH /api/tickets/{{ticketUsableCode}}/use` | {{ticketUsableCode}} | 401 | — | — | NOT RUN | — | — |
| TC-SEC-008 | — | userA | `POST /api/tickets` | {{userBEmail}}, {{publishedEventCode}} | 403 | — | — | NOT RUN | — | — |
| TC-SEC-009 | — | userB | `GET /api/tickets/{{ticketCancelableCode}}` | {{ticketCancelableCode}} | 403 | — | — | NOT RUN | — | — |
| TC-SEC-010 | — | userB | `GET /api/tickets/by-user?email={{userAEmail}}` | {{userAEmail}} | 403 | — | — | NOT RUN | — | — |
| TC-SEC-011 | — | userB | `PATCH /api/tickets/{{ticketCancelableCode}}/cancel` | {{ticketCancelableCode}} | 403 | — | — | NOT RUN | — | — |
| TC-SEC-012 | — | userB | `PATCH /api/tickets/{{ticketUsableCode}}/use` | {{ticketUsableCode}} | 403 | — | — | NOT RUN | — | — |
| TC-SEC-013 | — | userA | `GET /api/events/{{publishedEventCode}}/tickets/paid` | {{publishedEventCode}} | 403 | — | — | NOT RUN | — | — |
| E2E-TKT-05 | — | userA | `PATCH /api/tickets/{{ticketCancelableCode}}/cancel` | {{ticketCancelableCode}} | 200 | — | — | NOT RUN | — | — |
| E2E-TKT-06 | — | staff | `PATCH /api/tickets/{{ticketUsableCode}}/use` | {{ticketUsableCode}} | 200 | — | — | NOT RUN | — | — |
| VERIFY-USED | — | userA | `GET /api/tickets/{{ticketUsableCode}}` | {{ticketUsableCode}} | 200 | — | — | NOT RUN | — | — |
| TC-AUTH-004 | — | ANONYMOUS | `POST /api/auth/login` | {{userAUsername}} | 401 | — | — | NOT RUN | — | — |
| TC-AUTH-005 | — | ANONYMOUS | `POST /api/auth/login` | {{runId}} | 401 | — | — | NOT RUN | — | — |
| NOAUTH-01 | — | ANONYMOUS | `POST /api/events` | {{newEventCode}}, {{runId}}, {{futureEventDate}}, {{venueActiveCode}} | 401 | — | — | NOT RUN | — | — |
| NOAUTH-02 | — | ANONYMOUS | `PATCH /api/events/{{draftEventCode}}/publish` | {{draftEventCode}} | 401 | — | — | NOT RUN | — | — |
| NOAUTH-03 | — | ANONYMOUS | `POST /api/events/{{draftEventCode}}/artists/{{artistId}}` | {{draftEventCode}}, {{artistId}} | 401 | — | — | NOT RUN | — | — |
| NOAUTH-04 | — | ANONYMOUS | `GET /api/users/by-email?email={{userAEmail}}` | {{userAEmail}} | 401 | — | — | NOT RUN | — | — |
| NOAUTH-05 | — | ANONYMOUS | `GET /api/users/by-username?username={{userAUsername}}` | {{userAUsername}} | 401 | — | — | NOT RUN | — | — |
| NOAUTH-12 | — | ANONYMOUS | `GET /api/auth/me` | identidad/JWT de prueba (valor omitido) | 401 | — | — | NOT RUN | — | — |
| TC-SEC-006 | — | userB | `GET /api/users/by-email?email={{userAEmail}}` | {{userAEmail}} | 403 | — | — | NOT RUN | — | — |
| TC-SEC-007 | — | userB | `GET /api/users/by-username?username={{userAUsername}}` | {{userAUsername}} | 403 | — | — | NOT RUN | — | — |
| TC-SEC-016 | — | ANONYMOUS | `POST /api/users` | {{runId}} | 201 | — | — | NOT RUN | — | — |
| TC-AUTH-008 | — | malformed | `GET /api/auth/me` | identidad/JWT de prueba (valor omitido) | 401 | — | — | NOT RUN | — | — |
| TC-AUTH-009 | — | tampered | `GET /api/auth/me` | identidad/JWT de prueba (valor omitido) | 401 | — | — | NOT RUN | — | — |
| TC-AUTH-010 | — | expired | `GET /api/auth/me` | identidad/JWT de prueba (valor omitido) | 401 | — | — | NOT RUN | — | — |
| TC-AUTH-011-KEY | — | wrongKey | `GET /api/auth/me` | identidad/JWT de prueba (valor omitido) | 401 | — | — | NOT RUN | — | — |
| TC-AUTH-011-ISSUER | — | wrongIssuer | `GET /api/auth/me` | identidad/JWT de prueba (valor omitido) | 401 | — | — | NOT RUN | — | — |
| TC-AUTH-012 | — | ANONYMOUS | `GET /api/auth/me?token=[token omitido]` | identidad/JWT de prueba (valor omitido) | 401 | — | — | NOT RUN | — | — |
| TC-AUTH-015 | — | malformed | `GET /api/venues/active` | identidad/JWT de prueba (valor omitido) | 401 | — | — | NOT RUN | — | — |
| TC-AUTH-013 | — | userB | `GET /api/auth/me` | identidad/JWT de prueba (valor omitido) | 401 | — | — | NOT RUN | — | — |
| TC-SEC-017 | — | staff | `GET /api/events/{{publishedEventCode}}/tickets/paid` | {{publishedEventCode}} | 403 | — | — | NOT RUN | — | — |
| TC-HTTP-400-REQUIRED | — | ANONYMOUS | `POST /api/users` | fixture E2E | 400 | — | — | NOT RUN | — | — |
| TC-HTTP-400-EMAIL | — | ANONYMOUS | `POST /api/users` | {{userAUsername}} | 400 | — | — | NOT RUN | — | — |
| TC-HTTP-400-JSON | — | ANONYMOUS | `POST /api/users` | JSON malformado | 400 | — | — | NOT RUN | — | — |
| TC-HTTP-400-ENUM | — | userA | `POST /api/tickets` | {{userAEmail}}, {{publishedEventCode}} | 400 | — | — | NOT RUN | — | — |
| TC-HTTP-400-PASSWORD | — | ANONYMOUS | `POST /api/users` | {{userAUsername}}, {{userAEmail}} | 400 | — | — | NOT RUN | — | — |
| TC-HTTP-404-VENUE | — | ANONYMOUS | `GET /api/venues/missing-{{runId}}` | {{runId}} | 404 | — | — | NOT RUN | — | — |
| TC-HTTP-404-ARTIST | — | ANONYMOUS | `GET /api/artists/9223372036854775807` | recurso inexistente | 404 | — | — | NOT RUN | — | — |
| TC-HTTP-409-USER | — | ANONYMOUS | `POST /api/users` | {{userAUsername}}, {{userAEmail}} | 409 | — | — | NOT RUN | — | — |
| TC-HTTP-409-CANCEL | — | userA | `PATCH /api/tickets/{{ticketCancelableCode}}/cancel` | {{ticketCancelableCode}} | 409 | — | — | NOT RUN | — | — |
| TC-HTTP-409-USE | — | staff | `PATCH /api/tickets/{{ticketUsableCode}}/use` | {{ticketUsableCode}} | 409 | — | — | NOT RUN | — | — |
| TC-HTTP-409-DRAFT | — | userA | `POST /api/tickets` | {{userAEmail}}, {{draftEventCode}} | 409 | — | — | NOT RUN | — | — |
| TC-HTTP-409-CAPACITY | — | userA | `POST /api/tickets` | {{userAEmail}}, {{soldOutEventCode}} | 409 | — | — | NOT RUN | — | — |
| TC-HTTP-409-AGE | — | userA | `POST /api/tickets` | {{userAEmail}}, {{ageRestrictedEventCode}} | 409 | — | — | NOT RUN | — | — |
| FLOW-FINAL | — | userA | `GET /api/tickets/by-user?email={{userAEmail}}` | {{userAEmail}} | 200 | — | — | NOT RUN | — | — |
