package com.organizational.knowledge_gap_platform.scheduler;

import com.organizational.knowledge_gap_platform.entity.Certification;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.NotificationPriority;
import com.organizational.knowledge_gap_platform.entity.NotificationType;
import com.organizational.knowledge_gap_platform.repository.CertificationRepository;
import com.organizational.knowledge_gap_platform.repository.NotificationRepository;
import com.organizational.knowledge_gap_platform.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Runs once daily to auto-generate CERTIFICATION_EXPIRING / CERTIFICATION_EXPIRED
 * notifications. Reuses NotificationService.createNotification(...) so there is
 * no second notification-writing path — this class only decides WHEN to notify,
 * NotificationServiceImpl still owns HOW a notification gets created.
 *
 * Requires @EnableScheduling on your main Application class — see note below.
 */
@Component
public class NotificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(NotificationScheduler.class);
    private static final int EXPIRY_WARNING_WINDOW_DAYS = 30;

    private final CertificationRepository certificationRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    public NotificationScheduler(CertificationRepository certificationRepository,
                                  NotificationRepository notificationRepository,
                                  NotificationService notificationService) {
        this.certificationRepository = certificationRepository;
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
    }

    /** Runs every day at 06:00 server time. */
    @Scheduled(cron = "0 0 6 * * *")
    public void checkCertificationExpiry() {
        log.info("NotificationScheduler: starting daily certification expiry check");

        LocalDate today = LocalDate.now();
        LocalDate warningThreshold = today.plusDays(EXPIRY_WARNING_WINDOW_DAYS);

        List<Certification> certifications = certificationRepository.findAll();
        int expiredCount = 0;
        int expiringCount = 0;

        for (Certification certification : certifications) {
            LocalDate expiryDate = certification.getExpiryDate();
            if (expiryDate == null) {
                continue; // no expiry set -> nothing to check
            }

            Employee employee = certification.getEmployee();
            if (employee == null || employee.getUser() == null) {
                continue;
            }
            Long recipientUserId = employee.getUser().getId();

            if (expiryDate.isBefore(today)) {
                if (notifyOnce(recipientUserId, NotificationType.CERTIFICATION_EXPIRED, certification.getId(),
                        "Certification expired",
                        certification.getCertificationName() + " expired on " + expiryDate + ".",
                        NotificationPriority.HIGH)) {
                    expiredCount++;
                }
            } else if (!expiryDate.isAfter(warningThreshold)) {
                long daysLeft = ChronoUnit.DAYS.between(today, expiryDate);
                if (notifyOnce(recipientUserId, NotificationType.CERTIFICATION_EXPIRING, certification.getId(),
                        "Certification expiring soon",
                        certification.getCertificationName() + " expires in " + daysLeft
                                + " day(s), on " + expiryDate + ".",
                        NotificationPriority.MEDIUM)) {
                    expiringCount++;
                }
            }
        }

        log.info("NotificationScheduler: certification check complete. New expired notifications: {}, " +
                "new expiring-soon notifications: {}", expiredCount, expiringCount);
    }

    /**
     * Creates the notification unless the recipient already has an unread notification
     * of the same type for the same certification, so re-runs of this job don't spam
     * the same person every night for the same certificate.
     *
     * @return true if a new notification was created
     */
    private boolean notifyOnce(Long recipientUserId, NotificationType type, Long relatedEntityId,
                                String title, String message, NotificationPriority priority) {

        boolean alreadyNotified = notificationRepository
                .existsByRecipientIdAndTypeAndRelatedEntityIdAndIsReadFalse(recipientUserId, type, relatedEntityId);

        if (alreadyNotified) {
            return false;
        }

        notificationService.createNotification(
                recipientUserId,
                type.name(),
                title,
                message,
                priority.name(),
                "/certifications",
                relatedEntityId
        );
        return true;
    }
}