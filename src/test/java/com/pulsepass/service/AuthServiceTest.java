package com.pulsepass.service;

import com.pulsepass.domain.User;
import com.pulsepass.domain.UserCredential;
import com.pulsepass.domain.enums.Role;
import com.pulsepass.dto.request.LoginRequest;
import com.pulsepass.dto.response.AuthResponse;
import com.pulsepass.security.CustomUserDetailsService;
import com.pulsepass.security.JwtService;
import com.pulsepass.security.SecurityPrincipal;
import com.pulsepass.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * PRD de seguridad §17.1: credenciales correctas, password incorrecto, usuario inactivo y emisión
 * del token solo después de autenticar. Usa el AuthenticationManager real (DaoAuthenticationProvider
 * + BCrypt) con un CustomUserDetailsService simulado.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    private static final String PASSWORD = "Clave-Ficticia-2026";
    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder(4);

    @Mock
    private CustomUserDetailsService userDetailsService;

    @Mock
    private JwtService jwtService;

    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(ENCODER);
        authService = new AuthServiceImpl(new ProviderManager(provider), jwtService);
    }

    private static SecurityPrincipal principal(boolean active) {
        User user = new User("ana", "ana@mail.test", active);
        ReflectionTestUtils.setField(user, "id", 7L);
        return new SecurityPrincipal(user, new UserCredential(7L, ENCODER.encode(PASSWORD), Set.of(Role.USER)));
    }

    @Test
    void login_validCredentials_issuesBearerTokenForThatUser() {

        when(userDetailsService.loadUserByUsername("ana")).thenReturn(principal(true));
        when(jwtService.issue(7L)).thenReturn("token-firmado");
        when(jwtService.expiresIn()).thenReturn(900L);

        AuthResponse response = authService.login(new LoginRequest("ana", PASSWORD));

        assertThat(response.accessToken()).isEqualTo("token-firmado");
        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.expiresIn()).isEqualTo(900L);
        verify(jwtService).issue(7L);
    }

    @Test
    void login_wrongPassword_isRejectedAndNoTokenIsIssued() {

        when(userDetailsService.loadUserByUsername("ana")).thenReturn(principal(true));

        assertThatThrownBy(() -> authService.login(new LoginRequest("ana", "otra-clave-ficticia")))
                .isInstanceOf(BadCredentialsException.class);
        verify(jwtService, never()).issue(anyLong());
    }

    @Test
    void login_inactiveUser_isRejectedAndNoTokenIsIssued() {

        when(userDetailsService.loadUserByUsername("ana")).thenReturn(principal(false));

        assertThatThrownBy(() -> authService.login(new LoginRequest("ana", PASSWORD)))
                .isInstanceOf(DisabledException.class);
        verify(jwtService, never()).issue(anyLong());
    }

    @Test
    void login_unknownUser_looksLikeBadCredentialsAndNoTokenIsIssued() {

        when(userDetailsService.loadUserByUsername("nadie")).thenThrow(new UsernameNotFoundException("Invalid credentials"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("nadie", PASSWORD)))
                .isInstanceOf(BadCredentialsException.class);
        verify(jwtService, never()).issue(anyLong());
    }
}
