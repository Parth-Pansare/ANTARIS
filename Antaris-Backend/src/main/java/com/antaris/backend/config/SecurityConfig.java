package com.antaris.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        /*
         * DEVELOPMENT SECURITY CONFIGURATION
         *
         * Authentication is intentionally disabled during Phase 1
         * backend development and API testing.
         *
         * Before production deployment, this configuration must be
         * replaced with proper authentication and authorization,
         * including role-based access control and secure credentials.
         */

        http
                // Disable CSRF for development/API testing
                .csrf(csrf -> csrf.disable())

                // Disable browser login mechanisms
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())

                // Allow API and WebSocket access during development
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .anyRequest().permitAll()
                );

        return http.build();
    }
}