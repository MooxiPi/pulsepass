package com.pulsepass.security;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * Autentica con un único encabezado {@code Authorization: Bearer <jwt>}. Un Bearer inválido
 * responde 401 incluso en rutas públicas; sin encabezado la petición sigue como anónima.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final SecurityErrorWriter errorWriter;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService,
            SecurityErrorWriter errorWriter
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.errorWriter = errorWriter;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {

        List<String> headers = Collections.list(request.getHeaders("Authorization"));

        if (!headers.isEmpty()) {
            try {
                authenticate(headers);
            } catch (JwtException | IllegalArgumentException | AuthenticationException ex) {
                SecurityContextHolder.clearContext();
                errorWriter.write(response, HttpStatus.UNAUTHORIZED);
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private void authenticate(List<String> headers) {

        String header = headers.getFirst();

        if (headers.size() != 1
                || !header.regionMatches(true, 0, BEARER_PREFIX, 0, BEARER_PREFIX.length())
                || header.length() <= BEARER_PREFIX.length()) {
            throw new IllegalArgumentException("Invalid bearer");
        }

        Long userId = jwtService.validate(header.substring(BEARER_PREFIX.length()));
        SecurityPrincipal principal = userDetailsService.loadById(userId);

        if (!principal.isEnabled()) {
            throw new IllegalArgumentException("Inactive account");
        }

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(
                        principal,
                        null,
                        principal.getAuthorities()
                )
        );
        SecurityContextHolder.setContext(context);
    }
}
