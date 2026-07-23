package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.entity.NotificationType;
import com.organizational.knowledge_gap_platform.entity.PasswordResetToken;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.exception.EmailDeliveryException;
import com.organizational.knowledge_gap_platform.exception.InvalidTokenException;
import com.organizational.knowledge_gap_platform.repository.PasswordResetTokenRepository;
import com.organizational.knowledge_gap_platform.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final NotificationService notificationService;

    @Value("${app.password-reset.token-expiry-minutes}")
    private int expiryMinutes;

    @Value("${app.password-reset.frontend-url}")
    private String resetFrontendUrl;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public PasswordResetService(UserRepository userRepository,
                                 PasswordResetTokenRepository tokenRepository,
                                 PasswordEncoder passwordEncoder,
                                 JavaMailSender mailSender,
                                 NotificationService notificationService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
        this.notificationService = notificationService;
    }
    
    @Transactional
    public void requestReset(String email) {
        log.info("Password reset requested for email: {}", maskEmail(email));

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            log.info("Password reset requested for an email with no matching account: {}", maskEmail(email));
            return;
        }

        User user = userOpt.get();
        String rawToken = generateSecureToken();
        String tokenHash = hash(rawToken);

        tokenRepository.deleteByUser(user);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setTokenHash(tokenHash);
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(expiryMinutes));
        tokenRepository.save(resetToken);

        log.info("Password reset token created for user id: {}", user.getId());

        try {
            sendResetEmail(user.getEmail(), rawToken);
        } catch (EmailDeliveryException ex) {
            log.error("Password reset email could not be delivered for user id {}: {}", user.getId(), ex.getMessage());
        }
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        String tokenHash = hash(rawToken);

        PasswordResetToken token = tokenRepository.findByTokenHashAndUsedFalse(tokenHash)
                .orElseThrow(() -> {
                    log.warn("Password reset attempted with an invalid or already-used token");
                    return new InvalidTokenException("Invalid or already used token");
                });

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("Password reset attempted with an expired token for user id: {}", token.getUser().getId());
            throw new InvalidTokenException("This reset link has expired. Please request a new one.");
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        token.setUsed(true);
        tokenRepository.save(token);

        log.info("Password successfully reset for user id: {}", user.getId());

        notifyPasswordChanged(user);
    }

    /**
     * Fires a PASSWORD_CHANGED security notification to the user themselves after a
     * successful reset, so they're alerted even if they weren't the one who did it.
     * Never allowed to break the reset flow if notification creation fails.
     */
    private void notifyPasswordChanged(User user) {
        try {
            notificationService.createNotification(
                    user.getId(),
                    NotificationType.PASSWORD_CHANGED.name(),
                    "Your password was changed",
                    "Your password was successfully reset. If you didn't do this, contact your administrator immediately.",
                    "HIGH",
                    "/profile",
                    user.getId()
            );
        } catch (Exception ex) {
            log.error("Failed to create PASSWORD_CHANGED notification for user {}", user.getId(), ex);
        }
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        long deleted = tokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        if (deleted > 0) {
            log.info("Cleaned up {} expired password reset token(s)", deleted);
        }
    }

    private String generateSecureToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(token.getBytes());
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    private void sendResetEmail(String toEmail, String rawToken) {
        String resetLink = resetFrontendUrl + "?token=" + rawToken;
        log.info("Password reset link (for local testing): {}", resetLink);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(toEmail);
        message.setSubject("Password Reset Request");
        message.setText(
                "We received a request to reset your password.\n\n" +
                "Click the link below to set a new password:\n" + resetLink + "\n\n" +
                "This link expires in " + expiryMinutes + " minutes.\n" +
                "If you didn't request this, you can safely ignore this email."
        );
        try {
            mailSender.send(message);
            log.info("Password reset email sent to {}", maskEmail(toEmail));
        } catch (MailException ex) {
            log.error("Failed to send password reset email to {}: {}", maskEmail(toEmail), ex.getMessage());
            throw new EmailDeliveryException("Failed to send password reset email", ex);
        }
    }

    private String maskEmail(String email) {
        int at = email.indexOf('@');
        if (at <= 1) {
            return "***";
        }
        return email.charAt(0) + "***" + email.substring(at);
    }
}