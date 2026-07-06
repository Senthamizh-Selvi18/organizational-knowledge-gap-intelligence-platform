package com.organizational.knowledge_gap_platform.security;

import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.repository.RoleRepository;
import com.organizational.knowledge_gap_platform.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;

    @Value("${app.oauth2.default-role:EMPLOYEE}")
    private String defaultRoleName;

    @Value("${app.oauth2.redirect-uri:http://localhost:5173/oauth2/redirect}")
    private String redirectUri;

    public OAuth2LoginSuccessHandler(UserRepository userRepository,
                                      RoleRepository roleRepository,
                                      JwtService jwtService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtService = jwtService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                         HttpServletResponse response,
                                         Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            Role role = roleRepository.findByRoleName(defaultRoleName)
                    .orElseThrow(() -> new RuntimeException(
                            "Default role '" + defaultRoleName + "' not found. Seed it before enabling OAuth2 login."));

            User newUser = new User();
            newUser.setName(name);
            newUser.setEmail(email);
            newUser.setPassword(null); // Google users don't have a local password
            newUser.setRole(role);
            newUser.setCreatedAt(LocalDateTime.now());
            return userRepository.save(newUser);
        });

        String token = jwtService.generateToken(user.getEmail());
        response.sendRedirect(redirectUri + "?token=" + token);
    }
}