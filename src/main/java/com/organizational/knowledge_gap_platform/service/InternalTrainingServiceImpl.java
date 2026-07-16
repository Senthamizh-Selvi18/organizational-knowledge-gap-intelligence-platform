package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.InternalTrainingDto;
import com.organizational.knowledge_gap_platform.entity.InternalTraining;
import com.organizational.knowledge_gap_platform.repository.InternalTrainingRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InternalTrainingServiceImpl implements InternalTrainingService {

    private final InternalTrainingRepository internalTrainingRepository;

    public InternalTrainingServiceImpl(InternalTrainingRepository internalTrainingRepository) {
        this.internalTrainingRepository = internalTrainingRepository;
    }

    @Override
    public List<InternalTrainingDto> getAllTrainings() {
        return internalTrainingRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public InternalTrainingDto getTrainingById(Long id) {
        InternalTraining training = internalTrainingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Internal training not found for id: " + id));
        return toDto(training);
    }

    @Override
    public List<InternalTrainingDto> getTrainingsBySkill(String skillName) {
        return internalTrainingRepository.findBySkillNameIgnoreCaseAndActiveTrue(skillName)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public InternalTrainingDto createTraining(InternalTrainingDto dto) {
        InternalTraining training = toEntity(dto);
        training.setId(null);
        InternalTraining saved = internalTrainingRepository.save(training);
        return toDto(saved);
    }

    @Override
    public InternalTrainingDto updateTraining(Long id, InternalTrainingDto dto) {
        InternalTraining existing = internalTrainingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Internal training not found for id: " + id));

        existing.setTitle(dto.getTitle());
        existing.setSkillName(dto.getSkillName());
        existing.setCategory(dto.getCategory());
        existing.setTrainer(dto.getTrainer());
        existing.setMode(dto.getMode());
        existing.setDuration(dto.getDuration());
        existing.setDescription(dto.getDescription());
        existing.setMandatory(dto.isMandatory());
        existing.setActive(dto.isActive());

        InternalTraining saved = internalTrainingRepository.save(existing);
        return toDto(saved);
    }

    @Override
    public void deleteTraining(Long id) {
        if (!internalTrainingRepository.existsById(id)) {
            throw new RuntimeException("Internal training not found for id: " + id);
        }
        internalTrainingRepository.deleteById(id);
    }

    private InternalTrainingDto toDto(InternalTraining training) {
        return new InternalTrainingDto(
                training.getId(),
                training.getTitle(),
                training.getSkillName(),
                training.getCategory(),
                training.getTrainer(),
                training.getMode(),
                training.getDuration(),
                training.getDescription(),
                training.isMandatory(),
                training.isActive()
        );
    }

    private InternalTraining toEntity(InternalTrainingDto dto) {
        InternalTraining training = new InternalTraining();
        training.setId(dto.getId());
        training.setTitle(dto.getTitle());
        training.setSkillName(dto.getSkillName());
        training.setCategory(dto.getCategory());
        training.setTrainer(dto.getTrainer());
        training.setMode(dto.getMode());
        training.setDuration(dto.getDuration());
        training.setDescription(dto.getDescription());
        training.setMandatory(dto.isMandatory());
        training.setActive(dto.isActive());
        return training;
    }
}
