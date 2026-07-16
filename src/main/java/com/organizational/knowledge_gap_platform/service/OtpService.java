package com.organizational.knowledge_gap_platform.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    private static final long OTP_VALID_DURATION_MILLIS = 5 * 60 * 1000; // 5 minutes

    private final JavaMailSender mailSender;
    private final SecureRandom secureRandom = new SecureRandom();

    public OtpService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    private static class OtpEntry {
        final String otp;
        final long expiryTime;

        OtpEntry(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }

    private final Map<Long, OtpEntry> otpStore = new ConcurrentHashMap<>();

    public void generateAndSendOtp(Long userId, String email) {
        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        long expiryTime = Instant.now().toEpochMilli() + OTP_VALID_DURATION_MILLIS;

        otpStore.put(userId, new OtpEntry(otp, expiryTime));

        sendEmail(email, "Your KnowGap verification OTP is " + otp + ". Valid for 5 minutes.");
    }

    public boolean verifyOtp(Long userId, String otp) {
        OtpEntry entry = otpStore.get(userId);

        if (entry == null) {
            return false;
        }

        if (Instant.now().toEpochMilli() > entry.expiryTime) {
            otpStore.remove(userId);
            return false;
        }

        boolean matches = entry.otp.equals(otp);

        if (matches) {
            otpStore.remove(userId);
        }

        return matches;
    }

    private void sendEmail(String toEmail, String message) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(toEmail);
            mailMessage.setSubject("KnowGap - Your Login Verification OTP");
            mailMessage.setText(message);

            mailSender.send(mailMessage);

            log.info("OTP email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        }
    }
}