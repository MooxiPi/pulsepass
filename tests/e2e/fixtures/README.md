# Fixtures exclusivos para pulsepass_e2e

Ejecutar seed-e2e.sql desde psql conectado a pulsepass_e2e, después de arrancar la API y aplicar Flyway. El SQL se niega a operar en otra base, usa transacción y no borra registros. Cambiar runId en cada corrida. Requiere extensión pgcrypto para BCrypt; se habilita únicamente en la base E2E.

En psql usar `\set runId manual01` y `\prompt -s 'Password ADMIN: ' adminPassword`, repetir para staffPassword e inactivePassword. Usar frases únicas de al menos 12 caracteres y máximo 72 bytes. Después `\i tests/e2e/fixtures/seed-e2e.sql`. No poner passwords en argumentos de terminal ni archivos compartidos. Pegar los mismos valores en variables locales Postman. A y B se registran por HTTP.

El seed crea venue, artista, tres cuentas y cuatro eventos. Copiar el ID real de artista desde GET /artists/active. newEventCode y eventToPublishCode usan runId-new, que no existe hasta crear por HTTP. Las fechas del seed son futuras en cada ejecución.

Prueba de inactividad: con token B guardado, en esta base ejecutar `UPDATE users SET active=false WHERE username=:'runId'||'-b';`; probar /auth/me 401 y login 401. Restaurar active=true con el mismo predicado.

Revocación: `DELETE FROM user_roles WHERE user_id=(SELECT id FROM users WHERE username=:'runId'||'-staff') AND role='STAFF';`. El siguiente request de tickets/paid con token anterior debe ser 403. Restaurar con `INSERT INTO user_roles(user_id,role) SELECT id,'STAFF' FROM users WHERE username=:'runId'||'-staff' ON CONFLICT DO NOTHING;`. Solo usar en pulsepass_e2e y al final del recorrido.

No existe endpoint para promover roles. Usuarios legados permanecen sin login hasta provisión administrativa individual de un hash BCrypt y rol, después de verificar identidad por un canal externo seguro. Nunca asignarles contraseña compartida o predeterminada.
