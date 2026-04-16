package com.bugxyz.service.ai;

import com.bugxyz.dto.AiDtos.DuplicateDetectionRequest;
import com.bugxyz.dto.AiDtos.DuplicateDetectionResponse;
import com.bugxyz.entity.Bug;
import com.bugxyz.enums.BugStatus;
import com.bugxyz.repository.BugRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DuplicateDetectionService {

    private static final int TOP_K = 5;
    private static final double SIMILARITY_THRESHOLD = 0.2;
    private static final Set<BugStatus> OPEN_STATUSES = Set.of(
            BugStatus.OPEN, BugStatus.IN_PROGRESS, BugStatus.IN_REVIEW, BugStatus.REOPENED
    );

    private final BugRepository bugRepository;
    private final TfIdfEngine tfIdfEngine;

    @Transactional(readOnly = true)
    public List<DuplicateDetectionResponse> detectDuplicates(DuplicateDetectionRequest request) {
        log.info("Running duplicate detection for title: '{}'", request.getTitle());

        Specification<Bug> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(root.get("status").in(OPEN_STATUSES));
            if (request.getProjectId() != null) {
                predicates.add(cb.equal(root.get("project").get("id"), request.getProjectId()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<Bug> existingBugs = bugRepository.findAll(spec);

        if (existingBugs.isEmpty()) {
            log.debug("No existing bugs found for comparison");
            return List.of();
        }

        List<String> documents = existingBugs.stream()
                .map(bug -> combineText(bug.getTitle(), bug.getDescription()))
                .collect(Collectors.toList());

        List<Long> docIds = existingBugs.stream()
                .map(Bug::getId)
                .collect(Collectors.toList());

        String queryText = combineText(request.getTitle(), request.getDescription());

        List<TfIdfEngine.SimilarityResult> similarResults =
                tfIdfEngine.findSimilar(queryText, documents, docIds, TOP_K, SIMILARITY_THRESHOLD);

        List<DuplicateDetectionResponse> responses = new ArrayList<>();
        for (TfIdfEngine.SimilarityResult result : similarResults) {
            Bug matchedBug = existingBugs.stream()
                    .filter(b -> b.getId().equals(result.docId()))
                    .findFirst()
                    .orElse(null);

            if (matchedBug != null) {
                responses.add(DuplicateDetectionResponse.builder()
                        .bugId(matchedBug.getId())
                        .bugTitle(matchedBug.getTitle())
                        .similarityScore(Math.round(result.score() * 1000.0) / 1000.0)
                        .status(matchedBug.getStatus().name())
                        .build());
            }
        }

        log.info("Found {} potential duplicates", responses.size());
        return responses;
    }

    private String combineText(String title, String description) {
        StringBuilder sb = new StringBuilder();
        if (title != null) {
            sb.append(title);
        }
        if (description != null) {
            sb.append(" ").append(description);
        }
        return sb.toString();
    }
}
