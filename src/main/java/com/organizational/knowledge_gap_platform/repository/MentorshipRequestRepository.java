package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.MentorProfile;
import com.organizational.knowledge_gap_platform.entity.MentorshipRequest;
import com.organizational.knowledge_gap_platform.entity.MentorshipRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorshipRequestRepository extends JpaRepository<MentorshipRequest, Long> {

    List<MentorshipRequest> findByMenteeOrderByRequestedAtDesc(Employee mentee);

    List<MentorshipRequest> findByMentorProfileOrderByRequestedAtDesc(MentorProfile mentorProfile);

    List<MentorshipRequest> findByMentorProfile_EmployeeOrderByRequestedAtDesc(Employee mentorEmployee);

    Optional<MentorshipRequest> findByMentorProfileAndMenteeAndStatus(
            MentorProfile mentorProfile, Employee mentee, MentorshipRequestStatus status);

    long countByMentorProfileAndStatus(MentorProfile mentorProfile, MentorshipRequestStatus status);
}
