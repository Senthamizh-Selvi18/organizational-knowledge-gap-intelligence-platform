package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.IndustryBenchmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IndustryBenchmarkRepository extends JpaRepository<IndustryBenchmark, Long> {
    @Query("SELECT b FROM IndustryBenchmark b LEFT JOIN FETCH b.skillTaxonomy")
    List<IndustryBenchmark> findAllWithTaxonomy();

    @Query("SELECT b FROM IndustryBenchmark b LEFT JOIN FETCH b.skillTaxonomy WHERE b.skillTaxonomy.id = :skillTaxonomyId")
    List<IndustryBenchmark> findBySkillTaxonomyIdWithTaxonomy(@Param("skillTaxonomyId") Long skillTaxonomyId);

    List<IndustryBenchmark> findBySkillTaxonomyId(Long skillTaxonomyId);
    List<IndustryBenchmark> findByIndustrySectorIgnoreCase(String industrySector);
    List<IndustryBenchmark> findByRoleCategoryIgnoreCase(String roleCategory);
    List<IndustryBenchmark> findBySkillTaxonomyIdAndRoleCategoryIgnoreCase(Long skillTaxonomyId, String roleCategory);
}