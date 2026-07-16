package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.StrategicGoalDTO;
import com.organizational.knowledge_gap_platform.dto.StrategicGoalRequest;
import com.organizational.knowledge_gap_platform.entity.GoalPriority;
import com.organizational.knowledge_gap_platform.entity.StrategicGoal;
import com.organizational.knowledge_gap_platform.exception.StrategicGoalNotFoundException;
import com.organizational.knowledge_gap_platform.repository.StrategicGoalRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StrategicGoalServiceImpl implements StrategicGoalService {

    private final StrategicGoalRepository strategicGoalRepository;

    public StrategicGoalServiceImpl(StrategicGoalRepository strategicGoalRepository) {
        this.strategicGoalRepository = strategicGoalRepository;
    }

    @Override
    public StrategicGoalDTO create(StrategicGoalRequest request) {
        StrategicGoal goal = new StrategicGoal();
        applyRequest(goal, request);
        return StrategicGoalDTO.fromEntity(strategicGoalRepository.save(goal));
    }

    @Override
    public StrategicGoalDTO getById(Long id) {
        return StrategicGoalDTO.fromEntity(findEntity(id));
    }

    @Override
    public List<StrategicGoalDTO> getAll() {
        return strategicGoalRepository.findAll().stream()
                .map(StrategicGoalDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public StrategicGoalDTO update(Long id, StrategicGoalRequest request) {
        StrategicGoal goal = findEntity(id);
        applyRequest(goal, request);
        return StrategicGoalDTO.fromEntity(strategicGoalRepository.save(goal));
    }

    @Override
    public void deactivate(Long id) {
        StrategicGoal goal = findEntity(id);
        goal.setActive(false);
        strategicGoalRepository.save(goal);
    }

    @Override
    public void delete(Long id) {
        strategicGoalRepository.delete(findEntity(id));
    }

    private void applyRequest(StrategicGoal goal, StrategicGoalRequest request) {
        goal.setGoalName(request.getGoalName());
        goal.setDescription(request.getDescription());
        goal.setTargetYear(request.getTargetYear());
        goal.setPriority(request.getPriority() != null ? request.getPriority() : GoalPriority.MEDIUM);
    }

    private StrategicGoal findEntity(Long id) {
        return strategicGoalRepository.findById(id)
                .orElseThrow(() -> new StrategicGoalNotFoundException("Strategic goal not found with id: " + id));
    }
}
