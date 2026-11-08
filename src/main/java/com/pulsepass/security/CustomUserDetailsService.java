package com.pulsepass.security;
import com.pulsepass.domain.User;
import com.pulsepass.repository.*;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
@Transactional(readOnly = true)
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository users;
    private final UserCredentialRepository credentials;
    public CustomUserDetailsService(UserRepository users, UserCredentialRepository credentials) {
        this.users = users; this.credentials = credentials;
    }
    @Override public SecurityPrincipal loadUserByUsername(String identifier) {
        var byName = users.findByUsername(identifier);
        var byEmail = users.findByEmailIgnoreCase(identifier);
        if (byName.isPresent() && byEmail.isPresent() && !byName.get().getId().equals(byEmail.get().getId()))
            throw missing();
        return principal(byName.or(() -> byEmail).orElseThrow(this::missing));
    }
    public SecurityPrincipal loadById(Long id) { return principal(users.findById(id).orElseThrow(this::missing)); }
    private SecurityPrincipal principal(User user) {
        return new SecurityPrincipal(user, credentials.findById(user.getId()).orElseThrow(this::missing));
    }
    private UsernameNotFoundException missing() { return new UsernameNotFoundException("Invalid credentials"); }
}
