package com.pulsepass.security;
import com.pulsepass.domain.User;
import com.pulsepass.domain.UserCredential;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.List;
public final class SecurityPrincipal extends org.springframework.security.core.userdetails.User {
    private final Long userId;
    private final String email;
    public SecurityPrincipal(User user, UserCredential credential) {
        super(user.getUsername(), credential.getPasswordHash(), user.isActive(), true, true, true,
            credential.getRoles().stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r.name())).toList());
        this.userId = user.getId(); this.email = user.getEmail();
    }
    public Long userId() { return userId; }
    public String email() { return email; }
    public List<String> roles() { return getAuthorities().stream().map(a -> a.getAuthority().substring(5)).sorted().toList(); }
}
