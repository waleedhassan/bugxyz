package com.bugxyz.repository;

import com.bugxyz.entity.BugConfirmation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BugConfirmationRepository extends JpaRepository<BugConfirmation, Long> {

    List<BugConfirmation> findByBugId(Long bugId);

    long countByBugIdAndConfirmedTrue(Long bugId);

    long countByBugId(Long bugId);
}
