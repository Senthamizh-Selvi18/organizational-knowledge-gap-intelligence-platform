package com.organizational.knowledge_gap_platform.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    private static final long OTP_VALID_DURATION_MILLIS = 5 * 60 * 1000; // 5 minutes

    private final SecureRandom secureRandom = new SecureRandom();

    private final Map<Long, OtpEntry> otpStore = new ConcurrentHashMap<>();

    private final HttpClient httpClient = HttpClient.newHttpClient();

    private static class OtpEntry {
        final String otp;
        final long expiryTime;

        OtpEntry(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }

    public void generateAndSendOtp(Long userId, String email) {

        String otp = String.format(
                "%06d",
                secureRandom.nextInt(1_000_000)
        );

        long expiryTime =
                Instant.now().toEpochMilli() + OTP_VALID_DURATION_MILLIS;

        otpStore.put(
                userId,
                new OtpEntry(otp, expiryTime)
        );

        sendEmail(
                email,
                "Your KnowGap verification OTP is " + otp
                        + ". Valid for 5 minutes."
        );
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
            String apiKey = System.getenv("RESEND_API_KEY");
            String fromEmail = System.getenv("RESEND_FROM_EMAIL");

            if (apiKey == null || apiKey.isBlank()) {
                throw new RuntimeException(
                        "RESEND_API_KEY is not configured"
                );
            }

            if (fromEmail == null || fromEmail.isBlank()) {
                throw new RuntimeException(
                        "RESEND_FROM_EMAIL is not configured"
                );
            }

            String escapedMessage = message
                    .replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r");

            String escapedToEmail = toEmail
                    .replace("\\", "\\\\")
                    .replace("\"", "\\\"");

            String escapedFromEmail = fromEmail
                    .replace("\\", "\\\\")
                    .replace("\"", "\\\"");

            String jsonBody = """
                    {
                      "from": "%s",
                      "to": ["%s"],
                      "subject": "KnowGap - Your Login Verification OTP",
                      "text": "%s"
                    }
                    """.formatted(
                    escapedFromEmail,
                    escapedToEmail,
                    escapedMessage
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header(
                            "Authorization",
                            "Bearer " + apiKey
                    )
                    .header(
                            "Content-Type",
                            "application/json"
                    )
                    .POST(
                            HttpRequest.BodyPublishers.ofString(jsonBody)
                    )
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() < 200
                    || response.statusCode() >= 300) {

                log.error(
                        "Resend API error. Status: {}, Response: {}",
                        response.statusCode(),
                        response.body()
                );

                throw new RuntimeException(
                        "Failed to send OTP email. Resend API returned status "
                                + response.statusCode()
                );
            }

            log.info(
                    "OTP email sent successfully to {}",
                    toEmail
            );

        } catch (Exception e) {

            log.error(
                    "Failed to send OTP email to {}: {}",
                    toEmail,
                    e.getMessage()
            );

            throw new RuntimeException(
                    "Failed to send OTP email: " + e.getMessage(),
                    e
            );
        }
    }
}