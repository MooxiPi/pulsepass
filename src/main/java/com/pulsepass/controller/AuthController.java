package com.pulsepass.controller;
import com.pulsepass.dto.request.LoginRequest;
import com.pulsepass.dto.response.*;
import com.pulsepass.security.SecurityPrincipal;
import com.pulsepass.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    public AuthController(AuthService auth) { this.auth=auth; }
    @PostMapping("/login") public AuthResponse login(@Valid @RequestBody LoginRequest request) { return auth.login(request); }
    @GetMapping("/me") public AuthenticatedUserResponse me(@AuthenticationPrincipal SecurityPrincipal p) {
        return new AuthenticatedUserResponse(p.userId(), p.getUsername(), p.email(), p.roles());
    }
}
