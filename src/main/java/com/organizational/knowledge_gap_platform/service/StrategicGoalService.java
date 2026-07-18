package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.StrategicGoalDTO;
import com.organizational.knowledge_gap_platform.dto.StrategicGoalRequest;

import java.util.List;

public interface StrategicGoalService {

    StrategicGoalDTO create(StrategicGoalRequest request);

    StrategicGoalDTO getById(Long id);

    List<StrategicGoalDTO> getAll();

    StrategicGoalDTO update(Long id, StrategicGoalRequest request);

    void deactivate(Long id);

    void delete(Long id);
}
