package com.pulsepass.service;

import com.pulsepass.repository.TicketRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.security.SecurityPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/**
 * Reglas de autorización por rol y por propietario.
 *
 * <p>Las expresiones {@code @PreAuthorize} de los servicios lo usan por su nombre de bean
 * ({@code @authorizationService.email(#email)}). Los servicios lo inyectan para decidir si
 * el usuario actual puede ver eventos que no son públicos.</p>
 */
@Service("authorizationService")
@Transactional(readOnly = true)
public class AuthorizationService {

    private static final Set<String> OPERATOR_ROLES = Set.of("ROLE_ADMIN", "ROLE_STAFF");

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;

    public AuthorizationService(
            UserRepository userRepository,
            TicketRepository ticketRepository
    ) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
    }

    /** {@code true} si el usuario autenticado es STAFF o ADMIN. */
    public boolean isOperator() {

        Authentication authentication = currentAuthentication();

        return authentication != null
                && authentication.getAuthorities()
                .stream()
                .anyMatch(authority -> OPERATOR_ROLES.contains(authority.getAuthority()));
    }

    /** {@code true} si el email pertenece al usuario autenticado. */
    public boolean email(String email) {

        return userRepository
                .findByEmailIgnoreCase(email)
                .map(user -> isCurrentUser(user.getId()))
                .orElse(false);
    }

    /** {@code true} si el username pertenece al usuario autenticado. */
    public boolean username(String username) {

        return userRepository
                .findByUsername(username)
                .map(user -> isCurrentUser(user.getId()))
                .orElse(false);
    }

    /** {@code true} si el ticket pertenece al usuario autenticado. */
    public boolean ticket(String ticketCode) {

        return ticketRepository
                .findByTicketCode(ticketCode)
                .map(ticket -> isCurrentUser(ticket.getUser().getId()))
                .orElse(false);
    }

    private boolean isCurrentUser(Long userId) {

        Authentication authentication = currentAuthentication();

        return authentication != null
                && authentication.getPrincipal() instanceof SecurityPrincipal principal
                && principal.userId().equals(userId);
    }

    private Authentication currentAuthentication() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        return authentication != null && authentication.isAuthenticated()
                ? authentication
                : null;
    }
}
