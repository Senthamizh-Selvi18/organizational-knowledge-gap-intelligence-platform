package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.IndustryBenchmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IndustryBenchmarkRepository extends JpaRepository<IndustryBenchmark, Long> {
    List<IndustryBenchmark> findBySkillTaxonomyId(Long skillTaxonomyId);
    List<IndustryBenchmark> findByIndustrySectorIgnoreCase(String industrySector);
    List<IndustryBenchmark> findByRoleCategoryIgnoreCase(String roleCategory);
    List<IndustryBenchmark> findBySkillTaxonomyIdAndRoleCategoryIgnoreCase(Long skillTaxonomyId, String roleCategory);
}
