package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.SkillTaxonomyDTO;
import com.organizational.knowledge_gap_platform.dto.SkillTaxonomyRequest;

import java.util.List;

public interface SkillTaxonomyService {

    SkillTaxonomyDTO create(SkillTaxonomyRequest request);

    SkillTaxonomyDTO getById(Long id);

    List<SkillTaxonomyDTO> getAllFlat();

    List<SkillTaxonomyDTO> getTree();

    SkillTaxonomyDTO update(Long id, SkillTaxonomyRequest request);

    void deactivate(Long id);

    void delete(Long id);
}
