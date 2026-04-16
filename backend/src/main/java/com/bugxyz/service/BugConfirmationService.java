package com.bugxyz.service;

import com.bugxyz.dto.OtherDtos.*;
import com.bugxyz.entity.*;
import com.bugxyz.enums.ActivityAction;
import com.bugxyz.exception.*;
import com.bugxyz.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BugConfirmationService {

    private final BugConfirmationRepository confirmationRepository;
    private final BugRepository bugRepository;
    private final UserRepository userRepository;
    private final EnvironmentSnapshotRepository envRepository;
    private final ActivityLogService activityLogService;

    public List<BugConfirmationDto> getConfirmations(Long bugId) {
        return confirmationRepository.findByBugId(bugId).stream()
                .map(BugConfirmationDto::from).collect(Collectors.toList());
    }

    @Transactional
    public BugConfirmationDto addConfirmation(Long bugId, CreateBugConfirmationRequest request, Long userId) {
        Bug bug = bugRepository.findById(bugId)
                .orElseThrow(() -> new ResourceNotFoundException("Bug", "id", bugId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (confirmationRepository.existsByBugIdAndUserId(bugId, userId)) {
            throw new BadRequestException("You have already confirmed/denied this bug");
        }

        EnvironmentSnapshot env = null;
        if (request.getEnvironmentId() != null) {
            env = envRepository.findById(request.getEnvironmentId()).orElse(null);
        }

        BugConfirmation confirmation = BugConfirmation.builder()
                .bug(bug).user(user).confirmed(request.getConfirmed())
                .environment(env).notes(request.getNotes()).build();
        confirmation = confirmationRepository.save(confirmation);

        // Recalculate reproducibility score
        long total = confirmationRepository.countByBugId(bugId);
        long confirmed = confirmationRepository.countByBugIdAndConfirmedTrue(bugId);
        BigDecimal score = total > 0
                ? BigDecimal.valueOf(confirmed).multiply(BigDecimal.valueOf(100)).divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        bug.setReproducibilityScore(score);
        bugRepository.save(bug);

        activityLogService.log(bug, bug.getProject(), user, ActivityAction.CONFIRMED, null, null,
                request.getConfirmed() ? "confirmed" : "denied");
        return BugConfirmationDto.from(confirmation);
    }
}
