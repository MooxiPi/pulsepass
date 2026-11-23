package com.pulsepass.security;

import com.pulsepass.domain.User;
import com.pulsepass.domain.UserCredential;
import com.pulsepass.domain.enums.Role;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;
import tools.jackson.databind.json.JsonMapper;

import java.util.Base64;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * PRD de seguridad §17.1: sin Bearer, Bearer válido, Bearer inválido, doble header sospechoso y no
 * conservar una autenticación previa cuando el token no es válido.
 */
class JwtAuthenticationFilterTest {

    private static final String SECRET = Base64.getEncoder().encodeToString(new byte[32]);

    private final JwtService jwtService = new JwtService(SECRET, "pulsepass-api", 900);
    private final CustomUserDetailsService userDetailsService = mock(CustomUserDetailsService.class);
    private final JwtAuthenticationFilter filter =
            new JwtAuthenticationFilter(jwtService, userDetailsService, new SecurityErrorWriter(JsonMapper.builder().build()));

    private final MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/auth/me");
    private final MockHttpServletResponse response = new MockHttpServletResponse();
    private final MockFilterChain chain = new MockFilterChain();

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    private void userInDatabase(long id, boolean active, Role role) {
        User user = new User("ana", "ana@mail.test", active);
        ReflectionTestUtils.setField(user, "id", id);
        when(userDetailsService.loadById(id)).thenReturn(new SecurityPrincipal(user, new UserCredential(id, "hash", Set.of(role))));
    }

    private void assertRejected() {
        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getHeader("WWW-Authenticate")).isEqualTo("Bearer");
        assertThat(chain.getRequest()).isNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void noAuthorizationHeader_continuesAsAnonymous() throws Exception {

        filter.doFilter(request, response, chain);

        assertThat(chain.getRequest()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void validBearer_authenticatesWithRolesLoadedFromDatabase() throws Exception {

        userInDatabase(7, true, Role.USER);
        request.addHeader("Authorization", "Bearer " + jwtService.issue(7L));

        filter.doFilter(request, response, chain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(chain.getRequest()).isNotNull();
        assertThat(auth.isAuthenticated()).isTrue();
        assertThat(((SecurityPrincipal) auth.getPrincipal()).userId()).isEqualTo(7L);
        assertThat(AuthorityUtils.authorityListToSet(auth.getAuthorities())).containsExactly("ROLE_USER");
    }

    @Test
    void invalidBearer_respondsUnauthorized() throws Exception {

        request.addHeader("Authorization", "Bearer token-alterado");

        filter.doFilter(request, response, chain);

        assertRejected();
    }

    @Test
    void otherScheme_respondsUnauthorized() throws Exception {

        request.addHeader("Authorization", "Basic YW5hOmNsYXZl");

        filter.doFilter(request, response, chain);

        assertRejected();
    }

    @Test
    void duplicatedAuthorizationHeader_isSuspiciousAndRejected() throws Exception {

        String token = jwtService.issue(7L);
        request.addHeader("Authorization", "Bearer " + token);
        request.addHeader("Authorization", "Bearer " + token);

        filter.doFilter(request, response, chain);

        assertRejected();
    }

    @Test
    void validTokenOfInactiveUser_respondsUnauthorized() throws Exception {

        userInDatabase(7, false, Role.USER);
        request.addHeader("Authorization", "Bearer " + jwtService.issue(7L));

        filter.doFilter(request, response, chain);

        assertRejected();
    }

    @Test
    void invalidBearer_doesNotKeepAPreviouslyEstablishedAuthentication() throws Exception {

        SecurityContextHolder.getContext().setAuthentication(UsernamePasswordAuthenticationToken.authenticated(
                "admin-inyectado", null, AuthorityUtils.createAuthorityList("ROLE_ADMIN")));
        request.addHeader("Authorization", "Bearer token-alterado");

        filter.doFilter(request, response, chain);

        assertRejected();
    }

    @Test
    void validBearer_replacesAPreviousAuthenticationInsteadOfMergingIt() throws Exception {

        SecurityContextHolder.getContext().setAuthentication(UsernamePasswordAuthenticationToken.authenticated(
                "admin-inyectado", null, AuthorityUtils.createAuthorityList("ROLE_ADMIN")));
        userInDatabase(7, true, Role.USER);
        request.addHeader("Authorization", "Bearer " + jwtService.issue(7L));

        filter.doFilter(request, response, chain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth.getPrincipal()).isInstanceOf(SecurityPrincipal.class);
        assertThat(AuthorityUtils.authorityListToSet(auth.getAuthorities())).containsExactly("ROLE_USER");
    }
}
