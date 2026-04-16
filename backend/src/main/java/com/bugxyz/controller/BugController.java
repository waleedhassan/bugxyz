package com.bugxyz.controller;

import com.bugxyz.dto.BugDtos.*;
import com.bugxyz.dto.CommentDtos.*;
import com.bugxyz.dto.OtherDtos.*;
import com.bugxyz.security.CustomUserDetails;
import com.bugxyz.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bugs")
@RequiredArgsConstructor
public class BugController {

    private final BugService bugService;
    private final CommentService commentService;
    private final AttachmentService attachmentService;
    private final ActivityLogService activityLogService;
    private final BugRelationService relationService;
    private final EnvironmentSnapshotService envService;
    private final BugConfirmationService confirmationService;

    @GetMapping
    public ResponseEntity<Page<BugDto>> getAll(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isStale,
            @RequestParam(required = false) Boolean technicalDebt) {
        return ResponseEntity.ok(bugService.getAllBugs(pageable, status, severity, priority,
                projectId, assigneeId, search, isStale, technicalDebt));
    }

    @PostMapping
    public ResponseEntity<BugDto> create(@Valid @RequestBody CreateBugRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bugService.createBug(request, getCurrentUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BugDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(bugService.getBugById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BugDto> update(@PathVariable Long id, @RequestBody UpdateBugRequest request) {
        return ResponseEntity.ok(bugService.updateBug(id, request, getCurrentUserId()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BugDto> updateStatus(@PathVariable Long id, @Valid @RequestBody BugStatusUpdateRequest request) {
        return ResponseEntity.ok(bugService.updateBugStatus(id, request.getStatus(), getCurrentUserId()));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<BugDto> assign(@PathVariable Long id, @RequestBody AssignBugRequest request) {
        return ResponseEntity.ok(bugService.assignBug(id, request.getAssigneeId(), getCurrentUserId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bugService.deleteBug(id);
        return ResponseEntity.noContent().build();
    }

    // Comments
    @GetMapping("/{id}/comments")
    public ResponseEntity<Page<CommentDto>> getComments(@PathVariable Long id, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(commentService.getComments(id, pageable));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentDto> addComment(@PathVariable Long id, @Valid @RequestBody CreateCommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.addComment(id, request, getCurrentUserId()));
    }

    // Attachments
    @GetMapping("/{id}/attachments")
    public ResponseEntity<List<AttachmentDto>> getAttachments(@PathVariable Long id) {
        return ResponseEntity.ok(attachmentService.getAttachments(id));
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<AttachmentDto> uploadAttachment(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attachmentService.uploadAttachment(id, file, getCurrentUserId()));
    }

    @GetMapping("/attachments/{attachmentId}/download")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long attachmentId) {
        Resource resource = attachmentService.downloadAttachment(attachmentId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment")
                .body(resource);
    }

    // History
    @GetMapping("/{id}/history")
    public ResponseEntity<Page<ActivityLogDto>> getHistory(@PathVariable Long id, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(activityLogService.getBugHistory(id, pageable));
    }

    // Relations
    @GetMapping("/{id}/relations")
    public ResponseEntity<List<BugRelationDto>> getRelations(@PathVariable Long id) {
        return ResponseEntity.ok(relationService.getRelations(id));
    }

    @PostMapping("/{id}/relations")
    public ResponseEntity<BugRelationDto> addRelation(@PathVariable Long id, @Valid @RequestBody CreateBugRelationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(relationService.addRelation(id, request, getCurrentUserId()));
    }

    @DeleteMapping("/{id}/relations/{relationId}")
    public ResponseEntity<Void> removeRelation(@PathVariable Long id, @PathVariable Long relationId) {
        relationService.removeRelation(relationId, getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    // Confirmations
    @GetMapping("/{id}/confirmations")
    public ResponseEntity<List<BugConfirmationDto>> getConfirmations(@PathVariable Long id) {
        return ResponseEntity.ok(confirmationService.getConfirmations(id));
    }

    @PostMapping("/{id}/confirmations")
    public ResponseEntity<BugConfirmationDto> addConfirmation(@PathVariable Long id, @Valid @RequestBody CreateBugConfirmationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(confirmationService.addConfirmation(id, request, getCurrentUserId()));
    }

    // Environment
    @GetMapping("/{id}/environment")
    public ResponseEntity<List<EnvironmentSnapshotDto>> getEnvironment(@PathVariable Long id) {
        return ResponseEntity.ok(envService.getSnapshots(id));
    }

    @PostMapping("/{id}/environment")
    public ResponseEntity<EnvironmentSnapshotDto> addEnvironment(@PathVariable Long id, @RequestBody CreateEnvironmentSnapshotRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(envService.addSnapshot(id, request));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ((CustomUserDetails) auth.getPrincipal()).getId();
    }
}
