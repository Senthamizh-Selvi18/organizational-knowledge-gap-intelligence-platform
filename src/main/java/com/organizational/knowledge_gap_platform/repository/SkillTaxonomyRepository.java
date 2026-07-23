package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.SkillTaxonomy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SkillTaxonomyRepository extends JpaRepository<SkillTaxonomy, Long> {
    List<SkillTaxonomy> findByParentIsNull();
    List<SkillTaxonomy> findByCategoryIgnoreCase(String category);
    List<SkillTaxonomy> findByActiveTrue();
    boolean existsByNameIgnoreCase(String name);
}
