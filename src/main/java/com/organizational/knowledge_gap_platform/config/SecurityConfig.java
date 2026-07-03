package com.organizational.knowledge_gap_platform.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

// NOTE: added temporarily so /api/auth/** works before the JWT/OAuth2 SecurityConfig exists.
// Anyone building the JWT auth filter chain should REPLACE this class entirely and just make
// sure "/api/auth/forgot-password" and "/api/auth/reset-password" stay in permitAll().
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().permitAll() 
            );
        return http.build();
    }
}
