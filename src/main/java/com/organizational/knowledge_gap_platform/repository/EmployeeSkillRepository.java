package com.organizational.knowledge_gap_platform.repository;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.EmployeeSkill;
import com.organizational.knowledge_gap_platform.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeSkillRepository extends JpaRepository<EmployeeSkill, Long> {

    List<EmployeeSkill> findByEmployeeId(Long employeeId);

    List<EmployeeSkill> findByEmployee(Employee employee);

    // Added for the Assessment module: lets assessment submission upsert
    // the employee's proficiency level for a specific skill.
    Optional<EmployeeSkill> findByEmployeeAndSkill(Employee employee, Skill skill);

    @Modifying
    @Query("DELETE FROM EmployeeSkill es WHERE es.employee.id = :employeeId")
    void deleteByEmployeeId(@Param("employeeId") Long employeeId);

    boolean existsByEmployeeAndSkill(Employee employee, Skill skill);
}
