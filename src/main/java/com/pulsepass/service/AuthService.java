package com.pulsepass.service;

import com.pulsepass.dto.request.LoginRequest;
import com.pulsepass.dto.response.AuthResponse;
import com.pulsepass.dto.response.AuthenticatedUserResponse;
import com.pulsepass.security.SecurityPrincipal;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    AuthenticatedUserResponse currentUser(SecurityPrincipal principal);
}
