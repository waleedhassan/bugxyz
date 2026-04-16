package com.bugxyz.service;

import com.bugxyz.dto.CommentDtos.*;
import com.bugxyz.entity.*;
import com.bugxyz.enums.ActivityAction;
import com.bugxyz.exception.ResourceNotFoundException;
import com.bugxyz.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final BugRepository bugRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    public Page<CommentDto> getComments(Long bugId, Pageable pageable) {
        return commentRepository.findByBugIdOrderByCreatedAtDesc(bugId, pageable).map(CommentDto::from);
    }

    @Transactional
    public CommentDto addComment(Long bugId, CreateCommentRequest request, Long userId) {
        Bug bug = bugRepository.findById(bugId)
                .orElseThrow(() -> new ResourceNotFoundException("Bug", "id", bugId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Comment comment = Comment.builder()
                .bug(bug).author(user).content(request.getContent())
                .isInternal(request.getIsInternal() != null ? request.getIsInternal() : false)
                .build();
        comment = commentRepository.save(comment);

        // Clear stale flag on new activity
        bug.setIsStale(false);
        bug.setStaleSince(null);
        bugRepository.save(bug);

        activityLogService.log(bug, bug.getProject(), user, ActivityAction.COMMENTED, null, null, null);
        return CommentDto.from(comment);
    }
}
