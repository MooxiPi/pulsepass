package com.pulsepass.service.impl;

import com.pulsepass.dto.request.LoginRequest;
import com.pulsepass.dto.response.AuthResponse;
import com.pulsepass.dto.response.AuthenticatedUserResponse;
import com.pulsepass.security.JwtService;
import com.pulsepass.security.SecurityPrincipal;
import com.pulsepass.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private static final String TOKEN_TYPE = "Bearer";

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthServiceImpl(
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(
                        request.identifier(),
                        request.password()
                )
        );

        SecurityPrincipal principal =
                (SecurityPrincipal) authentication.getPrincipal();

        return new AuthResponse(
                jwtService.issue(principal.userId()),
                TOKEN_TYPE,
                jwtService.expiresIn()
        );
    }

    @Override
    public AuthenticatedUserResponse currentUser(SecurityPrincipal principal) {

        return new AuthenticatedUserResponse(
                principal.userId(),
                principal.getUsername(),
                principal.email(),
                principal.roles()
        );
    }
}
