package com.pulsepass.security;
import com.pulsepass.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;
@Component
public class SecurityErrorWriter {
    private final ObjectMapper mapper;
    public SecurityErrorWriter(ObjectMapper mapper) { this.mapper = mapper; }
    public void write(HttpServletResponse response, HttpStatus status) throws IOException {
        response.setStatus(status.value()); response.setContentType("application/json"); response.setCharacterEncoding("UTF-8");
        if (status == HttpStatus.UNAUTHORIZED) response.setHeader("WWW-Authenticate", "Bearer");
        mapper.writeValue(response.getWriter(), new ErrorResponse(LocalDateTime.now(), status.value(), status.getReasonPhrase(),
            status == HttpStatus.UNAUTHORIZED ? "Authentication required or invalid credentials" : "Access denied", Map.of()));
    }
}
