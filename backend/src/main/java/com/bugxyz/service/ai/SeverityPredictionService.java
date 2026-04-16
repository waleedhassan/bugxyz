package com.bugxyz.service.ai;

import com.bugxyz.dto.AiDtos.SeverityPredictionRequest;
import com.bugxyz.dto.AiDtos.SeverityPredictionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeverityPredictionService {

    private static final Map<String, Double> CRITICAL_KEYWORDS = Map.ofEntries(
            Map.entry("crash", 5.0), Map.entry("data loss", 5.0), Map.entry("security vulnerability", 5.0),
            Map.entry("production down", 5.0), Map.entry("cannot login", 5.0), Map.entry("blank screen", 5.0),
            Map.entry("infinite loop", 5.0), Map.entry("deadlock", 5.0), Map.entry("unrecoverable", 5.0)
    );

    private static final Map<String, Double> HIGH_KEYWORDS = Map.ofEntries(
            Map.entry("error", 3.0), Map.entry("broken", 3.0), Map.entry("fails", 3.0),
            Map.entry("exception", 3.0), Map.entry("500", 3.0), Map.entry("timeout", 3.0),
            Map.entry("unresponsive", 3.0), Map.entry("regression", 3.0), Map.entry("corrupt", 3.0)
    );

    private static final Map<String, Double> MEDIUM_KEYWORDS = Map.ofEntries(
            Map.entry("incorrect", 1.0), Map.entry("wrong", 1.0), Map.entry("unexpected", 1.0),
            Map.entry("slow", 1.0), Map.entry("confusing", 1.0), Map.entry("inconsistent", 1.0),
            Map.entry("missing", 1.0), Map.entry("delayed", 1.0)
    );

    private static final Map<String, Double> LOW_KEYWORDS = Map.ofEntries(
            Map.entry("minor", 0.5), Map.entry("cosmetic", 0.5), Map.entry("typo", 0.5),
            Map.entry("alignment", 0.5), Map.entry("color", 0.5), Map.entry("tooltip", 0.5),
            Map.entry("wording", 0.5), Map.entry("spacing", 0.5)
    );

    private static final Pattern ALL_CAPS_PATTERN = Pattern.compile("\\b[A-Z]{2,}\\b");
    private static final Pattern EXCLAMATION_PATTERN = Pattern.compile("!");

    public SeverityPredictionResponse predictSeverity(SeverityPredictionRequest request) {
        String combinedText = (request.getTitle() != null ? request.getTitle() : "") + " " +
                (request.getDescription() != null ? request.getDescription() : "");
        String lowerText = combinedText.toLowerCase();

        log.info("Predicting severity for text of length {}", combinedText.length());

        double totalScore = 0.0;
        List<String> matchedKeywords = new ArrayList<>();

        totalScore += scoreKeywords(lowerText, CRITICAL_KEYWORDS, matchedKeywords);
        totalScore += scoreKeywords(lowerText, HIGH_KEYWORDS, matchedKeywords);
        totalScore += scoreKeywords(lowerText, MEDIUM_KEYWORDS, matchedKeywords);
        totalScore += scoreKeywords(lowerText, LOW_KEYWORDS, matchedKeywords);

        Matcher capsMatcher = ALL_CAPS_PATTERN.matcher(combinedText);
        int capsCount = 0;
        while (capsMatcher.find()) {
            capsCount++;
        }
        totalScore += capsCount * 0.5;

        Matcher exclamationMatcher = EXCLAMATION_PATTERN.matcher(combinedText);
        int exclamationCount = 0;
        while (exclamationMatcher.find()) {
            exclamationCount++;
        }
        totalScore += exclamationCount * 0.3;

        String severity;
        String priority;
        if (totalScore > 10) {
            severity = "CRITICAL";
            priority = "URGENT";
        } else if (totalScore >= 5) {
            severity = "HIGH";
            priority = "HIGH";
        } else if (totalScore >= 2) {
            severity = "MEDIUM";
            priority = "MEDIUM";
        } else {
            severity = "LOW";
            priority = "LOW";
        }

        double confidence = Math.min((double) matchedKeywords.size() / 3.0, 1.0) * 100.0;

        log.info("Predicted severity: {} (score: {}, matched: {})", severity, totalScore, matchedKeywords.size());

        return SeverityPredictionResponse.builder()
                .predictedSeverity(severity)
                .predictedPriority(priority)
                .confidence(Math.round(confidence * 100.0) / 100.0)
                .matchedKeywords(matchedKeywords)
                .build();
    }

    private double scoreKeywords(String text, Map<String, Double> keywords, List<String> matched) {
        double score = 0.0;
        for (Map.Entry<String, Double> entry : keywords.entrySet()) {
            if (text.contains(entry.getKey())) {
                score += entry.getValue();
                matched.add(entry.getKey());
            }
        }
        return score;
    }
}
