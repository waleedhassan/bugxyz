package com.bugxyz.service;

import com.bugxyz.dto.OtherDtos.*;
import com.bugxyz.entity.*;
import com.bugxyz.enums.*;
import com.bugxyz.exception.ResourceNotFoundException;
import com.bugxyz.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.*;

@Service
@RequiredArgsConstructor
public class BugRelationService {

    private final BugRelationRepository relationRepository;
    private final BugRepository bugRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    public List<BugRelationDto> getRelations(Long bugId) {
        List<BugRelation> relations = relationRepository.findBySourceBugIdOrTargetBugId(bugId, bugId);
        return relations.stream().map(BugRelationDto::from).collect(Collectors.toList());
    }

    @Transactional
    public BugRelationDto addRelation(Long bugId, CreateBugRelationRequest request, Long userId) {
        Bug source = bugRepository.findById(bugId)
                .orElseThrow(() -> new ResourceNotFoundException("Bug", "id", bugId));
        Bug target = bugRepository.findById(request.getTargetBugId())
                .orElseThrow(() -> new ResourceNotFoundException("Bug", "id", request.getTargetBugId()));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        RelationType type = RelationType.valueOf(request.getRelationType());
        BugRelation relation = BugRelation.builder()
                .sourceBug(source).targetBug(target).relationType(type).createdBy(user).build();
        relation = relationRepository.save(relation);

        // Create inverse relation
        RelationType inverse = getInverseType(type);
        if (inverse != null) {
            relationRepository.save(BugRelation.builder()
                    .sourceBug(target).targetBug(source).relationType(inverse).createdBy(user).build());
        }

        activityLogService.log(source, source.getProject(), user, ActivityAction.RELATION_ADDED,
                "relation", null, type.name() + " #" + target.getId());
        return BugRelationDto.from(relation);
    }

    @Transactional
    public void removeRelation(Long relationId, Long userId) {
        BugRelation relation = relationRepository.findById(relationId)
                .orElseThrow(() -> new ResourceNotFoundException("BugRelation", "id", relationId));
        relationRepository.delete(relation);
        // Remove inverse
        RelationType inverse = getInverseType(relation.getRelationType());
        if (inverse != null) {
            relationRepository.findBySourceBugIdAndTargetBugIdAndRelationType(
                    relation.getTargetBug().getId(), relation.getSourceBug().getId(), inverse
            ).ifPresent(relationRepository::delete);
        }
    }

    private RelationType getInverseType(RelationType type) {
        return switch (type) {
            case BLOCKS -> RelationType.BLOCKED_BY;
            case BLOCKED_BY -> RelationType.BLOCKS;
            case PARENT_OF -> RelationType.CHILD_OF;
            case CHILD_OF -> RelationType.PARENT_OF;
            case DUPLICATE_OF -> RelationType.DUPLICATE_OF;
            case RELATED_TO -> RelationType.RELATED_TO;
        };
    }
}
