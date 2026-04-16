package com.bugxyz.service.ai;

import com.bugxyz.dto.AiDtos.FixImpactResponse;
import com.bugxyz.entity.Bug;
import com.bugxyz.entity.BugRelation;
import com.bugxyz.enums.BugSeverity;
import com.bugxyz.enums.RelationType;
import com.bugxyz.exception.ResourceNotFoundException;
import com.bugxyz.repository.BugRelationRepository;
import com.bugxyz.repository.BugRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class FixImpactAnalysisService {

    private static final int MAX_DEPTH = 3;
    private static final Set<RelationType> BLOCKING_RELATIONS = Set.of(
            RelationType.BLOCKS, RelationType.BLOCKED_BY
    );
    private static final List<BugSeverity> SEVERITY_ORDER = List.of(
            BugSeverity.CRITICAL, BugSeverity.HIGH, BugSeverity.MEDIUM, BugSeverity.LOW, BugSeverity.TRIVIAL
    );

    private final BugRepository bugRepository;
    private final BugRelationRepository bugRelationRepository;

    @Transactional(readOnly = true)
    public FixImpactResponse analyzeFixImpact(Long bugId) {
        Bug rootBug = bugRepository.findById(bugId)
                .orElseThrow(() -> new ResourceNotFoundException("Bug not found with id: " + bugId));

        log.info("Analyzing fix impact for bug {}", bugId);

        // BFS through bug relations up to MAX_DEPTH
        Set<Long> visited = new HashSet<>();
        visited.add(bugId);
        Queue<Long> queue = new LinkedList<>();
        queue.add(bugId);

        List<Long> blockedBugIds = new ArrayList<>();
        BugSeverity highestSeverity = rootBug.getSeverity();
        int depth = 0;

        while (!queue.isEmpty() && depth < MAX_DEPTH) {
            int levelSize = queue.size();
            for (int i = 0; i < levelSize; i++) {
                Long currentBugId = queue.poll();
                List<BugRelation> relations = bugRelationRepository.findBySourceBugIdOrTargetBugId(
                        currentBugId, currentBugId
                );

                for (BugRelation relation : relations) {
                    if (!BLOCKING_RELATIONS.contains(relation.getRelationType())) {
                        continue;
                    }

                    Long neighborId = getNeighborId(relation, currentBugId);
                    if (neighborId != null && !visited.contains(neighborId)) {
                        visited.add(neighborId);
                        queue.add(neighborId);
                        blockedBugIds.add(neighborId);

                        // Check severity of the neighbor
                        Bug neighborBug = relation.getSourceBug().getId().equals(neighborId)
                                ? relation.getSourceBug()
                                : relation.getTargetBug();
                        if (neighborBug != null && neighborBug.getSeverity() != null) {
                            if (SEVERITY_ORDER.indexOf(neighborBug.getSeverity()) <
                                    SEVERITY_ORDER.indexOf(highestSeverity)) {
                                highestSeverity = neighborBug.getSeverity();
                            }
                        }
                    }
                }
            }
            depth++;
        }

        // Regression risk: based on the number of affected bugs and their severities
        int totalAffected = blockedBugIds.size();
        double regressionRisk = calculateRegressionRisk(totalAffected, highestSeverity);

        log.info("Fix impact analysis complete: {} affected bugs, highest severity: {}, risk: {}%",
                totalAffected, highestSeverity, regressionRisk);

        return FixImpactResponse.builder()
                .affectedBugsCount(totalAffected)
                .highestSeverityInChain(highestSeverity.name())
                .regressionRiskPercent(Math.round(regressionRisk * 100.0) / 100.0)
                .blockedBugIds(blockedBugIds)
                .build();
    }

    private Long getNeighborId(BugRelation relation, Long currentBugId) {
        if (relation.getSourceBug().getId().equals(currentBugId)) {
            return relation.getTargetBug().getId();
        } else {
            return relation.getSourceBug().getId();
        }
    }

    private double calculateRegressionRisk(int affectedCount, BugSeverity highestSeverity) {
        // Base risk from affected count: each bug adds 10%, capped at 70%
        double baseRisk = Math.min(affectedCount * 10.0, 70.0);

        // Severity multiplier
        double severityMultiplier = switch (highestSeverity) {
            case CRITICAL -> 1.4;
            case HIGH -> 1.2;
            case MEDIUM -> 1.0;
            case LOW -> 0.8;
            case TRIVIAL -> 0.6;
        };

        return Math.min(baseRisk * severityMultiplier, 100.0);
    }
}
