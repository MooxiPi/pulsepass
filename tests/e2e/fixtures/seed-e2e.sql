\set ON_ERROR_STOP on
BEGIN;
DO $$ BEGIN IF current_database() <> 'pulsepass_e2e' THEN RAISE EXCEPTION 'Only pulsepass_e2e is allowed'; END IF; END $$;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
INSERT INTO venues(code,name,city,address,capacity,active)
VALUES (:'runId'||'-venue','Venue E2E','Santa Marta','Laboratorio',100,true);
INSERT INTO artists(stage_name,country,genre,active) VALUES (:'runId'||'-artist','Colombia','Rock',true);
INSERT INTO users(username,email,active)
SELECT :'runId'||'-'||actor, :'runId'||'-'||actor||'@example.test', actor <> 'inactive'
FROM (VALUES ('admin'),('staff'),('inactive')) AS actors(actor);
INSERT INTO user_profiles(first_name,last_name,birth_date,user_id)
SELECT 'Fixture','E2E','1990-01-01',id FROM users WHERE username IN (:'runId'||'-admin',:'runId'||'-staff',:'runId'||'-inactive');
INSERT INTO user_credentials(user_id,password_hash)
SELECT id,crypt(CASE WHEN username=:'runId'||'-admin' THEN :'adminPassword' WHEN username=:'runId'||'-staff' THEN :'staffPassword' ELSE :'inactivePassword' END,gen_salt('bf',12))
FROM users WHERE username IN (:'runId'||'-admin',:'runId'||'-staff',:'runId'||'-inactive');
INSERT INTO user_roles(user_id,role)
SELECT id, CASE WHEN username=:'runId'||'-admin' THEN 'ADMIN' WHEN username=:'runId'||'-staff' THEN 'STAFF' ELSE 'USER' END
FROM users WHERE username IN (:'runId'||'-admin',:'runId'||'-staff',:'runId'||'-inactive');
INSERT INTO events(event_code,name,category,status,event_date,minimum_age,venue_id)
SELECT :'runId'||'-'||fixtures.code,'Evento E2E','MUSIC',fixtures.status,localtimestamp+interval '1 year',fixtures.age,v.id
FROM venues v CROSS JOIN (VALUES ('published','PUBLISHED',0),('draft','DRAFT',0),('full','SOLD_OUT',0),('age','PUBLISHED',120)) AS fixtures(code,status,age)
WHERE v.code=:'runId'||'-venue';
INSERT INTO event_artists(event_id,artist_id)
SELECT e.id,a.id FROM events e JOIN venues v ON v.id=e.venue_id CROSS JOIN artists a
WHERE v.code=:'runId'||'-venue' AND a.stage_name=:'runId'||'-artist';
COMMIT;
