package com.pulsepass.service;

import com.pulsepass.domain.Ticket;
import com.pulsepass.domain.User;
import com.pulsepass.domain.UserCredential;
import com.pulsepass.domain.enums.Role;
import com.pulsepass.domain.enums.TicketType;
import com.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.repository.TicketRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.security.SecurityPrincipal;
import com.pulsepass.service.impl.EventServiceImpl;
import com.pulsepass.service.impl.TicketServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.support.StaticApplicationContext;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.Expression;
import org.springframework.security.access.expression.ExpressionUtils;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.util.SimpleMethodInvocation;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Method;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * PRD de seguridad §17.1: dueño vs tercero, STAFF en uso, ADMIN en publicación y rechazo de
 * correos ajenos. Las reglas de rol se comprueban evaluando las expresiones @PreAuthorize reales
 * de los servicios con el AuthorizationService de esta prueba.
 */
@ExtendWith(MockitoExtension.class)
class AuthorizationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TicketRepository ticketRepository;

    @InjectMocks
    private AuthorizationService authorizationService;

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    private static User user(long id, String username) {
        User user = new User(username, username + "@mail.test", true);
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    private static Authentication login(User user, Role... roles) {
        SecurityPrincipal principal = new SecurityPrincipal(user, new UserCredential(user.getId(), "hash", Set.of(roles)));
        Authentication auth = UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
        return auth;
    }

    private boolean permits(Class<?> type, String name, Authentication auth, Object... args) throws Exception {
        Method method = null;
        for (Method m : type.getDeclaredMethods()) {
            if (m.getName().equals(name) && m.isAnnotationPresent(PreAuthorize.class)) {
                method = m;
            }
        }
        StaticApplicationContext context = new StaticApplicationContext();
        context.getBeanFactory().registerSingleton("authorizationService", authorizationService);
        context.refresh();
        DefaultMethodSecurityExpressionHandler handler = new DefaultMethodSecurityExpressionHandler();
        handler.setApplicationContext(context);
        Expression expression = handler.getExpressionParser().parseExpression(method.getAnnotation(PreAuthorize.class).value());
        EvaluationContext evaluation = handler.createEvaluationContext(() -> auth, new SimpleMethodInvocation(mock(type), method, args));
        return ExpressionUtils.evaluateAsBoolean(expression, evaluation);
    }

    @Test
    void email_ownerIsAllowedAndThirdPartyIsNot() {

        User ana = user(7, "ana"), luis = user(9, "luis");
        when(userRepository.findByEmailIgnoreCase("ana@mail.test")).thenReturn(Optional.of(ana));
        when(userRepository.findByEmailIgnoreCase("luis@mail.test")).thenReturn(Optional.of(luis));
        login(ana, Role.USER);

        assertThat(authorizationService.email("ana@mail.test")).isTrue();
        assertThat(authorizationService.email("luis@mail.test")).isFalse();
    }

    @Test
    void email_unknownEmailOrAnonymous_isDenied() {

        when(userRepository.findByEmailIgnoreCase("nadie@mail.test")).thenReturn(Optional.empty());
        login(user(7, "ana"), Role.USER);
        assertThat(authorizationService.email("nadie@mail.test")).isFalse();

        SecurityContextHolder.clearContext();
        when(userRepository.findByEmailIgnoreCase("ana@mail.test")).thenReturn(Optional.of(user(7, "ana")));
        assertThat(authorizationService.email("ana@mail.test")).isFalse();
    }

    @Test
    void ticket_ownerIsAllowedAndThirdPartyIsNot() {

        User ana = user(7, "ana"), luis = user(9, "luis");
        Ticket deAna = mock(Ticket.class), deLuis = mock(Ticket.class);
        when(deAna.getUser()).thenReturn(ana);
        when(deLuis.getUser()).thenReturn(luis);
        when(ticketRepository.findByTicketCode("TCK-ANA")).thenReturn(Optional.of(deAna));
        when(ticketRepository.findByTicketCode("TCK-LUIS")).thenReturn(Optional.of(deLuis));
        login(ana, Role.USER);

        assertThat(authorizationService.ticket("TCK-ANA")).isTrue();
        assertThat(authorizationService.ticket("TCK-LUIS")).isFalse();
    }

    @Test
    void isOperator_onlyStaffAndAdmin() {

        login(user(1, "staff"), Role.STAFF);
        assertThat(authorizationService.isOperator()).isTrue();
        login(user(2, "admin"), Role.ADMIN);
        assertThat(authorizationService.isOperator()).isTrue();
        login(user(3, "ana"), Role.USER);
        assertThat(authorizationService.isOperator()).isFalse();
    }

    @Test
    void markAsUsed_staffIsAllowedAndUserIsNot() throws Exception {

        assertThat(permits(TicketServiceImpl.class, "markAsUsed", login(user(1, "staff"), Role.STAFF), "TCK-1")).isTrue();
        assertThat(permits(TicketServiceImpl.class, "markAsUsed", login(user(3, "ana"), Role.USER), "TCK-1")).isFalse();
    }

    @Test
    void publish_adminIsAllowedAndStaffIsNot() throws Exception {

        assertThat(permits(EventServiceImpl.class, "publish", login(user(2, "admin"), Role.ADMIN), "CMF-2026")).isTrue();
        assertThat(permits(EventServiceImpl.class, "publish", login(user(1, "staff"), Role.STAFF), "CMF-2026")).isFalse();
    }

    @Test
    void purchase_withSomeoneElsesEmail_isDenied() throws Exception {

        User ana = user(7, "ana"), luis = user(9, "luis");
        lenient().when(userRepository.findByEmailIgnoreCase("ana@mail.test")).thenReturn(Optional.of(ana));
        lenient().when(userRepository.findByEmailIgnoreCase("luis@mail.test")).thenReturn(Optional.of(luis));
        Authentication auth = login(ana, Role.USER);

        assertThat(permits(TicketServiceImpl.class, "purchase", auth,
                new PurchaseTicketRequest("ana@mail.test", "CMF-2026", TicketType.GENERAL))).isTrue();
        assertThat(permits(TicketServiceImpl.class, "purchase", auth,
                new PurchaseTicketRequest("luis@mail.test", "CMF-2026", TicketType.GENERAL))).isFalse();
    }
}
