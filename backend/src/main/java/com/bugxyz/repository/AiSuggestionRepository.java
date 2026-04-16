package com.bugxyz.repository;

import com.bugxyz.entity.AiSuggestion;
import com.bugxyz.enums.SuggestionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiSuggestionRepository extends JpaRepository<AiSuggestion, Long> {

    List<AiSuggestion> findByBugId(Long bugId);

    List<AiSuggestion> findByBugIdAndSuggestionType(Long bugId, SuggestionType type);
}
