package com.pulsepass.security;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.LoggerFactory;
import org.springframework.web.filter.OncePerRequestFilter;
/** Logs only server-generated correlation IDs and outcomes, never headers, credentials or request bodies. */
public class RequestAuditFilter extends OncePerRequestFilter {
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String id = UUID.randomUUID().toString(); response.setHeader("X-Request-ID", id);
        try { chain.doFilter(request, response); }
        finally {
            if (response.getStatus() == 401 || response.getStatus() == 403 || request.getServletPath().equals("/api/auth/login"))
                LoggerFactory.getLogger(RequestAuditFilter.class).info("security requestId={} outcome={}",id,response.getStatus());
        }
    }
}
