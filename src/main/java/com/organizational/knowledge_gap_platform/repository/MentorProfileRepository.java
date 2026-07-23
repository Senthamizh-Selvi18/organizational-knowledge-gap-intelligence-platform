package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.MentorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorProfileRepository extends JpaRepository<MentorProfile, Long> {

    Optional<MentorProfile> findByEmployee(Employee employee);

    Optional<MentorProfile> findByEmployeeId(Long employeeId);

    List<MentorProfile> findByActiveTrueOrderByCreatedAtDesc();

    List<MentorProfile> findAllByOrderByCreatedAtDesc();
}
