package com.pulsepass.domain;
import com.pulsepass.domain.enums.Role;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
@Entity
@Table(name = "user_credentials")
public class UserCredential {
    @Id @Column(name = "user_id") private Long userId;
    @Column(name = "password_hash", nullable = false, length = 100) private String passwordHash;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING) @Column(name = "role", length = 16, nullable = false)
    private Set<Role> roles = new HashSet<>();
    protected UserCredential() {}
    public UserCredential(Long userId, String passwordHash, Set<Role> roles) {
        this.userId = userId; this.passwordHash = passwordHash; this.roles = new HashSet<>(roles);
    }
    public Long getUserId() { return userId; }
    public String getPasswordHash() { return passwordHash; }
    public Set<Role> getRoles() { return Set.copyOf(roles); }
}
