package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.IndustryBenchmarkDTO;
import com.organizational.knowledge_gap_platform.dto.IndustryBenchmarkRequest;

import java.util.List;

public interface IndustryBenchmarkService {

    IndustryBenchmarkDTO create(IndustryBenchmarkRequest request);

    IndustryBenchmarkDTO getById(Long id);

    List<IndustryBenchmarkDTO> getAll();

    List<IndustryBenchmarkDTO> getBySkillTaxonomy(Long skillTaxonomyId);

    IndustryBenchmarkDTO update(Long id, IndustryBenchmarkRequest request);

    void delete(Long id);
}
