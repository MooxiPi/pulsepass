package com.pulsepass.security;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
@Configuration
@org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    @Bean org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource(
            @org.springframework.beans.factory.annotation.Value("${pulsepass.security.cors.allowed-origins:}") String origins) {
        var config = new org.springframework.web.cors.CorsConfiguration();
        config.setAllowedOrigins(java.util.Arrays.stream(origins.split(",")).map(String::trim).filter(s -> !s.isBlank() && !s.equals("*")).toList());
        config.setAllowedMethods(java.util.List.of("GET", "POST", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(java.util.List.of("Authorization", "Content-Type", "Accept"));
        config.setExposedHeaders(java.util.List.of("X-Request-ID"));
        config.setAllowCredentials(false);
        var source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config); return source;
    }
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(12); }
    @Bean AuthenticationManager authenticationManager(CustomUserDetailsService users, PasswordEncoder encoder) {
        var provider = new DaoAuthenticationProvider(users); provider.setPasswordEncoder(encoder);
        return new ProviderManager(provider);
    }
    @Bean SecurityFilterChain securityFilterChain(HttpSecurity http, JwtService jwt, CustomUserDetailsService users, SecurityErrorWriter errors) throws Exception {
        return http.csrf(c -> c.disable()).sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .cors(org.springframework.security.config.Customizer.withDefaults())
            .formLogin(c -> c.disable()).httpBasic(c -> c.disable()).logout(c -> c.disable()).requestCache(c -> c.disable())
            .exceptionHandling(e -> e.authenticationEntryPoint((q,s,x) -> errors.write(s, HttpStatus.UNAUTHORIZED))
                .accessDeniedHandler((q,s,x) -> errors.write(s, HttpStatus.FORBIDDEN)))
            .authorizeHttpRequests(a -> a
                .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/users").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/events/*/tickets/paid").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/venues/*", "/api/artists/*", "/api/events/*").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/events", "/api/events/*/artists/*").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/events/*/publish").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/tickets").hasRole("USER")
                .requestMatchers(HttpMethod.PATCH, "/api/tickets/*/use").hasAnyRole("STAFF", "ADMIN")
                .anyRequest().authenticated())
            .addFilterBefore(new RequestAuditFilter(), UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(new JwtAuthenticationFilter(jwt, users, errors), UsernamePasswordAuthenticationFilter.class).build();
    }
}
