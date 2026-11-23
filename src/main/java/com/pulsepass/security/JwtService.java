package com.pulsepass.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

/** Emite y valida JWT HS256 con sub, iss, iat, exp, jti y typ JWT. */
@Service
public class JwtService {

    private static final int MIN_KEY_BYTES = 32;
    private static final long ALLOWED_CLOCK_SKEW_SECONDS = 30;

    private final SecretKey key;
    private final String issuer;
    private final long ttlSeconds;

    public JwtService(
            @Value("${pulsepass.security.jwt.secret-base64}") String secretBase64,
            @Value("${pulsepass.security.jwt.issuer:pulsepass-api}") String issuer,
            @Value("${pulsepass.security.jwt.ttl-seconds:900}") long ttlSeconds) {

        byte[] secret = Decoders.BASE64.decode(secretBase64);

        if (secret.length < MIN_KEY_BYTES || issuer.isBlank() || ttlSeconds <= 0) {
            throw new IllegalArgumentException("Invalid JWT configuration");
        }

        this.key = Keys.hmacShaKeyFor(secret);
        this.issuer = issuer;
        this.ttlSeconds = ttlSeconds;
    }

    public long expiresIn() {
        return ttlSeconds;
    }

    public String issue(Long userId) {

        Instant now = Instant.now();

        return Jwts.builder()
                .subject(userId.toString())
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(ttlSeconds)))
                .id(UUID.randomUUID().toString())
                .header().type("JWT").and()
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    /** Devuelve el id de usuario del {@code sub}; lanza JwtException si el token no es válido. */
    public Long validate(String token) {

        Jws<Claims> jwt = Jwts.parser()
                .verifyWith(key)
                .requireIssuer(issuer)
                .sig().clear().add(Jwts.SIG.HS256).and()
                .build()
                .parseSignedClaims(token);

        Claims claims = jwt.getPayload();
        Instant now = Instant.now();

        if (!"JWT".equals(jwt.getHeader().getType())
                || claims.getSubject() == null
                || claims.getId() == null
                || claims.getId().isBlank()
                || claims.getExpiration() == null
                || claims.getIssuedAt() == null
                || claims.getIssuedAt().toInstant().isAfter(now.plusSeconds(ALLOWED_CLOCK_SKEW_SECONDS))
                || !claims.getExpiration().after(claims.getIssuedAt())
                || !claims.getExpiration().toInstant().isAfter(now)) {
            throw new MalformedJwtException("Invalid token");
        }

        long userId = Long.parseLong(claims.getSubject());

        if (userId <= 0) {
            throw new MalformedJwtException("Invalid subject");
        }

        return userId;
    }
}
