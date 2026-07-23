package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.CompetencyFramework;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompetencyFrameworkRepository extends JpaRepository<CompetencyFramework, Long> {

    List<CompetencyFramework> findByIsCurrentVersionTrue();

    List<CompetencyFramework> findByRoleIdAndIsCurrentVersionTrue(Long roleId);

    List<CompetencyFramework> findByDepartmentIgnoreCaseAndIsCurrentVersionTrue(String department);

    List<CompetencyFramework> findByRoleIdAndDepartmentIgnoreCaseAndIsCurrentVersionTrue(Long roleId, String department);

    List<CompetencyFramework> findByVersionGroupIdOrderByVersionNumberDesc(String versionGroupId);

    Optional<CompetencyFramework> findByVersionGroupIdAndIsCurrentVersionTrue(String versionGroupId);
}
