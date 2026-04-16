package com.bugxyz.service;

import com.bugxyz.dto.BugDtos.*;
import com.bugxyz.entity.*;
import com.bugxyz.enums.*;
import com.bugxyz.exception.*;
import com.bugxyz.repository.*;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class BugService {

    private final BugRepository bugRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    private static final Map<BugStatus, Set<BugStatus>> VALID_TRANSITIONS = Map.of(
            BugStatus.OPEN, Set.of(BugStatus.IN_PROGRESS, BugStatus.CLOSED),
            BugStatus.IN_PROGRESS, Set.of(BugStatus.IN_REVIEW, BugStatus.OPEN, BugStatus.CLOSED),
            BugStatus.IN_REVIEW, Set.of(BugStatus.RESOLVED, BugStatus.IN_PROGRESS),
            BugStatus.RESOLVED, Set.of(BugStatus.CLOSED, BugStatus.REOPENED),
            BugStatus.CLOSED, Set.of(BugStatus.REOPENED),
            BugStatus.REOPENED, Set.of(BugStatus.IN_PROGRESS, BugStatus.CLOSED)
    );

    public Page<BugDto> getAllBugs(Pageable pageable, String status, String severity, String priority,
                                   Long projectId, Long assigneeId, String search,
                                   Boolean isStale, Boolean technicalDebt) {
        Specification<Bug> spec = buildSpecification(status, severity, priority, projectId, assigneeId, search, isStale, technicalDebt);
        return bugRepository.findAll(spec, pageable).map(BugDto::from);
    }

    public BugDto getBugById(Long id) {
        return BugDto.from(findBug(id));
    }

    @Transactional
    public BugDto createBug(CreateBugRequest request, Long reporterId) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", reporterId));
        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssigneeId()));
        }

        Bug bug = Bug.builder()
                .project(project).reporter(reporter).assignee(assignee)
                .title(request.getTitle()).description(request.getDescription())
                .status(BugStatus.OPEN)
                .severity(request.getSeverity() != null ? BugSeverity.valueOf(request.getSeverity()) : BugSeverity.MEDIUM)
                .priority(request.getPriority() != null ? BugPriority.valueOf(request.getPriority()) : BugPriority.MEDIUM)
                .bugType(request.getBugType() != null ? BugType.valueOf(request.getBugType()) : BugType.BUG)
                .tags(request.getTags() != null ? request.getTags() : new String[]{})
                .stepsToReproduce(request.getStepsToReproduce())
                .expectedBehavior(request.getExpectedBehavior())
                .actualBehavior(request.getActualBehavior())
                .affectedVersion(request.getAffectedVersion())
                .reproducibilityScore(java.math.BigDecimal.ZERO)
                .isStale(false).technicalDebt(false)
                .build();

        bug = bugRepository.save(bug);
        activityLogService.log(bug, project, reporter, ActivityAction.CREATED, null, null, null);
        return BugDto.from(bug);
    }

    @Transactional
    public BugDto updateBug(Long id, UpdateBugRequest request, Long userId) {
        Bug bug = findBug(id);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getTitle() != null && !request.getTitle().equals(bug.getTitle())) {
            activityLogService.log(bug, bug.getProject(), user, ActivityAction.UPDATED, "title", bug.getTitle(), request.getTitle());
            bug.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) bug.setDescription(request.getDescription());
        if (request.getSeverity() != null) {
            String old = bug.getSeverity().name();
            bug.setSeverity(BugSeverity.valueOf(request.getSeverity()));
            activityLogService.log(bug, bug.getProject(), user, ActivityAction.UPDATED, "severity", old, request.getSeverity());
        }
        if (request.getPriority() != null) {
            String old = bug.getPriority().name();
            bug.setPriority(BugPriority.valueOf(request.getPriority()));
            activityLogService.log(bug, bug.getProject(), user, ActivityAction.UPDATED, "priority", old, request.getPriority());
        }
        if (request.getBugType() != null) bug.setBugType(BugType.valueOf(request.getBugType()));
        if (request.getTags() != null) bug.setTags(request.getTags());
        if (request.getStepsToReproduce() != null) bug.setStepsToReproduce(request.getStepsToReproduce());
        if (request.getExpectedBehavior() != null) bug.setExpectedBehavior(request.getExpectedBehavior());
        if (request.getActualBehavior() != null) bug.setActualBehavior(request.getActualBehavior());
        if (request.getAffectedVersion() != null) bug.setAffectedVersion(request.getAffectedVersion());
        if (request.getFixedVersion() != null) bug.setFixedVersion(request.getFixedVersion());
        if (request.getTechnicalDebt() != null) bug.setTechnicalDebt(request.getTechnicalDebt());
        if (request.getDebtCategory() != null) bug.setDebtCategory(request.getDebtCategory());
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssigneeId()));
            bug.setAssignee(assignee);
        }

        bug.setIsStale(false);
        bug.setStaleSince(null);
        return BugDto.from(bugRepository.save(bug));
    }

    @Transactional
    public BugDto updateBugStatus(Long id, String newStatusStr, Long userId) {
        Bug bug = findBug(id);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        BugStatus newStatus = BugStatus.valueOf(newStatusStr);
        BugStatus oldStatus = bug.getStatus();

        Set<BugStatus> allowed = VALID_TRANSITIONS.getOrDefault(oldStatus, Set.of());
        if (!allowed.contains(newStatus)) {
            throw new BadRequestException("Invalid status transition from " + oldStatus + " to " + newStatus);
        }

        bug.setStatus(newStatus);
        if (newStatus == BugStatus.RESOLVED || newStatus == BugStatus.CLOSED) {
            bug.setClosedAt(LocalDateTime.now());
            bug.setIsStale(false);
            bug.setStaleSince(null);
        }
        if (newStatus == BugStatus.REOPENED) {
            bug.setClosedAt(null);
        }

        activityLogService.log(bug, bug.getProject(), user, ActivityAction.STATUS_CHANGED, "status", oldStatus.name(), newStatus.name());
        return BugDto.from(bugRepository.save(bug));
    }

    @Transactional
    public BugDto assignBug(Long bugId, Long assigneeId, Long userId) {
        Bug bug = findBug(bugId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        String oldAssignee = bug.getAssignee() != null ? bug.getAssignee().getFullName() : "Unassigned";

        if (assigneeId != null) {
            User assignee = userRepository.findById(assigneeId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", assigneeId));
            bug.setAssignee(assignee);
            activityLogService.log(bug, bug.getProject(), user, ActivityAction.ASSIGNED, "assignee", oldAssignee, assignee.getFullName());
        } else {
            bug.setAssignee(null);
            activityLogService.log(bug, bug.getProject(), user, ActivityAction.ASSIGNED, "assignee", oldAssignee, "Unassigned");
        }
        return BugDto.from(bugRepository.save(bug));
    }

    @Transactional
    public void deleteBug(Long id) {
        Bug bug = findBug(id);
        bugRepository.delete(bug);
    }

    public Page<BugDto> getMyBugs(Long userId, Pageable pageable) {
        return bugRepository.findByAssigneeId(userId, pageable).map(BugDto::from);
    }

    private Bug findBug(Long id) {
        return bugRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bug", "id", id));
    }

    private Specification<Bug> buildSpecification(String status, String severity, String priority,
                                                   Long projectId, Long assigneeId, String search,
                                                   Boolean isStale, Boolean technicalDebt) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) predicates.add(cb.equal(root.get("status"), BugStatus.valueOf(status)));
            if (severity != null) predicates.add(cb.equal(root.get("severity"), BugSeverity.valueOf(severity)));
            if (priority != null) predicates.add(cb.equal(root.get("priority"), BugPriority.valueOf(priority)));
            if (projectId != null) predicates.add(cb.equal(root.get("project").get("id"), projectId));
            if (assigneeId != null) predicates.add(cb.equal(root.get("assignee").get("id"), assigneeId));
            if (isStale != null) predicates.add(cb.equal(root.get("isStale"), isStale));
            if (technicalDebt != null) predicates.add(cb.equal(root.get("technicalDebt"), technicalDebt));
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
