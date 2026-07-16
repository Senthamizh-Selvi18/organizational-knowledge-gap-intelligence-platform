package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.Certification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CertificationRepository extends JpaRepository<Certification, Long> {

    List<Certification> findByEmployeeIdOrderByUploadedAtDesc(Long employeeId);
}
