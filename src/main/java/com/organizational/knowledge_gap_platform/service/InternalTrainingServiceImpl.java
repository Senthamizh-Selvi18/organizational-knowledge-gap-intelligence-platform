package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.InternalTrainingDto;
import com.organizational.knowledge_gap_platform.entity.InternalTraining;
import com.organizational.knowledge_gap_platform.repository.InternalTrainingRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class InternalTrainingServiceImpl implements InternalTrainingService {

    private final InternalTrainingRepository internalTrainingRepository;
    private final LinkAvailabilityService linkAvailabilityService;

    public InternalTrainingServiceImpl(InternalTrainingRepository internalTrainingRepository,
                                        LinkAvailabilityService linkAvailabilityService) {
        this.internalTrainingRepository = internalTrainingRepository;
        this.linkAvailabilityService = linkAvailabilityService;
    }

    @Override
    public List<InternalTrainingDto> getAllTrainings() {
        List<InternalTraining> trainings = internalTrainingRepository.findAll();

        // Check every distinct external link once, in parallel, instead of
        // making a blocking HTTP call per row.
        Map<String, Boolean> linkStatus = linkAvailabilityService.isLinkActiveBulk(
                trainings.stream().map(InternalTraining::getLink).collect(Collectors.toList())
        );

        return trainings.stream()
                .map(training -> toDto(training, linkStatus))
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

    /** Re-checks a single training's link right now, bypassing the cache. */
    public InternalTrainingDto recheckLinkStatus(Long id) {
        InternalTraining training = internalTrainingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Internal training not found for id: " + id));
        if (training.getLink() != null && !training.getLink().isBlank()) {
            linkAvailabilityService.refresh(training.getLink());
        }
        return toDto(training);
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
        existing.setLink(dto.getLink());

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
        boolean effectiveActive = hasLink(training)
                ? linkAvailabilityService.isLinkActive(training.getLink())
                : training.isActive();
        return buildDto(training, effectiveActive);
    }

    private InternalTrainingDto toDto(InternalTraining training, Map<String, Boolean> linkStatus) {
        boolean effectiveActive = hasLink(training)
                ? linkStatus.getOrDefault(training.getLink(), false)
                : training.isActive();
        return buildDto(training, effectiveActive);
    }

    private boolean hasLink(InternalTraining training) {
        return training.getLink() != null && !training.getLink().isBlank();
    }

    private InternalTrainingDto buildDto(InternalTraining training, boolean effectiveActive) {
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
                effectiveActive,
                training.getLink()
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
        training.setLink(dto.getLink());
        return training;
    }
}
