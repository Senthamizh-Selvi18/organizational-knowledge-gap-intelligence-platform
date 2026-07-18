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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EmployeeSkillServiceImpl implements EmployeeSkillService {

    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final NotificationService notificationService;
    private final ActivityLogService activityLogService;

    public EmployeeSkillServiceImpl(EmployeeRepository employeeRepository,
                                    SkillRepository skillRepository,
                                    EmployeeSkillRepository employeeSkillRepository,
                                    NotificationService notificationService,
                                    ActivityLogService activityLogService) {
        this.employeeRepository = employeeRepository;
        this.skillRepository = skillRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.notificationService = notificationService;
        this.activityLogService = activityLogService;
    }

    @Override
    @Transactional
    public void assignSkills(Long employeeId, AssignSkillsRequestDTO request) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException("Employee not found with id: " + employeeId));

        List<Long> skillIds = request.getSkills().stream()
                .map(AssignSkillsRequestDTO.SkillAssignmentDTO::getSkillId)
                .toList();

        List<Skill> skills = skillRepository.findAllById(skillIds);

        if (skills.size() != skillIds.size()) {
            throw new SkillNotFoundException("One or more skills not found.");
        }

        Map<Long, Integer> proficiencyBySkillId = request.getSkills().stream()
                .collect(Collectors.toMap(
                        AssignSkillsRequestDTO.SkillAssignmentDTO::getSkillId,
                        s -> s.getProficiencyLevel() != null ? s.getProficiencyLevel() : 0
                ));

        List<String> newlyAssignedSkillNames = new ArrayList<>();

        for (Skill skill : skills) {

            // Skip if the employee already has this skill
            if (employeeSkillRepository.existsByEmployeeAndSkill(employee, skill)) {
                continue;
            }

            EmployeeSkill employeeSkill = new EmployeeSkill();
            employeeSkill.setEmployee(employee);
            employeeSkill.setSkill(skill);
            employeeSkill.setCreatedAt(LocalDateTime.now());
            employeeSkill.setProficiencyLevel(proficiencyBySkillId.get(skill.getId()));

            employeeSkillRepository.save(employeeSkill);
            newlyAssignedSkillNames.add(skill.getSkillName());
        }

        notificationService.notifySkillAssigned(employee, newlyAssignedSkillNames);

        if (!newlyAssignedSkillNames.isEmpty()) {
            activityLogService.logActivity(employee, "Added Skill: " + String.join(", ", newlyAssignedSkillNames));
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

        List<Long> skillIds = request.getSkills().stream()
                .map(AssignSkillsRequestDTO.SkillAssignmentDTO::getSkillId)
                .toList();

        List<Skill> skills = skillRepository.findAllById(skillIds);

        if (skills.size() != skillIds.size()) {
            throw new SkillNotFoundException("One or more skills not found.");
        }

        Map<Long, Integer> proficiencyBySkillId = request.getSkills().stream()
                .collect(Collectors.toMap(
                        AssignSkillsRequestDTO.SkillAssignmentDTO::getSkillId,
                        s -> s.getProficiencyLevel() != null ? s.getProficiencyLevel() : 0
                ));

        for (Skill skill : skills) {
            EmployeeSkill employeeSkill = new EmployeeSkill();
            employeeSkill.setEmployee(employee);
            employeeSkill.setSkill(skill);
            employeeSkill.setCreatedAt(LocalDateTime.now());
            employeeSkill.setProficiencyLevel(proficiencyBySkillId.get(skill.getId()));

            employeeSkillRepository.save(employeeSkill);
        }

        List<String> updatedSkillNames = skills.stream()
                .map(Skill::getSkillName)
                .toList();

        notificationService.notifySkillUpdated(employee, updatedSkillNames);
        activityLogService.logActivity(employee, "Updated Skills");
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
                        employeeSkill.getSkill().getSkillName(),
                        employeeSkill.getProficiencyLevel()
                ))
                .toList();
    }
}