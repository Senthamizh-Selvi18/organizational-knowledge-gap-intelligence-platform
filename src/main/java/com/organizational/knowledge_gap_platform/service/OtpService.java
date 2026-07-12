package com.organizational.knowledge_gap_platform.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    @Value("${fast2sms.api.key}")
    private String fast2smsApiKey;

    private static final String FAST2SMS_URL = "https://www.fast2sms.com/dev/bulkV2";
    private static final long OTP_VALID_DURATION_MILLIS = 5 * 60 * 1000; // 5 minutes

    private final RestTemplate restTemplate = new RestTemplate();
    private final SecureRandom secureRandom = new SecureRandom();

    private static class OtpEntry {
        final String otp;
        final long expiryTime;

        OtpEntry(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }

    private final Map<Long, OtpEntry> otpStore = new ConcurrentHashMap<>();

    public void generateAndSendOtp(Long userId, String phone) {
        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        long expiryTime = Instant.now().toEpochMilli() + OTP_VALID_DURATION_MILLIS;

        otpStore.put(userId, new OtpEntry(otp, expiryTime));

        sendSms(phone, "Your KnowGap verification OTP is " + otp + ". Valid for 5 minutes.");
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

    private void sendSms(String phone, String message) {
        // ===== TEMP: Fast2SMS disabled — logging OTP to console instead =====
        log.info("=== MOCK SMS === To: {} | Message: {} ===", phone, message);

        /* ORIGINAL FAST2SMS CODE — restore this once account/provider is ready:

        String url = UriComponentsBuilder.fromHttpUrl(FAST2SMS_URL)
                .queryParam("authorization", fast2smsApiKey)
                .queryParam("route", "q")
                .queryParam("message", message)
                .queryParam("language", "english")
                .queryParam("flash", "0")
                .queryParam("numbers", phone)
                .toUriString();

        try {
            restTemplate.getForObject(url, String.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP SMS: " + e.getMessage());
        }
        */
    }
}