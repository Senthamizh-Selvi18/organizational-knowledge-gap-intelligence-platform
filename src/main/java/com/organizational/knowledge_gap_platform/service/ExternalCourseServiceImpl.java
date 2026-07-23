package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.ExternalCourseDto;
import com.organizational.knowledge_gap_platform.entity.ExternalCourse;
import com.organizational.knowledge_gap_platform.repository.ExternalCourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExternalCourseServiceImpl implements ExternalCourseService {

    private final ExternalCourseRepository externalCourseRepository;

    public ExternalCourseServiceImpl(ExternalCourseRepository externalCourseRepository) {
        this.externalCourseRepository = externalCourseRepository;
    }

    @Override
    public List<ExternalCourseDto> getAllCourses() {
        return externalCourseRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ExternalCourseDto getCourseById(Long id) {
        ExternalCourse course = externalCourseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("External course not found for id: " + id));
        return toDto(course);
    }

    @Override
    public List<ExternalCourseDto> getCoursesBySkill(String skillName) {
        return externalCourseRepository.findBySkillNameIgnoreCaseAndActiveTrue(skillName)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ExternalCourseDto createCourse(ExternalCourseDto dto) {
        ExternalCourse course = toEntity(dto);
        course.setId(null);
        ExternalCourse saved = externalCourseRepository.save(course);
        return toDto(saved);
    }

    @Override
    public ExternalCourseDto updateCourse(Long id, ExternalCourseDto dto) {
        ExternalCourse existing = externalCourseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("External course not found for id: " + id));

        existing.setSkillName(dto.getSkillName());
        existing.setCourseTitle(dto.getCourseTitle());
        existing.setProvider(dto.getProvider());
        existing.setCourseUrl(dto.getCourseUrl());
        existing.setDescription(dto.getDescription());
        existing.setDifficulty(dto.getDifficulty());
        existing.setDuration(dto.getDuration());
        existing.setActive(dto.isActive());

        ExternalCourse saved = externalCourseRepository.save(existing);
        return toDto(saved);
    }

    @Override
    public void deleteCourse(Long id) {
        if (!externalCourseRepository.existsById(id)) {
            throw new RuntimeException("External course not found for id: " + id);
        }
        externalCourseRepository.deleteById(id);
    }

    private ExternalCourseDto toDto(ExternalCourse course) {
        return new ExternalCourseDto(
                course.getId(),
                course.getSkillName(),
                course.getCourseTitle(),
                course.getProvider(),
                course.getCourseUrl(),
                course.getDescription(),
                course.getDifficulty(),
                course.getDuration(),
                course.isActive()
        );
    }

    private ExternalCourse toEntity(ExternalCourseDto dto) {
        ExternalCourse course = new ExternalCourse();
        course.setId(dto.getId());
        course.setSkillName(dto.getSkillName());
        course.setCourseTitle(dto.getCourseTitle());
        course.setProvider(dto.getProvider());
        course.setCourseUrl(dto.getCourseUrl());
        course.setDescription(dto.getDescription());
        course.setDifficulty(dto.getDifficulty());
        course.setDuration(dto.getDuration());
        course.setActive(dto.isActive());
        return course;
    }
}