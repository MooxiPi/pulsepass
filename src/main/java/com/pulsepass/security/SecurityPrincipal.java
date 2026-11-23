package com.pulsepass.security;

import com.pulsepass.domain.User;
import com.pulsepass.domain.UserCredential;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

/** Usuario autenticado: datos de {@link User} más el hash y los roles de {@link UserCredential}. */
public final class SecurityPrincipal extends org.springframework.security.core.userdetails.User {

    private static final String ROLE_PREFIX = "ROLE_";

    private final Long userId;
    private final String email;

    public SecurityPrincipal(User user, UserCredential credential) {
        super(
                user.getUsername(),
                credential.getPasswordHash(),
                user.isActive(),
                true,
                true,
                true,
                credential.getRoles()
                        .stream()
                        .map(role -> new SimpleGrantedAuthority(ROLE_PREFIX + role.name()))
                        .toList()
        );
        this.userId = user.getId();
        this.email = user.getEmail();
    }

    public Long userId() {
        return userId;
    }

    public String email() {
        return email;
    }

    /** Roles sin el prefijo {@code ROLE_}, en orden alfabético. */
    public List<String> roles() {

        return getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .map(authority -> authority.substring(ROLE_PREFIX.length()))
                .sorted()
                .toList();
    }
}
