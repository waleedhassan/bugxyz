package com.bugxyz.controller;

import com.bugxyz.dto.AiDtos.*;
import com.bugxyz.service.ai.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final DuplicateDetectionService duplicateDetectionService;
    private final SeverityPredictionService severityPredictionService;
    private final FixTimePredictionService fixTimePredictionService;
    private final DeveloperLoadBalancerService developerLoadBalancerService;
    private final NaturalLanguageBugParser naturalLanguageBugParser;
    private final ReleaseNotesGeneratorService releaseNotesGeneratorService;
    private final FixImpactAnalysisService fixImpactAnalysisService;

    @PostMapping("/detect-duplicates")
    public ResponseEntity<List<DuplicateDetectionResponse>> detectDuplicates(
            @Valid @RequestBody DuplicateDetectionRequest request) {
        log.info("POST /api/v1/ai/detect-duplicates");
        return ResponseEntity.ok(duplicateDetectionService.detectDuplicates(request));
    }

    @PostMapping("/predict-severity")
    public ResponseEntity<SeverityPredictionResponse> predictSeverity(
            @Valid @RequestBody SeverityPredictionRequest request) {
        log.info("POST /api/v1/ai/predict-severity");
        return ResponseEntity.ok(severityPredictionService.predictSeverity(request));
    }

    @GetMapping("/predict-fix-time/{bugId}")
    public ResponseEntity<FixTimePredictionResponse> predictFixTime(@PathVariable Long bugId) {
        log.info("GET /api/v1/ai/predict-fix-time/{}", bugId);
        return ResponseEntity.ok(fixTimePredictionService.predictFixTime(bugId));
    }

    @GetMapping("/suggest-assignee/{bugId}")
    public ResponseEntity<List<AssigneeSuggestionResponse>> suggestAssignee(@PathVariable Long bugId) {
        log.info("GET /api/v1/ai/suggest-assignee/{}", bugId);
        return ResponseEntity.ok(developerLoadBalancerService.suggestAssignees(bugId));
    }

    @PostMapping("/parse-natural-language")
    public ResponseEntity<NaturalLanguageParseResponse> parseNaturalLanguage(
            @Valid @RequestBody NaturalLanguageParseRequest request) {
        log.info("POST /api/v1/ai/parse-natural-language");
        return ResponseEntity.ok(naturalLanguageBugParser.parse(request));
    }

    @GetMapping("/release-notes/{projectId}")
    public ResponseEntity<ReleaseNotesResponse> generateReleaseNotes(
            @PathVariable Long projectId,
            @RequestParam String version) {
        log.info("GET /api/v1/ai/release-notes/{} version={}", projectId, version);
        return ResponseEntity.ok(releaseNotesGeneratorService.generateReleaseNotes(projectId, version));
    }

    @GetMapping("/fix-impact/{bugId}")
    public ResponseEntity<FixImpactResponse> analyzeFixImpact(@PathVariable Long bugId) {
        log.info("GET /api/v1/ai/fix-impact/{}", bugId);
        return ResponseEntity.ok(fixImpactAnalysisService.analyzeFixImpact(bugId));
    }
}
