package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.PasswordResetToken;
import com.organizational.knowledge_gap_platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenHashAndUsedFalse(String tokenHash);

    @Transactional
    void deleteByUser(User user);
}
