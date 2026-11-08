package com.pulsepass.security;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.Collections;
import io.jsonwebtoken.JwtException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwt;
    private final CustomUserDetailsService users;
    private final SecurityErrorWriter errors;
    public JwtAuthenticationFilter(JwtService jwt, CustomUserDetailsService users, SecurityErrorWriter errors) {
        this.jwt = jwt; this.users = users; this.errors = errors;
    }
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        var headers = Collections.list(request.getHeaders("Authorization"));
        if (!headers.isEmpty()) {
            try {
                String header = headers.getFirst();
                if (headers.size() != 1 || !header.regionMatches(true, 0, "Bearer ", 0, 7) || header.length() <= 7)
                    throw new IllegalArgumentException("Invalid bearer");
                var principal = users.loadById(jwt.validate(header.substring(7)));
                if (!principal.isEnabled()) throw new IllegalArgumentException("Inactive account");
                var context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.getAuthorities()));
                SecurityContextHolder.setContext(context);
            } catch (JwtException | IllegalArgumentException | AuthenticationException e) {
                SecurityContextHolder.clearContext(); errors.write(response, HttpStatus.UNAUTHORIZED); return;
            }
        }
        chain.doFilter(request, response);
    }
}
