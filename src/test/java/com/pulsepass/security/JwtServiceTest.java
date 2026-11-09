package com.pulsepass.security;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.util.*;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import static org.assertj.core.api.Assertions.*;
class JwtServiceTest {
    static final String SECRET = Base64.getEncoder().encodeToString(new byte[32]);
    JwtService service = new JwtService(SECRET, "pulsepass-api", 900);
    @Test void roundTrip() { assertThat(service.validate(service.issue(5L))).isEqualTo(5); }
    @Test void rejectsWeakKey() { assertThatThrownBy(() -> new JwtService("YWJj", "pulsepass-api", 900)).isInstanceOf(RuntimeException.class); }
    @Test void validatesPasswordUtf8Bytes() {
        assertThat(PasswordPolicy.valid("a".repeat(12))).isTrue();
        assertThat(PasswordPolicy.valid("a".repeat(72))).isTrue();
        assertThat(PasswordPolicy.valid("a".repeat(73))).isFalse();
        assertThat(PasswordPolicy.valid("é".repeat(37))).isFalse();
        assertThat(PasswordPolicy.valid("short")).isFalse();
    }
    @ParameterizedTest @ValueSource(strings={"expired","issuer","future","no-exp","no-iat","no-jti","no-sub","negative-sub","wrong-key","HS384","type","none"})
    void rejectsInvalidClaimsAndSignatures(String scenario) {
        var now = Instant.now();
        var builder = Jwts.builder().issuer(scenario.equals("issuer") ? "other" : "pulsepass-api");
        if (!scenario.equals("no-sub")) builder.subject(scenario.equals("negative-sub") ? "-1" : "5");
        if (!scenario.equals("no-jti")) builder.id(UUID.randomUUID().toString());
        if (!scenario.equals("no-iat")) builder.issuedAt(Date.from(now.plusSeconds(scenario.equals("future") ? 120 : -60)));
        if (!scenario.equals("no-exp")) builder.expiration(Date.from(now.plusSeconds(scenario.equals("expired") ? -10 : 900)));
        builder.header().type(scenario.equals("type") ? "OTHER" : "JWT");
        byte[] bytes = new byte[scenario.equals("HS384") ? 48 : 32];
        if (scenario.equals("wrong-key")) Arrays.fill(bytes, (byte) 1);
        if (!scenario.equals("none")) builder.signWith(Keys.hmacShaKeyFor(bytes), scenario.equals("HS384") ? Jwts.SIG.HS384 : Jwts.SIG.HS256);
        String token = builder.compact();
        assertThatThrownBy(() -> service.validate(token)).isInstanceOf(RuntimeException.class);
    }
    @ParameterizedTest @ValueSource(strings={"", "abc", "a.b.c", "Bearer bad"})
    void rejectsMalformed(String token) { assertThatThrownBy(() -> service.validate(token)).isInstanceOf(RuntimeException.class); }
}
