package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.SkillTaxonomyDTO;
import com.organizational.knowledge_gap_platform.dto.SkillTaxonomyRequest;
import com.organizational.knowledge_gap_platform.entity.Skill;
import com.organizational.knowledge_gap_platform.entity.SkillTaxonomy;
import com.organizational.knowledge_gap_platform.exception.SkillTaxonomyNotFoundException;
import com.organizational.knowledge_gap_platform.repository.SkillRepository;
import com.organizational.knowledge_gap_platform.repository.SkillTaxonomyRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SkillTaxonomyServiceImpl implements SkillTaxonomyService {

    private final SkillTaxonomyRepository skillTaxonomyRepository;
    private final SkillRepository skillRepository;

    public SkillTaxonomyServiceImpl(SkillTaxonomyRepository skillTaxonomyRepository,
                                     SkillRepository skillRepository) {
        this.skillTaxonomyRepository = skillTaxonomyRepository;
        this.skillRepository = skillRepository;
    }

    @Override
    public SkillTaxonomyDTO create(SkillTaxonomyRequest request) {
        SkillTaxonomy taxonomy = new SkillTaxonomy();
        applyRequest(taxonomy, request);
        SkillTaxonomy saved = skillTaxonomyRepository.save(taxonomy);
        return SkillTaxonomyDTO.fromEntity(saved);
    }

    @Override
    public SkillTaxonomyDTO getById(Long id) {
        return SkillTaxonomyDTO.fromEntity(findEntity(id), true);
    }

    @Override
    public List<SkillTaxonomyDTO> getAllFlat() {
        return skillTaxonomyRepository.findAll().stream()
                .map(SkillTaxonomyDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<SkillTaxonomyDTO> getTree() {
        return skillTaxonomyRepository.findByParentIsNull().stream()
                .filter(t -> Boolean.TRUE.equals(t.getActive()))
                .map(t -> SkillTaxonomyDTO.fromEntity(t, true))
                .collect(Collectors.toList());
    }

    @Override
    public SkillTaxonomyDTO update(Long id, SkillTaxonomyRequest request) {
        SkillTaxonomy taxonomy = findEntity(id);
        applyRequest(taxonomy, request);
        SkillTaxonomy saved = skillTaxonomyRepository.save(taxonomy);
        return SkillTaxonomyDTO.fromEntity(saved);
    }

    @Override
    public void deactivate(Long id) {
        SkillTaxonomy taxonomy = findEntity(id);
        taxonomy.setActive(false);
        skillTaxonomyRepository.save(taxonomy);
    }

    @Override
    public void delete(Long id) {
        SkillTaxonomy taxonomy = findEntity(id);
        skillTaxonomyRepository.delete(taxonomy);
    }

    private void applyRequest(SkillTaxonomy taxonomy, SkillTaxonomyRequest request) {
        taxonomy.setName(request.getName());
        taxonomy.setCategory(request.getCategory());
        taxonomy.setDescription(request.getDescription());

        if (request.getParentId() != null) {
            if (request.getParentId().equals(taxonomy.getId())) {
                throw new IllegalArgumentException("A taxonomy node cannot be its own parent");
            }
            SkillTaxonomy parent = skillTaxonomyRepository.findById(request.getParentId())
                    .orElseThrow(() -> new SkillTaxonomyNotFoundException(
                            "Parent taxonomy not found with id: " + request.getParentId()));
            taxonomy.setParent(parent);
        } else {
            taxonomy.setParent(null);
        }

        if (request.getLinkedSkillId() != null) {
            Skill skill = skillRepository.findById(request.getLinkedSkillId())
                    .orElseThrow(() -> new RuntimeException(
                            "Skill not found with id: " + request.getLinkedSkillId()));
            taxonomy.setLinkedSkill(skill);
        } else {
            taxonomy.setLinkedSkill(null);
        }
    }

    private SkillTaxonomy findEntity(Long id) {
        return skillTaxonomyRepository.findById(id)
                .orElseThrow(() -> new SkillTaxonomyNotFoundException("Skill taxonomy not found with id: " + id));
    }
}
