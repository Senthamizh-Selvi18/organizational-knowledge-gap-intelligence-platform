package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.MentorshipSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MentorshipSessionRepository extends JpaRepository<MentorshipSession, Long> {

    @Query("""
            SELECT s FROM MentorshipSession s
            WHERE s.mentorshipRequest.mentee = :employee
               OR s.mentorshipRequest.mentorProfile.employee = :employee
            ORDER BY s.scheduledAt DESC
            """)
    List<MentorshipSession> findAllForEmployee(@Param("employee") Employee employee);

    List<MentorshipSession> findByMentorshipRequestId(Long mentorshipRequestId);
}
