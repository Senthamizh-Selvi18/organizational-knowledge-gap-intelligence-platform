package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.IndustryBenchmarkDTO;
import com.organizational.knowledge_gap_platform.dto.IndustryBenchmarkRequest;
import com.organizational.knowledge_gap_platform.entity.IndustryBenchmark;
import com.organizational.knowledge_gap_platform.entity.SkillTaxonomy;
import com.organizational.knowledge_gap_platform.exception.IndustryBenchmarkNotFoundException;
import com.organizational.knowledge_gap_platform.exception.SkillTaxonomyNotFoundException;
import com.organizational.knowledge_gap_platform.repository.IndustryBenchmarkRepository;
import com.organizational.knowledge_gap_platform.repository.SkillTaxonomyRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class IndustryBenchmarkServiceImpl implements IndustryBenchmarkService {

    private final IndustryBenchmarkRepository industryBenchmarkRepository;
    private final SkillTaxonomyRepository skillTaxonomyRepository;

    public IndustryBenchmarkServiceImpl(IndustryBenchmarkRepository industryBenchmarkRepository,
                                         SkillTaxonomyRepository skillTaxonomyRepository) {
        this.industryBenchmarkRepository = industryBenchmarkRepository;
        this.skillTaxonomyRepository = skillTaxonomyRepository;
    }

    @Override
    public IndustryBenchmarkDTO create(IndustryBenchmarkRequest request) {
        IndustryBenchmark benchmark = new IndustryBenchmark();
        applyRequest(benchmark, request);
        return IndustryBenchmarkDTO.fromEntity(industryBenchmarkRepository.save(benchmark));
    }

    @Override
    public IndustryBenchmarkDTO getById(Long id) {
        return IndustryBenchmarkDTO.fromEntity(findEntity(id));
    }

    @Override
    public List<IndustryBenchmarkDTO> getAll() {
        return industryBenchmarkRepository.findAll().stream()
                .map(IndustryBenchmarkDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<IndustryBenchmarkDTO> getBySkillTaxonomy(Long skillTaxonomyId) {
        return industryBenchmarkRepository.findBySkillTaxonomyId(skillTaxonomyId).stream()
                .map(IndustryBenchmarkDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public IndustryBenchmarkDTO update(Long id, IndustryBenchmarkRequest request) {
        IndustryBenchmark benchmark = findEntity(id);
        applyRequest(benchmark, request);
        return IndustryBenchmarkDTO.fromEntity(industryBenchmarkRepository.save(benchmark));
    }

    @Override
    public void delete(Long id) {
        industryBenchmarkRepository.delete(findEntity(id));
    }

    private void applyRequest(IndustryBenchmark benchmark, IndustryBenchmarkRequest request) {
        SkillTaxonomy taxonomy = skillTaxonomyRepository.findById(request.getSkillTaxonomyId())
                .orElseThrow(() -> new SkillTaxonomyNotFoundException(
                        "Skill taxonomy not found with id: " + request.getSkillTaxonomyId()));

        benchmark.setSkillTaxonomy(taxonomy);
        benchmark.setIndustrySector(request.getIndustrySector());
        benchmark.setRoleCategory(request.getRoleCategory());
        benchmark.setBenchmarkLevel(request.getBenchmarkLevel());
        benchmark.setSource(request.getSource());
        benchmark.setReferenceDate(request.getReferenceDate());
        benchmark.setNotes(request.getNotes());
    }

    private IndustryBenchmark findEntity(Long id) {
        return industryBenchmarkRepository.findById(id)
                .orElseThrow(() -> new IndustryBenchmarkNotFoundException("Industry benchmark not found with id: " + id));
    }
}
