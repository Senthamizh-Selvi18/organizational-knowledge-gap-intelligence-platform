package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.MentorProfile;
import com.organizational.knowledge_gap_platform.entity.MentorshipSession;
import com.organizational.knowledge_gap_platform.entity.SessionFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionFeedbackRepository extends JpaRepository<SessionFeedback, Long> {

    Optional<SessionFeedback> findBySession(MentorshipSession session);

    boolean existsBySession(MentorshipSession session);

    @Query("""
            SELECT f FROM SessionFeedback f
            WHERE f.session.mentorshipRequest.mentorProfile = :mentorProfile
            ORDER BY f.createdAt DESC
            """)
    List<SessionFeedback> findAllForMentorProfile(@Param("mentorProfile") MentorProfile mentorProfile);
}
