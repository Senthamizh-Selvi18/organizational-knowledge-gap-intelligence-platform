package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.InternalTrainingDto;

import java.util.List;

public interface InternalTrainingService {

    List<InternalTrainingDto> getAllTrainings();

    InternalTrainingDto getTrainingById(Long id);

    List<InternalTrainingDto> getTrainingsBySkill(String skillName);

    InternalTrainingDto createTraining(InternalTrainingDto dto);

    InternalTrainingDto updateTraining(Long id, InternalTrainingDto dto);

    void deleteTraining(Long id);
}
