package com.pulsepass.service;
import com.pulsepass.repository.*;
import com.pulsepass.security.SecurityPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service("authorizationService")
@Transactional(readOnly = true)
public class AuthorizationService {
    private final UserRepository users;
    private final TicketRepository tickets;
    public AuthorizationService(UserRepository users, TicketRepository tickets) { this.users=users; this.tickets=tickets; }
    public static boolean operator() {
        var a = SecurityContextHolder.getContext().getAuthentication();
        return a != null && a.isAuthenticated() && a.getAuthorities().stream()
            .anyMatch(r -> r.getAuthority().equals("ROLE_ADMIN") || r.getAuthority().equals("ROLE_STAFF"));
    }
    private boolean owns(Long id) {
        var a = SecurityContextHolder.getContext().getAuthentication();
        return a != null && a.isAuthenticated() && a.getPrincipal() instanceof SecurityPrincipal p && p.userId().equals(id);
    }
    public boolean email(String email) { return users.findByEmailIgnoreCase(email).map(u -> owns(u.getId())).orElse(false); }
    public boolean username(String username) { return users.findByUsername(username).map(u -> owns(u.getId())).orElse(false); }
    public boolean ticket(String code) { return tickets.findByTicketCode(code).map(t -> owns(t.getUser().getId())).orElse(false); }
}
