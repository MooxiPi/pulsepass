package com.pulsepass.service;
import com.pulsepass.dto.request.LoginRequest;
import com.pulsepass.dto.response.AuthResponse;
import com.pulsepass.security.*;
import org.springframework.security.authentication.*;
import org.springframework.stereotype.Service;
@Service
public class AuthService {
    private final AuthenticationManager manager;
    private final JwtService jwt;
    public AuthService(AuthenticationManager manager, JwtService jwt) { this.manager=manager; this.jwt=jwt; }
    public AuthResponse login(LoginRequest request) {
        var a = manager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(request.identifier(), request.password()));
        return new AuthResponse(jwt.issue(((SecurityPrincipal)a.getPrincipal()).userId()), "Bearer", jwt.expiresIn());
    }
}
