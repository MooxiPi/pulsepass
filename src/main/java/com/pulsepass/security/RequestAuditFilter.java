package com.pulsepass.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/** Logs only server-generated correlation IDs and outcomes, never headers, credentials or request bodies. */
public class RequestAuditFilter extends OncePerRequestFilter {

    private static final Logger LOGGER = LoggerFactory.getLogger(RequestAuditFilter.class);
    private static final String LOGIN_PATH = "/api/auth/login";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {

        String requestId = UUID.randomUUID().toString();
        response.setHeader("X-Request-ID", requestId);

        try {
            chain.doFilter(request, response);
        } finally {
            int status = response.getStatus();

            if (status == 401 || status == 403 || request.getServletPath().equals(LOGIN_PATH)) {
                LOGGER.info("security requestId={} outcome={}", requestId, status);
            }
        }
    }
}
