package com.organizational.knowledge_gap_platform.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.AuthenticationEntryPoint;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthenticationProvider authenticationProvider;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            AuthenticationProvider authenticationProvider,
            OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler,
            OAuth2LoginFailureHandler oAuth2LoginFailureHandler
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.authenticationProvider = authenticationProvider;
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
        this.oAuth2LoginFailureHandler = oAuth2LoginFailureHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(Customizer.withDefaults())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // Without this, Spring Security routes ALL auth failures on /api/**
                // (both "not logged in" and "logged in but not authorized") through
                // the OAuth2 login entry point, which tries to redirect the browser
                // to accounts.google.com. That redirect fails on an XHR/fetch call
                // and shows up in the browser as a misleading CORS error. Returning
                // plain JSON here keeps API failures as clean 401/403 responses.
                .exceptionHandling(exceptions -> exceptions
                        .defaultAuthenticationEntryPointFor(
                                apiAuthenticationEntryPoint(),
                                new org.springframework.security.web.util.matcher.AntPathRequestMatcher("/api/**")
                        )
                        .defaultAccessDeniedHandlerFor(
                                apiAccessDeniedHandler(),
                                new org.springframework.security.web.util.matcher.AntPathRequestMatcher("/api/**")
                        )
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",
                                "/login/**",
                                "/oauth2/**",
                                "/auth/**",
                                "/api/auth/**"
                        ).permitAll()

                        .requestMatchers("/api/roles/**")
                        .hasRole("ADMIN")

                        // Read-only access for HR: viewing skills is required for
                        // Gap Analysis, but creating/editing/deleting skills stays Admin-only.
                        .requestMatchers(HttpMethod.GET, "/api/skills/**")
                        .hasAnyRole("ADMIN", "HR")

                        .requestMatchers("/api/skills/**")
                        .hasRole("ADMIN")

                        // Read-only access for HR: viewing employees is required for
                        // Gap Analysis, but creating/editing/deleting employees stays Admin-only.
                        .requestMatchers(HttpMethod.GET, "/api/employees/**")
                        .hasAnyRole("ADMIN", "HR")

                        // Added to restrict Employee Management write APIs to Admin only
                        .requestMatchers("/api/employees/**")
                        .hasRole("ADMIN")

                        // Read-only access for HR: viewing required skill levels
                        // is needed for Gap Analysis; managing them is Admin-only.
                        .requestMatchers(HttpMethod.GET, "/api/role-skill-requirements/**")
                        .hasAnyRole("ADMIN", "HR")

                        .requestMatchers("/api/role-skill-requirements/**")
                        .hasRole("ADMIN")

                        .requestMatchers("/api/users/**")
                        .authenticated()

                        .requestMatchers("/api/gap-analysis/**")
                        .authenticated()

                        .anyRequest()
                        .authenticated()
                )

                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureHandler(oAuth2LoginFailureHandler)
                )

                .authenticationProvider(authenticationProvider)

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // Returns a plain 401 JSON body for unauthenticated requests to /api/**
    // instead of letting oauth2Login redirect the browser to Google.
    @Bean
    public AuthenticationEntryPoint apiAuthenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(401);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(
                    "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"" +
                            "Authentication is required to access this resource.\"}"
            );
        };
    }

    // Returns a plain 403 JSON body when an authenticated user lacks the
    // required role for /api/**, instead of letting oauth2Login redirect
    // the browser to Google.
    @Bean
    public AccessDeniedHandler apiAccessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setStatus(403);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(
                    "{\"status\":403,\"error\":\"Forbidden\",\"message\":\"" +
                            "You do not have permission to access this resource.\"}"
            );
        };
    }
}