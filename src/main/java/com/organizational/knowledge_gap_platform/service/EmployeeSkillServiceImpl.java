package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.AssignSkillsRequestDTO;
import com.organizational.knowledge_gap_platform.dto.EmployeeSkillResponseDTO;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.EmployeeSkill;
import com.organizational.knowledge_gap_platform.entity.Skill;
import com.organizational.knowledge_gap_platform.exception.EmployeeNotFoundException;
import com.organizational.knowledge_gap_platform.exception.SkillNotFoundException;
import com.organizational.knowledge_gap_platform.repository.EmployeeRepository;
import com.organizational.knowledge_gap_platform.repository.EmployeeSkillRepository;
import com.organizational.knowledge_gap_platform.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmployeeSkillServiceImpl implements EmployeeSkillService {

    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;
    private final EmployeeSkillRepository employeeSkillRepository;

    public EmployeeSkillServiceImpl(EmployeeRepository employeeRepository,
                                    SkillRepository skillRepository,
                                    EmployeeSkillRepository employeeSkillRepository) {
        this.employeeRepository = employeeRepository;
        this.skillRepository = skillRepository;
        this.employeeSkillRepository = employeeSkillRepository;
    }
    @Override
    @Transactional
    public void assignSkills(Long employeeId, AssignSkillsRequestDTO request) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException("Employee not found with id: " + employeeId));

        List<Skill> skills = skillRepository.findAllById(request.getSkillIds());

        if (skills.size() != request.getSkillIds().size()) {
            throw new SkillNotFoundException("One or more skills not found.");
        }

        for (Skill skill : skills) {

            // Skip if the employee already has this skill
            if (employeeSkillRepository.existsByEmployeeAndSkill(employee, skill)) {
                continue;
            }

            EmployeeSkill employeeSkill = new EmployeeSkill();
            employeeSkill.setEmployee(employee);
            employeeSkill.setSkill(skill);
            employeeSkill.setCreatedAt(LocalDateTime.now());

            employeeSkillRepository.save(employeeSkill);
        }
    }

    @Override
    @Transactional
    public void updateSkills(Long employeeId, AssignSkillsRequestDTO request) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException("Employee not found with id: " + employeeId));

        // Remove all existing skills
        employeeSkillRepository.deleteByEmployeeId(employeeId);
        employeeSkillRepository.flush();
        List<Skill> skills = skillRepository.findAllById(request.getSkillIds());

        if (skills.size() != request.getSkillIds().size()) {
            throw new SkillNotFoundException("One or more skills not found.");
        }

        for (Skill skill : skills) {
            EmployeeSkill employeeSkill = new EmployeeSkill();
            employeeSkill.setEmployee(employee);
            employeeSkill.setSkill(skill);
            employeeSkill.setCreatedAt(LocalDateTime.now());

            employeeSkillRepository.save(employeeSkill);
        }
    }


    @Override
    public List<EmployeeSkillResponseDTO> getEmployeeSkills(Long employeeId) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException("Employee not found with id: " + employeeId));

        List<EmployeeSkill> employeeSkills = employeeSkillRepository.findByEmployee(employee);

        return employeeSkills.stream()
                .map(employeeSkill -> new EmployeeSkillResponseDTO(
                        employeeSkill.getSkill().getId(),
                        employeeSkill.getSkill().getSkillName()
                ))
                .toList();
    }
    // Methods will be added next
}