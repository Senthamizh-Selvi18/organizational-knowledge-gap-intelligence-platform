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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class IndustryBenchmarkServiceImpl implements IndustryBenchmarkService {

    private final IndustryBenchmarkRepository industryBenchmarkRepository;
    private final SkillTaxonomyRepository skillTaxonomyRepository;
    private final CompetencyActivityLogService activityLogService;

    public IndustryBenchmarkServiceImpl(IndustryBenchmarkRepository industryBenchmarkRepository,
                                         SkillTaxonomyRepository skillTaxonomyRepository,
                                         CompetencyActivityLogService activityLogService) {
        this.industryBenchmarkRepository = industryBenchmarkRepository;
        this.skillTaxonomyRepository = skillTaxonomyRepository;
        this.activityLogService = activityLogService;
    }

    @Override
    public IndustryBenchmarkDTO create(IndustryBenchmarkRequest request) {
        IndustryBenchmark benchmark = new IndustryBenchmark();
        applyRequest(benchmark, request);
        IndustryBenchmark saved = industryBenchmarkRepository.save(benchmark);
        activityLogService.log("INDUSTRY_BENCHMARK", saved.getSkillTaxonomy().getName(), "CREATED",
                "Industry benchmark added for \"" + saved.getSkillTaxonomy().getName() + "\"");
        return IndustryBenchmarkDTO.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public IndustryBenchmarkDTO getById(Long id) {
        return IndustryBenchmarkDTO.fromEntity(findEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<IndustryBenchmarkDTO> getAll() {
        return industryBenchmarkRepository.findAllWithTaxonomy().stream()
                .map(IndustryBenchmarkDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<IndustryBenchmarkDTO> getBySkillTaxonomy(Long skillTaxonomyId) {
        return industryBenchmarkRepository.findBySkillTaxonomyIdWithTaxonomy(skillTaxonomyId).stream()
                .map(IndustryBenchmarkDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public IndustryBenchmarkDTO update(Long id, IndustryBenchmarkRequest request) {
        IndustryBenchmark benchmark = findEntity(id);
        applyRequest(benchmark, request);
        IndustryBenchmark saved = industryBenchmarkRepository.save(benchmark);
        activityLogService.log("INDUSTRY_BENCHMARK", saved.getSkillTaxonomy().getName(), "UPDATED",
                "Industry benchmark for \"" + saved.getSkillTaxonomy().getName() + "\" updated");
        return IndustryBenchmarkDTO.fromEntity(saved);
    }

    @Override
    public void delete(Long id) {
        IndustryBenchmark benchmark = findEntity(id);
        String name = benchmark.getSkillTaxonomy().getName();
        industryBenchmarkRepository.delete(benchmark);
        activityLogService.log("INDUSTRY_BENCHMARK", name, "DELETED",
                "Industry benchmark for \"" + name + "\" deleted");
    }

    private void applyRequest(IndustryBenchmark benchmark, IndustryBenchmarkRequest request) {
        SkillTaxonomy taxonomy = skillTaxonomyRepository.findById(request.getSkillTaxonomyId())
                .orElseThrow(() -> new SkillTaxonomyNotFoundException(
                        "Skill taxonomy not found with id: " + request.getSkillTaxonomyId()));

        benchmark.setSkillTaxonomy(taxonomy);
        benchmark.setIndustrySector(request.getIndustrySector());
        benchmark.setRoleCategory(request.getRoleCategory());
        benchmark.setRecommendedAction(request.getRecommendedAction());
        benchmark.setSource(request.getSource());
        benchmark.setReferenceDate(request.getReferenceDate());
        benchmark.setNotes(request.getNotes());
    }

    private IndustryBenchmark findEntity(Long id) {
        return industryBenchmarkRepository.findById(id)
                .orElseThrow(() -> new IndustryBenchmarkNotFoundException("Industry benchmark not found with id: " + id));
    }
}
