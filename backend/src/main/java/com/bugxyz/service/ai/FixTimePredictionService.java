package com.bugxyz.service.ai;

import com.bugxyz.dto.AiDtos.FixTimePredictionResponse;
import com.bugxyz.entity.Bug;
import com.bugxyz.enums.BugSeverity;
import com.bugxyz.exception.ResourceNotFoundException;
import com.bugxyz.repository.BugRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class FixTimePredictionService {

    private static final Map<BugSeverity, Double> DEFAULT_HOURS = Map.of(
            BugSeverity.CRITICAL, 8.0,
            BugSeverity.HIGH, 16.0,
            BugSeverity.MEDIUM, 24.0,
            BugSeverity.LOW, 40.0,
            BugSeverity.TRIVIAL, 4.0
    );

    private final BugRepository bugRepository;

    @Transactional(readOnly = true)
    public FixTimePredictionResponse predictFixTime(Long bugId) {
        Bug bug = bugRepository.findById(bugId)
                .orElseThrow(() -> new ResourceNotFoundException("Bug not found with id: " + bugId));

        BugSeverity severity = bug.getSeverity();
        log.info("Predicting fix time for bug {} with severity {}", bugId, severity);

        List<Object[]> avgTimeData = bugRepository.avgTimeToFixBySeverity();

        Map<BugSeverity, Double> avgHoursBySeverity = new HashMap<>();
        Map<BugSeverity, Integer> sampleCounts = new HashMap<>();

        for (Object[] row : avgTimeData) {
            BugSeverity sev = (BugSeverity) row[0];
            Double avgHours = row[1] != null ? ((Number) row[1]).doubleValue() : null;
            if (avgHours != null) {
                avgHoursBySeverity.put(sev, avgHours);
            }
        }

        // Count resolved bugs per severity for sample size
        for (Object[] row : avgTimeData) {
            BugSeverity sev = (BugSeverity) row[0];
            // The query returns avg, so we need to count separately
            // For now, estimate sample size from the grouped data
            sampleCounts.merge(sev, 1, Integer::sum);
        }

        // Try to get actual sample sizes
        int sampleSize = 0;
        List<Bug> closedBugs = bugRepository.findAll((root, query, cb) ->
                cb.and(
                        cb.equal(root.get("severity"), severity),
                        cb.isNotNull(root.get("closedAt"))
                )
        );
        sampleSize = closedBugs.size();

        double predictedHours;
        String basedOn;

        if (avgHoursBySeverity.containsKey(severity) && sampleSize > 0) {
            predictedHours = Math.round(avgHoursBySeverity.get(severity) * 100.0) / 100.0;
            basedOn = "historical data for " + severity.name() + " bugs";
        } else {
            predictedHours = DEFAULT_HOURS.getOrDefault(severity, 24.0);
            basedOn = "default estimate for " + severity.name() + " bugs";
            sampleSize = 0;
        }

        double confidence = Math.min((double) sampleSize, 20.0) / 20.0 * 100.0;
        confidence = Math.round(confidence * 100.0) / 100.0;

        log.info("Predicted fix time: {} hours (confidence: {}%, sample: {})", predictedHours, confidence, sampleSize);

        return FixTimePredictionResponse.builder()
                .predictedHours(predictedHours)
                .confidence(confidence)
                .sampleSize(sampleSize)
                .basedOn(basedOn)
                .build();
    }
}
