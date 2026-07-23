package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.CompetencyResponseDTO;
import com.organizational.knowledge_gap_platform.repository.CompetencyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompetencyServiceImpl implements CompetencyService {

    private final CompetencyRepository competencyRepository;

    public CompetencyServiceImpl(CompetencyRepository competencyRepository) {
        this.competencyRepository = competencyRepository;
    }

    @Override
    public List<CompetencyResponseDTO> getEmployeeCompetencies(Long employeeId) {

        return competencyRepository.findByEmployeeId(employeeId)
                .stream()
                .map(competency -> new CompetencyResponseDTO(
                        competency.getId(),
                        competency.getSkill() != null ? competency.getSkill().getSkillName() : null,
                        competency.getLevel()
                ))
                .toList();
    }
}