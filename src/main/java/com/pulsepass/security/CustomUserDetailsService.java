package com.pulsepass.security;

import com.pulsepass.domain.User;
import com.pulsepass.domain.UserCredential;
import com.pulsepass.repository.UserCredentialRepository;
import com.pulsepass.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserCredentialRepository credentialRepository;

    public CustomUserDetailsService(
            UserRepository userRepository,
            UserCredentialRepository credentialRepository
    ) {
        this.userRepository = userRepository;
        this.credentialRepository = credentialRepository;
    }

    /**
     * Acepta username o email. Si cada uno corresponde a un usuario distinto, el identificador
     * es ambiguo y se rechaza como credencial inválida.
     */
    @Override
    public SecurityPrincipal loadUserByUsername(String identifier) {

        Optional<User> byUsername = userRepository.findByUsername(identifier);
        Optional<User> byEmail = userRepository.findByEmailIgnoreCase(identifier);

        if (byUsername.isPresent()
                && byEmail.isPresent()
                && !byUsername.get().getId().equals(byEmail.get().getId())) {
            throw invalidCredentials();
        }

        User user = byUsername
                .or(() -> byEmail)
                .orElseThrow(this::invalidCredentials);

        return toPrincipal(user);
    }

    public SecurityPrincipal loadById(Long userId) {

        User user = userRepository
                .findById(userId)
                .orElseThrow(this::invalidCredentials);

        return toPrincipal(user);
    }

    private SecurityPrincipal toPrincipal(User user) {

        UserCredential credential = credentialRepository
                .findById(user.getId())
                .orElseThrow(this::invalidCredentials);

        return new SecurityPrincipal(user, credential);
    }

    private UsernameNotFoundException invalidCredentials() {
        return new UsernameNotFoundException("Invalid credentials");
    }
}
