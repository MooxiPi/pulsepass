package com.pulsepass.security;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
@Service
public class JwtService {
    private final SecretKey key;
    private final String issuer;
    private final long ttl;
    public JwtService(@Value("${pulsepass.security.jwt.secret-base64}") String secret,
                      @Value("${pulsepass.security.jwt.issuer:pulsepass-api}") String issuer,
                      @Value("${pulsepass.security.jwt.ttl-seconds:900}") long ttl) {
        byte[] bytes = Decoders.BASE64.decode(secret);
        if (bytes.length < 32 || issuer.isBlank() || ttl <= 0) throw new IllegalArgumentException("Invalid JWT configuration");
        this.key = Keys.hmacShaKeyFor(bytes); this.issuer = issuer; this.ttl = ttl;
    }
    public long expiresIn() { return ttl; }
    public String issue(Long userId) {
        Instant now = Instant.now();
        return Jwts.builder().subject(userId.toString()).issuer(issuer).issuedAt(Date.from(now))
            .expiration(Date.from(now.plusSeconds(ttl))).id(UUID.randomUUID().toString())
            .header().type("JWT").and().signWith(key, Jwts.SIG.HS256).compact();
    }
    public Long validate(String token) {
        var jwt = Jwts.parser().verifyWith(key).requireIssuer(issuer)
            .sig().clear().add(Jwts.SIG.HS256).and().build().parseSignedClaims(token);
        var c = jwt.getPayload();
        Instant now = Instant.now();
        if (!"JWT".equals(jwt.getHeader().getType()) || c.getSubject() == null || c.getId() == null || c.getId().isBlank()
            || c.getExpiration() == null || c.getIssuedAt() == null
            || c.getIssuedAt().toInstant().isAfter(now.plusSeconds(30))
            || !c.getExpiration().after(c.getIssuedAt()) || !c.getExpiration().toInstant().isAfter(now))
            throw new MalformedJwtException("Invalid token");
        long id = Long.parseLong(c.getSubject());
        if (id <= 0) throw new MalformedJwtException("Invalid subject");
        return id;
    }
}
