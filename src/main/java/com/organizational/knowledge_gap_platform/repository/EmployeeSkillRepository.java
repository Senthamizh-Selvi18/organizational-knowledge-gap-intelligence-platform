package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.EmployeeSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeSkillRepository extends JpaRepository<EmployeeSkill, Long> {

    // Get all skills assigned to an employee
    List<EmployeeSkill> findByEmployee(Employee employee);

    // Remove all skills of an employee (used while updating)
    void deleteByEmployee(Employee employee);
}