package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.ExternalCourseDto;

import java.util.List;

public interface ExternalCourseService {

    List<ExternalCourseDto> getAllCourses();

    ExternalCourseDto getCourseById(Long id);

    List<ExternalCourseDto> getCoursesBySkill(String skillName);

    ExternalCourseDto createCourse(ExternalCourseDto dto);

    ExternalCourseDto updateCourse(Long id, ExternalCourseDto dto);

    void deleteCourse(Long id);
}