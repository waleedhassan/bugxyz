package com.bugxyz.service.ai;

import com.bugxyz.dto.AiDtos.NaturalLanguageParseRequest;
import com.bugxyz.dto.AiDtos.NaturalLanguageParseResponse;
import com.bugxyz.dto.AiDtos.SeverityPredictionRequest;
import com.bugxyz.dto.AiDtos.SeverityPredictionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NaturalLanguageBugParser {

    private static final Pattern QUOTED_STRING_PATTERN = Pattern.compile("\"([^\"]+)\"");
    private static final Pattern CAMEL_CASE_PATTERN = Pattern.compile("\\b[A-Z][a-z]+(?:[A-Z][a-z]+)+\\b");
    private static final Pattern FRAMEWORK_PATTERN = Pattern.compile(
            "\\b(React|Angular|Vue|Spring|Django|Rails|Node|Express|jQuery|Bootstrap|" +
            "Hibernate|MyBatis|Redis|Kafka|Docker|Kubernetes|PostgreSQL|MySQL|MongoDB|" +
            "GraphQL|REST|gRPC|WebSocket|OAuth|JWT|CORS|API|SDK|CLI|UI|UX)\\b",
            Pattern.CASE_INSENSITIVE
    );
    private static final Pattern OS_PATTERN = Pattern.compile(
            "(Windows|macOS|Linux|iOS|Android|Ubuntu)", Pattern.CASE_INSENSITIVE
    );
    private static final Pattern BROWSER_PATTERN = Pattern.compile(
            "(Chrome|Firefox|Safari|Edge|Opera)", Pattern.CASE_INSENSITIVE
    );
    private static final Pattern NUMBERED_STEP_PATTERN = Pattern.compile("(?m)^\\s*\\d+\\.\\s+.+$");
    private static final Pattern BULLETED_STEP_PATTERN = Pattern.compile("(?m)^\\s*-\\s+.+$");
    private static final Pattern PRIORITY_URGENT_PATTERN = Pattern.compile(
            "\\b(urgent|asap|blocker)\\b", Pattern.CASE_INSENSITIVE
    );
    private static final Pattern PRIORITY_HIGH_PATTERN = Pattern.compile(
            "\\b(important)\\b", Pattern.CASE_INSENSITIVE
    );
    private static final Pattern FEATURE_PATTERN = Pattern.compile(
            "\\b(feature)\\b", Pattern.CASE_INSENSITIVE
    );
    private static final Pattern IMPROVEMENT_PATTERN = Pattern.compile(
            "\\b(improve|improvement|enhancement|enhance)\\b", Pattern.CASE_INSENSITIVE
    );

    private final SeverityPredictionService severityPredictionService;

    public NaturalLanguageParseResponse parse(NaturalLanguageParseRequest request) {
        String text = request.getText();
        log.info("Parsing natural language bug report of length {}", text.length());

        String title = extractTitle(text);
        String description = text;
        SeverityPredictionResponse severityResult = severityPredictionService.predictSeverity(
                new SeverityPredictionRequest(title, description)
        );
        String priority = extractPriority(text);
        String bugType = extractBugType(text);
        String[] tags = extractTags(text);
        String os = extractPattern(text, OS_PATTERN);
        String browser = extractPattern(text, BROWSER_PATTERN);
        String steps = extractSteps(text);

        log.info("Parsed bug: title='{}', severity={}, type={}", title, severityResult.getPredictedSeverity(), bugType);

        return NaturalLanguageParseResponse.builder()
                .title(title)
                .description(description)
                .severity(severityResult.getPredictedSeverity())
                .priority(priority != null ? priority : severityResult.getPredictedPriority())
                .bugType(bugType)
                .tags(tags)
                .os(os)
                .browser(browser)
                .stepsToReproduce(steps)
                .build();
    }

    private String extractTitle(String text) {
        // First sentence: split on period followed by space or newline
        String[] sentences = text.split("[.\\n]");
        String firstSentence = sentences[0].trim();
        if (firstSentence.length() > 100) {
            firstSentence = firstSentence.substring(0, 100);
        }
        return firstSentence;
    }

    private String extractPriority(String text) {
        if (PRIORITY_URGENT_PATTERN.matcher(text).find()) {
            return "URGENT";
        }
        if (PRIORITY_HIGH_PATTERN.matcher(text).find()) {
            return "HIGH";
        }
        return null;
    }

    private String extractBugType(String text) {
        if (FEATURE_PATTERN.matcher(text).find()) {
            return "FEATURE";
        }
        if (IMPROVEMENT_PATTERN.matcher(text).find()) {
            return "IMPROVEMENT";
        }
        return "BUG";
    }

    private String[] extractTags(String text) {
        List<String> tags = new ArrayList<>();

        // Extract quoted strings
        Matcher quotedMatcher = QUOTED_STRING_PATTERN.matcher(text);
        while (quotedMatcher.find()) {
            String quoted = quotedMatcher.group(1).trim();
            if (!quoted.isEmpty() && quoted.length() <= 50) {
                tags.add(quoted);
            }
        }

        // Extract CamelCase terms
        Matcher camelMatcher = CAMEL_CASE_PATTERN.matcher(text);
        while (camelMatcher.find()) {
            String term = camelMatcher.group();
            if (!tags.contains(term)) {
                tags.add(term);
            }
        }

        // Extract framework/technology names
        Matcher frameworkMatcher = FRAMEWORK_PATTERN.matcher(text);
        while (frameworkMatcher.find()) {
            String term = frameworkMatcher.group();
            if (!tags.stream().anyMatch(t -> t.equalsIgnoreCase(term))) {
                tags.add(term);
            }
        }

        return tags.stream()
                .distinct()
                .limit(10)
                .toArray(String[]::new);
    }

    private String extractPattern(String text, Pattern pattern) {
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    private String extractSteps(String text) {
        // Look for numbered steps: "1. ...", "2. ...", etc.
        Matcher numberedMatcher = NUMBERED_STEP_PATTERN.matcher(text);
        List<String> steps = new ArrayList<>();
        while (numberedMatcher.find()) {
            steps.add(numberedMatcher.group().trim());
        }
        if (!steps.isEmpty()) {
            return steps.stream().collect(Collectors.joining("\n"));
        }

        // Look for bulleted steps: "- ...", etc.
        Matcher bulletedMatcher = BULLETED_STEP_PATTERN.matcher(text);
        while (bulletedMatcher.find()) {
            steps.add(bulletedMatcher.group().trim());
        }
        if (!steps.isEmpty()) {
            return steps.stream().collect(Collectors.joining("\n"));
        }

        return null;
    }
}
