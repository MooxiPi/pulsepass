package com.pulsepass.integration;
import com.pulsepass.domain.*;
import com.pulsepass.domain.enums.*;
import com.pulsepass.repository.*;
import com.pulsepass.service.UserService;
import com.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.security.JwtService;
import java.net.URI;
import java.net.http.*;
import java.time.LocalDate;
import java.util.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import static org.assertj.core.api.Assertions.*;
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class SecurityHttpIT extends PostgresIntegrationTest {
    @LocalServerPort int port;
    @Autowired ObjectMapper json;
    @Autowired JdbcTemplate db;
    @Autowired UserService users;
    @Autowired UserRepository repository;
    @Autowired UserCredentialRepository credentials;
    @Autowired PasswordEncoder encoder;
    @Autowired JwtService jwt;
    @org.springframework.beans.factory.annotation.Value("${pulsepass.security.jwt.secret-base64}") String testSecret;
    final HttpClient client = HttpClient.newHttpClient();
    final String run = "s" + UUID.randomUUID().toString().replace("-", "").substring(0,10);
    final String password = "OnlyForTests2026!";
    final Map<String,String> tokens = new HashMap<>();
    long artist;
    String venue, event, draft;
    record Reply(int status, JsonNode body, HttpHeaders headers) {}
    Reply call(String method, String path, String actor, String body, int expected) throws Exception {
        var builder = HttpRequest.newBuilder(URI.create("http://localhost:"+port+path)).header("Accept", "application/json");
        if (actor != null) builder.header("Authorization", "Bearer " + tokens.getOrDefault(actor, actor));
        if (body != null) builder.header("Content-Type", "application/json");
        var response = client.send(builder.method(method, body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body)).build(), HttpResponse.BodyHandlers.ofString());
        assertThat(response.statusCode()).as(method+" "+path+" actor="+actor).isEqualTo(expected);
        assertThat(response.headers().firstValue("Set-Cookie")).isEmpty();
        assertThat(response.headers().firstValue("Content-Type").orElse("")).contains("application/json");
        JsonNode node = json.readTree(response.body());
        assertThat(response.body()).doesNotContain("passwordHash", "password_hash", password, "stackTrace");
        if (expected >= 400) {
            assertThat(node.properties().stream().map(Map.Entry::getKey).toList()).containsExactlyInAnyOrder("timestamp","status","error","message","details");
            assertThat(node.path("status").asInt()).isEqualTo(expected);
        }
        return new Reply(expected,node,response.headers());
    }
    String registration(String actor) {
        return "{\"username\":\""+run+actor+"\",\"email\":\""+email(actor)+"\",\"firstName\":\"Test\",\"lastName\":\"User\",\"birthDate\":\"1990-01-01\",\"password\":\""+password+"\",\"role\":\"ADMIN\"}";
    }
    String email(String actor) { return run+actor+"@example.test"; }
    String eventBody(String code) {
        return "{\"eventCode\":\""+code+"\",\"name\":\"Test event\",\"category\":\"MUSIC\",\"eventDate\":\""+LocalDate.now().plusYears(1)+"T20:00:00\",\"minimumAge\":0,\"venueCode\":\""+venue+"\"}";
    }
    @BeforeAll void fixtures() throws Exception {
        for (String actor : List.of("a","b","staff","admin")) {
            var response = call("POST","/api/users",null,registration(actor),201);
            long id=response.body.path("id").asLong();
            var credential=credentials.findById(id).orElseThrow();
            assertThat(credential.getRoles()).containsExactly(Role.USER);
            assertThat(credential.getPasswordHash()).startsWith("$2");
            assertThat(encoder.matches(password,credential.getPasswordHash())).isTrue();
            if (actor.equals("staff") || actor.equals("admin")) {
                db.update("delete from user_roles where user_id=?", id);
                db.update("insert into user_roles(user_id,role) values (?,?)",id,actor.toUpperCase());
            }
            var login=call("POST","/api/auth/login",null,json.writeValueAsString(Map.of("identifier",run+actor,"password",password)),200);
            assertThat(login.body.path("tokenType").asText()).isEqualTo("Bearer");
            assertThat(login.body.path("expiresIn").asLong()).isEqualTo(900);
            tokens.put(actor,login.body.path("accessToken").asText());
            assertThat(call("GET","/api/auth/me",actor,null,200).body.path("userId").asLong()).isEqualTo(id);
        }
        venue=run+"venue";event=run+"event";draft=run+"draft";
        db.update("insert into venues(code,name,city,address,capacity,active) values (?,?,?,?,?,true)",venue,"Test","Test","Test",100);
        artist=db.queryForObject("insert into artists(stage_name,country,genre,active) values (?,?,?,true) returning id",Long.class,run+"artist","Test","Test");
        for(String code:List.of(event,draft)) {
            call("POST","/api/events","admin",eventBody(code),201);
            call("POST","/api/events/"+code+"/artists/"+artist,"admin",null,200);
        }
        call("PATCH","/api/events/"+event+"/publish","admin",null,200);
    }
    @AfterAll void removeOnlyOwnFixtures() {
        db.update("delete from tickets where user_id in (select id from users where username like ?)",run+"%");
        db.update("delete from event_artists where event_id in (select id from events where event_code like ?)",run+"%");
        db.update("delete from events where event_code like ?",run+"%");
        db.update("delete from artists where stage_name=?",run+"artist");
        db.update("delete from venues where code=?",venue);
        db.update("delete from user_roles where user_id in (select id from users where username like ?)",run+"%");
        db.update("delete from user_credentials where user_id in (select id from users where username like ?)",run+"%");
        db.update("delete from user_profiles where user_id in (select id from users where username like ?)",run+"%");
        db.update("delete from users where username like ?",run+"%");
    }
    @Test void publicCatalogAndDraftPrivacy() throws Exception {
        for(String path:List.of("/api/venues/active","/api/venues/"+venue,"/api/artists/active","/api/artists/"+artist,"/api/artists/by-stage-name?stageName="+run+"artist","/api/events/published","/api/events/"+event)) call("GET",path,null,null,200);
        call("GET","/api/events/"+draft,null,null,404);
        call("GET","/api/events/"+draft,"a",null,404);
        call("GET","/api/events/"+draft,"staff",null,200);
        assertThat(call("GET","/api/events/by-artist?stageName="+run+"artist",null,null,200).body.toString()).contains(event).doesNotContain(draft);
        assertThat(call("GET","/api/events/by-artist?stageName="+run+"artist","admin",null,200).body.toString()).contains(draft);
    }
    @ParameterizedTest @CsvSource({"POST,/api/events", "PATCH,/api/events/MISSING/publish", "POST,/api/events/MISSING/artists/1", "GET,/api/users/by-email?email=missing@example.test", "GET,/api/users/by-username?username=missing", "POST,/api/tickets", "GET,/api/tickets/MISSING", "GET,/api/tickets/by-user?email=missing@example.test", "GET,/api/events/MISSING/tickets/paid", "PATCH,/api/tickets/MISSING/cancel", "PATCH,/api/tickets/MISSING/use", "GET,/api/auth/me"})
    void anonymousProtectedMatrix(String method,String path) throws Exception { call(method,path,null,"{}",401); }
    @ParameterizedTest @CsvSource({"POST,/api/events", "PATCH,/api/events/MISSING/publish", "POST,/api/events/MISSING/artists/1", "GET,/api/events/MISSING/tickets/paid", "PATCH,/api/tickets/MISSING/use"})
    void userForbiddenMatrix(String method,String path) throws Exception { call(method,path,"a","{}",403); }
    @Test void ownershipAndTicketLifecycle() throws Exception {
        call("GET","/api/users/by-email?email="+email("a"),"a",null,200);
        call("GET","/api/users/by-username?username="+run+"a","a",null,200);
        for(String path:List.of("/api/users/by-email?email="+email("a"),"/api/users/by-username?username="+run+"a","/api/tickets/by-user?email="+email("a"))) {
            call("GET",path,"b",null,403);call("GET",path,"staff",null,403);call("GET",path,"admin",null,200);
        }
        long before=db.queryForObject("select count(*) from tickets",Long.class);
        call("POST","/api/tickets","a",purchase("b"),403);
        assertThat(db.queryForObject("select count(*) from tickets",Long.class)).isEqualTo(before);
        String code=call("POST","/api/tickets","a",purchase("a"),201).body.path("ticketCode").asText();
        call("GET","/api/tickets/"+code,"b",null,403);
        call("PATCH","/api/tickets/"+code+"/cancel","b",null,403);
        call("PATCH","/api/tickets/"+code+"/cancel","staff",null,403);
        call("PATCH","/api/tickets/"+code+"/use","a",null,403);
        assertThat(call("GET","/api/tickets/"+code,"a",null,200).body.path("status").asText()).isEqualTo("PAID");
        assertThat(call("GET","/api/tickets/by-user?email="+email("a"),"a",null,200).body.toString()).contains(code);
        call("GET","/api/tickets/"+code,"staff",null,200);
        assertThat(call("GET","/api/events/"+event+"/tickets/paid","staff",null,200).body.toString()).contains(code);
        call("PATCH","/api/tickets/"+code+"/cancel","a",null,200);
        assertThat(call("GET","/api/tickets/"+code,"a",null,200).body.path("status").asText()).isEqualTo("CANCELLED");
        call("PATCH","/api/tickets/"+code+"/cancel","a",null,409);
        String usable=call("POST","/api/tickets","a",purchase("a"),201).body.path("ticketCode").asText();
        call("PATCH","/api/tickets/"+usable+"/use","staff",null,200);
        assertThat(call("GET","/api/tickets/"+usable,"a",null,200).body.path("status").asText()).isEqualTo("USED");
        call("PATCH","/api/tickets/"+usable+"/use","staff",null,409);
    }
    String purchase(String actor) throws Exception { return json.writeValueAsString(Map.of("userEmail",email(actor),"eventCode",event,"type","GENERAL")); }
    @Test void loginErrorsAndInvalidTokens() throws Exception {
        var wrong=call("POST","/api/auth/login",null,json.writeValueAsString(Map.of("identifier",run+"a","password","wrong")),401);
        var missing=call("POST","/api/auth/login",null,"{\"identifier\":\"nobody\",\"password\":\"wrong\"}",401);
        assertThat(wrong.body.path("message")).isEqualTo(missing.body.path("message"));
        call("POST","/api/auth/login",null,json.writeValueAsString(Map.of("identifier",email("a"),"password",password)),200);
        call("GET","/api/auth/me","invalid.token.value",null,401);
        call("GET","/api/venues/active","invalid.token.value",null,401);
        call("GET","/api/auth/me?token="+tokens.get("a"),null,null,401);
        String token=tokens.get("a");
        int dot=token.lastIndexOf('.')+1;
        call("GET","/api/auth/me",token.substring(0,dot)+(token.charAt(dot)=='A' ? "B" : "A")+token.substring(dot+1),null,401);
    }
    @ParameterizedTest @org.junit.jupiter.params.provider.ValueSource(strings={"expired","issuer","wrong-key","no-exp","future","none"})
    void invalidSignedTokensRejectedOverHttp(String kind) throws Exception {
        var now=java.time.Instant.now();
        var bytes=java.util.Base64.getDecoder().decode(testSecret);
        if(kind.equals("wrong-key")) java.util.Arrays.fill(bytes,(byte)7);
        var b=io.jsonwebtoken.Jwts.builder().subject(repository.findByUsername(run+"a").orElseThrow().getId().toString())
            .issuer(kind.equals("issuer") ? "other-api" : "pulsepass-api").id(java.util.UUID.randomUUID().toString())
            .issuedAt(java.util.Date.from(now.plusSeconds(kind.equals("future") ? 120 : -60)));
        b.header().type("JWT");
        if(!kind.equals("no-exp")) b.expiration(java.util.Date.from(now.plusSeconds(kind.equals("expired") ? -10 : 900)));
        if(!kind.equals("none")) b.signWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor(bytes),io.jsonwebtoken.Jwts.SIG.HS256);
        call("GET","/api/auth/me",b.compact(),null,401);
    }
    @Test void duplicateHeadersAndSessionsCannotAuthenticate() throws Exception {
        var request=HttpRequest.newBuilder(URI.create("http://localhost:"+port+"/api/auth/me"))
            .header("Authorization","Bearer "+tokens.get("a")).header("Authorization","Bearer "+tokens.get("b")).GET().build();
        assertThat(client.send(request,HttpResponse.BodyHandlers.ofString()).statusCode()).isEqualTo(401);
        request=HttpRequest.newBuilder(URI.create("http://localhost:"+port+"/api/auth/me"))
            .header("Cookie","JSESSIONID=pretend-session").GET().build();
        assertThat(client.send(request,HttpResponse.BodyHandlers.ofString()).statusCode()).isEqualTo(401);
    }
    @Test void serviceBoundaryRejectsUnauthenticatedCalls() {
        assertThatThrownBy(() -> users.findByEmail(email("a")))
            .isInstanceOf(org.springframework.security.core.AuthenticationException.class);
    }
    @Test void stateAndRolesReloaded() throws Exception {
        String actor="revoked";
        long id=call("POST","/api/users",null,registration(actor),201).body.path("id").asLong();
        db.update("insert into user_roles(user_id,role) values (?, 'STAFF')",id);
        String token=jwt.issue(id);
        call("GET","/api/events/"+event+"/tickets/paid",token,null,200);
        db.update("delete from user_roles where user_id=? and role='STAFF'",id);
        call("GET","/api/events/"+event+"/tickets/paid",token,null,403);
        db.update("update users set active=false where id=?",id);
        call("GET","/api/auth/me",token,null,401);
        call("POST","/api/auth/login",null,json.writeValueAsString(Map.of("identifier",run+actor,"password",password)),401);
    }
    @Test void validationConflictsAndAtomicRegistration() throws Exception {
        call("POST","/api/users",null,registration("a"),409);
        String ambiguousUsername = registration("collision")
            .replace("\"username\":\""+run+"collision\"", "\"username\":\""+email("a")+"\"");
        call("POST","/api/users",null,ambiguousUsername,400);
        assertThat(repository.findByUsername(email("a"))).isEmpty();
        call("POST","/api/auth/login",null,
            json.writeValueAsString(Map.of("identifier",email("a"),"password",password)),200);
        String legacyUsername=run+"legacy@example.test";
        db.update("insert into users(username,email,active) values (?,?,true)",legacyUsername,run+"legacy-other@example.test");
        String collidingEmail = registration("new")
            .replace(email("new"), legacyUsername.toUpperCase(java.util.Locale.ROOT));
        call("POST","/api/users",null,collidingEmail,409);
        assertThat(repository.findByUsername(run+"new")).isEmpty();
        call("POST","/api/users",null,"{}",400);
        call("POST","/api/users",null,"{",400);
        call("POST","/api/tickets","a",purchase("a").replace("GENERAL","INVALID"),400);
        call("GET","/api/artists/not-a-number",null,null,400);
        call("GET","/api/artists/by-stage-name",null,null,400);
        call("GET","/api/venues/missing",null,null,404);
        String body=registration("rollback").replace("\"firstName\":\"Test\"","\"firstName\":\""+"X".repeat(101)+"\"");
        call("POST","/api/users",null,body,409);
        assertThat(repository.findByUsername(run+"rollback")).isEmpty();
        call("POST","/api/users",null,registration("longpw").replace(password,"é".repeat(37)),400);
    }
}
