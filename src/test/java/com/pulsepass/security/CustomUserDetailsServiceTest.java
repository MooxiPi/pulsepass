package com.pulsepass.security;

import com.pulsepass.domain.User;
import com.pulsepass.domain.UserCredential;
import com.pulsepass.domain.enums.Role;
import com.pulsepass.repository.UserCredentialRepository;
import com.pulsepass.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/** PRD de seguridad §17.1: usuario existente, inexistente, roles actualizados y estado inactivo. */
@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserCredentialRepository credentialRepository;

    @InjectMocks
    private CustomUserDetailsService service;

    private static User user(long id, String username, String email, boolean active) {
        User user = new User(username, email, active);
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    private void credential(long id, Role... roles) {
        when(credentialRepository.findById(id))
                .thenReturn(Optional.of(new UserCredential(id, "$2a$12$hash", Set.of(roles))));
    }

    @Test
    void loadByUsername_existingUser_returnsPrincipalWithIdEmailAndRole() {

        when(userRepository.findByUsername("ana")).thenReturn(Optional.of(user(7, "ana", "ana@mail.test", true)));
        when(userRepository.findByEmailIgnoreCase("ana")).thenReturn(Optional.empty());
        credential(7, Role.USER);

        SecurityPrincipal principal = service.loadUserByUsername("ana");

        assertThat(principal.userId()).isEqualTo(7L);
        assertThat(principal.email()).isEqualTo("ana@mail.test");
        assertThat(principal.getPassword()).isEqualTo("$2a$12$hash");
        assertThat(principal.isEnabled()).isTrue();
        assertThat(principal.roles()).containsExactly("USER");
    }

    @Test
    void loadByEmail_existingUser_returnsSamePrincipal() {

        when(userRepository.findByUsername("ana@mail.test")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("ana@mail.test")).thenReturn(Optional.of(user(7, "ana", "ana@mail.test", true)));
        credential(7, Role.USER);

        assertThat(service.loadUserByUsername("ana@mail.test").getUsername()).isEqualTo("ana");
    }

    @Test
    void loadByUsername_nonExistingUser_throwsInvalidCredentials() {

        when(userRepository.findByUsername("nadie")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("nadie")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.loadUserByUsername("nadie"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    void loadByUsername_identifierMatchingTwoDifferentUsers_isRejected() {

        when(userRepository.findByUsername("x@mail.test")).thenReturn(Optional.of(user(1, "x@mail.test", "a@mail.test", true)));
        when(userRepository.findByEmailIgnoreCase("x@mail.test")).thenReturn(Optional.of(user(2, "otro", "x@mail.test", true)));

        assertThatThrownBy(() -> service.loadUserByUsername("x@mail.test"))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    void loadById_rolesComeFromCurrentCredential() {

        when(userRepository.findById(9L)).thenReturn(Optional.of(user(9, "luis", "luis@mail.test", true)));
        credential(9, Role.USER, Role.STAFF);

        SecurityPrincipal principal = service.loadById(9L);

        assertThat(principal.getAuthorities())
                .extracting(GrantedAuthority::getAuthority)
                .containsExactlyInAnyOrder("ROLE_USER", "ROLE_STAFF");
        assertThat(principal.roles()).containsExactly("STAFF", "USER");
    }

    @Test
    void loadById_inactiveUser_isNotEnabled() {

        when(userRepository.findById(4L)).thenReturn(Optional.of(user(4, "baja", "baja@mail.test", false)));
        credential(4, Role.USER);

        assertThat(service.loadById(4L).isEnabled()).isFalse();
    }

    @Test
    void loadById_legacyUserWithoutCredential_cannotAuthenticate() {

        when(userRepository.findById(3L)).thenReturn(Optional.of(user(3, "legado", "legado@mail.test", true)));
        when(credentialRepository.findById(3L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.loadById(3L)).isInstanceOf(UsernameNotFoundException.class);
    }
}
