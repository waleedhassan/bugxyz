package com.bugxyz.service.ai;

import com.bugxyz.dto.AiDtos.ReleaseNotesResponse;
import com.bugxyz.dto.AiDtos.ReleaseNotesResponse.BugEntry;
import com.bugxyz.entity.Bug;
import com.bugxyz.entity.Project;
import com.bugxyz.enums.BugSeverity;
import com.bugxyz.enums.BugStatus;
import com.bugxyz.enums.BugType;
import com.bugxyz.exception.ResourceNotFoundException;
import com.bugxyz.repository.BugRepository;
import com.bugxyz.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReleaseNotesGeneratorService {

    private static final Set<BugStatus> COMPLETED_STATUSES = Set.of(BugStatus.RESOLVED, BugStatus.CLOSED);
    private static final Map<BugType, String> SECTION_TITLES = Map.of(
            BugType.BUG, "Bug Fixes",
            BugType.FEATURE, "New Features",
            BugType.IMPROVEMENT, "Improvements",
            BugType.TASK, "Tasks"
    );
    private static final List<BugSeverity> SEVERITY_ORDER = List.of(
            BugSeverity.CRITICAL, BugSeverity.HIGH, BugSeverity.MEDIUM, BugSeverity.LOW, BugSeverity.TRIVIAL
    );

    private final BugRepository bugRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public ReleaseNotesResponse generateReleaseNotes(Long projectId, String version) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        log.info("Generating release notes for project '{}' version '{}'", project.getName(), version);

        List<Bug> bugs = bugRepository.findAll((root, query, cb) -> cb.and(
                cb.equal(root.get("project").get("id"), projectId),
                root.get("status").in(COMPLETED_STATUSES),
                cb.equal(root.get("fixedVersion"), version)
        ));

        log.info("Found {} bugs for release version {}", bugs.size(), version);

        // Group by bug type
        Map<BugType, List<Bug>> grouped = bugs.stream()
                .collect(Collectors.groupingBy(Bug::getBugType));

        // Sort each group by severity descending
        Comparator<Bug> severityComparator = Comparator.comparingInt(
                bug -> SEVERITY_ORDER.indexOf(bug.getSeverity())
        );
        grouped.values().forEach(list -> list.sort(severityComparator));

        // Build markdown content
        StringBuilder markdown = new StringBuilder();
        markdown.append("# Release Notes - ").append(project.getName())
                .append(" v").append(version).append("\n\n");

        // Process in a consistent order: FEATURE, IMPROVEMENT, BUG, TASK
        List<BugType> typeOrder = List.of(BugType.FEATURE, BugType.IMPROVEMENT, BugType.BUG, BugType.TASK);

        for (BugType type : typeOrder) {
            List<Bug> typeBugs = grouped.get(type);
            if (typeBugs == null || typeBugs.isEmpty()) {
                continue;
            }
            String sectionTitle = SECTION_TITLES.getOrDefault(type, type.name());
            markdown.append("## ").append(sectionTitle).append("\n\n");

            for (Bug bug : typeBugs) {
                markdown.append("- **[").append(bug.getSeverity().name()).append("]** ")
                        .append(bug.getTitle());
                if (bug.getId() != null) {
                    markdown.append(" (#").append(bug.getId()).append(")");
                }
                markdown.append("\n");
            }
            markdown.append("\n");
        }

        // Build bug entries for the response
        List<BugEntry> bugEntries = bugs.stream()
                .map(bug -> BugEntry.builder()
                        .bugId(bug.getId())
                        .title(bug.getTitle())
                        .severity(bug.getSeverity().name())
                        .bugType(bug.getBugType().name())
                        .build())
                .collect(Collectors.toList());

        return ReleaseNotesResponse.builder()
                .projectName(project.getName())
                .version(version)
                .generatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .markdownContent(markdown.toString())
                .bugs(bugEntries)
                .build();
    }
}
