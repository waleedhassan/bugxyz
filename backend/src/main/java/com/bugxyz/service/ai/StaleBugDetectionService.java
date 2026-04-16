package com.bugxyz.service.ai;

import com.bugxyz.entity.Bug;
import com.bugxyz.enums.BugStatus;
import com.bugxyz.repository.BugRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class StaleBugDetectionService {

    private static final int STALE_THRESHOLD_DAYS = 14;
    private static final Set<BugStatus> ACTIVE_STATUSES = Set.of(BugStatus.OPEN, BugStatus.IN_PROGRESS);

    private final BugRepository bugRepository;

    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void detectStaleBugs() {
        log.info("Running stale bug detection...");

        LocalDateTime threshold = LocalDateTime.now().minusDays(STALE_THRESHOLD_DAYS);

        List<Bug> staleCandidates = bugRepository.findAll((root, query, cb) -> cb.and(
                root.get("status").in(ACTIVE_STATUSES),
                cb.lessThan(root.get("updatedAt"), threshold),
                cb.or(
                        cb.equal(root.get("isStale"), false),
                        cb.isNull(root.get("isStale"))
                )
        ));

        int markedCount = 0;
        LocalDateTime now = LocalDateTime.now();

        for (Bug bug : staleCandidates) {
            bug.setIsStale(true);
            bug.setStaleSince(now);
            bugRepository.save(bug);
            markedCount++;
            log.debug("Marked bug {} as stale (last updated: {})", bug.getId(), bug.getUpdatedAt());
        }

        log.info("Stale bug detection complete. Marked {} bugs as stale.", markedCount);
    }
}
